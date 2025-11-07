from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# Schema para imágenes de producto
class ProductImageBase(BaseModel):
    image_path: str
    is_primary: bool = False


class ProductImageCreate(ProductImageBase):
    pass


class ProductImageResponse(ProductImageBase):
    image_id: int
    product_id: int
    
    class Config:
        from_attributes = True


# Schema para producto
class ProductBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=100)
    nutritional_value: Optional[str] = None
    price: float = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    category_id: int


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    brand: Optional[str] = Field(None, max_length=100)
    nutritional_value: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category_id: Optional[int] = None
    is_active: Optional[bool] = None


class ProductResponse(ProductBase):
    product_id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    images: List[ProductImageResponse] = []
    
    class Config:
        from_attributes = True


# Schema para categoría
class CategoryBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    category_id: int
    
    class Config:
        from_attributes = True
