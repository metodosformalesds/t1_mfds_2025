# Autor: Gabriel Vilchis
# Fecha: 08/11/2025
# Descripción: Este archivo configura la conexión a la base de datos utilizando SQLAlchemy.
# Incluye la creación del motor de base de datos, la sesión y el modelo base,
# así como una función generadora para obtener sesiones de manera segura.
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# obtenemos el url de la bd desde las variables de entorno ubicados en .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

# parametros de conexion a sqlite
engine = create_engine(
    DATABASE_URL, connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 
Base = declarative_base()

# Funcion para crear una nueva secion a la bd
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