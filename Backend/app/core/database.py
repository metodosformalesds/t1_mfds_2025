from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# obtenemos el url de la bd desde las variables de entorno ubicados en .env
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

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