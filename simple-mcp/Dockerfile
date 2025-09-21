# syntax=docker/dockerfile:1

FROM node:20-alpine

WORKDIR /app

# Instala dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copia el resto del código
COPY . .

# Si necesitas compilar TypeScript, hazlo aquí
# RUN npm run build

# Ajusta el entrypoint a tu servidor MCP
CMD ["node", "src/main.js"]