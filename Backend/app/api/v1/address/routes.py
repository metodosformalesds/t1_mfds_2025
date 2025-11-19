# Autor: Lizbeth Barajas
# Fecha: 11-11-25
# Descripción: Rutas para la gestión de direcciones de usuario

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    status
)
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.api.v1.address import schemas
from app.api.v1.address.service import address_service

router = APIRouter()

"""
Extrae el token del header Authorization
"""

@router.get("", response_model=schemas.AddressListResponse, status_code=status.HTTP_200_OK)
async def get_all_addresses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Obtiene la lista completa de direcciones registradas por el usuario
        autenticado. Solo devuelve direcciones pertenecientes al Cognito Sub
        del usuario actual.

    Parámetros:
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Payload del usuario autenticado.

    Retorna:
        AddressListResponse: Lista de direcciones del usuario.
    """

    cognito_sub = current_user.cognito_sub
    
    result = address_service.get_user_addresses(db=db, cognito_sub=cognito_sub)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result

@router.get("/{address_id}", response_model=schemas.AddressResponse, status_code=status.HTTP_200_OK)
async def get_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Obtiene una dirección específica utilizando su ID, validando que
        pertenezca al usuario actualmente autenticado.

    Parámetros:
        address_id (int): ID de la dirección a obtener.
        db (Session): Sesión de la base de datos.
        current_user (dict): Usuario autenticado.

    Retorna:
        AddressResponse: Datos de la dirección solicitada.
    """
    
    cognito_sub = current_user.cognito_sub
    
    result = address_service.get_address_by_id(db=db, cognito_sub=cognito_sub, address_id=address_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("error")
        )
    
    return result["address"]

@router.post("", response_model=schemas.AddressResponse, status_code=status.HTTP_201_CREATED)
async def create_address(
    address_data: schemas.CreateAddressRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Crea una nueva dirección asociada al usuario autenticado. Permite
        registrar direcciones completas e indicar si será la dirección
        predeterminada.

    Parámetros:
        address_data (CreateAddressRequest): Datos de la dirección a crear.
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Usuario autenticado.

    Retorna:
        AddressResponse: Dirección recién creada.
    """

    cognito_sub = current_user.cognito_sub
    
    result = address_service.create_address(
        db=db,
        cognito_sub=cognito_sub,
        address_name=address_data.address_name,
        address_line1=address_data.address_line1,
        address_line2=address_data.address_line2,
        country=address_data.country,
        state=address_data.state,
        city=address_data.city,
        zip_code=address_data.zip_code,
        recipient_name=address_data.recipient_name,
        phone_number=address_data.phone_number,
        is_default=address_data.is_default
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result["address"]

@router.put("/{address_id}", response_model=schemas.AddressResponse, status_code=status.HTTP_200_OK)
async def update_address(
    address_id: int,
    address_data: schemas.UpdateAddressRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Actualiza una dirección existente validando que pertenezca al usuario
        actual. Permite modificar cualquier campo de la dirección, incluida la
        opción de marcarla como predeterminada.

    Parámetros:
        address_id (int): ID de la dirección a actualizar.
        address_data (UpdateAddressRequest): Datos nuevos de la dirección.
        db (Session): Sesión de la base de datos.
        current_user (dict): Usuario autenticado.

    Retorna:
        AddressResponse: Dirección actualizada.
    """

    cognito_sub = current_user.cognito_sub
    
    result = address_service.update_address(
        db=db,
        cognito_sub=cognito_sub,
        address_id=address_id,
        address_name=address_data.address_name,
        address_line1=address_data.address_line1,
        address_line2=address_data.address_line2,
        country=address_data.country,
        state=address_data.state,
        city=address_data.city,
        zip_code=address_data.zip_code,
        recipient_name=address_data.recipient_name,
        phone_number=address_data.phone_number,
        is_default=address_data.is_default
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result["address"]

@router.delete("/{address_id}", response_model=schemas.MessageResponse, status_code=status.HTTP_200_OK)
async def delete_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Elimina lógicamente una dirección del usuario autenticado. La operación
        falla si la dirección no pertenece al usuario o no existe.

    Parámetros:
        address_id (int): ID de la dirección a eliminar.
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Usuario autenticado.

    Retorna:
        MessageResponse: Mensaje confirmando la eliminación.
    """

    cognito_sub = current_user.cognito_sub
    
    result = address_service.delete_address(db=db, cognito_sub=cognito_sub, address_id=address_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result

@router.patch("/{address_id}/set-default", response_model=schemas.AddressResponse, status_code=status.HTTP_200_OK)
async def set_default_address(
    address_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Establece una dirección como la predeterminada del usuario autenticado.
        Automáticamente desactiva la anterior dirección marcada como default.

    Parámetros:
        address_id (int): ID de la dirección a establecer como predeterminada.
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Usuario autenticado.

    Retorna:
        AddressResponse: Dirección marcada como predeterminada.
    """

    cognito_sub = current_user.cognito_sub
    
    result = address_service.set_default_address(db=db, cognito_sub=cognito_sub, address_id=address_id)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result["address"]
