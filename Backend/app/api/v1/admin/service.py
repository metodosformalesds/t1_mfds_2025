# Autor: Luis Flores
# Fecha: 13/11/2025
# Descripción: Servicios de lógica de negocio para operaciones administrativas.
#              Implementa funcionalidades para gestión masiva de productos y administradores.

from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime, UTC, date
import uuid

from app.models.product import Product
from app.models.user import User
from app.models.enum import UserRole, AuthType, Gender
from app.core.security import hash_password
from app.services.s3_service import S3Service
from app.api.v1.admin import schemas


class AdminProductService:
    """
    Autor: Luis Flores
    Descripción: Clase de servicio para operaciones administrativas de productos.
                 Contiene métodos estáticos para gestión masiva y operaciones
                 que requieren permisos de administrador.
    """
    
    @staticmethod
    def bulk_update_products(
        db: Session,
        action_data: schemas.BulkProductAction
    ) -> schemas.BulkActionResponse:
        """
        Autor: Luis Flores
        Descripción: Realiza operaciones en lote sobre múltiples productos.
                     Procesa cada producto individualmente y registra éxitos y errores.
                     Acciones soportadas: activate, deactivate, delete.
        Parámetros:
            db (Session): Sesión de base de datos.
            action_data (BulkProductAction): Contiene lista de product_ids y acción a realizar.
        Retorna:
            BulkActionResponse: Objeto con contadores de success y failed, 
                                más lista de mensajes de error.
        """
        success = 0
        failed = 0
        errors = []
        
        for product_id in action_data.product_ids:
            try:
                product = db.query(Product).filter(
                    Product.product_id == product_id
                ).first()
                
                if not product:
                    errors.append(f"Producto {product_id} no encontrado")
                    failed += 1
                    continue
                
                if action_data.action == "activate":
                    product.is_active = True
                elif action_data.action == "deactivate":
                    product.is_active = False
                elif action_data.action == "delete":
                    db.delete(product)
                
                success += 1
            except Exception as e:
                errors.append(f"Error en producto {product_id}: {str(e)}")
                failed += 1
        
        db.commit()
        
        return schemas.BulkActionResponse(
            success=success,
            failed=failed,
            errors=errors
        )


class AdminUserService:
    """
    Autor: Luis Flores
    Descripción: Clase de servicio para operaciones de gestión de administradores.
    """
    
    @staticmethod
    def create_admin_user(
        db: Session,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        gender: Optional[str] = None,
        birth_date: Optional[date] = None,
        profile_image: Optional[bytes] = None
    ) -> dict:
        """
        Autor: Luis Flores
        Descripción: Crea un nuevo usuario con rol de administrador directamente en la base de datos.
                     No utiliza Cognito, solo crea el usuario localmente.
                     Soporta imagen de perfil opcional que se sube a S3.
        Parámetros:
            db (Session): Sesión de base de datos.
            email (str): Email del nuevo administrador.
            password (str): Contraseña en texto plano (se hasheará).
            first_name (str): Nombre del administrador.
            last_name (str): Apellido del administrador.
            gender (Optional[str]): Género del administrador.
            birth_date (Optional[date]): Fecha de nacimiento.
            profile_image (Optional[bytes]): Bytes de la imagen de perfil.
        Retorna:
            dict: Diccionario con success, user y message o error.
        """
        try:
            # Verificar si el email ya existe
            existing_user = db.query(User).filter(User.email == email).first()
            if existing_user:
                return {
                    "success": False,
                    "error": "El email ya está registrado en el sistema"
                }
            
            # Generar un cognito_sub único para este usuario local
            cognito_sub = f"local_admin_{uuid.uuid4()}"
            
            # Hashear la contraseña
            password_hash = hash_password(password)
            
            # Convertir gender string a enum si está presente
            gender_enum = None
            if gender:
                try:
                    gender_enum = Gender(gender)
                except ValueError:
                    return {
                        "success": False,
                        "error": "Valor de género inválido"
                    }
            
            # Subir imagen de perfil a S3 si se proporcionó
            profile_picture_url = None
            if profile_image:
                s3_service = S3Service()
                upload_result = s3_service.upload_profile_img(
                    file_content=profile_image,
                    user_id=cognito_sub
                )
                
                if not upload_result.get("success"):
                    return {
                        "success": False,
                        "error": f"Error al subir imagen: {upload_result.get('error')}"
                    }
                
                profile_picture_url = upload_result.get("file_url")
            
            # Crear el nuevo usuario administrador
            new_admin = User(
                cognito_sub=cognito_sub,
                email=email,
                auth_type=AuthType.EMAIL,
                password_hash=password_hash,
                first_name=first_name,
                last_name=last_name,
                gender=gender_enum,
                date_of_birth=birth_date,
                profile_picture=profile_picture_url,
                role=UserRole.ADMIN,  # ⭐ Rol de administrador
                account_status=True,
                created_at=datetime.now(UTC)
            )
            
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            
            return {
                "success": True,
                "message": "Administrador creado exitosamente",
                "user": new_admin
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Error al crear administrador: {str(e)}"
            }
    
    @staticmethod
    def promote_user_to_admin(
        db: Session,
        user_id: int
    ) -> dict:
        """
        Autor: Luis Flores
        Descripción: Convierte un usuario regular existente a administrador.
        Parámetros:
            db (Session): Sesión de base de datos.
            user_id (int): ID del usuario a promover.
        Retorna:
            dict: Diccionario con success, user y message o error.
        """
        try:
            # Buscar el usuario
            user = db.query(User).filter(User.user_id == user_id).first()
            
            if not user:
                return {
                    "success": False,
                    "error": "Usuario no encontrado"
                }
            
            # Verificar si ya es admin
            if user.role == UserRole.ADMIN:
                return {
                    "success": False,
                    "error": "El usuario ya es administrador"
                }
            
            # Verificar que la cuenta esté activa
            if not user.account_status:
                return {
                    "success": False,
                    "error": "No se puede promover una cuenta inactiva"
                }
            
            # Promover a administrador
            user.role = UserRole.ADMIN
            db.commit()
            db.refresh(user)
            
            return {
                "success": True,
                "message": f"Usuario {user.email} promovido a administrador exitosamente",
                "user": user
            }
            
        except Exception as e:
            db.rollback()
            return {
                "success": False,
                "error": f"Error al promover usuario: {str(e)}"
            }
    
    @staticmethod
    def get_all_admins(db: Session) -> dict:
        """
        Autor: Luis Flores
        Descripción: Obtiene todos los usuarios con rol de administrador.
        Parámetros:
            db (Session): Sesión de base de datos.
        Retorna:
            dict: Diccionario con success, admins y total.
        """
        try:
            admins = db.query(User).filter(User.role == UserRole.ADMIN).all()
            
            return {
                "success": True,
                "admins": admins,
                "total": len(admins)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Error al obtener administradores: {str(e)}"
            }
# Instancias singleton de los servicios
admin_product_service = AdminProductService()
admin_user_service = AdminUserService()
