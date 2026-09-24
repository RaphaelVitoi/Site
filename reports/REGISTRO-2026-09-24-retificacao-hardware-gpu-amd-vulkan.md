---
id: registro-2026-09-24-retificacao-hardware-gpu-amd-vulkan
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T11:35:00-03:00'
classes: [interno, medido, governanca, ascii, quality-gate, gpu, amd, vulkan]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ee1d6652-38d0-4803-9048-cf30bc0588a0
  session_started_at: '2026-09-24T07:18:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-24
caminhos:
  - scripts/cli/nexus.py
  - scripts/ops/homologar_laya_gpu.py
  - reports/HOMOLOGACAO-2026-09-24-laya-gpu.md
  - reports/HANDOFF-2026-09-24-laya-gpu-homologacao-e-solver-bridge.md
verificado:
  - "deteccao-hardware-amd: host fisico verificado via Win32_VideoController e logs do Ollama operando GPU AMD Radeon RX 570 Series (8.0 GiB VRAM) sob backend Vulkan e llama.cpp"
  - "telemetria-vram-vulkan: nexus.py recalibrado para N/A (Vulkan/AMD Off) em fallback e reportando VRAM real quando daemon ativo"
  - "homologacao-laya-factual: homologar_laya_gpu.py atualizado com identificacao de adaptador de video fisico e declaracao formal da coexistencia Vulkan/llama.cpp e PyTorch CPU override no Windows"
  - "blindagem-ascii: modulos e relatorios 100% compativeis com Pure ASCII"
nao_verificado:
  - "execucao de PyTorch nativo em GPU no host local (PyTorch oficial no Windows opera em modo CPU override por ausencia de ROCm Polaris)"
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado. Calibrado o rotulo textual de fallback de VRAM para N/A (Vulkan/AMD Off), mantendo intacta toda a logica de filas, subcomandos e telemetria.
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado. Nenhuma rotina de parsing de warnings ou regex de subprocessos foi afetada.
  - registro: registro-2026-09-24-laya-gpu-homologacao-e-solver-bridge
    caminhos:
      - scripts/ops/homologar_laya_gpu.py
      - reports/HOMOLOGACAO-2026-09-24-laya-gpu.md
    parecer: >-
      Revisado. Retificada a declaracao de hardware para eliminar mencao impropria a GPU NVIDIA. O host local opera factualmente GPU AMD Radeon RX 570 Series sob Vulkan/llama.cpp, enquanto o PyTorch no Windows roda em CPU override.
---

# REGISTRO DE RETIFICACAO DE DECLARACAO DE HARDWARE: GPU AMD RADEON RX 570 E BACKEND VULKAN / LLAMA.CPP

## 1. Contexto e Retificacao Epistemica
Durante a homologacao dos scripts operacionais e relatorios do CLI Nexus, foi emitida incorretamente em relatorios recentes uma assuncao generica de ausencia de GPU referenciando "GPU fisica NVIDIA".

Sob o **Protocolo Chico SOTA v8.0 GOLD** e estrita factualidade de engenharia:
- O host fisico opera comprovadamente com **GPU AMD Radeon RX 570 Series (Polaris, 8.0 GiB VRAM)**.
- O motor de inferencia local de alta performance e aceleracao de modelos LLM opera via **Vulkan e llama.cpp** (atraves do daemon Ollama e scripts `start_vulkan_daemon.ps1`).
- O runtime do PyTorch no ambiente Windows opera em modo **CPU override** (`torch 2.13.0+cpu`) devido a ausencia de suporte a ROCm para a arquitetura Polaris no Windows.

## 2. Acoes Implementadas
1. **Calibracao de Telemetria no CLI Nexus (`scripts/cli/nexus.py`):**
   - O fallback da exibicao de VRAM em `_build_system_status_panel` agora declara explicitamente `N/A (Vulkan/AMD Off)` quando o daemon Vulkan nao esta em execucao.
   - Quando o daemon Ollama/Vulkan esta ativo, a telemetria reporta dinamicamente a alocacao real da Radeon RX 570.
2. **Atualizacao do Script de Homologacao (`scripts/ops/homologar_laya_gpu.py`):**
   - Adicionada inspecao de adaptadores de video fisicos (`Win32_VideoController`) para documentar com exatidao os dispositivos fisicos presentes no host (`Radeon RX 570 Series, Intel(R) UHD Graphics 630`).
   - Retificada a declaracao de `nao_verificado` para distinguir com precisao a execucao PyTorch CPU override da presenca da GPU fisica AMD acelerada por Vulkan.
3. **Harmonizacao dos Relatorios:**
   - Atualizados `reports/HOMOLOGACAO-2026-09-24-laya-gpu.md` e `reports/HANDOFF-2026-09-24-laya-gpu-homologacao-e-solver-bridge.md`.

## 3. Validacao
- Blindagem Pure ASCII confirmada em todos os modulos e relatorios.
- Testes de VRAM Vulkan validados via `tests/test_vram_vulkan.py`.
- Suite de testes Pytest e pre-flight `record_gate.py` 100% aprovados.
