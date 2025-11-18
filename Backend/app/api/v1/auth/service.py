# Autor: Gabriel Vilchis
# Fecha: 09/11/2025
# Descripción: Servicio centralizado para la gestión de usuarios y autenticación
# utilizando AWS Cognito. Maneja la lógica de negocio para el registro, login,
# recuperación de contraseñas, validación de tokens y sincronización de usuarios locales (DB)
# con Cognito, incluyendo la subida de imágenes de perfil a S3.
import boto3
from jose import jwt, JWTError
from typing import Dict, Optional
import requests
from app.config import settings
from app.services.s3_service import S3Service
import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.user import User
from app.models.enum import AuthType, UserRole, Gender
from app.core.security import hash_password
from app.api.v1.auth.schemas import SignUpRequest
from starlette.concurrency import run_in_threadpool
import logging

logger = logging.getLogger(__name__)


class CognitoService:
    """Servicio para gestión de autenticación con AWS Cognito"""
    
    # Cache de JWKS a nivel de clase
    _jwks_cache = None
    _jwks_cache_time = None
    _jwks_cache_duration = timedelta(hours=1)
    
    def __init__(self):
        self.client = boto3.client(
            'cognito-idp',
            region_name=settings.COGNITO_REGION,
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
        )
        self.user_pool_id = settings.COGNITO_USER_POOL_ID
        self.client_id = settings.COGNITO_CLIENT_ID
        self.jwks = None
    
    def _get_jwks(self):
        """ Obtiene las claves públicas (JWKS) del User Pool de Cognito.
        Implementa un mecanismo de caché para reducir las peticiones a AWS."""
        now = datetime.now()
        
        if (CognitoService._jwks_cache is None or 
            CognitoService._jwks_cache_time is None or 
            now - CognitoService._jwks_cache_time > CognitoService._jwks_cache_duration):
            
            # --- INICIO DE NUESTRO FIX PARA PRUEBAS ---
            # Si estamos usando el .env de prueba (region='test'), 
            # no intentes conectar a AWS. Devuelve un JWKS falso.
            if settings.COGNITO_REGION == 'test':
                CognitoService._jwks_cache = {'keys': []} # Un JWKS vacío pero válido
                CognitoService._jwks_cache_time = now
                return CognitoService._jwks_cache
            # --- FIN DE NUESTRO FIX PARA PRUEBAS ---
            
            jwks_url = (
                f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
                f"{self.user_pool_id}/.well-known/jwks.json"
            )
            response = requests.get(jwks_url)
            CognitoService._jwks_cache = response.json()
            CognitoService._jwks_cache_time = now
        
        return CognitoService._jwks_cache
    
    async def sign_up(
        self,
        db: Session,
        user_data: SignUpRequest,
        profile_image: Optional[bytes] = None
    ) -> Dict:
        """
        Registra un nuevo usuario en Cognito y en la base de datos local.

        Args:
            db: Sesión de base de datos
            user_data: Datos del usuario
            profile_image: Imagen de perfil opcional (bytes)

        Returns:
            Dict con success, user_sub, user_id, profile_image_url, temp_s3_id, message o error
        """
        profile_image_url = None
        temp_s3_id = None
        s3_service_instance = S3Service()
        current_time = datetime.now()

        try:
            email = user_data.email

            # Si hay imagen, subirla primero con ID temporal
            if profile_image:
                # Validar tamaño de imagen
                if len(profile_image) > 5 * 1024 * 1024:
                    return {
                        "success": False,
                        "error": "La imagen es demasiado grande (máximo 5MB)"
                    }

                # Generar ID temporal para S3
                temp_s3_id = str(uuid.uuid4())

                # Subir imagen con ID temporal (async)
                upload_result = await s3_service_instance.upload_profile_img(
                    file_content=profile_image,
                    user_id=temp_s3_id
                )

                if not upload_result["success"]:
                    return {"success": False, "error": upload_result["error"]}

                profile_image_url = upload_result["file_url"]

            # Construir atributos para Cognito
            user_attributes = [
                {"Name": "email", "Value": email},
                {"Name": "given_name", "Value": user_data.first_name},
                {"Name": "family_name", "Value": user_data.last_name},
                {"Name": "custom:role", "Value": UserRole.USER.value},
            ]

            # Agregar atributos opcionales
            if user_data.gender:
                user_attributes.append({"Name": "gender", "Value": user_data.gender})
            if user_data.birth_date:
                user_attributes.append({"Name": "birthdate", "Value": str(user_data.birth_date)})
            if profile_image_url:
                user_attributes.append({"Name": "picture", "Value": profile_image_url})

            # Registrar en Cognito (blocking - wrap in threadpool)
            response = await run_in_threadpool(
                self.client.sign_up,
                ClientId=self.client_id,
                Username=email,
                Password=user_data.password,
                UserAttributes=user_attributes
            )

            cognito_sub = response["UserSub"]

            # Hashear la contraseña para almacenamiento local (blocking - wrap in threadpool)
            hashed_password = await run_in_threadpool(hash_password, user_data.password)

            # Crear usuario en base de datos local
            new_db_user = User(
                cognito_sub=cognito_sub,
                email=email,
                auth_type=AuthType.EMAIL,
                password_hash=hashed_password,
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                gender=Gender(user_data.gender) if user_data.gender else None,
                date_of_birth=user_data.birth_date,
                profile_picture=profile_image_url,  # Temporary URL initially
                role=UserRole.USER,
                account_status=True,
                created_at=current_time
            )

            db.add(new_db_user)
            db.commit()
            db.refresh(new_db_user)

            return {
                "success": True,
                "user_sub": cognito_sub,
                "user_id": str(new_db_user.user_id),
                "profile_image_url": profile_image_url,
                "temp_s3_id": temp_s3_id,  # For background task to migrate
                "message": "Usuario registrado correctamente. Verifica tu correo.",
            }

        except self.client.exceptions.UsernameExistsException:
            return {"success": False, "error": "El usuario ya existe"}
        except self.client.exceptions.InvalidPasswordException:
            return {"success": False, "error": "La contraseña no cumple con los requisitos"}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def confirm_sign_up(self, email: str, code: str) -> Dict:
        """
        Confirma el registro con el código enviado al email.
        
        Args:
            email: Email del usuario
            code: Código de verificación
            
        Returns:
            Dict con success y message o error
        """
        try:
            self.client.confirm_sign_up(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=code
            )
            
            return {'success': True, 'message': 'Usuario confirmado correctamente'}
        except self.client.exceptions.CodeMismatchException:
            return {'success': False, 'error': 'Código de verificación incorrecto'}
        except self.client.exceptions.ExpiredCodeException:
            return {'success': False, 'error': 'El código de verificación ha expirado'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def resend_confirmation_code(self, email: str) -> Dict:
        """
        Reenvía el código de confirmación.
        
        Args:
            email: Email del usuario
            
        Returns:
            Dict con success y message o error
        """
        try:
            self.client.resend_confirmation_code(
                ClientId=self.client_id,
                Username=email
            )
            return {'success': True, 'message': 'Código reenviado correctamente'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def sign_in(self, email: str, password: str) -> Dict:
        """
        Inicia sesión con email y contraseña.
        
        Args:
            email: Email del usuario
            password: Contraseña
            
        Returns:
            Dict con tokens o error
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                }
            )
            
            return {
                'success': True,
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'refresh_token': response['AuthenticationResult']['RefreshToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn']
            }
        except self.client.exceptions.NotAuthorizedException:
            return {'success': False, 'error': 'Credenciales inválidas'}
        except self.client.exceptions.UserNotConfirmedException:
            return {
                'success': False, 
                'error': 'Usuario no confirmado. Por favor verifica tu correo.'
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def sign_out(self, access_token: str) -> Dict:
        """
        Cierra la sesión del usuario (invalida el token).
        
        Args:
            access_token: Token de acceso del usuario
            
        Returns:
            Dict con success y message o error
        """
        try:
            self.client.global_sign_out(AccessToken=access_token)
            return {'success': True, 'message': 'Sesión cerrada correctamente'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def refresh_token(self, refresh_token: str) -> Dict:
        """
        Refresca el access token usando el refresh token.
        
        Args:
            refresh_token: Refresh token del usuario
            
        Returns:
            Dict con nuevos tokens o error
        """
        try:
            response = self.client.initiate_auth(
                ClientId=self.client_id,
                AuthFlow='REFRESH_TOKEN_AUTH',
                AuthParameters={
                    'REFRESH_TOKEN': refresh_token
                }
            )
            
            return {
                'success': True,
                'access_token': response['AuthenticationResult']['AccessToken'],
                'id_token': response['AuthenticationResult']['IdToken'],
                'expires_in': response['AuthenticationResult']['ExpiresIn']
            }
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def verify_token(self, token: str) -> Optional[Dict]:
        """
        Verifica y decodifica un JWT token.
        ...
        """
        if self.jwks is None:            # <-- AÑADE ESTA LÍNEA
            self.jwks = self._get_jwks() # <-- Y ESTA LÍNEA
        """
        Verifica y decodifica un JWT token.
        
        Args:
            token: Token JWT a verificar
            
        Returns:
            Payload del token o None si es inválido
        """
        
        try:
            # Decodificar el header para obtener el kid
            headers = jwt.get_unverified_header(token)
            kid = headers['kid']
            
            # Buscar la clave pública correspondiente
            key = None
            for k in self.jwks['keys']:
                if k['kid'] == kid:
                    key = k
                    break
            
            if not key:
                return None
            
            # Verificar y decodificar el token
            payload = jwt.decode(
                token,
                key,
                algorithms=['RS256'],
                audience=self.client_id,
                issuer=(
                    f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/"
                    f"{self.user_pool_id}"
                ),
                options={'verify_exp': True}
            )
            
            return payload
        except JWTError:
            return None
        except Exception:
            return None
    
    def get_user_info(self, access_token: str) -> Dict:
        """
        Obtiene información del usuario usando el access token.
        
        Args:
            access_token: Token de acceso
            
        Returns:
            Dict con información del usuario o error
        """
        try:
            response = self.client.get_user(AccessToken=access_token)
            
            user_info = {
                'username': response['Username'],
                'email': None,
                'email_verified': False,
                'attributes': {}
            }
            
            # Parsear atributos
            for attr in response['UserAttributes']:
                user_info['attributes'][attr['Name']] = attr['Value']
                
                # Extraer campos importantes
                if attr['Name'] == 'email':
                    user_info['email'] = attr['Value']
                elif attr['Name'] == 'email_verified':
                    user_info['email_verified'] = attr['Value'] == 'true'
            
            return {'success': True, 'user': user_info}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def forgot_password(self, email: str) -> Dict:
        """
        Inicia el proceso de recuperación de contraseña.
        
        Args:
            email: Email del usuario
            
        Returns:
            Dict con success y message o error
        """
        try:
            self.client.forgot_password(
                ClientId=self.client_id,
                Username=email
            )
            return {'success': True, 'message': 'Código de recuperación enviado al correo'}
        except self.client.exceptions.UserNotFoundException:
            return {'success': False, 'error': 'Usuario no encontrado'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def confirm_forgot_password(self, email: str, code: str, new_password: str) -> Dict:
        """
        Confirma el cambio de contraseña con el código recibido.
        
        Args:
            email: Email del usuario
            code: Código de verificación
            new_password: Nueva contraseña
            
        Returns:
            Dict con success y message o error
        """
        try:
            self.client.confirm_forgot_password(
                ClientId=self.client_id,
                Username=email,
                ConfirmationCode=code,
                Password=new_password
            )
            return {'success': True, 'message': 'Contraseña actualizada correctamente'}
        except self.client.exceptions.CodeMismatchException:
            return {'success': False, 'error': 'Código de verificación incorrecto'}
        except self.client.exceptions.ExpiredCodeException:
            return {'success': False, 'error': 'El código de verificación ha expirado'}
        except self.client.exceptions.InvalidPasswordException:
            return {'success': False, 'error': 'La nueva contraseña no cumple con los requisitos'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def change_password(self, access_token: str, old_password: str, new_password: str) -> Dict:
        """
        Cambia la contraseña del usuario autenticado.
        
        Args:
            access_token: Token de acceso
            old_password: Contraseña actual
            new_password: Nueva contraseña
            
        Returns:
            Dict con success y message o error
        """
        try:
            self.client.change_password(
                AccessToken=access_token,
                PreviousPassword=old_password,
                ProposedPassword=new_password
            )
            return {'success': True, 'message': 'Contraseña cambiada correctamente'}
        except self.client.exceptions.NotAuthorizedException:
            return {'success': False, 'error': 'Contraseña actual incorrecta'}
        except self.client.exceptions.InvalidPasswordException:
            return {'success': False, 'error': 'La nueva contraseña no cumple con los requisitos'}
        except Exception as e:
            return {'success': False, 'error': str(e)}

    def process_s3_and_cognito_updates_sync(
        self,
        db: Session,
        temp_s3_id: str,
        final_user_id: str,
        cognito_sub: str,
        profile_image: bytes
    ):
        """
        Procesa la migración de imagen de S3 del ID temporal al ID final del usuario.
        Ejecutado como tarea en segundo plano para no bloquear la respuesta de signup.

        Args:
            db: Sesión de base de datos
            temp_s3_id: ID temporal usado inicialmente en S3
            final_user_id: ID definitivo del usuario en la BD
            cognito_sub: Sub de Cognito del usuario
            profile_image: Bytes de la imagen original
        """
        try:
            s3_service = S3Service()

            # Subir imagen con el ID final del usuario (sync porque está en background)
            upload_result = s3_service._upload_profile_img_sync(
                file_content=profile_image,
                user_id=final_user_id
            )

            if upload_result["success"]:
                final_url = upload_result["file_url"]

                # Actualizar URL en la base de datos
                user = db.query(User).filter(User.user_id == int(final_user_id)).first()
                if user:
                    user.profile_picture = final_url
                    db.commit()

                # Eliminar imagen temporal de S3
                temp_url = f"https://{s3_service.bucket_name}.s3.{settings.AWS_REGION}.amazonaws.com/profile_images/{temp_s3_id}/picture.jpeg"
                s3_service._delete_profile_img_sync(temp_url, temp_s3_id)

                # Actualizar atributo picture en Cognito
                try:
                    self.client.admin_update_user_attributes(
                        UserPoolId=self.user_pool_id,
                        Username=cognito_sub,
                        UserAttributes=[
                            {"Name": "picture", "Value": final_url}
                        ]
                    )
                    logger.info(f"Successfully migrated S3 image for user {final_user_id}")
                except Exception as e:
                    logger.error(f"Failed to update Cognito picture attribute: {str(e)}")

        except Exception as e:
            logger.error(f"Error in background S3 migration: {str(e)}")

    def is_admin(self, id_token_payload: Dict) -> bool:
        """
        Verifica si el payload del token contiene el rol de administrador.

        Args:
            id_token_payload: Payload decodificado del ID token

        Returns:
            True si es admin, False en caso contrario
        """
        user_role = id_token_payload.get('role')

        if not user_role:
            user_role = id_token_payload.get('custom:role')

        return user_role == UserRole.ADMIN.value


# Instancia única del servicio
cognito_service = CognitoService()