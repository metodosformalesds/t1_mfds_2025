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

class CognitoService:
    """
    Autor: Gabriel VIlchis
    Clase de servicio que gestiona la interacción con AWS Cognito para todas
    las operaciones de autenticación y autorización de usuarios. 
    
    Implementa caché para las claves públicas (JWKS) de Cognito y coordina
    la sincronización de datos con la base de datos local (SQLAlchemy) y S3.
    """
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
        self.jwks = self._get_jwks()
    
    def _get_jwks(self):
        """ Obtiene las claves públicas (JWKS) del User Pool de Cognito.
        Implementa un mecanismo de caché para reducir las peticiones a AWS."""
        now = datetime.now()
        
        if (CognitoService._jwks_cache is None or 
            CognitoService._jwks_cache_time is None or 
            now - CognitoService._jwks_cache_time > CognitoService._jwks_cache_duration):
            
            jwks_url = f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{self.user_pool_id}/.well-known/jwks.json"
            response = requests.get(jwks_url)
            CognitoService._jwks_cache = response.json()
            CognitoService._jwks_cache_time = now
        
        return CognitoService._jwks_cache
    
    def sign_up(self, db: Session, user_data: SignUpRequest, profile_image: Optional[bytes] = None) -> Dict:
        """
        Autor: Gabriel Vilchis
        Registra un nuevo usuario en AWS Cognito y lo sincroniza en la base de datos local.
        Gestiona la subida de la imagen de perfil a S3 y el hash de la contraseña local.
        
        Args:
            db (Session): Sesión de SQLAlchemy para la persistencia local.
            user_data (SignUpRequest): Datos del usuario a registrar (email, password, etc.).
            profile_image (Optional[bytes]): Contenido binario de la imagen de perfil (opcional).

        Returns:
            Dict: Resultado con `success` (bool), `user_sub` (str), `user_id` (str), y mensaje o error.
        """
        profile_image_url = None
        s3_service_instance = S3Service()
        profile_img = None # Usado para la URL que va a la DB y al retorno
        current_time = datetime.now()

        try:
            email = user_data.email
            temp_s3_id = None # id temporal para subir cosas al s3 y cumplir el campo obligatorio de cognito
            
            # Generar id temporal ANTES de subir la imagen
            temp_s3_id = str(uuid.uuid4())

            if profile_image:
                # Validar tamaño de imagen
                if len(profile_image) > 5 * 1024 * 1024:
                    return {"success": False, "error": "La imagen es demasiado grande (máximo 5MB)"}

                temp_s3_id = str(uuid.uuid4())

                upload_result = s3_service_instance.upload_profile_img(
                    file_content=profile_image,
                    user_id=temp_s3_id
                )
                 
                if not upload_result["success"]:
                    return {"success": False, "error": upload_result["error"]}
            
                profile_image_url = upload_result["file_url"]
                profile_img = profile_image_url # placeholder inicial de la imagen


            # Construir atributos para Cognito
            user_attributes = [
                {"Name": "email", "Value": email},
                {"Name": "given_name", "Value": user_data.first_name},
                {"Name": "family_name", "Value": user_data.last_name},
                {"Name": "gender", "Value": user_data.gender},
                {"Name": "birthdate", "Value": str(user_data.birth_date)},
                {"Name": "picture", "Value": profile_image_url or ""},
                {"Name": "custom:role", "Value": UserRole.USER.value}, # para identifcar el rol si es usuario o admin
            ]

            # Registrar en Cognito
            response = self.client.sign_up(
                ClientId=self.client_id,
                Username=email,
                Password=user_data.password,
                UserAttributes=user_attributes
            )

            cognito_sub = response["UserSub"]
            # se considera el sub de cognito en lugar de "id" temporal
            if profile_img and temp_s3_id:
                transfer_upload_result = s3_service_instance.upload_profile_img(
                    file_content=profile_image,
                    user_id=cognito_sub
                )
                if transfer_upload_result["success"]:
                    final_profile_image_url = transfer_upload_result["file_url"]
                    
                    # Elimina el archivo temporal 
                    s3_service_instance.delete_profile_img(old_url=profile_image_url, user_id=temp_s3_id)
                    
                    # Actualiza cognita con la url final
                    self.client.admin_update_user_attributes(
                        UserPoolId=self.user_pool_id,
                        Username=email, 
                        UserAttributes=[
                            {'Name': 'picture', 'Value': final_profile_image_url}
                        ]
                    )
                else:
                    # Si falla la re-subida, el usuario se queda con la URL temporal en S3 y DB.
                    pass

            # Hashear la contraseña para almacenamiento local
            hashed_password =hash_password(user_data.password)

            new_db_user = User(
                cognito_sub=cognito_sub,
                email=email,
                auth_type=AuthType.EMAIL,
                password_hash=hashed_password, 
                first_name=user_data.first_name,
                last_name=user_data.last_name,
                gender=Gender(user_data.gender),
                date_of_birth=user_data.birth_date,
                profile_picture=profile_image_url,
                role=UserRole.USER,
                account_status=True,
                created_at=current_time
            )

            db.add(new_db_user)
            db.commit()
            db.refresh(new_db_user)

            return {
                "success": True,
                "user_sub": response["UserSub"],
                "user_id": str(new_db_user.user_id),
                "profile_image_url": profile_image_url,
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
        Autor: Gabriel Vilchis
        Confirma el registro de un usuario en Cognito usando el código de verificación.
        
        Args:
            email (str): El correo electrónico del usuario.
            code (str): El código de confirmación de 6 dígitos.

        Returns:
            Dict: Diccionario con `success` (bool) y `message` o `error`.
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
        Autor: Gabriel Vilchis
        Solicita a Cognito que reenvíe el código de confirmación de registro al usuario.
        
        Args:
            email (str): El correo electrónico del usuario.

        Returns:
            Dict: Diccionario con `success` (bool) y `message` o `error`.
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
        Autor: Gabriel Vilchis
        Inicia sesión del usuario en Cognito mediante el flujo de autenticación estándar.
        
        Args:
            email (str): El correo electrónico (Username) del usuario.
            password (str): La contraseña del usuario.

        Returns:
            Dict: Diccionario con `success` (bool) y los tokens (`access_token`, `id_token`, 
                  `refresh_token`, `expires_in`) o `error`.
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
            return {'success': False, 'error': 'Usuario no confirmado. Por favor verifica tu correo.'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def sign_out(self, access_token: str) -> Dict:
        """
        Autor: Gabriel Vilchis
        Cierra globalmente la sesión del usuario, invalidando el Access Token en Cognito.
        
        Args:
            access_token (str): El Access Token del usuario.

        Returns:
            Dict: Diccionario con `success` (bool) y `message` o `error`.
        """
        try:
            self.client.global_sign_out(AccessToken=access_token)
            return {'success': True, 'message': 'Sesión cerrada correctamente'}
        except Exception as e:
            return {'success': False, 'error': str(e)}
    
    def refresh_token(self, refresh_token: str) -> Dict:
        """
        Autor: Gabriel Vilchis
        Obtiene un nuevo Access Token e ID Token utilizando el Refresh Token existente.
        
        Args:
            refresh_token (str): El Refresh Token del usuario.

        Returns:
            Dict: Diccionario con `success` (bool) y los nuevos tokens o `error`.
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
        Autor: Gabriel Vilchis
        Verifica la firma, emisor y validez de un JWT (Access Token o ID Token) 
        contra las claves públicas de Cognito (JWKS).
        
        Args:
            token (str): El JWT a verificar.

        Returns:
            Optional[Dict]: El payload decodificado del token si es válido, o `None` en caso de fallo.
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
                issuer=f"https://cognito-idp.{settings.COGNITO_REGION}.amazonaws.com/{self.user_pool_id}",
                options={'verify_exp': True}
            )
            
            return payload
        except JWTError:
            return None
        except Exception:
            return None
    
    def get_user_info(self, access_token: str) -> Dict:
        """
        Autor: Gabriel Vilchis
        Obtiene los atributos detallados del usuario autenticado directamente desde Cognito.
        
        Args:
            access_token (str): El Access Token del usuario.

        Returns:
            Dict: Diccionario con `success` (bool) y la información del usuario en el campo `user` o `error`.
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
        Autor: Gabriel Vilchis
        Inicia el proceso de recuperación de contraseña, enviando un código de verificación al correo.
        
        Args:
            email (str): El correo electrónico del usuario.

        Returns:
            Dict: Diccionario con `success` (bool) y `message` o `error`.
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
        Autor: Gabriel Vilchis
        Confirma el restablecimiento de la contraseña usando el código y establece la nueva contraseña.
        
        Args:
            email (str): El correo electrónico del usuario.
            code (str): El código de verificación.
            new_password (str): La nueva contraseña.

        Returns:
            Dict: Diccionario con `success` (bool) y `message` o `error`.
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
        Autor: Gabriel Vilchis
        Permite al usuario autenticado cambiar su contraseña, requiriendo la contraseña actual.
        
        Args:
            access_token (str): El Access Token del usuario.
            old_password (str): La contraseña actual.
            new_password (str): La nueva contraseña a establecer.

        Returns:
            Dict: Diccionario con `success` (bool) y `message` o `error`.
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
        
    def sync_federated_user(self, db: Session, id_token: str) -> dict:
        """
        Autor: Gabriel Vilchis
        Sincroniza un usuario federado (ej. Google, Facebook) por primera vez con la base de datos local. 
        Si ya existe, retorna su ID.
        
        Args:
            db (Session): Sesión de SQLAlchemy para la persistencia local.
            id_token (str): El ID Token de Cognito que contiene el payload del usuario.

        Returns:
            Dict: Diccionario con `success` (bool), `user_id` (str) y `message` o `error`.
        """
        try:
            # verificar y decodificar el id de cognito
            payload = self.verify_token(id_token)

            if not payload:
                return {'success': False, 'error': 'Token inválido o expirado. No se puede sincronizar.'}
            
            # extraer informacion del payload
            cognito_sub = payload.get('sub')
            user_email = payload.get('email')
            first_name = payload.get('given_name', 'Usuario') # Default seguro
            last_name = payload.get('family_name', 'Federado') # Default seguro

            if not cognito_sub or not user_email:
                return {'success': False, 'error': 'Token incompleto. Faltan sub o email.'}
            
            # Buscar si el usuario ya existe en la BD  usando el cognito_sub
            existing_user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
                
            if existing_user:
                # El usuario ya existe y está sincronizado, no se hace nada
                return {"success": True, "user_id": str(existing_user.user_id), "message": "Usuario sincronizado (existente)."}

            # Determinar el AuthType del proveedor (Google/Facebook/Amazon/etc.)
            issuer = payload.get('iss', '').lower() 
            auth_type_value = AuthType.EMAIL # Valor por defecto si no se identifica

            if 'google' in issuer:
                auth_type_value = AuthType.GOOGLE
            elif 'facebook' in issuer:
                auth_type_value = AuthType.FACEBOOK

            # Cear el registro local 
            new_db_user = User(
                cognito_sub=cognito_sub,
                email=user_email,
                first_name=first_name,
                last_name=last_name,
                auth_type=auth_type_value, 
                password_hash=None, # IMPORTANTE: Null para federados
                gender=Gender.PREFER_NOT_SAY, 
                date_of_birth=datetime.today(),
                profile_picture=payload.get('picture'),
                role=UserRole.USER,
                account_status=True
            )
                
            db.add(new_db_user)
            db.commit()
            db.refresh(new_db_user)

            return {
                "success": True,
                "user_id": str(new_db_user.user_id),
                "message": "Usuario creado y sincronizado exitosamente."
            }
        except Exception as e:
            return {'success': False, 'error': f"Error interno durante la sincronización: {str(e)}"}

       
cognito_service = CognitoService()