# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
# If you have a package-lock.json or yarn.lock, copy it too and use 'npm ci' or 'yarn install --frozen-lockfile'
RUN npm install
COPY . .      # Copia todo el contexto del proyecto, incluyendo index.html en /app/index.html
RUN npm run build  # Esto crea la carpeta 'dist' y 'dist/index.js' en /app/dist/index.js

# --> ESTA ES LA LÍNEA QUE NECESITAS AÑADIR <--
# Copia el index.html (que está en /app/index.html después del 'COPY . .')
# al directorio /app/dist/ para que sea parte del output del build.
COPY index.html ./dist/index.html

# Stage 2: Esta etapa copia el contenido de /app/dist (que ahora incluye index.html y index.js)
# al directorio /app/dist de la imagen final que se usa para popular el volumen.
FROM alpine:latest
WORKDIR /app # Es buena práctica definir un WORKDIR también en la etapa final
COPY --from=builder /app/dist ./dist/
# También podrías copiar directamente a la raíz si el volumen se espera así:
# COPY --from=builder /app/dist /app/
