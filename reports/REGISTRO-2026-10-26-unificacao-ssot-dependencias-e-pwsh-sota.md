---
id: registro-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota
tipo: registro
escopo: Site -- Unificacao SSOT de dependencias, elevacao de pisos de runtime SOTA v8.0 e reconciliacao de ancoras de dependencias e infraestrutura
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-26T20:10:00-03:00'
atualizado_em: '2026-10-26T20:10:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, dependencias, sota]
caminhos:
  - package.json
  - pyproject.toml
  - reports/REGISTRO-2026-10-26-unificacao-ssot-dependencias-e-pwsh-sota.md
  - requirements.txt
  - uv.lock
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python: '3.14.7'
  so: Windows
  session_id: cfa39f66-47e2-4565-b886-e0a7555e67e7
  session_started_at: '2026-10-26T20:00:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-26
verificado:
  - "Sincronizacao e resolucao integral do uv.lock com 258 pacotes e zero conflitos em uv pip check"
  - "Elevacao dos pisos das dependencias em pyproject.toml mitigando alertas uv-pypi (fastapi >=0.162.0, multidict >=7.2.1, onnxruntime >=1.31.1, google-genai >=2.33.0, openai >=3.39.0, anthropic >=2.3.0, laya >=0.4.15, pytest-asyncio >=1.4.1, duckdb >=2.0.0, playwright >=1.64.1)"
  - "Conversao canonica de requirements.txt para ponteiro editavel SSOT (-e .) eliminando divergencia"
  - "Harmonizacao e validacao dos scripts de gerenciamento de dependencias em package.json (deps:sync, deps:check, deps:lock)"
  - "Preservacao da suite e compatibilidade do motor asincrono com python 3.12+"
nao_verificado:
  - "Execucao de suite e2e Playwright com browsers headless completos nesta sessao de dependencia"
revisoes_de_ancora:
  - registro: auditoria-2026-10-08-integralidade-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
    parecer: >-
      Revisado em 2026-10-26. Unificacao de dependencias em pyproject.toml como SSOT e conversao de requirements.txt em ponteiro editavel (-e .), mantendo pisos e integridade do backend.
  - registro: handoff-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Atualizacao dos pisos de dependencias em pyproject.toml e sincronizacao de uv.lock sem violacao dos contratos de auditoria e remediacao.
  - registro: handoff-2026-10-24-remediacao-dependabot-e-integridade-sota
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Atualizacao dos manifests e travamento uv.lock preservando a resolucao das 74 vulnerabilidades Dependabot e adicionando scripts deps:* ao package.json.
  - registro: registro-2026-10-04-remediacao-dependabot-pypdf
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Sincronizacao de uv.lock preservando os pisos seguros de pypdf >=6.21.2.
  - registro: registro-2026-10-04-remediacao-dependabot-sentence-transformers-e-urllib3
    caminhos:
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Sincronizacao de uv.lock preservando integridade das dependencias de RAG e clientes HTTP.
  - registro: registro-2026-10-08-auditoria-e-remediacao-backend
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Reconciliacao de ancoras de pyproject.toml, requirements.txt e uv.lock com atualizacao dos pisos minimos de runtime SOTA.
  - registro: registro-2026-10-13-remediacao-dependabot-e-offload-strata
    caminhos:
      - package.json
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Adicao de rotinas de deps no package.json e resolucao consistente do uv.lock sem impactar a arquitetura Strata.
  - registro: registro-2026-10-14-saneamento-tipagem-config-ide-e-dependencias
    caminhos:
      - pyproject.toml
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Eleva pisos de dependencias em pyproject.toml e resolve uv.lock mantendo conformidade com as regras de tipagem e ambiente.
  - registro: registro-2026-10-18-remediacao-dependabot-e-renovacao-axe
    caminhos:
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Preservacao dos limites de seguranca com elevacao de pisos de IA (openai, anthropic, google-genai) e eliminacao de drift no requirements.txt.
  - registro: registro-2026-10-24-remediacao-integral-74-vulnerabilidades-dependabot
    caminhos:
      - package.json
      - pyproject.toml
      - requirements.txt
      - uv.lock
    parecer: >-
      Revisado em 2026-10-26. Consolidacao do ecossistema multiprojeto em SSOT canonica em pyproject.toml, unificacao de ambiente virtual e travamento estrito em uv.lock.
---

# Registro de Engenharia: Unificacao SSOT de Dependencias & Elevacao de Pisos SOTA

## 1. Contexto e Motivacao
Durante a auditoria de integridade do ecossistema multiprojeto sob o protocolo Chico SOTA v8.0 GOLD, foram detectadas divergencias de versao e alertas `uv-pypi` em manifestos Python, alem de duplicidade estrutural de ambientes virtuais (`.gemini/.venv` e `Site/.venv`) e estatico drift em `requirements.txt`.

## 2. Acoes Executadas

### 2.1 Elevacao de Pisos no pyproject.toml
Todos os pacotes alertados pela IDE e uv-pypi foram elevados para suas versoes SOTA estaveis:
- `fastapi >=0.162.0`
- `multidict >=7.2.1`
- `onnxruntime >=1.31.1`
- `google-genai >=2.33.0`
- `openai >=3.39.0`
- `anthropic >=2.3.0`
- `laya >=0.4.15`
- `pytest-asyncio >=1.4.1`
- `duckdb >=2.0.0`
- `playwright >=1.64.1`
- `tenacity >=9.1.4,<9.2.0` (deliberadamente limitado por exigencia de constraint do google-genai 2.33.0)

### 2.2 Unificacao em SSOT Canonica
- `Site/requirements.txt` foi convertido em `-e .` (SSOT imediato para o `pyproject.toml`).
- `.gemini/requirements.txt` foi convertido em `-e ./Site`.
- `nucleo/python-runtime/requirements.txt` foi convertido em `-e ../../Site`.
- O ambiente virtual `.gemini/.venv` foi substituido por uma juncao NTFS transparente apontando para `Site/.venv`, garantindo zero divergencia de binarios e bibliotecas.

### 2.3 Scripts de Gestao em package.json
Adicionadas rotinas `deps:sync`, `deps:check` e `deps:lock` ao `Site/package.json` para manutencao continua e idempotente.

## 3. Verificacao e Integridade
O `uv.lock` foi recalculado e travado com 258 pacotes resolvidos.
O comando `uv pip check` atestou conformidade total de dependencias.
As ancoras de 10 registros historicos foram reconciliadas neste registro, em conformidade com o criterio M.O. 13.F.
