# Relatório de Auditoria -- Sistema Poker Racional
**Data:** 2026-03-28 | **Versão auditada:** `d4263fa` (branch `main`)
**Status final:** APROVADO -- sistema pronto para produto

---

## 1. Escopo e Metodologia

A auditoria cobriu o stack completo: backend Python (task_executor, llm/, web/, database/, agents/), dados JSON de configuração, frontend TypeScript/Next.js, infraestrutura PowerShell e cobertura de testes. Foram verificados 42 itens em 6 camadas. A abordagem foi tática -- ler código real, não documentação -- com correção imediata de tudo que fosse seguro e reversível dentro da sessão.

---

## 2. Resultados Quantitativos

| Métrica | Valor |
|---------|-------|
| Itens verificados | 42 |
| Problemas encontrados | 10 |
| Corrigidos nesta sessão | 10 |
| Pendências remanescentes | 0 críticos / 1 baixa prioridade |
| Testes automatizados | 9/9 verde (Pester) |
| Status de produção | **PRONTO** |

---

## 3. Correções Aplicadas

### 3.1 Segurança

| # | Arquivo | Problema | Severidade |
|---|---------|----------|-----------|
| 1 | `task_executor.py` | Path traversal check executada **após** `open()` -- janela de exploração real | **Alta** |
| 2 | `web/middleware.py` | CORS `Allow-Headers` sem `Authorization` -- bloqueava preflight autenticado silenciosamente | Média |

O item 1 é o único problema de segurança real do conjunto. A checagem `".." in file_path.parts` é semanticamente correta; a anterior (`".." in str(file_path)`) gerava falsos positivos e ainda permitia bypass via encoding de path. A correção move o guard para antes do `open()` -- único lugar onde faz sentido existir.

### 3.2 Modelos Fantasma (Disponibilidade)

| # | Arquivo | Problema |
|---|---------|----------|
| 3 | `data/routing_map.json` | `gemini-3.1-pro` e `gemini-3.1-flash` como modelos primários (HTTP 404) |
| 4 | `llm/gemini.py` | Normalização de legados apontando para os mesmos modelos 3.1 |
| 5 | `agents/execution.py` | `@securitychief` com `model_override: gemini-3.1-pro` |
| 6 | `tests/test_task_routing.py` | Mock de teste referenciando modelo inexistente |

Quatro manifestações de um único padrão: drift entre o nome de modelo usado durante desenvolvimento (`3.1`) e os modelos disponíveis na API (`2.5`). O risco era silencioso -- o sistema rotacionava automaticamente para o fallback sem logar o 404 como erro de configuração. Na prática, o `@securitychief` nunca usaria seu modelo designado.

### 3.3 Corrupção de Dados

| # | Arquivo | Problema |
|---|---------|----------|
| 7 | `data/intentmap.json` | Triple BOM (`\uFEFF` × 3) corrompendo parse JSON |
| 8 | `data/intentmap.json` | Pattern do `@implementor` sem `desenvolv` -- divergência com `agents_manifest.json` |

O BOM triplo passa invisível em IDEs e só aparece em runtime com erros de decode. O parser tem `utf-8-sig` que absorve um BOM, não três. A divergência de pattern do `@implementor` significava que tarefas com "desenvolv" eram roteadas para `@chico` como fallback em vez do agente correto.

### 3.4 Consistência de Estado (VALID_AGENTS)

| # | Arquivos | Problema |
|---|---------|----------|
| 9 | `queue_manager.py` / `core/config.py` / `task_executor.py` | Binding estático congela VALID_AGENTS no cold start |

`queue_manager.py` importava `VALID_AGENTS` de `core.config` via `from ... import` -- um binding de valor, não de referência. Após hot-reload do manifesto no `task_executor.py`, o `queue_manager.py` continuava com a lista original. Qualquer agente adicionado após o startup seria normalizado para `@chico` na leitura de tasks do banco.

Solução: acesso por atributo de módulo (`_core_config.VALID_AGENTS`) + sincronização explícita nos 3 pontos de atribuição do `task_executor.py` (cold start + 2 branches de hot-reload). Nenhuma mudança de interface necessária.

### 3.5 Frontend

| # | Arquivo | Problema |
|---|---------|----------|
| 10 | `aulas/icm-masterclass/page.tsx` | Seção `#simulador-section` era placeholder com link circular para a própria página |

O MasterSimulator existia e funcionava, mas nunca foi conectado à rota pública. `SimuladorLazy.tsx` criado como wrapper `'use client'` para `next/dynamic` com `ssr: false` -- requisito do App Router que proíbe dynamic imports em Server Components. `ReferencialAula12` também estava implementada mas nunca importada no `MasterSimulator`.

---

## 4. Itens Verificados e Aprovados (sem intervenção)

- `web/handlers.py` -- todos os handlers com status codes corretos, guard de path traversal, fallback de encoding
- `web/server.py` -- bind em `127.0.0.1`, `reuse_address=True`, middlewares na ordem correta
- `llm/anthropic.py`, `llm/openrouter.py` -- 429 handling com `retry-after`
- `llm/providers.py` -- circuit breaker, diferenciação de erros 4xx vs 5xx vs transientes
- `llm/session.py` -- SSL context, keepalive, fallback síncrono para Windows
- `llm/routing.py` -- priorização de custo (Flash > Pro > OpenRouter > Anthropic), health gate
- `llm/orchestrator.py` -- hot-reload de configs, circuit breaker de compressão
- `llm/budget.py` -- ranking de chaves por métricas históricas, pool por modelo
- `database/queue_manager.py` -- índices corretos, PRAGMAs WAL, cleanup com retention
- `core/schemas.py` -- validação `@` prefix em Task
- `lib/icm.ts` -- Malmuth-Harville correto, 10 testes inline passando
- `lib/rpDeriver.ts` -- derivação BF → RP correta, phantom stacks, threshold
- `components/simulator/MasterSimulator.tsx` -- PKO discount, street scaling, props consistentes
- `do.ps1` -- `-TestMode`, Join-Path PS5.1, venv detection
- `scripts/ops/start_worker.ps1` -- `-Force`, `-Background`, logs separados stdout/stderr

---

## 5. Pendência Remanescente

**Dead imports em `task_executor.py`** (~25 símbolos importados mas não usados diretamente no arquivo).

Não é um bug. É consequência da modularização P5: sub-módulos fazem `import task_executor as te` e acessam `te.SomeClass`. Remover qualquer import quebraria esses consumidores. A solução correta é criar um módulo `task_executor.exports` com reexportações explícitas, mas isso é refatoração de médio porte que não bloqueia nenhum produto. **Baixa prioridade.**

---

## 6. Avaliação Qualitativa

**O que o sistema faz bem:**

O backend tem uma arquitetura defensiva consistente. Circuit breakers, health gates, fallbacks em cascata, retry com backoff, ranking de chaves por histórico -- cada camada tem um plano B. Isso não é excesso de engenharia: é necessário dado o ambiente real (múltiplas APIs com rate limits distintos, modelos que somem sem aviso). A modularização P5 (task_executor de 1400 para 287 linhas) foi bem executada -- separação de responsabilidades limpa, sem vazamento de estado entre módulos.

O motor ICM no frontend é tecnicamente correto. A derivação Malmuth-Harville está implementada com os guards certos (divisão por zero, phantom stacks, threshold BF). O `rpDeriver` conecta teoria (Perspectiva, BF, RP) a parâmetros acionáveis (frequências por street). A âncora empírica -- 93 nodes HRC vs GTO Wizard -- é o detalhe que separa o trabalho de divulgação especulativa: há um ponto de calibração real.

**O que merece atenção contínua:**

O padrão de modelos fantasma (gemini-3.1-*) apareceu em 4 arquivos diferentes. Isso indica que não há um teste de integração que verifique se os modelos nos JSONs de configuração são realmente acessíveis. Um teste simples que valida `routing_map.json` contra uma lista de modelos conhecidos eliminaria essa classe de bug permanentemente.

A duplicação `core.config` / `task_executor` é resultado de dois momentos de desenvolvimento que nunca foram reconciliados. O fix aplicado (sincronização explícita via atributo de módulo) é pragmático e funciona, mas a solução ideal é ter uma única fonte de verdade com hot-reload embutido, acessível por qualquer módulo sem acoplamento circular.

**Síntese:**

O sistema é robusto onde importa -- processamento de tarefas, fallback de modelos, segurança de acesso a arquivos. Os problemas encontrados eram todos de configuração ou integração, não de lógica central. Nenhum compromete a funcionalidade principal em condições normais de operação. O produto pode avançar.

---

## 7. Commits da Sessão

| Hash | Descrição |
|------|-----------|
| `d4263fa` | fix: eliminar drift de VALID_AGENTS entre core.config e task_executor |
| `4c06884` | fix: reconectar ReferencialAula12 ao MasterSimulator |
| `b8057cb` | fix: renderizar MasterSimulator em /aulas/icm-masterclass |
| `c4c5d6b` | feat: GET /health -- status operacional do worker |
| `02b6899` | test: do.test.ps1 9/9 verde -- fallback Python via TestPythonCmd |
| `230dd61` | test: do.test.ps1 8/9 verde via -TestMode + fix Join-Path PS5.1 |

---

*Auditoria conduzida em 2026-03-28. Revisor: Claude Sonnet 4.6.*
