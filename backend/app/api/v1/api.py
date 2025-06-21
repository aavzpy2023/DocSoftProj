from fastapi import APIRouter

from app.api.v1.endpoints import login, users
# Aquí importarías otros módulos de endpoints a medida que los crees
# from app.api.v1.endpoints import documents, files, etc.

api_router_v1 = APIRouter()

# Incluir el router de login
# El prefijo "/login" es opcional aquí si las rutas en login.py ya lo tienen,
# pero es buena práctica para agrupar. Como en login.py ya usamos "/login/access-token",
# no necesitamos un prefijo aquí para ese router específico.
# Sin embargo, si tuvieras múltiples endpoints relacionados con "auth" o "login",
# podrías agruparlos. Por ahora, lo incluimos directamente.
api_router_v1.include_router(login.router, tags=["Login"]) # Tags para la documentación OpenAPI

# Incluir el router de users
# Usamos un prefijo para que todas las rutas en users.py (ej. "/", "/{user_id}")
# se monten bajo "/users" (ej. "/api/v1/users/", "/api/v1/users/{user_id}")
api_router_v1.include_router(users.router, prefix="/users", tags=["Users"])

# Aquí incluirías otros routers a medida que los desarrolles:
# api_router_v1.include_router(documents.router, prefix="/documents", tags=["Documents"])
# api_router_v1.include_router(files.router, prefix="/files", tags=["Files"])
