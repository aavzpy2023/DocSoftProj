FROM node:18-alpine as builder
WORKDIR /app

# Copia los archivos de manifiesto y configuración principales primero
COPY package.json ./
COPY package-lock.json* ./  # Maneja si package-lock.json existe o no
COPY tsconfig.json ./

# Copia el código fuente de la aplicación React (directorios y archivos TSX/TS principales)
COPY App.tsx ./
COPY index.tsx ./
COPY constants.ts ./
COPY types.ts ./
COPY components ./components
COPY hooks ./hooks
COPY services ./services

# AHORA copia los archivos estáticos (index.html, index.css) de la raíz de tu proyecto
# al WORKDIR /app del builder. Estos serán los que usaremos después del build.
COPY index.html ./index.html
COPY index.css ./index.css

RUN echo "--- DEBUG: Contenido de /app después de copiar TODO el código fuente y los archivos index.html/css originales:" && ls -la

RUN npm install

RUN echo "--- DEBUG: Contenido de /app después de npm install y ANTES del build:" && ls -la

# Ejecuta el build. Esto debería crear /app/dist/index.js y /app/dist/index.js.map
RUN npm run build

RUN echo "--- DEBUG: Contenido de /app/dist JUSTO DESPUÉS de npm run build:" && (ls -la dist || echo "Directorio dist no encontrado después del build")

# Ahora, copia index.html e index.css (que están en /app) a /app/dist/
# Asegúrate de que la carpeta dist exista
RUN mkdir -p ./dist
COPY index.html ./dist/index.html  # Copia desde /app/index.html a /app/dist/index.html
COPY index.css ./dist/index.css    # Copia desde /app/index.css a /app/dist/index.css

RUN echo "--- DEBUG: Contenido de /app/dist DESPUÉS de copiar index.html e index.css a dist:" && ls -la dist

# Stage 2: Serve the built app
FROM alpine:latest
WORKDIR /html_root
COPY --from=builder /app/dist .

RUN echo "--- DEBUG: Contenido de /html_root en la etapa final (lo que va al volumen):" && ls -la
