import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';
//1.Crear servidor
const server = new McpServer({
    name: 'Demo',
    version: '1.0.0'
});
//2. Definir herramientas
server.tool('fetch-weather', 'Fetch weather information for a given city', {
    city: z.string().describe('Name of the city to fetch weather for')
}, async ({ city }) => {
    // Simular una llamada a una API de clima
    return {
        content: [
            {
                type: "text",
                text: `Weather for ${city}: 25°C, Sunny`
            }
        ]
    };
});
const transport = new StdioServerTransport();
await server.connect(transport);
console.log("MCP server is running...");
