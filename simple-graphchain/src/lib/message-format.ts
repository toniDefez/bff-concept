import { AIMessage, HumanMessage, SystemMessage, type BaseMessage } from "@langchain/core/messages";
import type { ChatPayload } from "./validation.js";

export function toLangChainMessages(messages: ChatPayload["messages"]): BaseMessage[] {
  const formatted: BaseMessage[] = [];

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

export function extractTextFromContent(content: unknown): string {
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
