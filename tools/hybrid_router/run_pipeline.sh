#!/usr/bin/env bash
# =====================================================================
# run_pipeline.sh - Automação Completa no Linux / macOS / WSL
# =====================================================================
set -euo pipefail

HOST_URL="${ROUTER_URL:-http://127.0.0.1:8000}"
PORT="${PORT:-8000}"
REQUESTS="${BENCH_REQUESTS:-60}"
CONCURRENCY="${BENCH_CONCURRENCY:-10}"
OUTPUT_JSON="${BENCH_OUTPUT_JSON:-benchmark_results.json}"
OUTPUT_PNG="${BENCH_OUTPUT_PNG:-benchmark_latency_report.png}"

SERVER_PID=""

cleanup() {
    if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
        echo -e "\n\033[90m[CLEANUP] Encerrando servidor FastAPI (PID: $SERVER_PID)...\033[0m"
        kill -SIGTERM "$SERVER_PID" 2>/dev/null || kill -9 "$SERVER_PID" 2>/dev/null
    fi
}
trap cleanup EXIT INT TERM

echo -e "\033[36m============================================================\033[0m"
echo -e "\033[36m INICIANDO PIPELINE DE BENCHMARK HÍBRIDO (BASH)             \033[0m"
echo -e "\033[36m============================================================\033[0m"

# 1. Iniciar FastAPI em segundo plano
echo -e "\n\033[33m[1/4] Inicializando servidor FastAPI (app:app) na porta $PORT...\033[0m"
python -m uvicorn app:app --host 127.0.0.1 --port "$PORT" &
SERVER_PID=$!

# 2. Polling ativo de Health Check via curl
echo -e "\033[33m[2/4] Aguardando prontidão do endpoint /health...\033[0m"
MAX_RETRIES=30
RETRY_COUNT=0
IS_ONLINE=0

while [[ $RETRY_COUNT -lt $MAX_RETRIES ]]; do
    if curl -s -f "$HOST_URL/health" >/dev/null 2>&1; then
        IS_ONLINE=1
        echo -e "\033[32m  -> Servidor online em $HOST_URL (Tentativa $((RETRY_COUNT + 1)))\033[0m"
        break
    fi
    sleep 0.5
    RETRY_COUNT=$((RETRY_COUNT + 1))
done

if [[ $IS_ONLINE -eq 0 ]]; then
    echo -e "\033[31m[ERRO CRÍTICO] Timeout: Servidor FastAPI não respondeu após 15 segundos.\033[0m"
    exit 1
fi

# 3. Execução do Benchmark
echo -e "\n\033[33m[3/4] Disparando benchmark ($REQUESTS requisições, $CONCURRENCY concorrentes)...\033[0m"
export ROUTER_URL="$HOST_URL"
export BENCH_REQUESTS="$REQUESTS"
export BENCH_CONCURRENCY="$CONCURRENCY"
export BENCH_OUTPUT_JSON="$OUTPUT_JSON"

python benchmark.py

# 4. Geração dos Gráficos
echo -e "\n\033[33m[4/4] Gerando gráficos de latência e densidade...\033[0m"
python plot_benchmark.py --input "$OUTPUT_JSON" --output "$OUTPUT_PNG"

echo -e "\n\033[32m============================================================\033[0m"
echo -e "\033[32m PIPELINE CONCLUÍDO COM SUCESSO!                           \033[0m"
echo -e "\033[32m Resultados exportados:                                     \033[0m"
echo -e "\033[32m   - Dataset Bruto: $OUTPUT_JSON                             \033[0m"
echo -e "\033[32m   - Gráfico PNG:   $OUTPUT_PNG                              \033[0m"
echo -e "\033[32m============================================================\033[0m"
