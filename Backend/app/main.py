from fastapi import FastAPI
from app.services.scheduler import start_scheduler, stop_scheduler
from contextlib import asynccontextmanager
import logging
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_router
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi
from fastapi.responses import JSONResponse

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

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

logger.info(f"CORS Origins configurados: {settings.BACKEND_CORS_ORIGINS}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluir el router principal de la API
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Welcome to the T1-MFDS 2025 Backend!",
        "docs": "/docs",
        "api_v1": "/api/v1"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": settings.APP_VERSION
    }

@app.get("/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    # Retorna la definición OpenAPI, bypassando la seguridad de los endpoints
    return JSONResponse(get_openapi(title=app.title, version=app.APP_VERSION, routes=app.routes))

@app.get("/docs", include_in_schema=False)
async def get_documentation():
    # Retorna la interfaz de Swagger UI
    return get_swagger_ui_html(openapi_url="/openapi.json", title=app.title)
