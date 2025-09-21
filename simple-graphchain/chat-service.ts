import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import { z } from "zod";
import { createGroqClient, type GroqChatModel } from "./groq-client.js";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("user"),
  content: z.string().min(1, "El contenido no puede estar vacío."),
});

const chatPayloadSchema = z.object({
  messages: z.array(messageSchema).min(1, "Se requiere al menos un mensaje."),
});

export type ChatPayload = z.infer<typeof chatPayloadSchema>;

export type ChatValidationResult =
  | { success: true; data: ChatPayload }
  | { success: false; errors: string[] };

export class EmptyAIResponseError extends Error {
  constructor(message = "La respuesta de la IA está vacía.") {
    super(message);
    this.name = "EmptyAIResponseError";
  }
}

export interface ChatService {
  validate(payload: unknown): ChatValidationResult;
  createChatCompletion(payload: ChatPayload): Promise<string>;
}

type ChatModel = Pick<GroqChatModel, "invoke">;

interface ChatServiceDependencies {
  model: ChatModel;
  systemPrompt?: string;
}

export function validateChatPayload(payload: unknown): ChatValidationResult {
  const parsed = chatPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return { success: false, errors };
  }

  return { success: true, data: parsed.data };
}

function toLangChainMessages(
  messages: ChatPayload["messages"],
  systemPrompt?: string
) {
  const formatted: BaseMessage[] = [];

  if (systemPrompt) {
    formatted.push(new SystemMessage(systemPrompt));
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

class DefaultChatService implements ChatService {
  constructor(private readonly deps: ChatServiceDependencies) {}

  validate(payload: unknown): ChatValidationResult {
    return validateChatPayload(payload);
  }

  async createChatCompletion(payload: ChatPayload): Promise<string> {
    const messages = toLangChainMessages(
      payload.messages,
      this.deps.systemPrompt
    );
    const aiMessage = await this.deps.model.invoke(messages);
    const content = extractContent(aiMessage.content);

    if (!content) {
      throw new EmptyAIResponseError();
    }

    return content;
  }
}

export function createChatService(
  deps?: Partial<ChatServiceDependencies>
): ChatService {
  const model = deps?.model ?? createGroqClient();
  const systemPrompt = deps?.systemPrompt ?? process.env.SYSTEM_PROMPT;

  return new DefaultChatService({ model, systemPrompt });
}
