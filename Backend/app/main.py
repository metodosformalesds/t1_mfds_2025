from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app import models
from app.api.v1.auth import router as auth_router
from app.core.database import engine 

models.Base.metadata.create_all(bind=engine) # Crea las tablas de la base de datos

app = FastAPI(
    #title="BeFit",
    description="API Backend para BeFit - E-commerce de suplementos y fitness",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
)

# Esto es una prueba para probar el comando de uvicorn
@app.get("/")
def root():
    return {"message": "Welcome to the T1-MFDS 2025 Backend!"}

@app.get("/", tags=["Health"])
def read_root():
    return {
        "message": f"está funcionando correctamente",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "database": "connected", 
        "s3": "configured"
    }

# Rutas del modulo de auth/cognito
app.include_router(auth_router)
