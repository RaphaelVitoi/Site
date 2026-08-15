# Plano: Suporte AMD e Consenso de Entidades

## Objetivo
1. **Reconhecimento Oficial:** Consolidar a hierarquia de 20 Entidades no ecossistema (19 Agentes SOTA + 1 Tier 0 / CEO Raphael Vitoi).
2. **Hardware Guard para AMD:** Adaptar o `engine/gemma_server.py` para reconhecer placas de vídeo AMD e gerenciar a VRAM corretamente, substituindo a dependência exclusiva do `nvidia-smi`.

## Arquivos Afetados
- `engine/gemma_server.py`

## Passos da Implementação
1. Modificar a função `_validate_thermodynamic_hardware` em `engine/gemma_server.py` para incluir uma verificação de hardware AMD usando comandos PowerShell (`Get-CimInstance Win32_VideoController`).
2. Garantir que a verificação consiga ler a memória total (AdapterRAM) da GPU AMD como fallback de segurança, prevenindo que o sistema tente carregar modelos além da capacidade física do hardware.
3. Adicionar logs claros informando a detecção da GPU AMD (ex: modo DirectML/ROCm).
4. Ajustar as mensagens de log/comentários para referenciar corretamente as 19 entidades agentes.

## Verificação
- O servidor não deve falhar em máquinas Windows com AMD.
- A restrição de VRAM (OOM Protection) atuará baseada no limite físico detectado para a AMD.