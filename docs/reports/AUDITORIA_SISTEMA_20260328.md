# Relatorio de Auditoria -- Sistema Poker Racional
**Data:** 2026-03-28 | **Versao auditada:** `d4263fa` (branch `main`)
**Status final:** APROVADO -- sistema pronto para produto

---

## 1. Escopo e Metodologia

A auditoria cobriu o stack completo: backend Python (task_executor, llm/, web/, database/, agents/), dados JSON de configuracao, frontend TypeScript/Next.js, infraestrutura PowerShell e cobertura de testes. Foram verificados 42 itens em 6 camadas. A abordagem foi tatica -- ler codigo real, nao documentacao -- com correcao imediata de tudo que fosse seguro e reversivel dentro da sessao.

---

## 2. Resultados Quantitativos

| Metrica | Valor |
|---------|-------|
| Itens verificados | 42 |
| Problemas encontrados | 10 |
| Corrigidos nesta sessao | 10 |
| Pendencias remanescentes | 0 criticos / 1 baixa prioridade |
| Testes automatizados | 9/9 verde (Pester) |
| Status de producao | **PRONTO** |

---

## 3. Correcoes Aplicadas

### 3.1 Seguranca

| # | Arquivo | Problema | Severidade |
|---|---------|----------|-----------|
| 1 | `task_executor.py` | Path traversal check executada **apos** `open()` -- janela de exploracao real | **Alta** |
| 2 | `web/middleware.py` | CORS `Allow-Headers` sem `Authorization` -- bloqueava preflight autenticado silenciosamente | Media |

O item 1 e o unico problema de seguranca real do conjunto. A checagem `".." in file_path.parts` e semanticamente correta; a anterior (`".." in str(file_path)`) gerava falsos positivos e ainda permitia bypass via encoding de path. A correcao move o guard para antes do `open()` -- unico lugar onde faz sentido existir.

### 3.2 Modelos Fantasma (Disponibilidade)

| # | Arquivo | Problema |
|---|---------|----------|
| 3 | `data/routing_map.json` | `gemini-3.1-pro` e `gemini-3.1-flash` como modelos primarios (HTTP 404) |
| 4 | `llm/gemini.py` | Normalizacao de legados apontando para os mesmos modelos 3.1 |
| 5 | `agents/execution.py` | `@securitychief` com `model_override: gemini-3.1-pro` |
| 6 | `tests/test_task_routing.py` | Mock de teste referenciando modelo inexistente |

Quatro manifestacoes de um unico padrao: drift entre o nome de modelo usado durante desenvolvimento (`3.1`) e os modelos disponiveis na API (`2.5`). O risco era silencioso -- o sistema rotacionava automaticamente para o fallback sem logar o 404 como erro de configuracao. Na pratica, o `@securitychief` nunca usaria seu modelo designado.

### 3.3 Corrupcao de Dados

| # | Arquivo | Problema |
|---|---------|----------|
| 7 | `data/intentmap.json` | Triple BOM (`\uFEFF`  3) corrompendo parse JSON |
| 8 | `data/intentmap.json` | Pattern do `@implementor` sem `desenvolv` -- divergencia com `agents_manifest.json` |

O BOM triplo passa invisivel em IDEs e so aparece em runtime com erros de decode. O parser tem `utf-8-sig` que absorve um BOM, nao tres. A divergencia de pattern do `@implementor` significava que tarefas com "desenvolv" eram roteadas para `@chico` como fallback em vez do agente correto.

### 3.4 Consistencia de Estado (VALID_AGENTS)

| # | Arquivos | Problema |
|---|---------|----------|
| 9 | `queue_manager.py` / `core/config.py` / `task_executor.py` | Binding estatico congela VALID_AGENTS no cold start |

`queue_manager.py` importava `VALID_AGENTS` de `core.config` via `from ... import` -- um binding de valor, nao de referencia. Apos hot-reload do manifesto no `task_executor.py`, o `queue_manager.py` continuava com a lista original. Qualquer agente adicionado apos o startup seria normalizado para `@chico` na leitura de tasks do banco.

Solucao: acesso por atributo de modulo (`_core_config.VALID_AGENTS`) + sincronizacao explicita nos 3 pontos de atribuicao do `task_executor.py` (cold start + 2 branches de hot-reload). Nenhuma mudanca de interface necessaria.

### 3.5 Frontend

| # | Arquivo | Problema |
|---|---------|----------|
| 10 | `aulas/icm-masterclass/page.tsx` | Secao `#simulador-section` era placeholder com link circular para a propria pagina |

O MasterSimulator existia e funcionava, mas nunca foi conectado a rota publica. `SimuladorLazy.tsx` criado como wrapper `'use client'` para `next/dynamic` com `ssr: false` -- requisito do App Router que proibe dynamic imports em Server Components. `ReferencialAula12` tambem estava implementada mas nunca importada no `MasterSimulator`.

---

## 4. Itens Verificados e Aprovados (sem intervencao)

- `web/handlers.py` -- todos os handlers com status codes corretos, guard de path traversal, fallback de encoding
- `web/server.py` -- bind em `127.0.0.1`, `reuse_address=True`, middlewares na ordem correta
- `llm/anthropic.py`, `llm/openrouter.py` -- 429 handling com `retry-after`
- `llm/providers.py` -- circuit breaker, diferenciacao de erros 4xx vs 5xx vs transientes
- `llm/session.py` -- SSL context, keepalive, fallback sincrono para Windows
- `llm/routing.py` -- priorizacao de custo (Flash > Pro > OpenRouter > Anthropic), health gate
- `llm/orchestrator.py` -- hot-reload de configs, circuit breaker de compressao
- `llm/budget.py` -- ranking de chaves por metricas historicas, pool por modelo
- `database/queue_manager.py` -- indices corretos, PRAGMAs WAL, cleanup com retention
- `core/schemas.py` -- validacao `@` prefix em Task
- `lib/icm.ts` -- Malmuth-Harville correto, 10 testes inline passando
- `lib/rpDeriver.ts` -- derivacao BF  RP correta, phantom stacks, threshold
- `components/simulator/MasterSimulator.tsx` -- PKO discount, street scaling, props consistentes
- `do.ps1` -- `-TestMode`, Join-Path PS5.1, venv detection
- `scripts/ops/start_worker.ps1` -- `-Force`, `-Background`, logs separados stdout/stderr

---

## 5. Pendencia Remanescente

**Dead imports em `task_executor.py`** (~25 simbolos importados mas nao usados diretamente no arquivo).

Nao e um bug. E consequencia da modularizacao P5: sub-modulos fazem `import task_executor as te` e acessam `te.SomeClass`. Remover qualquer import quebraria esses consumidores. A solucao correta e criar um modulo `task_executor.exports` com reexportacoes explicitas, mas isso e refatoracao de medio porte que nao bloqueia nenhum produto. **Baixa prioridade.**

---

## 6. Avaliacao Qualitativa

**O que o sistema faz bem:**

O backend tem uma arquitetura defensiva consistente. Circuit breakers, health gates, fallbacks em cascata, retry com backoff, ranking de chaves por historico -- cada camada tem um plano B. Isso nao e excesso de engenharia: e necessario dado o ambiente real (multiplas APIs com rate limits distintos, modelos que somem sem aviso). A modularizacao P5 (task_executor de 1400 para 287 linhas) foi bem executada -- separacao de responsabilidades limpa, sem vazamento de estado entre modulos.

O motor ICM no frontend e tecnicamente correto. A derivacao Malmuth-Harville esta implementada com os guards certos (divisao por zero, phantom stacks, threshold BF). O `rpDeriver` conecta teoria (Perspectiva, BF, RP) a parametros acionaveis (frequencias por street). A ancora empirica -- 93 nodes HRC vs GTO Wizard -- e o detalhe que separa o trabalho de divulgacao especulativa: ha um ponto de calibracao real.

**O que merece atencao continua:**

O padrao de modelos fantasma (gemini-3.1-*) apareceu em 4 arquivos diferentes. Isso indica que nao ha um teste de integracao que verifique se os modelos nos JSONs de configuracao sao realmente acessiveis. Um teste simples que valida `routing_map.json` contra uma lista de modelos conhecidos eliminaria essa classe de bug permanentemente.

A duplicacao `core.config` / `task_executor` e resultado de dois momentos de desenvolvimento que nunca foram reconciliados. O fix aplicado (sincronizacao explicita via atributo de modulo) e pragmatico e funciona, mas a solucao ideal e ter uma unica fonte de verdade com hot-reload embutido, acessivel por qualquer modulo sem acoplamento circular.

**Sintese:**

O sistema e robusto onde importa -- processamento de tarefas, fallback de modelos, seguranca de acesso a arquivos. Os problemas encontrados eram todos de configuracao ou integracao, nao de logica central. Nenhum compromete a funcionalidade principal em condicoes normais de operacao. O produto pode avancar.

---

## 7. Commits da Sessao

| Hash | Descricao |
|------|-----------|
| `d4263fa` | fix: eliminar drift de VALID_AGENTS entre core.config e task_executor |
| `4c06884` | fix: reconectar ReferencialAula12 ao MasterSimulator |
| `b8057cb` | fix: renderizar MasterSimulator em /aulas/icm-masterclass |
| `c4c5d6b` | feat: GET /health -- status operacional do worker |
| `02b6899` | test: do.test.ps1 9/9 verde -- fallback Python via TestPythonCmd |
| `230dd61` | test: do.test.ps1 8/9 verde via -TestMode + fix Join-Path PS5.1 |

---

*Auditoria conduzida em 2026-03-28. Revisor: Claude Sonnet 4.6.*
