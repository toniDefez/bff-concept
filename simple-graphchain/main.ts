import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { pathToFileURL } from "url";
import { z } from "zod";
import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";

const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const DEFAULT_TEMPERATURE = Number.parseFloat(process.env.GROQ_TEMPERATURE ?? "0");
const SYSTEM_PROMPT = process.env.SYSTEM_PROMPT;
const PORT = Number.parseInt(
  process.env.PORT ?? process.env.SERVER_PORT ?? "3000",
  10
);

if (Number.isNaN(PORT)) {
  throw new Error("El puerto configurado no es un número válido.");
}

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("user"),
  content: z.string().min(1, "El contenido no puede estar vacío."),
});

const chatPayloadSchema = z.object({
  messages: z.array(messageSchema).min(1, "Se requiere al menos un mensaje."),
});

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Configúralo en el entorno o defínelo en el archivo .env."
    );
  }

  return apiKey;
}

const chatModel = new ChatGroq({
  model: DEFAULT_MODEL,
  temperature: DEFAULT_TEMPERATURE,
  apiKey: getGroqApiKey(),
});

function toLangChainMessages(messages: Array<{ role: string; content: string }>) {
  const formatted: BaseMessage[] = [];

  if (SYSTEM_PROMPT) {
    formatted.push(new SystemMessage(SYSTEM_PROMPT));
  }

  for (const message of messages) {
    if (message.role === "assistant") {
      formatted.push(new AIMessage(message.content));
      continue;
    }

    if (message.role === "system") {
      formatted.push(new SystemMessage(message.content));
      continue;
    }

    formatted.push(new HumanMessage(message.content));
  }

  return formatted;
}

function extractContent(content: unknown): string {
  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }

        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text ?? "");
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  if (content && typeof content === "object" && "text" in content) {
    return String((content as { text?: unknown }).text ?? "").trim();
  }

  return "";
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  app.post("/chat", async (req: Request, res: Response) => {
    const parsed = chatPayloadSchema.safeParse(req.body);

    if (!parsed.success) {
      const issues = parsed.error.issues.map((issue) => issue.message);
      res.status(400).json({ error: "Solicitud inválida", details: issues });
      return;
    }

    try {
      const messages = toLangChainMessages(parsed.data.messages);
      const aiMessage = await chatModel.invoke(messages);
      const content = extractContent(aiMessage.content);

      if (!content) {
        res.status(502).json({
          error: "La respuesta de la IA está vacía.",
        });
        return;
      }

      res.json({ content });
    } catch (error) {
      console.error("Error al invocar el modelo:", error);
      res.status(500).json({
        error: "No se pudo obtener una respuesta de la IA.",
      });
    }
  });

  return app;
}

function start() {
  const app = createApp();

  app.listen(PORT, () => {
    console.log(
      `simple-graphchain API escuchando en http://localhost:${PORT}`
    );
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  start();
}

export { createApp, start };
