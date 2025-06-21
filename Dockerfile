FROM node:18-alpine as builder
WORKDIR /app

RUN echo "--- DEBUG: Contenido inicial de /app (etapa builder):" && ls -la

# Copia los archivos de manifiesto y configuración principales primero
COPY package.json ./
COPY package-lock.json* ./  # El asterisco maneja si package-lock.json existe o no
COPY tsconfig.json ./

RUN echo "--- DEBUG: Contenido de /app después de copiar package.json, lockfile, tsconfig.json:" && ls -la

# Copia los archivos estáticos que eventualmente irán a dist
COPY index.html ./index.html-original-en-app
COPY index.css ./index.css-original-en-app

RUN echo "--- DEBUG: Contenido de /app después de copiar index.html e index.css originales a /app:" && ls -la

# Copia el código fuente de la aplicación React
COPY App.tsx ./
COPY index.tsx ./
COPY constants.ts ./
COPY types.ts ./
COPY components ./components
COPY hooks ./hooks
COPY services ./services

RUN echo "--- DEBUG: Contenido de /app después de copiar todo el código fuente y antes de npm install:" && ls -la

RUN npm install

RUN echo "--- DEBUG: Contenido de /app después de npm install y ANTES del build:" && ls -la

# Ejecuta el build. Esto debería crear /app/dist/index.js y /app/dist/index.js.map
RUN npm run build

RUN echo "--- DEBUG: Contenido de /app/dist JUSTO DESPUÉS de npm run build:" && (ls -la dist || echo "Directorio dist no encontrado después del build")

# Ahora, copia index.html e index.css (que están en /app, copiados como *-original-en-app) a /app/dist/
# Esto asegura que no sean sobrescritos si el build hiciera algo inesperado con dist
RUN mkdir -p ./dist # Asegurarse que dist existe, aunque esbuild debería crearlo
COPY index.html-original-en-app ./dist/index.html
COPY index.css-original-en-app ./dist/index.css

RUN echo "--- DEBUG: Contenido de /app/dist DESPUÉS de copiar index.html e index.css a dist:" && ls -la dist

# Stage 2: Serve the built app
FROM alpine:latest
WORKDIR /html_root
COPY --from=builder /app/dist .

RUN echo "--- DEBUG: Contenido de /html_root en la etapa final (lo que va al volumen):" && ls -la
