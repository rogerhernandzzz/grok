from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

# Configuración de Base de Datos
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite:///./skynet.db"
)

# Para PostgreSQL en producción:
# DATABASE_URL = "postgresql://user:password@db_server/skynet"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
