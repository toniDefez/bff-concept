import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";

const DEFAULT_SYSTEM_PROMPT =
  "Eres un asistente útil y colaborativo. Responde de forma breve y clara.";

export function createChatPrompt(systemPrompt?: string) {
  const system = systemPrompt?.trim().length
    ? systemPrompt
    : DEFAULT_SYSTEM_PROMPT;

  return ChatPromptTemplate.fromMessages([
    ["system", system],
    new MessagesPlaceholder("conversation"),
  ]);
}

export { DEFAULT_SYSTEM_PROMPT };
