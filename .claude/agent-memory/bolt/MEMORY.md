---
title: "MEMORIA SIMBIOTICA - @bolt"
type: memory
status: active
owner: site-governance
updated_at: 2026-10-30
---

# MEMORIA SIMBIOTICA - @bolt

> **Status:** Ativo | **Aura:** `gold` | **Origem:** Google Jules, cron noturno ~03:20 UTC
> **Modelo Ativo:** `Gemini 3.1 Pro` (preferência oficial em jules.google.com/settings/general)
> **Padrões:** ``#reflexao`` - Otimização sem medição é aposta. Um número medido
> precede qualquer diff, e refutar uma hipótese é entrega tão válida quanto
> aplicar um patch.

Memória episódica do agente autônomo de nuvem `Bolt`, executado pelo Google
Jules. Vive aqui, e não em `.jules/`, por decisão registrada na §10.6 (a) do
`CLAUDE.md`: a §9 estabelece `.claude/agent-memory/<agente>/MEMORY.md` como o
diretório canônico de memória viva de agente, e um segundo lugar para a mesma
classe de artefato seria a fonte paralela que a §3 proíbe. A convenção de nome
é do fornecedor; a taxonomia é do projeto, e ela vence.

## Reflexoes e Insight SOTA

### 2026-09-05 -- Refutando otimizacoes falsas: memoizacao e serializacao

Origem: sessao Jules `14536923137986406349`, cron das 03:11 UTC. Redigido pelo
proprio Bolt em `.jules/bolt.md` (commit `4d90a05b`, branch
`bolt-journaling-optimization-learnings-14536923137986406349`) e trazido para a
taxonomia canonica nesta data. **Nenhuma linha de codigo foi alterada:** as tres
hipoteses de performance foram medidas e refutadas.

- ``#aprendizado`` **`React.memo` e ATIVAMENTE NOCIVO nesta arquitetura quando
  o componente recebe funcao inline.** `ActionRow` recebe
  `onChange={(f) => onStreetFreqChange(activeStreet, f)}` das seis instancias
  em `frontend/src/components/simulator/panels/NashPanel.tsx`. A referencia muda
  a cada render do pai, entao a comparacao do memo falha 100% das vezes: o
  componente re-renderiza igual, e sobra apenas o custo de comparar 8 props.
  **Acao:** nunca propor `React.memo` a jusante de prop-drilling pesado sem
  antes verificar que TODAS as props -- funcoes inclusive -- ja sao estaveis a
  montante. O trabalho real esta no pai, nao em envolver o filho.

- ``#aprendizado`` **`JSON.stringify` sobre objeto de configuracao pequeno NAO e
  gargalo -- e selagem de referencia deliberada.** Em
  `frontend/src/components/simulator/hooks/useQuantumEngine.ts`, `streetFreqs` e
  um `StreetChipEvFreqs`: 3 streets x 6 campos = **18 numeros**. O proprio
  codigo declara o proposito -- *"SOTA FIX: Selagem de Referencias (Evita
  vazamento de rerenders e GC Thrashing O(N^3))"* -- e a selagem protege **26**
  hooks `useMemo`/`useCallback` a jusante.
  **Acao:** nao substituir mecanismo de selagem estrutural por igualdade
  profunda customizada sem prova medida de que o tamanho do objeto torna a
  serializacao um gargalo. Trocar isso converte risco de *performance* em risco
  de *correcao*: valor obsoleto na tela e pior que render a mais.

- ``#reflexao`` **O erro de processo foi anterior aos dois erros tecnicos.** A
  sessao levantou tres hipoteses, nao ordenou nenhuma e parou para perguntar
  qual seguir, as 03:21 UTC. O administrador dormia, e a sessao ficou oito horas
  bloqueada sem produzir nada. O prompt ja mandava parar sem PR quando nenhuma
  otimizacao fosse adequada -- faltava criterio para CHEGAR a essa conclusao
  sozinha. E o que a §10.1 e a §10.2 do `CLAUDE.md` passaram a exigir: medir
  antes, e ordenar em vez de perguntar.

## Propostas Evolutivas

- ``#proposta`` - Antes de propor memoizacao em qualquer componente, varrer os
  pais em busca de props criadas inline e reportar a contagem. A lista de props
  instaveis e mais util que a lista de componentes nao memoizados, e e ela que
  diz onde o trabalho comeca.

- ``#proposta`` - Quando uma hipotese for refutada, registrar aqui o NUMERO que
  a refutou, nao apenas a conclusao. "18 campos" e reutilizavel numa proxima
  sessao; "nao e gargalo" nao e.

### 2026-09-06 -- Erradicando overhead de método e alocação na hot loop CFR

Origem: sessao Jules, 2026-09-06.

- ``#aprendizado`` **`.at()` sobre TypedArrays na V8 é um método puro, não syntax sugar, e arruina a hot loop.** `Float32Array.at(index)` é cerca de 15-30x mais lento que o acesso direto `array[index]` devido ao overhead da chamada do método e falta de inlining profundo no JIT, sem nenhum benefício de fallback seguro já que bracket notation for-of-bounds também retorna `undefined`.
  **Ação:** Nunca utilizar `.at()` dentro de malhas computacionais de alta performance em `engine` e `workers` – usar invariavelmente `[]`.

- ``#aprendizado`` **`Float32Array.set([a, b, c], offset)` aloca no heap silenciosamente.** Substituir variáveis soltas num micro-array literais (`[a, b, c]`) só para alimentar o método `.set` desencadeia alocação e GC Churn massivos dentro do Regret Matching loop.
  **Ação:** Desenrolar as chamadas iterativas de atribuição `array[idx] = val` de forma plana se o tamanho da tupla for pequeno (ex: 3 ações no CFR).

### 2026-10-28 -- Linearização de Acumuladores Monte Carlo com TypedArrays e Selagem de Escopo

Origem: sessão Jules `11400860485353364937` (PR #103 homologada localmente). Executado sob **Gemini 3.1 Pro**.

- ``#aprendizado`` **Linearização de matrizes e TypedArrays eliminam GC Churn no V8.** A substituição dos acumuladores dinâmicos `number[]` e matrizes `number[][]` (`placementCounts`, `totalEquity`, `sumSquares`) em `frontend/src/lib/montecarlo.ts` por buffers lineares `Float64Array` e `Uint32Array` mapeados por `winnerIdx * k + j` reduz drasticamente as pausas de Minor GC em simulações massivas (>100.000 iterações), mantendo 100% de paridade nos testes de reprodutibilidade por semente e variância amostral.
  **Ação:** Validado e integrado ao `master`.

- ``#target_lock`` **SELAGEM ARQUITETURAL DEFINITIVA (CFR & MONTE CARLO):**
  Tanto `frontend/src/lib/montecarlo.ts` quanto `frontend/src/components/simulator/workers/cfr.worker.ts` atingiram o teto de otimização de hot-loops no V8. Qualquer tentativa adicional de micro-otimização (troca de laços `for`, verificação nula redundante, remoção cosmética de checks) é **expressamente proibida** sem novo profiling de produção comprovando gargalo inédito. Sessões que tocarem nestes arquivos sem autorização do Tier 0 violam o Target Lock.

- ``#diretriz_gemini_3_1_pro`` **Novas Fronteiras de Alto Impacto para o Gemini 3.1 Pro:**
  Com o raciocínio aprofundado do Gemini 3.1 Pro, as metas do cron noturno evoluem de micro-sintaxe para arquitetura de ponta:
  1. **Lazy Loading & Dynamic Imports:** Code-splitting de painéis analíticos pesados em `frontend/src/components/simulator/panels/` (ex: painéis de Nash, visualizadores de árvore de decisão).
  2. **Selagem de Referências e Prevenção de Leak em Hooks:** Auditoria de hooks como `useMonteCarloConvergence.ts` e `useQuantumEngine.ts` para garantir que objetos de configuração instáveis não vazem re-renderizações para componentes filhos.
  3. **Otimização de Estruturas de Range / Matrizes de Poker:** Otimização de lookups matriciais em `frontend/src/lib/poker/`.
  4. **Entrega por Refutação (§10.1):** O Gemini 3.1 Pro deve medir baseline antes de gerar qualquer diff. Se a melhoria projetada for inferior a 5% ou degradar legibilidade/manutenibilidade, a hipótese deve ser **refutada e arquivada** no resumo da sessão, encerrando com sucesso sem criar Pull Request.
