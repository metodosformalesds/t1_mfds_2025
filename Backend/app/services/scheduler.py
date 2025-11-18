# Autor: Lizbeth Barajas y Luis Flores
# Fecha: 12/11/25
# Descripción: Scheduler para la ejecución automática de tareas programadas (cron jobs),
#              incluyendo expiración de puntos diarios y procesamiento de suscripciones.
#              Este módulo inicia, detiene y monitorea el scheduler global utilizado
#              por la aplicación, además de ofrecer funciones para ejecutar jobs manualmente.

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from app.core.database import SessionLocal
from app.api.v1.loyalty.service import loyalty_service
from app.api.v1.subscriptions.service import subscription_service

# Configurar logging
logger = logging.getLogger(__name__)

def get_db_session() -> Session:
    """
    Crea una nueva sesion de base de datos para usar en los jobs
    """
    return SessionLocal()

# ==================== JOBS ====================

def expire_points_daily_job():
    """
    Autor: Lizbeth Barajas

    Descripción:
        Job programado que expira los puntos de fidelidad de todos los usuarios.
        Se ejecuta diariamente a las 00:00. Registra información detallada del proceso
        incluyendo puntos expirados, usuarios afectados y cualquier error.

    Parámetros:
        Ninguno

    Retorna:
        None: Este job solo ejecuta procesos y registra logs.
    """
    logger.info("="*50)
    logger.info(f"[{datetime.now()}] Iniciando job: Expiración de puntos")
    logger.info("="*50)
    
    db = get_db_session()
    try:
        result = loyalty_service.expire_all_points(db)
        
        if result.get("success"):
            logger.info(
                f"Expiración completada exitosamente:\n"
                f"  - Usuarios afectados: {result.get('users_affected', 0)}\n"
                f"  - Total de puntos expirados: {result.get('total_expired_points', 0)}"
            )
        else:
            error_msg = result.get('error', 'Error desconocido')
            logger.error(f"Error en expiración de puntos: {error_msg}")
            
    except Exception as e:
        logger.error(f"Excepción fatal en job de expiración: {str(e)}", exc_info=True)
    finally:
        db.close()
        logger.info("="*50)
        logger.info(f"Job de expiración finalizado\n")


def process_subscriptions_daily_job():
    """
    Autor: Lizbeth Barajas

    Descripción:
        Job programado que procesa los cobros de suscripciones diarias.
        Se ejecuta a las 00:30. Realiza cobro en Stripe, genera órdenes,
        actualiza fechas de entrega y maneja fallos o reintentos de pago.

    Parámetros:
        Ninguno

    Retorna:
        None: Solo ejecuta lógica de procesamiento y guarda logs del resultado.
    """
    logger.info("="*50)
    logger.info(f"[{datetime.now()}] Iniciando job: Procesamiento de suscripciones")
    logger.info("="*50)
    
    db = get_db_session()
    try:
        result = subscription_service.process_due_subscriptions(db)
        
        if result.get("success"):
            results_data = result.get("results", {})
            logger.info(
                f"Procesamiento de suscripciones completado:\n"
                f"  - Total procesadas: {results_data.get('total_processed', 0)}\n"
                f"  - Exitosas: {results_data.get('successful', 0)}\n"
                f"  - Fallidas: {results_data.get('failed', 0)}"
            )
            
            # Registrar errores específicos si los hay
            if results_data.get('errors'):
                logger.warning("Errores en suscripciones:")
                for error in results_data['errors']:
                    logger.warning(
                        f"  - Subscription ID {error.get('subscription_id')} "
                        f"(User {error.get('user_id')}): {error.get('error')}"
                    )
        else:
            error_msg = result.get('error', 'Error desconocido')
            logger.error(f"Error en procesamiento de suscripciones: {error_msg}")
            
    except Exception as e:
        logger.error(f"Excepción fatal en job de suscripciones: {str(e)}", exc_info=True)
    finally:
        db.close()
        logger.info("="*50)
        logger.info(f"Job de suscripciones finalizado\n")


# ==================== SCHEDULER ====================

# Variable global para mantener referencia al scheduler
_scheduler = None

def start_scheduler():
    """
    Autor: Lizbeth Barajas

    Descripción:
        Inicia el scheduler global de la aplicación y registra todos los cron jobs
        configurados (expiración de puntos y procesamiento de suscripciones).
        Esta función se ejecuta al iniciar la aplicación.

    Parámetros:
        Ninguno

    Retorna:
        BackgroundScheduler: Instancia del scheduler activo con los jobs cargados.
    """
    global _scheduler
    
    if _scheduler is not None:
        logger.warning("El scheduler ya está corriendo")
        return _scheduler
    
    logger.info("Inicializando scheduler de tareas programadas...")
    
    _scheduler = BackgroundScheduler(
        timezone="America/Denver",
        job_defaults={
            'coalesce': True,
            'max_instances': 1,
            'misfire_grace_time': 3600
        }
    )
    
    # ==================== REGISTRAR JOBS ====================
    
    # Job 1: Expiracion diaria de puntos (00:00)
    _scheduler.add_job(
        func=expire_points_daily_job,
        trigger=CronTrigger(hour=0, minute=0),
        id='expire_points_daily',
        name='Expiración diaria de puntos',
        replace_existing=True
    )
    
    # Job 2: Procesamiento de suscripciones (00:30)
    _scheduler.add_job(
        func=process_subscriptions_daily_job,
        trigger=CronTrigger(hour=0, minute=30),
        id='process_subscriptions_daily',
        name='Procesamiento diario de suscripciones',
        replace_existing=True
    )
    
    # Iniciar el scheduler
    _scheduler.start()
    logger.info("Scheduler iniciado correctamente")
    
    # Mostrar informacion de los jobs programados
    logger.info("\nJobs programados:")
    for job in _scheduler.get_jobs():
        next_run = job.next_run_time.strftime('%Y-%m-%d %H:%M:%S') if job.next_run_time else 'N/A'
        logger.info(f"   • {job.name} (ID: {job.id})")
        logger.info(f"     Próxima ejecución: {next_run}")
    
    return _scheduler

def stop_scheduler():
    """
    Autor: Lizbeth Barajas

    Descripción:
        Detiene de forma segura el scheduler global. Esta función es llamada
        cuando la aplicación se apaga o requiere detener las tareas programadas.

    Parámetros:
        Ninguno

    Retorna:
        None
    """
    global _scheduler
    
    if _scheduler is not None:
        logger.info("Deteniendo scheduler...")
        _scheduler.shutdown(wait=True)
        _scheduler = None
        logger.info("Scheduler detenido correctamente")
    else:
        logger.warning("El scheduler no estaba corriendo")

def get_scheduler_status():
    """
    Devuelve el estado actual del scheduler y sus jobs - Para monitoreo
    """
    global _scheduler
    
    if _scheduler is None:
        return {
            "running": False,
            "jobs": []
        }
    
    jobs_info = []
    for job in _scheduler.get_jobs():
        jobs_info.append({
            "id": job.id,
            "name": job.name,
            "next_run_time": job.next_run_time.isoformat() if job.next_run_time else None,
            "trigger": str(job.trigger)
        })
    
    return {
        "running": _scheduler.running,
        "jobs": jobs_info
    }

# ==================== FUNCIONES DE TESTING ====================

def run_expire_points_now():
    """
    Autor: Lizbeth Barajas

    Descripción:
        Ejecuta inmediatamente el job de expiración de puntos.
        Usado únicamente para pruebas o debugging en entornos no productivos.

    Parámetros:
        Ninguno

    Retorna:
        None
    """
    logger.info("Ejecutando expiración de puntos manualmente (testing)...")
    expire_points_daily_job()

def run_process_subscriptions_now():
    """
    Autor: Luis Flores

    Descripción:
        Ejecuta de inmediato el job de procesamiento de suscripciones.
        Usado para pruebas o debugging fuera de producción.

    Parámetros:
        Ninguno

    Retorna:
        None
    """
    logger.info("Ejecutando procesamiento de suscripciones manualmente (testing)...")
    process_subscriptions_daily_job()