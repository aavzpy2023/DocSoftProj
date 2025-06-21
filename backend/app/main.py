// --- /backend/app/main.py ---
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Para permitir peticiones Cross-Origin

from app.core.config import settings
from app.api.v1.api import api_router_v1 # El router que acabamos de definir
from app.database import engine # Para crear tablas si es necesario (opcional aquí)
from app import models # Para crear tablas (opcional aquí)

# Opcional: Crear todas las tablas en la base de datos al iniciar la aplicación.
# Esto es útil para desarrollo, pero para producción se suele usar Alembic para migraciones.
# Si decides usar Alembic, esta línea debería eliminarse o condicionarse.
models.Base.metadata.create_all(bind=engine)


# Inicializar la aplicación FastAPI
app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json" # URL para el esquema OpenAPI
)

# Configuración de CORS (Cross-Origin Resource Sharing)
# Esto es importante si tu frontend se sirve desde un dominio/puerto diferente al backend.
# En tu caso con Nginx sirviendo todo bajo el mismo dominio (localhost:8080),
# el proxy inverso maneja esto, pero es bueno tenerlo si alguna vez accedes
# a la API del backend directamente desde otro origen.
# Por ahora, configuraremos una política permisiva.
# Deberías restringir esto en producción a los orígenes de tu frontend.
origins = [
    "http://localhost",         # Si accedes directamente al frontend via node/vite dev server
    "http://localhost:3000",    # Puerto común para React dev server
    "http://localhost:5173",    # Puerto común para Vite dev server
    "http://localhost:8080",    # Si el frontend es servido por Nginx en este puerto
    # "*" # Para permitir todos los orígenes (NO RECOMENDADO PARA PRODUCCIÓN)
    # Añade aquí el dominio de tu frontend en producción si es diferente
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Lista de orígenes permitidos (o "*" para todos)
    allow_credentials=True, # Permitir cookies/auth headers
    allow_methods=["*"],    # Permitir todos los métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Permitir todos los encabezados
)

# Incluir el router principal de la API v1
# Todas las rutas definidas en api_router_v1 se montarán bajo el prefijo settings.API_V1_STR
app.include_router(api_router_v1, prefix=settings.API_V1_STR)


# Un endpoint raíz simple para verificar que la aplicación está corriendo
@app.get("/", tags=["Root"])
async def read_root():
    return {"message": f"Welcome to {settings.PROJECT_NAME}!"}

# Aquí podrías añadir manejadores de eventos de inicio/apagado si fueran necesarios
# @app.on_event("startup")
# async def startup_event():
#     # Ejemplo: Inicializar una conexión a un servicio externo, crear usuario admin inicial
#     # from app.db_init import init_db # Función hipotética para inicializar BD
#     # await init_db()
#     pass

# @app.on_event("shutdown")
# async def shutdown_event():
#     # Ejemplo: Cerrar conexiones a servicios externos
#     pass
