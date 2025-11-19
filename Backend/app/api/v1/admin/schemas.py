# Autor: Luis Flores
# Fecha: 13/11/2025
# Descripción: Schemas de validación y serialización para el módulo de administración.
#              Define las estructuras de datos para operaciones administrativas en lote.

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, datetime


# ============ GESTIÓN DE PRODUCTOS ============

class BulkProductAction(BaseModel):
    """
    Autor: Luis Flores
    Descripción: Schema para realizar acciones en lote sobre múltiples productos.
                 Permite activar, desactivar o eliminar varios productos simultáneamente.
    """
    product_ids: List[int] = Field(..., description="Lista de IDs de productos a procesar")
    action: str = Field(
        ..., 
        pattern="^(activate|deactivate|delete)$",
        description="Acción a realizar: 'activate', 'deactivate' o 'delete'"
    )


class BulkActionResponse(BaseModel):
    """
    Autor: Luis Flores
    Descripción: Schema de respuesta para operaciones en lote.
                 Indica cuántos productos se procesaron exitosamente y cuántos fallaron.
    """
    success: int = Field(..., description="Cantidad de productos procesados exitosamente")
    failed: int = Field(..., description="Cantidad de productos que fallaron")
    errors: List[str] = Field(
        default=[],
        description="Lista de mensajes de error para productos que fallaron"
    )


# ============ GESTIÓN DE ADMINISTRADORES ============

class CreateAdminRequest(BaseModel):
    """
    Autor: Luis Flores
    Descripción: Schema para crear un nuevo usuario administrador.
    """
    email: str = Field(..., description="Email del nuevo administrador")
    password: str = Field(..., min_length=8, description="Contraseña del administrador")
    first_name: str = Field(..., min_length=2, max_length=50, description="Nombre")
    last_name: str = Field(..., min_length=2, max_length=50, description="Apellido")
    gender: Optional[str] = Field(None, pattern="^(M|F|prefer_not_say)$", description="Género")
    birth_date: Optional[date] = Field(None, description="Fecha de nacimiento")
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "admin@befit.com",
                "password": "Admin123!",
                "first_name": "Juan",
                "last_name": "Administrador",
                "gender": "M",
                "birth_date": "1990-01-15"
            }
        }


class PromoteToAdminRequest(BaseModel):
    """
    Autor: Luis Flores
    Descripción: Schema para promover un usuario existente a administrador.
    """
    user_id: int = Field(..., description="ID del usuario a promover")
    
    class Config:
        json_schema_extra = {
            "example": {
                "user_id": 5
            }
        }


class AdminUserResponse(BaseModel):
    """
    Autor: Luis Flores
    Descripción: Schema de respuesta para operaciones de administradores.
    """
    user_id: int
    email: str
    first_name: str
    last_name: str
    role: str
    account_status: bool
    created_at: datetime
    profile_picture: Optional[str] = Field(None, description="URL de la imagen de perfil en S3")
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "user_id": 1,
                "email": "admin@befit.com",
                "first_name": "Juan",
                "last_name": "Administrador",
                "role": "ADMIN",
                "account_status": True,
                "created_at": "2024-11-17T10:00:00Z",
                "profile_picture": "https://bucket.s3.region.amazonaws.com/profile_images/local_admin_xxx/picture.jpg"
            }
        }