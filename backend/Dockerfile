# Etapa 1: Base con Python
FROM python:3.9-slim-buster
# Usa una versión de Python compatible con tus dependencias, FastAPI recomienda 3.7+
# Puedes usar python:3.9, python:3.10, python:3.11, etc.
# -slim-buster es una buena opción para mantener el tamaño de la imagen reducido.

# Establecer el directorio de trabajo
WORKDIR /app

# Establecer variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copiar solo el archivo de requerimientos primero para aprovechar el cache de Docker
COPY requirements.txt .

# Instalar dependencias
# Es buena práctica usar un virtual environment, pero para Docker no siempre es estrictamente necesario si la imagen es dedicada.
# Considera agregar --no-cache-dir para reducir el tamaño de la imagen
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código de la aplicación
COPY . .
# Si tienes archivos que no deben ir en la imagen (ej: .git, .vscode, __pycache__), usa un .dockerignore en /backend/

# El comando para ejecutar la aplicación se define en docker-compose.yml
# Pero si quisieras definirlo aquí, sería algo como:
# CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
