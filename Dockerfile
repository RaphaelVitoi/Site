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
FROM python:3.12-slim

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
COPY --from=builder /app/.venv /app/.venv
ENV PATH="/app/.venv/bin:$PATH"

# Materialização SOTA do código-fonte (Imutável, protegido contra modificação por non-root)
#
# Esta lista é o FECHO TRANSITIVO DE IMPORTS do CMD (`python core/runtime.py`),
# não uma enumeração de diretórios. Medido: o fecho original não cobria
# `monitoring`, `agents`, `conductor`, `task_executor.py`, `memory_rag.py` nem
# `predictive_forest.py`, todos importados em tempo de execução por
# `worker/startup.py` e `worker/loop.py`. A imagem morria com
# `ModuleNotFoundError` no primeiro segundo — e nenhum controle de container
# declarados abaixo (usuário não-root, healthcheck) jamais chegou a rodar em
# produção, porque a imagem nunca subiu.
#
# `cli/` e `scripts/` NÃO entram de propósito: `task_executor.py:695,702,709`
# os importa dentro de `if __name__ == "__main__"`, caminho que o container
# nunca percorre (`python task_executor.py`, e não). Copiá-los incharia a imagem
# e a superfície de ataque sem necessidade de runtime.
#
# `tests/test_dockerfile_closure_runtime.py` deriva este mesmo fecho por AST e
# reprova se um import novo entrar aqui sem COPY correspondente. A lista e o
# guard são o mesmo fato, medido dos dois lados.
COPY agents ./agents
COPY api ./api
COPY conductor ./conductor
COPY core ./core
COPY data ./data
COPY database ./database
COPY engine ./engine
COPY llm ./llm
COPY math ./math
COPY monitoring ./monitoring
COPY utils ./utils
COPY worker ./worker
COPY memory_rag.py predictive_forest.py task_executor.py ./
COPY pyproject.toml ./

USER appuser

# Healthcheck SOTA
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 CMD curl -f http://localhost:${PORT:-8080}/health || exit 1

# Boot do Master Core
CMD ["python", "core/runtime.py"]
