from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base # declarative_base para SQLAlchemy < 2.0
# from sqlalchemy.orm import DeclarativeBase # Para SQLAlchemy >= 2.0 (preferido si es una nueva instalación)

from app.core.config import settings

# Crear el motor de la base de datos SQLAlchemy
# pool_pre_ping=True ayuda a manejar conexiones que podrían haber sido cerradas por la BD
engine = create_engine(settings.sqlalchemy_database_url, pool_pre_ping=True)

# Crear una fábrica de sesiones (SessionLocal)
# autocommit=False y autoflush=False son configuraciones estándar para usar con FastAPI
# y dependencias que gestionan el ciclo de vida de la sesión.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Crear una clase Base para los modelos ORM.
# Todas tus clases de modelo heredarán de esta Base.
Base = declarative_base() # Para SQLAlchemy < 2.0
# class Base(DeclarativeBase): # Para SQLAlchemy >= 2.0
#     pass


# Función de dependencia para obtener una sesión de BD por petición
# Esto se usará en los endpoints para interactuar con la base de datos.
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
