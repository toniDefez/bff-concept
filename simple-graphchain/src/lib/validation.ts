import { z } from "zod";

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
