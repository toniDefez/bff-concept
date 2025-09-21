#!/bin/sh
set -e

MODEL="${OLLAMA_MODEL:-llama3.1-nano}"

cleanup() {
  if [ -n "$SERVER_PID" ]; then
    kill -TERM "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM

echo "Starting ollama serve..."
ollama serve &
SERVER_PID=$!

TRIES=0
until curl -sf http://localhost:11434/api/version >/dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ "$TRIES" -gt 30 ]; then
    echo "Ollama server failed to become ready" >&2
    exit 1
  fi
  echo "Waiting for Ollama to be ready..."
  sleep 1
done

echo "Ollama ready. Ensuring model $MODEL is available..."
if ! ollama list | grep -F "$MODEL" >/dev/null 2>&1; then
  ollama pull "$MODEL"
else
  echo "Model $MODEL already present."
fi

echo "Ollama serving model $MODEL."
wait "$SERVER_PID"
