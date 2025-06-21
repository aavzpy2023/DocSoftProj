from datetime import datetime, timedelta, timezone
from typing import Optional, Any

from passlib.context import CryptContext
from jose import JWTError, jwt

from app.core.config import settings # Para SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

# Configuración de Passlib para el hashing de contraseñas
# Usamos bcrypt como el esquema de hashing.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM
SECRET_KEY = settings.SECRET_KEY
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica una contraseña en texto plano contra una contraseña hasheada.
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Genera el hash de una contraseña.
    """
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Crea un nuevo token de acceso JWT.
    'data' debe ser un diccionario con la información a codificar en el token (ej: {'sub': user_email}).
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        # Si no se provee un delta, usa el tiempo de expiración de la configuración
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict[str, Any]]:
    """
    Decodifica un token JWT. Retorna el payload si es válido, None en caso contrario.
    Esta función puede ser útil para la dependencia que obtiene el usuario actual.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        # Podrías loggear el error aquí si quieres más detalle
        # ej: logging.error(f"Error decodificando token: {e}")
        return None

# Ejemplo de cómo podrías usar decode_token para obtener el 'subject' (ej. email) del token
# def get_subject_from_token(token: str) -> Optional[str]:
#     payload = decode_token(token)
#     if payload:
#         return payload.get("sub") # Asumiendo que el subject está en el campo 'sub'
#     return None
