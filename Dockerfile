# SOTA: Matriz mínima, alta densidade e anti-entropia
FROM python:3.12-slim

# Defesa Termodinâmica (Sem buffers, sem lixo em bytecode)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Porta contratual do Cloud Run
ENV PORT=8080

# Blindagem OS SOTA (Expurgo de Vulnerabilidades de Imagem)
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Criar usuario e grupo non-root
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser

# Cache Layering Otimizado
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Materialização SOTA
COPY --chown=appuser:appgroup . .

# Ajustar propriedade do diretorio de trabalho
RUN chown -R appuser:appgroup /app

USER appuser

# Healthcheck SOTA
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:8080/ || exit 1

# Boot do Master Core (AioHTTP / God Mode)
CMD ["python", "core/runtime.py"]
