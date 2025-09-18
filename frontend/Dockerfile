# ------- Build (Node) -------
FROM node:20-alpine AS build
WORKDIR /app

# Solo dependencias primero para aprovechar caché
COPY package*.json ./
RUN npm ci

# Copia el resto y compila
COPY . .
# Vite toma esta env en build-time
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# ------- Runtime (Nginx) -------
FROM nginx:1.27-alpine
# Config SPA: fallback a index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copia el build
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
