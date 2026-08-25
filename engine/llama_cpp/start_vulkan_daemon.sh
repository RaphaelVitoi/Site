#!/usr/bin/env bash
# ==============================================================================
# NEXUS CORE - SCRIPT POSIX / LINUX / WSL2 (AFFINITY CORE PINNING)
# Arquivo: engine/llama_cpp/start_vulkan_daemon.sh
# ==============================================================================

set -euo pipefail

MODEL_PATH="${1:-models/qwen2.5-coder-7b-instruct-q5_k_m.gguf}"
PORT="${2:-8080}"
HOST="127.0.0.1"
CTX_SIZE=8192
SLOTS=4
PHYSICAL_CORES=8
KV_CACHE="q8_0"

if [ ! -f "$MODEL_PATH" ]; then
    echo "[FATAL] Modelo não encontrado em: $MODEL_PATH" >&2
    exit 1
fi

echo "============================================================"
echo "  INICIANDO LLAMA-SERVER (LINUX/WSL2 TASKSET PINNING)"
echo "============================================================"

# taskset -c 0-7: Fixa a execução exclusivamente nos primeiros 8 P-Cores
exec taskset -c 0-$((PHYSICAL_CORES - 1)) ./llama-server     --host "$HOST"     --port "$PORT"     -m "$MODEL_PATH"     --mlock     -ngl 99     -c "$CTX_SIZE"     -ctk "$KV_CACHE"     -ctv "$KV_CACHE"     -fa     -np "$SLOTS"     --cont-batching     -b 512     -ub 512     --prompt-cache-all     -t "$PHYSICAL_CORES"     -tb "$PHYSICAL_CORES"
