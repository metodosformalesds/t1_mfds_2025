from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.api.v1.products.service import ProductService
from app.api.v1.products.schemas import (
    ProductResponse,
    ProductCreate,
    ProductUpdate,
    CategoryResponse,
    CategoryCreate
)

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("/", response_model=List[ProductResponse])
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, le=100),
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db)
):
    """Obtener lista de productos con filtros opcionales"""
    products = ProductService.get_all_products(
        db=db,
        skip=skip,
        limit=limit,
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price
    )
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    """Obtener un producto específico por ID"""
    return ProductService.get_product_by_id(db, product_id)


@router.post("/", response_model=ProductResponse, status_code=201)
def create_product(product: ProductCreate, db: Session = Depends(get_db)):
    """Crear un nuevo producto (requiere permisos de admin)"""
    return ProductService.create_product(db, product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product: ProductUpdate,
    db: Session = Depends(get_db)
):
    """Actualizar un producto existente (requiere permisos de admin)"""
    return ProductService.update_product(db, product_id, product)


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    """Eliminar (desactivar) un producto (requiere permisos de admin)"""
    return ProductService.delete_product(db, product_id)


@router.patch("/{product_id}/stock")
def update_stock(
    product_id: int,
    quantity: int,
    db: Session = Depends(get_db)
):
    """Actualizar el stock de un producto"""
    return ProductService.update_stock(db, product_id, quantity)


# Endpoints de categorías
@router.get("/categories/all", response_model=List[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    """Obtener todas las categorías"""
    return ProductService.get_all_categories(db)


@router.post("/categories/", response_model=CategoryResponse, status_code=201)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Crear una nueva categoría (requiere permisos de admin)"""
    return ProductService.create_category(
        db,
        name=category.name,
        description=category.description
    )