FROM ollama/ollama:latest

ARG OLLAMA_MODEL=llama3.1-nano
ENV OLLAMA_MODEL=${OLLAMA_MODEL}

RUN <<'SCRIPT'
set -e

MODEL="${OLLAMA_MODEL:-llama3.1-nano}"

cleanup() {
  if [ -n "${SERVER_PID:-}" ]; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT

echo "Starting temporary Ollama server to download model ${MODEL}..."
ollama serve &
SERVER_PID=$!

TRIES=0
until curl -sf http://localhost:11434/api/version >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -gt 60 ]; then
    echo "Ollama server failed to become ready" >&2
    exit 1
  fi
  sleep 1
done

echo "Pulling model ${MODEL} during build..."
ollama pull "$MODEL"
echo "Model ${MODEL} downloaded."
SCRIPT

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
