from fastapi import FastAPI
from app.services.scheduler import start_scheduler, stop_scheduler
from contextlib import asynccontextmanager
import logging
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Maneja el ciclo de vida de la aplicacion
    """
    # ===== STARTUP =====
    logger.info("Iniciando aplicación FastAPI...")
    
    # Iniciar el scheduler
    try:
        start_scheduler()
        logger.info("Scheduler inicializado correctamente")
    except Exception as e:
        logger.error(f"Error al inicializar scheduler: {e}")
        
    yield
    
    # ===== SHUTDOWN =====
    logger.info("Deteniendo aplicación FastAPI...")
    
    # Detener el scheduler
    try:
        stop_scheduler()
        logger.info("Scheduler detenido correctamente")
    except Exception as e:
        logger.error(f"Error al detener scheduler: {e}")
        
    logger.info("Aplicación detenida")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    #allow_origins=["*"],
    allow_origins=settings.BACKEND_CORS_ORIGINS, 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Esto es una prueba para probar el comando de uvicorn
@app.get("/")
def root():
    return {"message": "Welcome to the T1-MFDS 2025 Backend!"}