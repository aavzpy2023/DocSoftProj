from sqlalchemy import Column, Integer, String, Boolean, Enum as SAEnum
from sqlalchemy.orm import relationship # Si tuviéramos relaciones, por ahora no es necesario
import enum

from app.database import Base # Importamos la Base declarativa que creamos

# Definición de roles de usuario como un Enum de Python
# Esto ayuda a mantener la consistencia y facilita las validaciones.
class UserRole(str, enum.Enum):
    admin = "admin"
    editor = "editor"
    # podrías añadir 'viewer' u otros roles si es necesario

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, index=True, nullable=True) # Nombre completo, puede ser opcional al inicio
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    # Usamos SAEnum para el campo de rol, asegurando que solo los valores del Enum UserRole sean válidos en la BD.
    role = Column(SAEnum(UserRole), nullable=False, default=UserRole.editor)

    # Aquí podrías definir relaciones si las hubiera, por ejemplo, con documentos creados por el usuario.
    # Ejemplo:
    # documents = relationship("Document", back_populates="owner")

    def __repr__(self):
        return f"<User(id={self.id}, email='{self.email}', role='{self.role.value}')>"
