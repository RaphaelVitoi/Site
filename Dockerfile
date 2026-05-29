# SOTA: Matriz mínima, alta densidade e anti-entropia via UV
FROM ghcr.io/astral-sh/uv:python3.12-slim AS builder

# Defesa Termodinâmica (Sem buffers, sem lixo em bytecode)
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app

# SOTA: Instalacao de dependencias via UV (Ultra-Fast)
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    uv sync --frozen --no-install-project --no-dev

# Estágio Final: Imagem de Runtime Purificada
FROM python:3.12-slim-bookworm

# Porta contratual do Cloud Run
ENV PORT=8080
ENV PYTHONUNBUFFERED=1

# Blindagem OS SOTA
RUN apt-get update && apt-get upgrade -y && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Criar usuario non-root
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -m -s /bin/bash appuser

# Copiar ambiente virtual sincronizado do builder
COPY --from=builder --chown=appuser:appgroup /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Materialização SOTA do código-fonte
COPY --chown=appuser:appgroup . .

USER appuser

# Healthcheck SOTA
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:8080/ || exit 1

# Boot do Master Core
CMD ["python", "core/runtime.py"]
