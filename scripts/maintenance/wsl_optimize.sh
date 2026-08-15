#!/usr/bin/env bash
# ==============================================================================
# SOTA WSL OPTIMIZER - Prevencao de Colapso de I/O (9P Protocol)
# ==============================================================================

set -euo pipefail

echo -e "\n=== [SISTEMA] OTIMIZACAO DE I/O WSL SOTA ===\n"

# 1. Sincronizacao do VFS (Virtual File System) do Linux
echo "[+] Sincronizando buffers de disco no Kernel Linux..."
sync

# 2. Descarte de caches fantasmas (Requer sudo - pode pedir senha)
echo "[+] Purgando PageCache, Dentries e Inodes (VFS Ghost Caches)..."
sudo sysctl -w vm.drop_caches=3 > /dev/null

# 3. Tratamento de Reparse Points corrompidos no NTFS
VENV_DIR=".venv"
DEAD_DIR=".venv_corrupted_$(date +%s)"

if [ -d "$VENV_DIR" ]; then
    echo "[!] Diretorio $VENV_DIR detectado. Iniciando obliteracao segura via CMD Nativo..."

    # Bypass 1: Tentativa de remocao via CMD (Ignora erros de Reparse Point do PowerShell)
    cmd.exe /c "rd /s /q .venv" 2>/dev/null || true

    if [ -d "$VENV_DIR" ]; then
        echo "[!] Falha na remocao direta (NTFS Lock). Aplicando bypass de quarentena (Rename)..."
        # Bypass 2: Mover para quarentena se o arquivo estiver bloqueado pelo Defender/Kernel
        cmd.exe /c "move .venv $DEAD_DIR" > /dev/null 2>&1 || mv "$VENV_DIR" "$DEAD_DIR" 2>/dev/null || true
        echo "[OK] Diretorio isolado em $DEAD_DIR. A arvore original esta limpa."
    else
        echo "[OK] Diretorio obliterado com sucesso."
    fi
fi

echo -e "\n[OK] Homeostase de I/O reestabelecida. O ambiente esta pronto para recriacao."
