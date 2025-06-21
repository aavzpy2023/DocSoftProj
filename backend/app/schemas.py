from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from app.models import UserRole # Importamos el Enum UserRole definido en models.py
import uuid # Para IDs de usuario si fueran UUID, pero estamos usando Integer. Lo mantendré por si decides cambiarlo.

# --- User Schemas ---

# Propiedades base compartidas por otros esquemas de usuario
class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    is_active: Optional[bool] = True
    role: UserRole = UserRole.editor

# Propiedades a recibir al crear un usuario
class UserCreate(UserBase):
    password: str = Field(min_length=8) # Asegurar una longitud mínima para la contraseña

# Propiedades a recibir al actualizar un usuario (todos los campos son opcionales)
class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    password: Optional[str] = Field(default=None, min_length=8)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None

# Propiedades almacenadas en la BD (pero que no necesariamente se devuelven todas siempre)
# No incluye la contraseña hasheada por seguridad.
class UserInDBBase(UserBase):
    id: int # Cambiado a int para coincidir con el modelo User.id
    # Si quisieras usar UUIDs para IDs de usuario:
    # id: uuid.UUID

    class Config:
        # Deprecated in Pydantic v2. Use model_config instead.
        # orm_mode = True
        from_attributes = True # Equivalente a orm_mode = True en Pydantic v2

# Propiedades a devolver al cliente (API response)
class User(UserInDBBase):
    pass # Hereda todos los campos de UserInDBBase

# Esquema para la respuesta de la lista de usuarios
class UserList(BaseModel):
    users: List[User]
    total: int


# --- Token Schemas (para autenticación) ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None
    # podrías añadir 'sub' (subject) si sigues las convenciones JWT más estrictas
    # y otros campos como 'scopes' si usas autorización basada en scopes.


# --- Schemas para Documentos (Ejemplo, a desarrollar más adelante si es necesario) ---
# class DocumentBase(BaseModel):
#     title: str
#     path: str # Ejemplo: "Project Alpha/README.md"

# class DocumentCreate(DocumentBase):
#     content: Optional[str] = ""

# class DocumentUpdate(BaseModel):
#     title: Optional[str] = None
#     path: Optional[str] = None
#     content: Optional[str] = None

# class Document(DocumentBase):
#     id: int
#     owner_id: int
#     # created_at: datetime
#     # updated_at: datetime

#     class Config:
#         from_attributes = True


# --- Schemas para Archivos/Carpetas (más genérico, basado en tu `FileNode` de types.ts) ---
# Podríamos refinar esto para que sea más específico para el backend,
# por ejemplo, separando File y Folder.

class FileNodeBase(BaseModel):
    name: str
    type: str # Podría ser un Enum ('file', 'folder')
    path: str # Full path

class FileNodeCreate(FileNodeBase):
    content: Optional[str] = None # Para archivos
    parent_id: Optional[int] = None # Para anidar bajo una carpeta

class FileNodeUpdate(BaseModel):
    name: Optional[str] = None
    path: Optional[str] = None # Mover/Renombrar podría afectar el path
    content: Optional[str] = None # Solo para archivos
    # Mover un nodo a otra carpeta podría implicar cambiar parent_id

class FileNodeInDB(FileNodeBase):
    id: int
    # owner_id: int # Si los archivos tienen propietarios
    # children: Optional[List['FileNodeInDB']] = [] # Para carpetas, manejo de relaciones recursivas

    class Config:
        from_attributes = True

# class FileNodeResponse(FileNodeInDB): # Para las respuestas de la API
#     # Podrías añadir isOpen aquí si quieres que el backend controle ese estado,
#     # aunque suele ser más un estado de UI del frontend.
#     isOpen: Optional[bool] = None # Para carpetas
#     content: Optional[str] = None # Para archivos, si se debe devolver el contenido
#     children: Optional[List['FileNodeResponse']] = None # Para carpetas

#     # Necesario para manejar la referencia forward de List['FileNodeResponse']
#     # En Pydantic v2, esto se hace con model_rebuild() o type adaptation.
#     # Para Pydantic v1, a veces se necesita update_forward_refs()
# FileNodeResponse.update_forward_refs() # Descomentar si usas referencias forward y Pydantic v1
