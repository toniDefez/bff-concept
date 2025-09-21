import { FormEvent, useEffect, useRef, useState } from "react";

type MessageRole = "user" | "assistant";

type Message = {
  role: MessageRole;
  content: string;
};

type ChatResponse = {
  content?: string;
  message?: string;
  [key: string]: unknown;
};

const isDev = import.meta.env.DEV;
const rawBaseUrl = !isDev
  ? (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim()
  : undefined;
const defaultBaseUrl = isDev ? "/api" : "";
const API_BASE_URL = rawBaseUrl && rawBaseUrl.length > 0 ? rawBaseUrl : defaultBaseUrl;
const CHAT_ENDPOINT = (API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL) + "/chat";

export default function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }

    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = prompt.trim();
    if (!trimmed || isLoading) {
      return;
    }

    const userMessage: Message = { role: "user", content: trimmed };

    setMessages((prev) => prev.concat(userMessage));
    setPrompt("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      });

      if (!response.ok) {
        throw new Error(`El servidor respondió con estado ${response.status}`);
      }

      const data: ChatResponse = await response.json();
      const aiContent =
        typeof data.content === "string" && data.content.trim().length > 0
          ? data.content
          : typeof data.message === "string"
          ? data.message
          : "";

      if (!aiContent) {
        throw new Error("La respuesta de la IA no contiene texto.");
      }

      const aiMessage: Message = { role: "assistant", content: aiContent };
      setMessages((prev) => prev.concat(aiMessage));
    } catch (err) {
      const message = err instanceof Error ? err.message : "No se pudo completar la solicitud.";
      setError(message);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Simple Front · IA</h1>
        <p>Envía un mensaje y recibe una respuesta del backend Groq al instante.</p>
      </header>

      <main className="chat" aria-live="polite">
        <ul className="messages" ref={listRef}>
          {messages.length === 0 && (
            <li className="empty">Todavía no hay mensajes. Escribe tu primera pregunta.</li>
          )}

          {messages.map((message, index) => (
            <li key={index} className={`message message-${message.role}`}>
              <span className="author">{message.role === "user" ? "Tú" : "Asistente"}</span>
              <p>{message.content}</p>
            </li>
          ))}

          {isLoading && (
            <li className="message message-assistant pending" aria-live="assertive">
              Pensando…
            </li>
          )}
        </ul>
      </main>

      <form className="composer" onSubmit={handleSubmit}>
        <label className="composer-label" htmlFor="prompt">
          Escribe tu mensaje
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={3}
          placeholder="Pregúntale algo a la IA..."
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          disabled={isLoading}
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar"}
        </button>
      </form>

      {error && (
        <div className="error" role="status">
          {error}
        </div>
      )}
    </div>
  );
}
