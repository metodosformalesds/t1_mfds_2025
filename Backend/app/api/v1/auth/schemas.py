from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import date
import re
from app.models.enum import UserRole

"""
Schema para registro de usuario
"""
class SignUpRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=2, max_length=50)
    last_name: str = Field(..., min_length=2, max_length=50)
    gender: Optional[str] = Field(None, pattern="^(M|F|prefer_not_say)$") # M para male y F para female
    birth_date: Optional[date] = None
    role: UserRole = Field(default=UserRole.USER, description="El rol del usuario (por defecto: USER)")
    
    # Validador basado de cognito para contraseñas
    @validator('password')
    def validate_password(cls, v):

        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un número')
        
        if not any(char.islower() for char in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
            
        if not any(char.isupper() for char in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
            
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v) and not re.search(r'[^a-zA-Z0-9\s]', v):
            raise ValueError('La contraseña debe contener al menos un carácter especial')
           
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "password": "MiPassword123",
                "first_name": "Juan",
                "last_name": "Pérez",
                "gender": "male",
                "birth_date": "1990-01-15"
            }
        }

"""
Schema para respuesta de registro
"""
class SignUpResponse(BaseModel):
    success: bool
    message: str
    user_sub: Optional[str] = None
    user_id: Optional[str] = None
    profile_image_url: Optional[str] = None

"""
Schema para inicio de sesion
"""
class SignInRequest(BaseModel):
    email: EmailStr
    password: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "password": "MiPassword123"
            }
        }

"""
Schema para respuesta de tokens
"""
class TokenResponse(BaseModel):
    success: bool
    access_token: Optional[str] = None
    id_token: Optional[str] = None
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    token_type: str = "Bearer"
    error: Optional[str] = None

"""
Schema para confirmación de registro
"""
class ConfirmSignUpRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "code": "123456"
            }
        }

"""
Schema para reenviar código de verificacion
"""
class ResendCodeRequest(BaseModel):
    email: EmailStr
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com"
            }
        }

"""
Schema para refrescar token
"""
class RefreshTokenRequest(BaseModel):
    refresh_token: str
    
    class Config:
        json_schema_extra = {
            "example": {
                "refresh_token": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ..."
            }
        }

"""
Schema para solicitar recuperacion de contraseña
"""
class ForgotPasswordRequest(BaseModel):
    email: EmailStr
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com"
            }
        }

"""
Schema para confirmar nueva contraseña
"""
class ConfirmForgotPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=8)
    
    # Mismo validador de contraseña
    @validator('new_password')
    def validate_password(cls, v):
        """Valida que la contraseña cumpla con requisitos mínimos"""
        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(char.isupper() for char in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(char.islower() for char in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "email": "usuario@example.com",
                "code": "123456",
                "new_password": "NuevaPassword123"
            }
        }

"""
Schema para cambiar contraseña estando autenticado
"""
class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str = Field(..., min_length=8)
    
    @validator('new_password')
    def validate_password(cls, v):
        """Valida que la contraseña cumpla con requisitos mínimos"""
        if not any(char.isdigit() for char in v):
            raise ValueError('La contraseña debe contener al menos un número')
        if not any(char.isupper() for char in v):
            raise ValueError('La contraseña debe contener al menos una mayúscula')
        if not any(char.islower() for char in v):
            raise ValueError('La contraseña debe contener al menos una minúscula')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "old_password": "MiPassword123",
                "new_password": "NuevaPassword456"
            }
        }

"""
Schema genérico para respuestas con mensaje
"""
class MessageResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
