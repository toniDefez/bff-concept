# BFF Concept - Weather MCP Service

Este proyecto es una demostración de un servicio MCP (Model Context Protocol) que proporciona información del clima.

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/toniDefez/bff-concept.git
cd bff-concept

# Instalar dependencias
npm install
```

## Uso

El servicio proporciona las siguientes funcionalidades:

### Iniciar el servidor

```bash
npm run start  # o npm run dev
```

### Ejecutar con el inspector MCP

```bash
npm run inspect
```

El inspector estará disponible en http://localhost:6274

### Configuración MCP

Para usar este servidor MCP, necesitas configurar tu cliente MCP (como VS Code o Claude) con la siguiente configuración:

```json
{
  "servers": {
    "Demo": {
      "type": "stdio",
      "command": "npx",
      "args": [
        "tsx",
        "src/main.ts"
      ]
    }
  }
}
```

## Herramientas disponibles

- `fetch-weather`: Obtiene información del clima para una ciudad
  - Parámetros:
    - `city`: Nombre de la ciudad (string)
  - Ejemplo:
    ```typescript
    const result = await client.fetchWeather({ city: "Barcelona" });
    ```

## Desarrollo

Para desarrollo, puedes usar el inspector MCP para depurar las llamadas al servicio:

1. Inicia el servidor con el inspector: `npm run inspect`
2. Abre http://localhost:6274 en tu navegador
3. Usa el token proporcionado para autenticarte
4. Prueba las herramientas directamente desde la interfaz web

## Estructura del proyecto

```
src/
  main.ts         # Implementación del servidor MCP
tsconfig.json     # Configuración de TypeScript
package.json      # Dependencias y scripts
mcp.json         # Configuración del servidor MCP
```

## Dependencias principales

- `@modelcontextprotocol/sdk`: SDK para crear servidores MCP
- `@modelcontextprotocol/inspector`: Herramienta de inspección para desarrollo
- `zod`: Validación de esquemas
- `tsx`: Ejecutor de TypeScript

## Docker

También puedes ejecutar el servicio dentro de un contenedor Docker.

### Construir la imagen

```bash
docker build -t bff-concept .
```

### Ejecutar el contenedor

```bash
docker run --rm -it bff-concept
```

El contenedor ejecuta el servidor MCP compilado (`node build/main.js`).