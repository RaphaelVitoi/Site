---
id: registro-2026-09-25-pool-rotacional-gemini-flash-lite
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-25T19:25:00-03:00'
classes: [interno, medido, governanca, llm, pool, rotation, gemini, circuit-breaker]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 31abdec0-f1f1-44d8-a782-de88a85e8c3a
  session_started_at: '2026-09-25T19:15:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-25
caminhos:
  - llm/gemini.py
  - llm/gemini_pool.py
  - scripts/ops/Set-GeminiKeyPool.ps1
  - tests/test_gemini_pool.py
verificado:
  - "suite test_gemini_pool.py: 8/8 testes aprovados com homeostase total (0 erros, 0 warnings)"
  - "suite test_credenciais.py: 7/7 testes aprovados sem credenciais em arquivos rastreados"
  - "suite test_declarado_e_lido.py: 100% aprovado sem constantes orfas"
  - "formatacao ruff: llm/gemini_pool.py e llm/gemini.py 100% conformes"
  - "powershell 5.1: scripts/ops/Set-GeminiKeyPool.ps1 com BOM UTF-8 unico validado"
  - "teste de rede em voo: rotacao entre as 5 chaves reais confirmada com sub-420ms de latencia media"
  - "cwv_gate: 0 erros criticos nas 5 fases"
nao_verificado:
  - "esgotamento forcado de cota diaria (1.500 RPD) em ambiente de teste"
revisoes_de_ancora:
  - registro: registro-2026-09-24-blindagem-ascii-e-harmonizacao-scripts
    caminhos: [llm/gemini.py]
    parecer: "Integracao aditiva de pool rotacional adaptativo inteligente com circuit breaker e suporte prioritario ao modelo gemini-3.5-flash-lite. Nenhuma interface existente foi quebrada."
---

# REGISTRO FORMAL — POOL ROTACIONAL ADAPTATIVO GEMINI 3.5 FLASH-LITE

## 1. Contexto e Motivação
O operador (Tier 0) proveu 5 chaves de API da Generative Language API vinculadas ao projeto Google AI Studio / GCP `projects/913870412920` (`original-498419`) com diretriz estrita:
- Operação em pool rotacional inteligente para `gemini-3.5-flash-lite`.
- Atribuição especializada para:
  1. **Edições pontuais e atômicas** (micro-edits, blocos SEARCH/REPLACE cirúrgicos).
  2. **Triagem** (classificação de prompts, fast-path ingress, triagem de tarefas).
  3. **Linting** (auditoria estática de código, validação AST, pre-commit gates).
- Respeito integral às limitações do Google AI Studio (projetos simultâneos, cotas de RPM/TPM/RPD e filtros de API).
- Governança rigorosa de credenciais: nenhuma chave salva em texto claro em código versionado, sendo persistidas exclusivamente em `HKCU:\Environment` do Windows com telemetria por fingerprint `sha8`.

## 2. Ações de Engenharia
1. **Provisionador Seguro PowerShell (`Site/scripts/ops/Set-GeminiKeyPool.ps1`):**
   - Grava `GEMINI_API_KEY_1..5`, aliases `GEMINI_FLASH_KEY_1..5`, `GEMINI_PROJECT_ID` e `GEMINI_PROJECT_NAME` em `HKCU:\Environment` e no processo ativo.
   - Emite broadcast `WM_SETTINGCHANGE` para herança por processos filhos.
   - Exibe exclusivamente comprimentos e fingerprints SHA-256 (`sha8`).
2. **Módulo de Pool Rotacional (`Site/llm/gemini_pool.py`):**
   - Classe `GeminiPoolManager` com thread-safety assíncrono (`asyncio.Lock`).
   - Algoritmo Weighted Round-Robin adaptativo sobre chaves com Health Score saudável ($\ge 60.0$).
   - Circuit Breaker reativo:
     - HTTP 429 (`RESOURCE_EXHAUSTED`): leitura de `retryDelay` da resposta da API (ou fallback de 45s) e failover transparente em $\mathcal{O}(1)$ para a próxima chave.
     - HTTP 401/403: isolamento permanente (`is_revoked = True`).
     - HTTP 5xx: cooldown curto (15s).
   - Rastreamento dos domínios de trabalho `GeminiWorkload` (`atomic_edits`, `triagem`, `linting`, `general`).
   - Tabela de telemetria formatada em Markdown com anonimização total de credenciais.
3. **Integração no Motor Principal (`Site/llm/gemini.py`):**
   - Atualização de `call_gemini` para rotacionar automaticamente chaves do pool quando `api_key` não é especificada.
   - Função de conveniência `call_gemini_flash_lite` com retries e failover automatizado.
4. **Validação & Testes:**
   - Criação de `Site/tests/test_gemini_pool.py` com 8 testes cobrindo inicialização, round-robin, circuit breaker 429, revogação 401/403, contadores de carga, medição de latência e failover.
   - 8/8 testes aprovados em 1.14s com homeostase total (0 erros, 0 warnings).
   - Teste de rede ao vivo confirmando rotação bem-sucedida entre as 5 chaves reais e sub-420ms de latência.

## 3. Telemetria Medida em Voo
| Chave | SHA-8 | Score | Sucessos / Tentativas | Latência Média | Status | Carga (Edits / Triagem / Lint) |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| #1 | `e0dbf4a2` | **96.0** | 1/1 | 405.0 ms | Ativa | 0 / 1 / 0 |
| #2 | `c071fe44` | **95.8** | 1/1 | 415.7 ms | Ativa | 0 / 1 / 0 |
| #3 | `cd41bfff` | **96.6** | 1/1 | 344.8 ms | Ativa | 0 / 1 / 0 |
| #4 | `e4d60fbf` | **96.4** | 1/1 | 358.7 ms | Ativa | 0 / 1 / 0 |
| #5 | `92171534` | **96.4** | 1/1 | 362.1 ms | Ativa | 0 / 1 / 0 |
