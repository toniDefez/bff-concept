import "dotenv/config";
import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { ChatGroq } from "@langchain/groq";

function getGroqApiKey() {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY. Set it in the environment or define it in the .env file."
    );
  }

  return apiKey;
}

async function main() {
  const model = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    temperature: 0,
    apiKey: getGroqApiKey(),
  });

  const messages = [
    new SystemMessage("Translate the following from English into Italian"),
    new HumanMessage("hi!"),
  ];

  const response = await model.invoke(messages);
  console.log(response.content);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
