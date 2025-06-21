from sqlalchemy.orm import Session
from typing import Optional, List, Type, TypeVar

from app import models, schemas
from app.auth import get_password_hash # Necesitaremos esto para hashear contraseñas

# Para tipado genérico en funciones CRUD base (opcional pero buena práctica para escalabilidad)
ModelType = TypeVar("ModelType", bound=models.Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=schemas.BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=schemas.BaseModel)

# --- CRUD Genérico Base (Opcional, pero útil si tienes muchos modelos similares) ---
# Puedes decidir si usar estas funciones base o escribir específicas para cada modelo.
# Por ahora, escribiré las específicas para User para mayor claridad inicial.

# --- User CRUD ---

def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """
    Obtiene un usuario por su ID.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """
    Obtiene un usuario por su email.
    """
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """
    Obtiene una lista de usuarios con paginación.
    """
    return db.query(models.User).offset(skip).limit(limit).all()

def count_users(db: Session) -> int:
    """
    Cuenta el número total de usuarios.
    """
    return db.query(models.User).count()

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    """
    Crea un nuevo usuario.
    """
    hashed_password = get_password_hash(user_in.password)
    db_user = models.User(
        email=user_in.email,
        name=user_in.name,
        hashed_password=hashed_password,
        role=user_in.role, # Asumiendo que UserCreate tiene el campo role
        is_active=user_in.is_active if user_in.is_active is not None else True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user) # Refresca el objeto para obtener el ID generado por la BD
    return db_user

def update_user(db: Session, user_in_db: models.User, user_update_data: schemas.UserUpdate) -> models.User:
    """
    Actualiza un usuario existente.
    'user_in_db' es el objeto User existente obtenido de la BD.
    'user_update_data' es un esquema Pydantic con los campos a actualizar.
    """
    update_data = user_update_data.model_dump(exclude_unset=True) # Obtiene solo los campos provistos

    if "password" in update_data and update_data["password"]:
        # Si se provee una nueva contraseña, hashearla
        hashed_password = get_password_hash(update_data["password"])
        update_data["hashed_password"] = hashed_password
        del update_data["password"] # Eliminar la contraseña en texto plano del dict de actualización
    else:
        # Asegurarse de no intentar actualizar con una contraseña vacía o None si no se cambió
        if "password" in update_data:
            del update_data["password"]


    for field, value in update_data.items():
        # Actualizar solo los campos que no sean 'hashed_password' si la contraseña no se actualizó explícitamente
        # o si el campo es 'hashed_password' (ya que se manejó arriba).
        if field == "hashed_password" and "hashed_password" not in update_data: # Evitar sobreescribir si no se cambió pass
             continue
        setattr(user_in_db, field, value)

    db.add(user_in_db)
    db.commit()
    db.refresh(user_in_db)
    return user_in_db

def delete_user(db: Session, user_id: int) -> Optional[models.User]:
    """
    Elimina un usuario por su ID.
    Retorna el usuario eliminado o None si no se encontró.
    """
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return db_user


# --- CRUD para Documentos/Archivos (Ejemplos, a desarrollar si es necesario) ---
# def get_document(db: Session, document_id: int) -> Optional[models.Document]:
#     return db.query(models.Document).filter(models.Document.id == document_id).first()

# def create_document(db: Session, document_in: schemas.DocumentCreate, owner_id: int) -> models.Document:
#     db_document = models.Document(**document_in.model_dump(), owner_id=owner_id)
#     db.add(db_document)
#     db.commit()
#     db.refresh(db_document)
#     return db_document

# ... más funciones CRUD para Documentos y Archivos/Carpetas ...
