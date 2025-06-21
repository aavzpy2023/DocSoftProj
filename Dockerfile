# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Esta línea asegura que el index.html de la raíz del proyecto (con CDNs)
# se copie a la carpeta dist DENTRO de la etapa de build.
COPY index.html ./dist/index.html
COPY index.css ./dist/index.css

# Stage 2: Serve the built app
FROM alpine:latest
# Establecer el WORKDIR donde se copiarán los archivos.
# Este directorio será el origen para el volumen `frontend_dist`.
WORKDIR /html_root
# Copiar el contenido de /app/dist del builder directamente a /html_root (el WORKDIR actual).
# NO a una subcarpeta ./dist/ aquí.
COPY --from=builder /app/dist .

# No se necesita un CMD aquí ya que este contenedor solo sirve para poblar el volumen
# que Nginx usará.
