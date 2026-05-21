---
name: Prompt de Continuidade V52 - 2026-03-29
description: Renomeação do motor aprovada. conceitos-icm hierarquia errada. .txt pesquisa em leitura (agente background). Conflito de nomenclatura "Perspectiva" identificado.
type: project
---

# Prompt de Continuidade V52 — 2026-03-29

## Commits desta sessão
| Hash | Descrição |
|------|-----------|
| `8566e97` | fix: buildInsight threshold usa esperancaRealizadaPct quando R<1 + docs framework PM v2 |

## Tarefa imediata ao retomar

### 1. Renomear o que o motor calcula em `perspectiva.ts`

**Aprovado por Raphael.** O motor calcula:
- Distribuição M-H (positionProbs + equities) → `calculatePerspectiva` / `PerspectiveResult`
- Esperança sobre ΔPerspectiva → `calculateEsperanca` / `EsperancaResult`
- EV do fold → `calculateEsperancaFold`
- **RP diluído entre streets e seus resultantes** → `rpDeriver` (integrado nos cenários do MasterSimulator)

"Perspectiva Matemática" está bloqueada pelo nome da função M-H. Precisa liberar para a síntese final.

**Renomeações aprovadas:**
- `calculatePerspectiva` → `calculateMapaICM` (ou `calculateDistribuicaoPosicional`)
- `PerspectiveResult` → `MapaICMResult`
- Módulo `perspectiva.ts` permanece como guarda-chuva
- "Perspectiva Matemática" reservada para síntese final (não implementada ainda)

**IMPORTANTE:** Antes de renomear, verificar todos os usos em:
- `perspectiva.ts` (definições)
- `PerspectivePanel.tsx` (usa `calculatePerspectiva` indiretamente via `calculateEsperanca`)
- `MasterSimulator.tsx` (usa `rpDeriver` + cenários)
- Qualquer outro arquivo que importe de `perspectiva.ts`

### 2. Corrigir `conceitos-icm/page.tsx`

**Problema identificado:** Página define hierarquia errada.

Página atual:
- Expectativa = "referencial/contexto" (perde camada preditiva)
- Perspectiva = distribuição M-H (confunde com insumo da Esperança)
- Esperança = métrica de decisão (correto)

Hierarquia correta (Raphael):
```
chipEV → ICM EV → Esperança → Expectativa → Perspectiva
```
- ICM EV: snapshot financeiro ("O que tenho agora?")
- Esperança: estratégico-lógica ("O que posso buscar neste cenário?")
- Expectativa: probabilístico-preditiva com cadeia futura ("SE X, o que impacta no FGS e na Esperança futura?")
- Perspectiva: síntese definitiva fechada (aprendeu iterativamente de tudo)

**O que está correto na página:** equação da Esperança, relação ICM EV vs framework.
**O que corrigir:** definição de Expectativa (não é só "contexto"), definição de Perspectiva (não é M-H distribution), ordem das seções.

### 3. Verificar .txt de pesquisa

Agente em background lendo:
- `frontend/research/icm-materials/icmteoriaadicionalpt1.txt`
- `frontend/research/icm-materials/icmteoriaadicionalpt2.txt`

Verificar se há teoria não registrada na memória. Agente ID: `a0d772022920be3c9`.

### 4. 5º arquétipo — "Transferência do Risco"

`frontend/research/icm-materials/geometria_texto.md` tem 5 arquétipos.
`icm-masterclass/page.tsx` publica apenas 4.
Verificar se o 5º deve ser incorporado.

## Pendências mantidas do V51

- PKO: teoria em revisão com base na Perspectiva
- EV_fold dinâmico f(t, d_pj, pos): conceitual, sem matemática fechada — standby
- Label "Perspectiva Realizada" no painel: tecnicamente é "Esperança Realizada (com R)" — aguarda decisão de nomenclatura junto com renomeação geral
