from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    # PostgreSQL Settings
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    POSTGRES_HOST: str = "db"  # Nombre del servicio Docker para la BD
    POSTGRES_PORT: int = 5432
    DATABASE_URL: Optional[str] = None # Se construirá si no se provee explícitamente

    # JWT Settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Initial Admin User (para creación en el primer inicio si es necesario)
    FIRST_ADMIN_EMAIL: str
    FIRST_ADMIN_PASSWORD: str
    FIRST_ADMIN_NAME: str

    # API General
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "DocuHub"

    # Configuración para cargar desde el archivo .env
    # El prefijo es para Pydantic v1. Para Pydantic v2 (pydantic-settings), no se necesita env_prefix
    # si los nombres de las variables de entorno coinciden exactamente (case-insensitive).
    # Pero aquí usamos el .env file directamente.
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding='utf-8', extra='ignore')

    @property
    def sqlalchemy_database_url(self) -> str:
        if self.DATABASE_URL:
            return self.DATABASE_URL
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

# Crear una instancia global de la configuración
settings = Settings()
