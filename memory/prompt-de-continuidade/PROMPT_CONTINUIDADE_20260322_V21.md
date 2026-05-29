---
name: Prompt de Continuidade V21
description: Estado sessão 20260322 (continuação V20). Simulador: streets Flop/Turn/River em implementação. Página /tools/simulador com apresentação didática. Tooltips NashPanel melhorados.
type: project
---

# V21 — 2026-03-22

## Concluído nesta sessão (pós V20)

### Simulador — Remoção da frontpage
- Hub-card "Motor ICM" removido de page.tsx (frontpage)
- MasterSimulator removido de aula-icm/page.tsx — substituído por CTA link
- Simulador acessível apenas via botão "Motor ICM" no header → /tools/simulador

### Página /tools/simulador — Apresentação didática
- Reescrita com foco na DOR real: "Sei o GTO puro. Não sei quanto o ICM me obriga a desviar neste spot pós-flop."
- Bloco de problema + "O que resolve" + "Como usar"
- Sem menção a cash game (usuário é especialista MTT)
- Step 4 reformulado: "Leia a coluna Δ: negativo = ICM comprime, positivo = ICM favorece"

### Nomes dos cenários
- Artigos "O/A" removidos de todos: Paradoxo, Pacto, Efeito Batata Quente, Vácuo Matemático, Franco-Atirador, Bully do Botão, Ameaça Orgânica

### NashPanel — Tooltips e clareza
- InfoTooltip via ReactDOM.createPortal (escapa backdrop-filter/overflow)
- Tooltips nos 3 cabeçalhos: "Freq. GTO Base", "Com ICM ±margem", "Δ p.p."
- Bet S e Bet L: renomeados de "/s" e "/l", tooltips explicando sizing vs frequência
- Unidade no input: "%" → "% freq" (evita confusão sizing vs frequência)
- Coluna renomeada: "GTO Base" → "Freq. GTO Base"
- Tooltip Δ p.p.: "1 p.p. = 1% de frequência; Δ = −15: ação encolhe 15%, combos mais fracos saem primeiro"
- ActionRow: aceita prop `labelTooltip?: string` para InfoTooltip no label

### MasterSimulator — Header
- Subtítulo de propósito adicionado abaixo do h1 "Motor ICM"

## Em implementação (agente em background — a4aa7f010168067f4)

### Feature: Flop / Turn / River simultâneos
**Objetivo**: Usuário vê ICM distortion por street simultaneamente, com inputs separados por street.

**Arquitetura**:
- `types.ts`: `Street`, `StreetChipEvFreqs` adicionados; `Scenario.defaultChipEvFreqs` → `defaultStreetFreqs: StreetChipEvFreqs`
- `scenarios.ts`: Cada cenário ganha `defaultStreetFreqs: { flop, turn, river }` (flop = valores atuais)
- `MasterSimulator.tsx`: estado `streetFreqs: StreetChipEvFreqs`, 3 nash results via `solveNash` direto, street RPs escalonados via sprData
- `NashPanel.tsx`: tabs FLOP/TURN/RIVER com `activeStreet` state, action rows dinâmicas

**Fórmula RP por street**:
```
scale = sprData[street].rpValue / sprData['PRE'].rpValue
ipRp_street = scenario.ipRp * scale
oopRp_street = scenario.oopRp * scale
```

**Defaults por cenário** (turn/river — flop = valores atuais):
| Cenário | Turn IP | Turn OOP | River IP | River OOP |
|---|---|---|---|---|
| paradoxo | 20/45/35 | 55/35/10 | 35/10/55 | 65/28/7 |
| pacto | 25/35/40 | 55/33/12 | 20/10/70 | 65/28/7 |
| batata | 0/0/100 | 42/58/0 | 0/0/100 | 45/55/0 |
| agonia | 15/20/65 | 60/33/7 | 10/5/85 | 72/22/6 |
| lama | 35/30/35 | 55/35/10 | 30/10/60 | 65/28/7 |
| chipev | 35/30/35 | 55/35/10 | 30/10/60 | 65/28/7 |
| sniper | 5/20/75 | 55/38/7 | 5/5/90 | 65/28/7 |
| bully | 10/20/70 | 55/38/7 | 10/5/85 | 65/28/7 |
| ameaca | 20/30/50 | 55/35/10 | 15/10/75 | 65/28/7 |

## Estado técnico
- TypeScript: 0 erros
- Agente em background pode ter concluído — verificar com `npx tsc --noEmit`

## PENDENTES
- Verificar se agente concluiu os 4 arquivos (types, scenarios, MasterSimulator, NashPanel)
- Se não: concluir manualmente seguindo a spec acima
- Commit desta sessão
- Validação visual: tabs FLOP/TURN/RIVER funcionando, RP decresce progressivamente
- Teste: cenário chipev (RP=0) deve mostrar 0 distorção em todas as streets
