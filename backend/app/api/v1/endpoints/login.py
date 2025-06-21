from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # FastAPI provee este form para el login
from sqlalchemy.orm import Session

from app import crud, models, schemas, auth
from app.api import deps # Importamos nuestras dependencias
from app.core.config import settings

router = APIRouter()

@router.post("/login/access-token", response_model=schemas.Token)
async def login_for_access_token(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests.

    Se espera un form con 'username' (que será el email) y 'password'.
    """
    user = crud.get_user_by_email(db, email=form_data.username) # form_data.username es el email

    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email},  # 'sub' (subject) es el email del usuario por convención JWT
        expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login/test-token", response_model=schemas.User)
async def test_token(current_user: models.User = Depends(deps.get_current_active_user)):
    """
    Test access token. Retorna el usuario si el token es válido y el usuario está activo.
    """
    return current_user
