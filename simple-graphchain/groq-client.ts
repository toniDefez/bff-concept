import { ChatGroq } from "@langchain/groq";

const DEFAULT_MODEL = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";
const DEFAULT_TEMPERATURE = Number.parseFloat(
  process.env.GROQ_TEMPERATURE ?? "0"
);

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Configúralo en el entorno o defínelo en el archivo .env."
    );
  }

  return apiKey;
}

export function createGroqClient() {
  return new ChatGroq({
    model: DEFAULT_MODEL,
    temperature: DEFAULT_TEMPERATURE,
    apiKey: getGroqApiKey(),
  });
}

export type GroqChatModel = ReturnType<typeof createGroqClient>;
