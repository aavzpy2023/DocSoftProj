from typing import Any, List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps # Importamos nuestras dependencias

router = APIRouter()

@router.post("/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
async def create_user(
    *, # El asterisco fuerza a que los siguientes argumentos sean keyword-only
    db: Session = Depends(deps.get_db),
    user_in: schemas.UserCreate,
    # Descomentar la siguiente línea si solo los admins pueden crear usuarios:
    # current_user: models.User = Depends(deps.get_current_active_admin_user),
) -> Any:
    """
    Crea un nuevo usuario.
    Por defecto, cualquier persona puede crear un usuario (registro).
    Si se requiere que solo administradores creen usuarios, se debe proteger este endpoint.
    """
    user = crud.get_user_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The user with this email already exists in the system.",
        )
    new_user = crud.create_user(db=db, user_in=user_in)
    return new_user

@router.get("/", response_model=schemas.UserList)
async def read_users(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_admin_user), # Solo admins pueden listar todos los usuarios
) -> Any:
    """
    Recupera una lista de usuarios.
    Solo accesible por usuarios administradores.
    """
    users = crud.get_users(db, skip=skip, limit=limit)
    total_users = crud.count_users(db)
    return {"users": users, "total": total_users}

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user), # Cualquier usuario activo autenticado
) -> Any:
    """
    Obtiene el perfil del usuario actual.
    """
    return current_user

@router.get("/{user_id}", response_model=schemas.User)
async def read_user_by_id(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin_user), # Solo admins pueden ver otros usuarios por ID
) -> Any:
    """
    Obtiene un usuario específico por su ID.
    Solo accesible por usuarios administradores.
    """
    user = crud.get_user(db, user_id=user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this id does not exist in the system",
        )
    return user

@router.put("/{user_id}", response_model=schemas.User)
async def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: schemas.UserUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Actualiza un usuario.
    Un usuario normal solo puede actualizarse a sí mismo (a menos que sea admin).
    Un administrador puede actualizar a cualquier usuario.
    """
    user_in_db = crud.get_user(db, user_id=user_id)
    if not user_in_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this id does not exist in the system",
        )

    # Lógica de permisos:
    # Solo el propio usuario o un admin pueden actualizar el usuario.
    if user_in_db.id != current_user.id and current_user.role != models.UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions to update this user",
        )

    # Un no-admin no puede cambiar su propio rol ni el de otros.
    if user_in.role is not None and current_user.role != models.UserRole.admin:
        if user_in_db.id == current_user.id and user_in.role != user_in_db.role: # Intentando cambiar su propio rol
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Users cannot change their own role.",
            )
        elif user_in_db.id != current_user.id: # Intentando cambiar el rol de otro (ya cubierto por el primer if, pero por claridad)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to change user roles.",
            )

    updated_user = crud.update_user(db=db, user_in_db=user_in_db, user_update_data=user_in)
    return updated_user

@router.delete("/{user_id}", response_model=schemas.User)
async def delete_user(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_admin_user), # Solo admins pueden eliminar usuarios
) -> Any:
    """
    Elimina un usuario.
    Solo accesible por usuarios administradores.
    """
    user_to_delete = crud.get_user(db, user_id=user_id)
    if not user_to_delete:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="The user with this id does not exist in the system",
        )

    # Opcional: Prevenir que un admin se elimine a sí mismo si es el único admin, o alguna otra lógica de negocio.
    # if user_to_delete.id == current_user.id and current_user.role == models.UserRole.admin:
    #     # Contar cuántos admins quedan
    #     # Si es el único, no permitir la eliminación
    #     raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete the only admin user.")

    deleted_user = crud.delete_user(db=db, user_id=user_id) # crud.delete_user ya retorna el usuario o None
    return deleted_user # FastAPI serializará esto usando schemas.User
