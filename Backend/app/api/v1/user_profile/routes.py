# Autor: Lizbeth Barajas
# Fecha: 10-11-25
# Descripción: Rutas para la gestión del perfil de usuario, incluyendo obtención de
#              información general, información básica, actualización de datos,
#              actualización de imagen de perfil y eliminación lógica de la cuenta.

from fastapi import (
    APIRouter,
    HTTPException,
    Depends,
    UploadFile,
    File,
    status
)
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.api.v1.user_profile import schemas
from app.api.v1.user_profile.service import user_profile_service

router = APIRouter()

"""
Obtiene el perfil completo del usuario autenticado
"""
@router.get("/me", response_model=schemas.UserProfileResponse, status_code=status.HTTP_200_OK)
async def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Obtiene el perfil completo del usuario autenticado, incluyendo
        información personal, imagen de perfil y otra metadata relevante.

    Parámetros:
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Información del usuario autenticado.

    Retorna:
        UserProfileResponse: Perfil completo del usuario.
    """

    cognito_sub = current_user.cognito_sub
    
    result = user_profile_service.get_user_profile(db=db, cognito_sub=cognito_sub)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("error")
        )
    
    return result["user"]

@router.get("/me/basic", response_model=schemas.BasicProfileResponse, status_code=status.HTTP_200_OK)
async def get_my_basic_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Obtiene únicamente la información básica del perfil del usuario
        autenticado, como nombre, apellido e imagen de perfil.

    Parámetros:
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Información del usuario autenticado.

    Retorna:
        BasicProfileResponse: Datos esenciales del perfil del usuario.
    """

    cognito_sub = current_user.cognito_sub
    
    result = user_profile_service.get_basic_profile(db=db, cognito_sub=cognito_sub)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result.get("error")
        )
    
    return result["user"]

@router.put("/me", response_model=schemas.UserProfileResponse, status_code=status.HTTP_200_OK)
async def update_my_profile(
    profile_data: schemas.UpdateProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Actualiza la información personal del usuario autenticado,
        incluyendo nombre, apellido, género y fecha de nacimiento.

    Parámetros:
        profile_data (UpdateProfileRequest): Datos nuevos del perfil.
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Payload del usuario autenticado.

    Retorna:
        UserProfileResponse: Perfil actualizado del usuario.
    """

    cognito_sub = current_user.cognito_sub
    
    result = user_profile_service.update_user_profile(
        db=db,
        cognito_sub=cognito_sub,
        first_name=profile_data.first_name,
        last_name=profile_data.last_name,
        gender=profile_data.gender,
        date_of_birth=profile_data.date_of_birth
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result["user"]

@router.put("/me/image", response_model=schemas.ProfileImageResponse, status_code=status.HTTP_200_OK)
async def update_profile_image(
    profile_image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Actualiza la imagen de perfil del usuario autenticado. Valida que el
        archivo recibido sea una imagen y delega el procesamiento al servicio
        correspondiente.

    Parámetros:
        profile_image (UploadFile): Archivo enviado por el usuario.
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Información del usuario autenticado.

    Retorna:
        ProfileImageResponse: Información sobre la nueva imagen de perfil.
    """

    cognito_sub = current_user.cognito_sub
    
    # Validar que es una imagen
    if not profile_image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El archivo debe ser una imagen"
        )
    
    # Leer el contenido de la imagen
    image_content = await profile_image.read()
    
    result = user_profile_service.update_profile_image(
        db=db,
        cognito_sub=cognito_sub,
        image_content=image_content
    )
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result

@router.delete("/me", response_model=schemas.DeleteAccountResponse, status_code=status.HTTP_200_OK)
async def delete_my_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Autor: Lizbeth Barajas

    Descripción:
        Realiza la eliminación lógica (soft delete) del perfil del usuario
        autenticado. Desactiva la cuenta sin borrar permanentemente sus
        registros asociados.

    Parámetros:
        db (Session): Sesión activa de la base de datos.
        current_user (dict): Payload del usuario autenticado.

    Retorna:
        DeleteAccountResponse: Resultado de la operación de eliminación.
    """

    cognito_sub = current_user.cognito_sub
    
    result = user_profile_service.soft_delete_account(db=db, cognito_sub=cognito_sub)
    
    if not result.get("success"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result.get("error")
        )
    
    return result