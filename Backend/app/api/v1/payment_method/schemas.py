from pydantic import BaseModel, Field, field_validator
from typing import Optional
from app.models.enum import PaymentType
import re

"""
Schema para crear un nuevo metodo de pago
"""
class CreatePaymentMethodRequest(BaseModel):
    payment_type: PaymentType
    provider_ref: str = Field(..., description="Token o referencia del proveedor (Stripe/PayPal)")
    last_four: str = Field(..., min_length=4, max_length=4, description="Últimos 4 dígitos para identificación")
    expiration_date: Optional[str] = Field(None, description="Fecha de expiración (MM/YY)")
    is_default: bool = False
    
    @field_validator('last_four')
    def validate_last_four(cls, v):
        if not v.isdigit():
            raise ValueError('Los últimos 4 dígitos deben ser numéricos')
        return v
    
    @field_validator('expiration_date')
    def validate_expiration(cls, v):
        if v is None:
            return v
        if not re.match(r'^\d{2}/\d{2}$', v):
            raise ValueError('Formato de fecha de expiración inválido (debe ser MM/YY)')
        return v
    
    class Config:
        json_schema_extra = {
            "example": {
                "payment_type": "credit_card",
                "provider_ref": "tok_1234567890abcdef",
                "last_four": "4532",
                "expiration_date": "12/29",
                "is_default": True
            }
        }

"""
Schema de respuesta para el metodo de pago
"""
class PaymentMethodResponse(BaseModel):
    payment_id: int
    user_id: int
    payment_type: str
    last_four: str
    expiration_date: Optional[str] = None
    is_default: bool
    
    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "payment_id": 1,
                "user_id": "123e4567-e89b-12d3-a456-426614174000",
                "payment_type": "credit_card",
                "last_four": "4532",
                "expiration_date": "12/29",
                "is_default": True
            }
        }

"""
Schema de listado de metodos de pago
"""
class PaymentMethodListResponse(BaseModel):
    success: bool
    payment_methods: list[PaymentMethodResponse]
    total: int
    
    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "payment_methods": [
                    {
                        "payment_id": 1,
                        "user_id": "123e4567-e89b-12d3-a456-426614174000",
                        "payment_type": "credit_card",
                        "last_four": "4532",
                        "expiration_date": "12/29",
                        "is_default": True
                    }
                ],
                "total": 1
            }
        }

"""
Schema genérico para respuestas con mensaje
"""
class MessageResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    error: Optional[str] = None
