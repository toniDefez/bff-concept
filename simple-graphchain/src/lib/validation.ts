import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]).default("user"),
  content: z.string().trim().min(1, "El contenido no puede estar vacío."),
});

const chatPayloadSchema = z
  .object({
    prompt: z.string().optional(),
    messages: z.array(messageSchema).optional(),
  })
  .transform((payload) => {
    const prompt = payload.prompt?.trim();

    if (prompt && prompt.length > 0) {
      return { ...payload, prompt };
    }

    const fallback = payload.messages
      ?.slice()
      .reverse()
      .find((message) => message.role !== "assistant" && message.content.trim().length > 0);

    if (!fallback) {
      throw new z.ZodError([
        {
          code: z.ZodIssueCode.custom,
          message: "Se requiere un prompt o al menos un mensaje de usuario.",
          path: ["prompt"],
        },
      ]);
    }

    return {
      ...payload,
      prompt: fallback.content.trim(),
    };
  });

export type ChatPayload = z.infer<typeof chatPayloadSchema>;

export type ChatValidationResult =
  | { success: true; data: ChatPayload }
  | { success: false; errors: string[] };

export function validateChatPayload(payload: unknown): ChatValidationResult {
  const parsed = chatPayloadSchema.safeParse(payload);

  if (!parsed.success) {
    const errors = parsed.error.issues.map((issue) => issue.message);
    return { success: false, errors };
  }

  return { success: true, data: parsed.data };
}

export const schemas = {
  chatPayload: chatPayloadSchema,
  message: messageSchema,
};
