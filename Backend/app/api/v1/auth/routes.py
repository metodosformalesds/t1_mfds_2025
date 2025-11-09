from fastapi import (
    APIRouter, 
    HTTPException, 
    Depends, 
    UploadFile, 
    File, 
    status, 
    Form, 
    Security
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional, Dict
from app.api.v1.auth.service import cognito_service
from app.api.v1.auth import schemas
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

security = HTTPBearer()

"""Extrae el token del header Authorization"""
def get_token_from_header(
    credentials: HTTPAuthorizationCredentials = Security(security)
) -> str:
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se proporcionaron credenciales de autenticación",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return credentials.credentials

"""
Verifica el token JWT y devuelve el payload del usuario (como dict).
Si el token es inválido, lanza una excepción HTTP.
"""
def get_current_user(token: str = Depends(get_token_from_header)) -> Dict:
    payload = cognito_service.verify_token(token)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    #user_role = payload.get("custom:role")
    #is_admin = user_role == UserRole.ADMIN.value
    #payload["is_admin"] = is_admin
    # El payload es el diccionario decodificado del JWT
    # Contiene 'sub' (user_id), 'email', 'exp', 'iat', etc.
    return payload

"""
Registra un nuevo usuario.
Acepta datos de formulario (multipart/form-data) y una imagen opcional.
"""
@router.post("/signup", response_model=schemas.SignUpResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    db: Session = Depends(get_db),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    gender: Optional[str] = Form(None),
    birth_date: Optional[str] = Form(None), 
    profile_image: Optional[UploadFile] = None
):
    try:
        user_data = schemas.SignUpRequest(
            email=email,
            first_name=first_name,
            last_name=last_name,
            password=password,
            gender=gender,
            birth_date=birth_date,
        )
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=e.errors())

    image_bytes = await profile_image.read() if profile_image else None

    result = cognito_service.sign_up(db=db, user_data=user_data, profile_image=image_bytes)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result.get("error"))
    
    return result

"""Confirma el registro de usuario con el código del email."""
@router.post(
    "/confirm", 
    response_model=schemas.MessageResponse, 
    status_code=status.HTTP_200_OK
)
async def confirm_signup(data: schemas.ConfirmSignUpRequest):
    result = cognito_service.confirm_sign_up(data.email, data.code)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    return result

"""Reenvía el código de confirmación a un email."""
@router.post("/resend-code", response_model=schemas.MessageResponse)
async def resend_code(data: schemas.ResendCodeRequest):
    result = cognito_service.resend_confirmation_code(data.email)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    return result

"""Inicia sesión y obtiene tokens JWT."""
@router.post("/login", response_model=schemas.TokenResponse)
async def login(credentials: schemas.SignInRequest):
    result = cognito_service.sign_in(credentials.email, credentials.password)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=result["error"])
    
    # El servicio devuelve un dict, lo usamos para poblar el schema de respuesta
    return schemas.TokenResponse(
        success=True,
        access_token=result["access_token"],
        id_token=result["id_token"],
        refresh_token=result.get("refresh_token"),
        expires_in=result["expires_in"],
        token_type="Bearer"
    )

"""Refresca el Access Token usando un Refresh Token."""
@router.post("/refresh", response_model=schemas.TokenResponse)
async def refresh_access_token(data: schemas.RefreshTokenRequest):
    result = cognito_service.refresh_token(data.refresh_token)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=result.get("error"))
    
    return schemas.TokenResponse(
        success=True,
        access_token=result["access_token"],
        id_token=result["id_token"],
        refresh_token=data.refresh_token, # Reutiliza el mismo refresh token
        expires_in=result["expires_in"],
        token_type="Bearer"
    )

"""
Cierra la sesión del usuario (invalida el access token globalmente).
Requiere token de autenticación.
"""
@router.post("/logout", response_model=schemas.MessageResponse)
async def logout(token: str = Depends(get_token_from_header)):
    result = cognito_service.sign_out(token)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    return result

# Endpoints de gestion de contraseña en el auth
"""Inicia el flujo de recuperacion de contraseña (envía codigo)"""
@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(data: schemas.ForgotPasswordRequest):
    result = cognito_service.forgot_password(data.email)
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    return result

"""Establece una nueva contraseña usando el código de recuperacion"""
@router.post("/confirm-forgot-password", response_model=schemas.MessageResponse)
async def confirm_forgot_password(data: schemas.ConfirmForgotPasswordRequest):
    result = cognito_service.confirm_forgot_password(
        data.email, data.code, data.new_password
    )
    
    if not result.get("success"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])
    
    return result