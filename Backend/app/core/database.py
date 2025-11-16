# Autor: Gabriel Vilchis
# Fecha: 08/11/2025
# Descripción: Este archivo configura la conexión a la base de datos utilizando SQLAlchemy.
# Incluye la creación del motor de base de datos, la sesión y el modelo base,
# así como una función generadora para obtener sesiones de manera segura.
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, "../../.env"))  # ajusta la ruta si tu .env está en la raíz
# obtenemos el url de la bd desde las variables de entorno ubicados en .env
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("No se encontró DATABASE_URL en .env")

# parametros de conexion a sqlite
#engine = create_engine(
 #   DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
#

engine = create_engine(DATABASE_URL)  # no uses connect_args para SQLite
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
Base = declarative_base()

"""
Esta funcion se utiliza para obtener una sesion de base de datos.
"""
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  
# version con rds
#DATABASE_URL_RDS = os.getenv("DATABASE_RDS")

#engine_rds = create_engine(DATABASE_URL_RDS)

#SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
#Base = declarative_base()