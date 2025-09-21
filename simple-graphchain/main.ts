import "dotenv/config";
import cors from "cors";
import express, { type Request, type Response } from "express";
import { pathToFileURL } from "url";
import { createChatRouter } from "./chat-router.js";
import { createChatService } from "./chat-service.js";

const PORT = Number.parseInt(
  process.env.PORT ?? process.env.SERVER_PORT ?? "3000",
  10
);

if (Number.isNaN(PORT)) {
  throw new Error("El puerto configurado no es un número válido.");
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  const chatService = createChatService();
  app.use("/chat", createChatRouter(chatService));

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
