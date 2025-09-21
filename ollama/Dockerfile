FROM ollama/ollama:latest

ENV OLLAMA_MODEL=llama3.1-nano

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
