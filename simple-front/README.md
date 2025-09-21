# Simple Front

Interfaz mínima en React para conversar con el backend de IA expuesto por este repositorio.

## Configuración

1. Instala las dependencias:

        npm install

2. (Opcional) Crea un archivo .env en la raíz con la URL del BFF si es distinta a http://localhost:3000:

        VITE_API_BASE_URL=http://localhost:3000

## Scripts disponibles

- npm run dev: levanta Vite en modo desarrollo.
- npm run build: genera la build de producción.
- npm run preview: inicia un servidor para previsualizar la build.

## Integración con el BFF

El front envía peticiones POST al endpoint /chat. Si el servicio está montado en otra ruta o dominio, actualiza la variable VITE_API_BASE_URL para apuntar al nuevo endpoint.
