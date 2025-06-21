# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
# If you have a package-lock.json or yarn.lock, copy it too and use 'npm ci' or 'yarn install --frozen-lockfile'
RUN npm install
COPY . .
RUN npm run build  # Esto crea la carpeta 'dist' y 'dist/index.js' en /app/dist/index.js

# --> ESTA ES LA LÍNEA QUE NECESITAS AÑADIR <--
# Copia el index.html (que está en /app/index.html después del 'COPY . .')
# al directorio /app/dist/ para que sea parte del output del build.
COPY index.html ./dist/index.html

# Stage 2:
FROM alpine:latest
# WORKDIR /app # WORKDIR aquí no es tan crucial si solo copias a la raíz del destino.
# Copia el contenido de /app/dist de la etapa builder directamente a /app en esta etapa final.
# El volumen frontend_dist se llenará con el contenido de /app de esta imagen.
COPY --from=builder /app/dist /app/
