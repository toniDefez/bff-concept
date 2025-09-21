# Simple Graphchain API

Servicio HTTP mínimo que conecta con Groq para exponer un endpoint POST /chat consumido por el frontal simple-front.

## Requisitos

- Node.js 20+
- Variable GROQ_API_KEY definida (por ejemplo en .env)

Variables opcionales:

- GROQ_MODEL (por defecto llama-3.3-70b-versatile)
- GROQ_TEMPERATURE (por defecto 0)
- SYSTEM_PROMPT para prefijar un mensaje de sistema (si no se define se usa
  "Eres un asistente útil y colaborativo. Responde de forma breve y clara.")
- PORT o SERVER_PORT para cambiar el puerto (por defecto 3000)

## Uso

Instala dependencias y arranca el servidor:

    npm install
    npm run dev

Esto deja el API escuchando en http://localhost:3000.

## Endpoint

POST /chat

    {
        "messages": [
            { "role": "user", "content": "Hola" }
        ]
    }

Respuesta:

    {
        "content": "...respuesta de la IA..."
    }

También se expone GET /health para comprobaciones sencillas.
