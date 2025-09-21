import { Router, type Request, type Response } from "express";
import {
  EmptyAIResponseError,
  type ChatService,
} from "../services/chat-service.js";

export function createChatRouter(chatService: ChatService) {
  const router = Router();

  router.post("/", async (req: Request, res: Response) => {
    const validation = chatService.validate(req.body);

    if (!validation.success) {
      res
        .status(400)
        .json({ error: "Solicitud inválida", details: validation.errors });
      return;
    }

    try {
      const content = await chatService.createChatCompletion(validation.data);
      res.json({ content });
    } catch (error) {
      if (error instanceof EmptyAIResponseError) {
        res.status(502).json({ error: error.message });
        return;
      }

      console.error("Error al invocar el modelo:", error);
      res.status(500).json({
        error: "No se pudo obtener una respuesta de la IA.",
      });
    }
  });

  return router;
}
