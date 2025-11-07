from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from app.models.product import Product
from app.models.category import Category
from app.models.product_image import ProductImage
from app.api.v1.products.schemas import ProductCreate, ProductUpdate
from fastapi import HTTPException, status


class ProductService:
    
    @staticmethod
    def get_all_products(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category_id: Optional[int] = None,
        search: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None
    ) -> List[Product]:
        """Obtener lista de productos con filtros opcionales"""
        query = db.query(Product).filter(Product.is_active == True)
        
        # Filtro por categoría
        if category_id:
            query = query.filter(Product.category_id == category_id)
        
        # Búsqueda por nombre o descripción
        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%")
                )
            )
        
        # Filtro por rango de precio
        if min_price:
            query = query.filter(Product.price >= min_price)
        if max_price:
            query = query.filter(Product.price <= max_price)
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_product_by_id(db: Session, product_id: int) -> Product:
        """Obtener un producto por ID"""
        product = db.query(Product).filter(
            Product.product_id == product_id,
            Product.is_active == True
        ).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado"
            )
        
        return product
    
    @staticmethod
    def create_product(db: Session, product: ProductCreate) -> Product:
        """Crear un nuevo producto"""
        # Verificar que la categoría existe
        category = db.query(Category).filter(
            Category.category_id == product.category_id
        ).first()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
        
        db_product = Product(**product.dict())
        db.add(db_product)
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def update_product(
        db: Session,
        product_id: int,
        product_update: ProductUpdate
    ) -> Product:
        """Actualizar un producto existente"""
        db_product = ProductService.get_product_by_id(db, product_id)
        
        # Actualizar solo los campos proporcionados
        update_data = product_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_product, field, value)
        
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def delete_product(db: Session, product_id: int) -> dict:
        """Eliminar (desactivar) un producto"""
        db_product = ProductService.get_product_by_id(db, product_id)
        db_product.is_active = False
        db.commit()
        return {"message": "Producto eliminado correctamente"}
    
    @staticmethod
    def update_stock(db: Session, product_id: int, quantity: int) -> Product:
        """Actualizar el stock de un producto"""
        db_product = ProductService.get_product_by_id(db, product_id)
        
        if db_product.stock + quantity < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock insuficiente"
            )
        
        db_product.stock += quantity
        db.commit()
        db.refresh(db_product)
        return db_product
    
    @staticmethod
    def get_all_categories(db: Session) -> List[Category]:
        """Obtener todas las categorías"""
        return db.query(Category).all()
    
    @staticmethod
    def create_category(db: Session, name: str, description: str = None) -> Category:
        """Crear una nueva categoría"""
        db_category = Category(name=name, description=description)
        db.add(db_category)
        db.commit()
        db.refresh(db_category)
        return db_category
