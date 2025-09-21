import { createGroqClient, type GroqChatModel } from "../integrations/groq-client.js";
import { createChatPrompt, DEFAULT_SYSTEM_PROMPT } from "../lib/prompt-factory.js";
import {
  type ChatPayload,
  type ChatValidationResult,
  validateChatPayload,
} from "../lib/validation.js";

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

function normalizeContent(content: unknown): string {
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
  private readonly promptTemplate: ReturnType<typeof createChatPrompt>;

  constructor(private readonly deps: ChatServiceDependencies) {
    this.promptTemplate = createChatPrompt(this.deps.systemPrompt);
  }

  validate(payload: unknown): ChatValidationResult {
    return validateChatPayload(payload);
  }

  async createChatCompletion(payload: ChatPayload): Promise<string> {
    const promptMessages = await this.promptTemplate.formatMessages({
      input: payload.prompt,
    });
    const aiMessage = await this.deps.model.invoke(promptMessages);
    const content = normalizeContent(aiMessage.content);

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
  const systemPrompt =
    deps?.systemPrompt ?? process.env.SYSTEM_PROMPT ?? DEFAULT_SYSTEM_PROMPT;

  return new DefaultChatService({ model, systemPrompt });
}

export type { ChatPayload, ChatValidationResult };
export { DEFAULT_SYSTEM_PROMPT, validateChatPayload };
