# Stage 1: Build the React app
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

COPY index.html ./dist/index.html

# Stage 2:
FROM alpine:latest
WORKDIR /html_root
COPY --from=builder /app/dist ./dist/
