---
id: cli-interativa-spec
tipo: especificacao
escopo: Site
autor: Raphael Vitoi
criado_em: 2026-05-01T00:00:00-03:00
verificado:
  - Especificacao tecnica da Smart CLI v2.0 consolidada
nao_verificado:
  - Revalidacao ponta a ponta do fluxo do.ps1 em producao
title:
  'SPEC Tecnica: Implementacao da Smart CLI v2.0 (do.ps1 - "A Membrana
  Inteligente")'
type: technical
status: active
owner: site-governance
updated_at: 2026-11-15
---

# SPEC Tecnica: Implementacao da Smart CLI v2.0 (do.ps1 - "A Membrana Inteligente")

> **Autor:** @planner (via CHICO) | **Baseado em:** [PRD.md](PRD.md),
> [CONCEPT_MAVERICK.md](CONCEPT_MAVERICK.md) e
> [IDENTITY_SPEC.md](IDENTITY_SPEC.md) **Status:** Implementado e consolidado
> (fusao dos arquivos de especificacao de `cli-interativa/` e antigo
> `aula-icm-rp/SPEC.md`)

## 1. Visao Tecnica

O script [`../../../do.ps1`](../../../do.ps1) atua como **Membrana Semipermeavel
Inteligente**, interceptando input em linguagem natural, classificando a
intencao via Regex e formatando a saida com a identidade visual definida em
[IDENTITY_SPEC.md](IDENTITY_SPEC.md).

## 2. Arquitetura de Dados (Cortex Lexical)

O script exige a leitura de tres arquivos estaticos em `data/`:

- `data/intentmap.json`: Dicionario principal (`Key`: Agente, `Value`:
  configuracao com `pattern` Regex).
- `data/synonyms.json`: Vetores secundarios de palavras, agrupados em Regex no
  momento do load.
- `data/aphorisms.json`: Array de strings contendo frases do sistema (Easter
  eggs).

### 2.1 Mapeamento Minimo de Intencao (Baseline Historico)

| Agente           | Keywords/Padroes (Regex Case-Insensitive)                                                                     | Intencao                  |
| :--------------- | :------------------------------------------------------------------------------------------------------------ | :------------------------ |
| **@implementor** | `(cria\|codific\|implement\|bug\|fix\|erro\|script\|codigo\|js\|html\|css\|layout\|design\|imersiv\|refinar)` | Execucao tecnica/Frontend |
| **@pesquisador** | `(pesquisa\|busca\|encontr\|estado da arte\|compar\|lista\|o que e)`                                          | Exploracao                |
| **@planner**     | `(planej\|estrutur\|spec\|prd\|roadmap\|arquitetur\|como fazer)`                                              | Arquitetura               |
| **@auditor**     | `(audit\|verific\|valid\|confer\|revis\|seguran\|compliance\|check)`                                          | Validacao                 |
| **@maverick**    | `(ideia\|inova\|pensar\|estrategia\|analis\|sentinela\|invent\|melhorar)`                                     | Intelectual               |
| **@curator**     | `(etica\|estetica\|tom\|texto\|copy\|revisao text\|identidade\|visual)`                                       | Refinamento               |

_Nota de evolucao:_ O catalogo ativo em `data/intentmap.json` expandiu o
baseline acima para cobrir toda a frota (>= 18 agentes), conforme validado em
[`../../../tests/test_smart_cli_intent.py`](../../../tests/test_smart_cli_intent.py).

## 3. Logica de Scoring (`Resolve-Intent`)

A funcao de resolucao e iterativa e deterministica:

1. **Short-circuit:** Verifica se a string inicia com `^(@[a-zA-Z0-9_-]+)`. Se
   sim, valida no mapa e retorna imediatamente.
2. **Regex Match Counting:** Para cada agente no mapa, combina o padrao primario
   com os sinonimos (`(pattern|syn1|syn2)`).
3. **Match Collection:** Conta as ocorrencias via Regex case-insensitive. O
   agente com maior score na string vence (ou o primeiro match em caso de
   empate).
4. **Fallback:** Se nenhum padrao pontuar (ou empatar em zero), retorna fallback
   para input manual ou `@maverick`.

## 4. Identidade Visual e UX

Conforme [IDENTITY_SPEC.md](IDENTITY_SPEC.md), a interface abandona o tom padrao
do PowerShell:

- **Paleta de Cores (`Write-Host`):**
  - Prompt: `Cyan` (`[NEXUS] Awaiting Directive >`)
  - Sistema: `DarkGray` (Logs internos, IDs)
  - Maverick/Inovacao: `Magenta`
  - Sucesso/Confirmacao: `Green`
  - Erro/Bloqueio: `Red`
- **Feedback Interativo e Auditivo:**
  - `[console]::Beep()` para feedback auditivo em sucessos e erros.
  - `Write-Host -NoNewline` para efeito de console em tempo real durante a
    verificacao de agentes.
- **Easter Eggs:** Ao iniciar em modo interativo sem argumentos, sortear numero
  aleatorio (1 a 100); se dentro do limiar configurado, exibir aforismo de
  `data/aphorisms.json` em `DarkMagenta` antes do prompt.

## 5. Fluxo de Execucao (`do.ps1`) e Integracao DAL

1. **Boot:** Carregar `Agent-TaskManager.psm1` e arquivos lexicos.
2. **Verificacao de Argumentos:** Se `$Description` / `$args[0]` existe,
   executar processamento direto (Modo Rapido); se vazio, iniciar Modo
   Interativo (Header "CHICO SMART CLI v2.0", Easter egg opcional e prompt
   `[NEXUS] Awaiting Directive >`).
3. **Processamento:** Sanitizar input via whitelist
   (`[a-zA-Z0-9\-\_\s\u00C0-\u00FF?.!]+`) e executar `Resolve-Intent`.
4. **Confirmacao (Handshake):** Se agente detectado e `-Force` nao estiver
   ativo, exibir `[PATTERN MATCH] Intent detected: '@agente'. Confirm? [Y/n]`;
   se `Y` ou Enter, enfileirar; se `n`, solicitar agente manualmente.
5. **Enfileiramento DAL:** Gerar payload Ordered Dictionary com schema exigido
   por `Test-TaskSchema` no `Agent-TaskManager.psm1` e injetar via
   `Add-AgentTask`.
6. **Feedback:** Exibir ID da Task em `DarkGray` e encerrar com
   `[SYMMETRY] Integrity verified. Cycle complete.`.

## 6. Checklist de Seguranca e Casos de Teste

- [x] **Sanitizacao:** Input do usuario nunca deve ser executado como codigo
      (`Invoke-Expression` proibido sobre input livre); tratar apenas como
      string literal para payload JSON.
- [x] **Escape:** Aspas e caracteres especiais no input devem ser escapados
      antes da serializacao JSON.
- [x] **Suite Automatizada:** Coberta em
      [`../../../tests/test_smart_cli_intent.py`](../../../tests/test_smart_cli_intent.py)
      (`test_intentmap_covers_all_agents`, `test_aphorisms_exist_and_not_empty`,
      `test_resolve_intent_heuristics`) e `do.test.ps1`.
- [x] **Casos de Aceite Baseline:**
  1. Input `"criar um arquivo js"` -> sugere `@implementor`.
  2. Input `"analisar a estrategia"` -> sugere `@maverick`.
  3. Input vazio sem flags -> abre prompt interativo colorido.
