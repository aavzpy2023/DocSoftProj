# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
# If you have a package-lock.json or yarn.lock, copy it too and use 'npm ci' or 'yarn install --frozen-lockfile'
RUN npm install
COPY . .
# This command comes from your package.json
RUN npm run build

# Stage 2: This stage is just to ensure the /app/dist is correctly populated.
# The actual serving is done by the nginx service in docker-compose using the frontend_dist volume.
# No CMD is needed here as this image is used by the 'frontend_builder' service
# which only runs the build and populates the volume.
FROM alpine:latest
COPY --from=builder /app/dist /app/dist
# You could add an entrypoint that does nothing or just lists files if you ever run it directly
# For example: ENTRYPOINT ["ls", "-la", "/app/dist"]
