# Autor: Luis Flores
# Fecha: 13/11/2025
# Descripción: Rutas API de administración para gestión de productos. Incluye endpoints
#              para crear, actualizar y eliminar productos, así como operaciones en lote.
#              Todos los endpoints requieren permisos de administrador.

from fastapi import APIRouter, Depends, Query, status, Form, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from app.api.deps import get_db, require_admin, get_current_user
from app.api.v1.admin import schemas
from app.api.v1.admin.service import AdminProductService, AdminUserService
from app.api.v1.products import schemas as product_schemas
from app.api.v1.products.service import ProductService
from app.models.user import User

router = APIRouter()


# ============ GESTIÓN DE PRODUCTOS (ADMIN) ============

@router.post("/products", response_model=product_schemas.ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    name: str = Form(...),
    description: str = Form(...),
    brand: str = Form(...),
    category: str = Form(...),
    physical_activities: str = Form("[]", description="JSON array o strings separados por coma"),
    fitness_objectives: str = Form("[]", description="JSON array o strings separados por coma"),
    nutritional_value: str = Form(...),
    price: float = Form(..., gt=0),
    stock: int = Form(..., ge=0),
    images: List[UploadFile] = File(..., description="Al menos 1 imagen es requerida"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Crea un nuevo producto con sus imágenes. Este endpoint usa multipart/form-data
                 para permitir la carga de archivos. Valida formatos de imagen y tamaños,
                 sube las imágenes a S3 y registra el producto en la base de datos.
    Parámetros:
        name (str): Nombre del producto.
        description (str): Descripción detallada.
        brand (str): Marca del producto.
        category (str): Categoría del producto.
        physical_activities (str): Actividades físicas relacionadas (JSON array o CSV).
        fitness_objectives (str): Objetivos fitness relacionados (JSON array o CSV).
        nutritional_value (str): Información nutricional.
        price (float): Precio del producto (mayor a 0).
        stock (int): Cantidad en inventario (mayor o igual a 0).
        images (List[UploadFile]): Lista de imágenes del producto (mínimo 1).
        current_user (User): Usuario administrador autenticado.
        db (Session): Sesión de base de datos.
    Retorna:
        ProductResponse: Producto creado con todas sus relaciones.
    Excepciones:
        HTTPException 400: Si no se proporciona al menos 1 imagen o hay errores en los datos.
    """
    from app.services.s3_service import S3Service
    from app.models.product import Product
    from app.models.product_image import ProductImage
    
    # Validar que hay al menos 1 imagen
    if not images or len(images) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Debes subir al menos 1 imagen del producto"
        )
    
    # Función helper para parsear arrays
    def parse_array_field(value: str, field_name: str) -> list:
        """
        Autor: Luis Flores
        Descripción: Parsea un campo que puede ser JSON array o string separado por comas.
        Parámetros:
            value (str): Valor a parsear.
            field_name (str): Nombre del campo para mensajes de error.
        Retorna:
            list: Lista de valores parseados.
        Excepciones:
            HTTPException 400: Si el formato JSON es inválido.
        """
        if not value or value.strip() == "":
            return []
        
        value = value.strip()
        
        # Intentar parsear como JSON
        if value.startswith('['):
            try:
                result = json.loads(value)
                if isinstance(result, list):
                    return result
                else:
                    raise ValueError(f"{field_name} debe ser un array")
            except json.JSONDecodeError as e:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Error en {field_name}: JSON inválido. Ejemplo: '[\"weightlifting\", \"crossfit\"]'"
                )
        
        # Si no es JSON, asumir que es string separado por comas
        return [item.strip() for item in value.split(',') if item.strip()]
    
    # Parsear los arrays
    try:
        physical_activities_list = parse_array_field(physical_activities, "physical_activities")
        fitness_objectives_list = parse_array_field(fitness_objectives, "fitness_objectives")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Error procesando arrays: {str(e)}"
        )
    
    # Crear el producto en la BD
    new_product = Product(
        name=name,
        description=description,
        brand=brand,
        category=category,
        physical_activities=physical_activities_list,
        fitness_objectives=fitness_objectives_list,
        nutritional_value=nutritional_value,
        price=price,
        stock=stock,
        is_active=True
    )
    
    db.add(new_product)
    db.flush()  # Para obtener el product_id sin hacer commit aún
    
    # Subir imágenes a S3
    s3_service = S3Service()
    uploaded_count = 0
    errors = []
    
    for idx, image_file in enumerate(images):
        try:
            # Leer la imagen
            image_bytes = await image_file.read()
            
            # Subir a S3
            result = s3_service.upload_product_img(
                file_content=image_bytes,
                product_id=str(new_product.product_id)
            )
            
            if result["success"]:
                # Guardar en la BD
                db_image = ProductImage(
                    product_id=new_product.product_id,
                    image_path=result["file_url"],
                    is_primary=(idx == 0)  # La primera imagen es primary
                )
                db.add(db_image)
                uploaded_count += 1
            else:
                errors.append(f"Imagen {idx + 1}: {result['error']}")
        
        except Exception as e:
            errors.append(f"Imagen {idx + 1}: Error - {str(e)}")
    
    # Si ninguna imagen se subió, revertir la creación del producto
    if uploaded_count == 0:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se pudo subir ninguna imagen. Errores: {', '.join(errors)}"
        )
    
    # Si algunas imágenes fallaron, registrar pero continuar
    if errors:
        print(f"Advertencias al subir imágenes del producto {new_product.product_id}: {errors}")
    
    db.commit()
    db.refresh(new_product)
    
    return new_product


@router.put("/products/{product_id}", response_model=product_schemas.ProductResponse)
def update_product(
    product_id: int,
    product_data: product_schemas.ProductUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Actualiza un producto existente. Solo los campos proporcionados
                 en el request serán actualizados. Requiere permisos de administrador.
    Parámetros:
        product_id (int): ID del producto a actualizar.
        product_data (ProductUpdate): Datos del producto a actualizar (campos opcionales).
        current_user (User): Usuario administrador autenticado.
        db (Session): Sesión de base de datos.
    Retorna:
        ProductResponse: Producto actualizado con todas sus relaciones.
    Excepciones:
        HTTPException 404: Si el producto no existe.
    """
    return ProductService.update_product(db, product_id, product_data)


@router.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    hard_delete: bool = Query(False, description="Si es True, elimina permanentemente"),
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Elimina un producto. Por defecto hace soft delete (is_active = False).
                 Si hard_delete=True, elimina permanentemente de la base de datos.
    Parámetros:
        product_id (int): ID del producto a eliminar.
        hard_delete (bool): Si es True, eliminación permanente; si es False, soft delete.
        current_user (User): Usuario administrador autenticado.
        db (Session): Sesión de base de datos.
    Retorna:
        None: Respuesta 204 No Content si la eliminación fue exitosa.
    Excepciones:
        HTTPException 404: Si el producto no existe.
    """
    if hard_delete:
        ProductService.hard_delete_product(db, product_id)
    else:
        ProductService.delete_product(db, product_id)
    
    return None


@router.post("/products/bulk-action", response_model=schemas.BulkActionResponse)
def bulk_product_action(
    action_data: schemas.BulkProductAction,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Realiza operaciones en lote sobre múltiples productos.
                 Acciones disponibles: activar, desactivar o eliminar productos.
    Parámetros:
        action_data (BulkProductAction): IDs de productos y acción a realizar.
        current_user (User): Usuario administrador autenticado.
        db (Session): Sesión de base de datos.
    Retorna:
        BulkActionResponse: Resultado con cantidad de éxitos, fallos y lista de errores.
    """
    return AdminProductService.bulk_update_products(db, action_data)


# ============ GESTIÓN DE ADMINISTRADORES ============

@router.post("/users/create-admin", response_model=schemas.AdminUserResponse, status_code=status.HTTP_201_CREATED)
async def create_admin_user(
    email: str = Form(...),
    password: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    gender: Optional[str] = Form(None),
    birth_date: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),  # Por ahora solo requiere autenticación
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Crea un nuevo usuario con rol de administrador con imagen de perfil opcional.
                 TEMPORALMENTE ACCESIBLE: Cualquier usuario autenticado puede crear admins.
                 TODO: Cambiar a require_admin cuando esté listo.
    Parámetros:
        email (str): Email del nuevo administrador.
        password (str): Contraseña del administrador.
        first_name (str): Nombre del administrador.
        last_name (str): Apellido del administrador.
        gender (Optional[str]): Género (M, F, prefer_not_say).
        birth_date (Optional[str]): Fecha de nacimiento en formato ISO.
        profile_image (Optional[UploadFile]): Imagen de perfil del administrador.
        current_user (User): Usuario autenticado (temporal, debería ser admin).
        db (Session): Sesión de base de datos.
    Retorna:
        AdminUserResponse: Información del administrador creado.
    Excepciones:
        HTTPException 400: Si hay error en la creación o el email ya existe.
        HTTPException 422: Si los datos de entrada no son válidos.
    """
    from pydantic import ValidationError
    from datetime import date as date_type
    
    # Validar que la imagen sea realmente una imagen si se proporcionó
    if profile_image:
        if not profile_image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El archivo debe ser una imagen"
            )
        
        # Validar tamaño (máximo 5MB)
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        temp_content = b""
        
        while chunk := await profile_image.read(chunk_size):
            file_size += len(chunk)
            temp_content += chunk
            if file_size > 5 * 1024 * 1024:  # 5MB
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La imagen es demasiado grande (máximo 5MB)"
                )
        
        # Resetear el archivo para usarlo después
        image_bytes = temp_content
    else:
        image_bytes = None
    
    # Convertir birth_date string a date object si existe
    birth_date_obj = None
    if birth_date:
        try:
            birth_date_obj = date_type.fromisoformat(birth_date)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Formato de fecha inválido. Use YYYY-MM-DD"
            )
    
    # Validar datos básicos
    try:
        # Validación de password
        if len(password) < 8:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="La contraseña debe tener al menos 8 caracteres"
            )
        
        # Validación de género si se proporciona
        if gender and gender not in ["M", "F", "prefer_not_say"]:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Género inválido. Use: M, F o prefer_not_say"
            )
    except ValidationError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e)
        )
    
    result = AdminUserService.create_admin_user(
        db=db,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name,
        gender=gender,
        birth_date=birth_date_obj,
        profile_image=image_bytes
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    user = result["user"]
    return schemas.AdminUserResponse(
        user_id=user.user_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.value,
        account_status=user.account_status,
        created_at=user.created_at,
        profile_picture=user.profile_picture
    )


@router.patch("/users/promote-to-admin", response_model=schemas.AdminUserResponse)
def promote_user_to_admin(
    promotion_data: schemas.PromoteToAdminRequest,
    current_user: User = Depends(get_current_user),  # Por ahora solo requiere autenticación
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Convierte un usuario regular existente a administrador.
                 TEMPORALMENTE ACCESIBLE: Cualquier usuario autenticado puede promover a otros.
                 TODO: Cambiar a require_admin cuando esté listo.
    Parámetros:
        promotion_data (PromoteToAdminRequest): ID del usuario a promover.
        current_user (User): Usuario autenticado (temporal, debería ser admin).
        db (Session): Sesión de base de datos.
    Retorna:
        AdminUserResponse: Información del usuario promovido.
    Excepciones:
        HTTPException 400: Si hay error en la promoción.
        HTTPException 404: Si el usuario no existe.
    """
    result = AdminUserService.promote_user_to_admin(
        db=db,
        user_id=promotion_data.user_id
    )
    
    if not result.get("success"):
        error_msg = result.get("error")
        if "no encontrado" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    user = result["user"]
    return schemas.AdminUserResponse(
        user_id=user.user_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        role=user.role.value,
        account_status=user.account_status,
        created_at=user.created_at,
        profile_picture=user.profile_picture
    )


@router.get("/users/admins", response_model=list[schemas.AdminUserResponse])
def get_all_admins(
    current_user: User = Depends(get_current_user),  # Por ahora solo requiere autenticación
    db: Session = Depends(get_db)
):
    """
    Autor: Luis Flores
    Descripción: Obtiene la lista de todos los administradores del sistema.
                 TEMPORALMENTE ACCESIBLE: Cualquier usuario autenticado puede ver la lista.
                 TODO: Cambiar a require_admin cuando esté listo.
    Parámetros:
        current_user (User): Usuario autenticado (temporal, debería ser admin).
        db (Session): Sesión de base de datos.
    Retorna:
        list[AdminUserResponse]: Lista de todos los administradores.
    """
    result = AdminUserService.get_all_admins(db)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return [
        schemas.AdminUserResponse(
            user_id=admin.user_id,
            email=admin.email,
            first_name=admin.first_name,
            last_name=admin.last_name,
            role=admin.role.value,
            account_status=admin.account_status,
            created_at=admin.created_at,
            profile_picture=admin.profile_picture
        )
        for admin in result["admins"]
    ]