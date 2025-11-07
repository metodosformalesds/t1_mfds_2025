# routes/upload.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from services.s3_service import s3_service

router = APIRouter(prefix="/upload", tags=["Upload"])

@router.post("/profile-image/{user_id}")
async def upload_profile_image(
    user_id: str,
    file: UploadFile = File(...)
):
    """
    Sube una imagen de perfil a S3
    - **user_id**: ID del usuario
    - **file**: Archivo de imagen (JPEG, PNG, WEBP)
    """
    # Validar que sea una imagen
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    # Leer el contenido del archivo
    file_content = await file.read()
    
    # Subir a S3
    result = s3_service.upload_profile_img(file_content, user_id)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return JSONResponse(
        status_code=200,
        content={
            "message": "Imagen subida exitosamente",
            "file_url": result["file_url"],
            "file_name": result["file_name"]
        }
    )

@router.delete("/profile-image")
async def delete_profile_image(file_name: str):
    """
    Elimina una imagen de perfil de S3
    - **file_name**: Nombre del archivo en S3 (ej: profile_images/user123/uuid.jpg)
    """
    result = s3_service.delete_profile_img(file_name)
    
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    
    return JSONResponse(
        status_code=200,
        content={"message": result["message"]}
    )