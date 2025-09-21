# Simple Front

Interfaz mínima en React para conversar con el backend de IA expuesto por este repositorio.

## Configuración

1. Instala las dependencias:

        npm install

2. (Opcional) Crea un archivo .env en la raíz con la URL del BFF si es distinta
   a la usada por defecto.

        VITE_API_BASE_URL=http://localhost:3000

## Scripts disponibles

- npm run dev: levanta Vite en modo desarrollo.
- npm run build: genera la build de producción.
- npm run preview: inicia un servidor para previsualizar la build.

## Integración con el BFF

- En desarrollo (`npm run dev`) las peticiones a `/api/chat` se proxian al
  backend local en `http://localhost:3000`.
- En la build de producción, define `VITE_API_BASE_URL` para apuntar al host del
  backend accesible desde el navegador (por ejemplo `http://localhost:3001` si
  se ejecuta via Docker Compose).
- El cliente envía `POST /chat` con `{ "prompt": "..." }`.
