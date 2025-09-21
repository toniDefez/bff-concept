import { FormEvent, useMemo, useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiResponse {
  content?: string;
  message?: string;
  [key: string]: unknown;
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";
const CHAT_ENDPOINT = API_BASE_URL.endsWith("/") ? API_BASE_URL + "chat" : API_BASE_URL + "/chat";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastMessageId = useMemo(() => messages.length - 1, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };
    const history = messages.concat(userMessage);

    setMessages(history);
    setPrompt("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      if (!response.ok) {
        throw new Error("El servidor respondió con estado " + response.status);
      }

      const data: AiResponse = await response.json();
      const aiContent = typeof data.content === "string" ? data.content : data.message;

      if (!aiContent) {
        throw new Error("La respuesta de la IA no contiene contenido legible.");
      }

      const aiMessage: Message = { role: "assistant", content: aiContent };
      setMessages(function appendAssistant(current) {
        return current.concat(aiMessage);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>Simple Front · IA</h1>
        <p>Envía un mensaje para conversar con tu modelo a través del BFF.</p>
      </header>

      <main className="chat-panel" aria-live="polite">
        {messages.length === 0 && (
          <p className="empty-state">
            Aún no hay mensajes. Envía tu primera consulta para comenzar.
          </p>
        )}

        <ul className="messages">
          {messages.map(function renderMessage(message, index) {
            const key = message.role + "-" + index;
            const classes = "message message-" + message.role;

            return (
              <li
                key={key}
                className={classes}
                data-active={index === lastMessageId}
              >
                <span className="message-role">
                  {message.role === "user" ? "Tú" : "Asistente"}
                </span>
                <p>{message.content}</p>
              </li>
            );
          })}
        </ul>
      </main>

      <form className="composer" onSubmit={handleSubmit}>
        <label className="composer-label" htmlFor="prompt">
          Escribe tu mensaje
        </label>
        <div className="composer-row">
          <textarea
            id="prompt"
            name="prompt"
            value={prompt}
            onChange={function handleChange(event) {
              setPrompt(event.target.value);
            }}
            placeholder="Pregúntale algo a la IA..."
            rows={3}
            required
            disabled={isLoading}
            aria-disabled={isLoading}
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Enviando..." : "Enviar"}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-banner" role="status">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}
