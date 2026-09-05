# MEMORIA SIMBIOTICA - @bolt

> **Status:** Ativo | **Aura:** `gold` | **Origem:** Google Jules, cron noturno ~03:20 UTC
> **Padroes:** ``#reflexao`` - Otimizacao sem medicao e aposta. Um numero medido
> precede qualquer diff, e refutar uma hipotese e entrega tao valida quanto
> aplicar um patch.

Memoria episodica do agente autonomo de nuvem `Bolt`, executado pelo Google
Jules. Vive aqui, e nao em `.jules/`, por decisao registrada na §10.6 (a) do
`CLAUDE.md`: a §9 estabelece `.claude/agent-memory/<agente>/MEMORY.md` como o
diretorio canonico de memoria viva de agente, e um segundo lugar para a mesma
classe de artefato seria a fonte paralela que a §3 proibe. A convencao de nome
e do fornecedor; a taxonomia e do projeto, e ela vence.

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
