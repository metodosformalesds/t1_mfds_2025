# Autor: Lizbeth Barajas
# Fecha: 10-11-25
# Descripción: Servicio para manejar la información de usuario

from sqlalchemy.orm import Session
from typing import Dict, Optional
from app.models.user import User
from app.models.enum import Gender
from app.services.s3_service import S3Service
from datetime import date

class UserProfileService:
    def __init__(self):
        self.s3_service = S3Service()
    
    def get_user_profile(self, db: Session, cognito_sub: str) -> Optional[Dict]:
        """
        Autor: Lizbeth Barajas

        Descripción:
            Obtiene el perfil completo del usuario desde la base de datos utilizando
            su identificador de Cognito. Valida que la cuenta esté activa y retorna
            toda la información relevante del perfil.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.

        Retorna:
            dict: Resultado de la operación, incluyendo los datos completos del usuario
                si existe y está activo.
        """

        """
        Autor: Lizbeth Barajas

        Descripción:
            Obtiene el perfil completo del usuario desde la base de datos utilizando
            su identificador de Cognito. Valida que la cuenta esté activa y retorna
            toda la información relevante del perfil.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.

        Retorna:
            dict: Resultado de la operación, incluyendo los datos completos del usuario
                si existe y está activo.
        """

        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
            
            if not user:
                return {"success": False, "error": "Usuario no encontrado"}
            
            if not user.account_status:
                return {"success": False, "error": "Cuenta inactiva"}
            
            return {
                "success": True,
                "user": {
                    "user_id": str(user.user_id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "gender": user.gender.value if user.gender else None,
                    "date_of_birth": user.date_of_birth,
                    "profile_picture": user.profile_picture,
                    "role": user.role.value,
                    "account_status": user.account_status,
                    "auth_type": user.auth_type.value,
                    "created_at": user.created_at
                }
            }
        except Exception as e:
            return {"success": False, "error": f"Error al obtener perfil: {str(e)}"}
    
    def update_user_profile(
        self,
        db: Session,
        cognito_sub: str,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        gender: Optional[Gender] = None,
        date_of_birth: Optional[date] = None
    ) -> Dict:
        """
        Autor: Lizbeth Barajas

        Descripción:
            Actualiza los datos personales del usuario, modificando únicamente
            los campos que se hayan proporcionado. Valida existencia y estado de
            la cuenta antes de realizar cambios.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.
            first_name (str | None): Nuevo nombre del usuario.
            last_name (str | None): Nuevo apellido del usuario.
            gender (Gender | None): Nuevo género del usuario.
            date_of_birth (date | None): Nueva fecha de nacimiento.

        Retorna:
            dict: Resultado de la operación, incluyendo el perfil actualizado.
        """

        """
        Autor: Lizbeth Barajas

        Descripción:
            Actualiza los datos personales del usuario, modificando únicamente
            los campos que se hayan proporcionado. Valida existencia y estado de
            la cuenta antes de realizar cambios.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.
            first_name (str | None): Nuevo nombre del usuario.
            last_name (str | None): Nuevo apellido del usuario.
            gender (Gender | None): Nuevo género del usuario.
            date_of_birth (date | None): Nueva fecha de nacimiento.

        Retorna:
            dict: Resultado de la operación, incluyendo el perfil actualizado.
        """

        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
            
            if not user:
                return {"success": False, "error": "Usuario no encontrado"}
            
            if not user.account_status:
                return {"success": False, "error": "Cuenta inactiva"}
            
            # Update only provided fields
            if first_name is not None:
                user.first_name = first_name
            
            if last_name is not None:
                user.last_name = last_name
            
            if gender is not None:
                user.gender = gender
            
            if date_of_birth is not None:
                user.date_of_birth = date_of_birth
            
            db.commit()
            db.refresh(user)
            
            return {
                "success": True,
                "message": "Perfil actualizado correctamente",
                "user": {
                    "user_id": str(user.user_id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "gender": user.gender.value if user.gender else None,
                    "date_of_birth": user.date_of_birth,
                    "profile_picture": user.profile_picture,
                    "role": user.role.value,
                    "account_status": user.account_status,
                    "auth_type": user.auth_type.value,
                    "created_at": user.created_at
                }
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "error": f"Error al actualizar perfil: {str(e)}"}
        
    def update_profile_image(
        self,
        db: Session,
        cognito_sub: str,
        image_content: bytes
    ) -> Dict:
        """
        Autor: Lizbeth Barajas

        Descripción:
            Actualiza la imagen de perfil del usuario. Elimina la imagen anterior de S3,
            sube la nueva imagen y actualiza la URL en la base de datos.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.
            image_content (bytes): Contenido en bytes de la nueva imagen.

        Retorna:
            dict: Resultado de la operación, incluyendo la nueva URL de la imagen.
        """

        """
        Autor: Lizbeth Barajas

        Descripción:
            Actualiza la imagen de perfil del usuario. Elimina la imagen anterior de S3,
            sube la nueva imagen y actualiza la URL en la base de datos.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.
            image_content (bytes): Contenido en bytes de la nueva imagen.

        Retorna:
            dict: Resultado de la operación, incluyendo la nueva URL de la imagen.
        """

        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()

            if not user:
                return {"success": False, "error": "Usuario no encontrado"}
            
            if not user.account_status:
                return {"success": False, "error": "Cuenta inactiva"}
            
            old_url = user.profile_picture

            if old_url:
                self.s3_service.delete_profile_img(old_url=old_url, user_id=str(cognito_sub))
            
            # Upload new image to S3 (this will overwrite if same user_id)
            upload_result = self.s3_service.upload_profile_img(
                file_content=image_content,
                user_id=str(cognito_sub)
            )
            
            if not upload_result["success"]:
                return upload_result
            
            # Update database with new image URL
            user.profile_picture = upload_result["file_url"]
            db.commit()
            db.refresh(user)
            
            return {
                "success": True,
                "message": "Imagen de perfil actualizada correctamente",
                "profile_picture_url": user.profile_picture
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "error": f"Error al actualizar imagen: {str(e)}"}
    
    def soft_delete_account(self, db: Session, cognito_sub: str) -> Dict:
        """
        Autor: Lizbeth Barajas

        Descripción:
            Realiza un borrado lógico del usuario cambiando el campo account_status
            a falso. No elimina los datos del usuario, solo desactiva la cuenta.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.

        Retorna:
            dict: Mensaje confirmando la operación o detalle del error.
        """

        """
        Autor: Lizbeth Barajas

        Descripción:
            Realiza un borrado lógico del usuario cambiando el campo account_status
            a falso. No elimina los datos del usuario, solo desactiva la cuenta.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.

        Retorna:
            dict: Mensaje confirmando la operación o detalle del error.
        """

        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
            
            if not user:
                return {"success": False, "error": "Usuario no encontrado"}
            
            if not user.account_status:
                return {"success": False, "error": "La cuenta ya esta inactiva"}
            
            user.account_status = False
            db.commit()
            
            return {
                "success": True,
                "message": "Cuenta eliminada correctamente"
            }
        except Exception as e:
            db.rollback()
            return {"success": False, "error": f"Error al eliminar cuenta: {str(e)}"}
    
    def get_basic_profile(self, db: Session, cognito_sub: str) -> Optional[Dict]:
        """
        Autor: Lizbeth Barajas

        Descripción:
            Obtiene la información básica del perfil del usuario, incluyendo nombre,
            apellido, correo e imagen de perfil. Se utiliza para vistas simplificadas.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.

        Retorna:
            dict: Datos básicos del usuario autenticado.
        """

        """
        Autor: Lizbeth Barajas

        Descripción:
            Obtiene la información básica del perfil del usuario, incluyendo nombre,
            apellido, correo e imagen de perfil. Se utiliza para vistas simplificadas.

        Parámetros:
            db (Session): Sesión activa de la base de datos.
            cognito_sub (str): Identificador único del usuario en Cognito.

        Retorna:
            dict: Datos básicos del usuario autenticado.
        """

        try:
            user = db.query(User).filter(User.cognito_sub == cognito_sub).first()
            
            if not user:
                return {"success": False, "error": "Usuario no encontrado"}
            
            return {
                "success": True,
                "user": {
                    "user_id": str(user.user_id),
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "profile_picture": user.profile_picture
                }
            }
        except Exception as e:
            return {"success": False, "error": f"Error al obtener perfil básico: {str(e)}"}

user_profile_service = UserProfileService()