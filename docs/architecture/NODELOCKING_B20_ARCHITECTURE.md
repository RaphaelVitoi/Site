# Arquitetura SOTA: Nodelocking Dinâmico (Block Bet 20%)

> **Guardião:** @architect & @validador
> **Escopo:** Integração de constraints de Solver (Nodelock) no Motor de Perspectiva Matemática.
> **Foco:** Block Bet de 20% do pote (B20).

## 1. O Princípio Teórico (Axioma do Nodelock B20)

O Block Bet de 20% (B20) atua como uma ferramenta termodinâmica de **Negação de Equidade Barata** e **Controle de SPR**.
Sob a ótica da Perspectiva Matemática (PM):

- **Agressor (IP/OOP):** Limita a diluição do SPR (SPR Decay), extraindo valor marginal sem inflacionar as Reverse Implied Odds (RIO). O B20 paralisa o *Downward Drift* de cenários inflacionados e permite ver o river a um custo ditado por você.
- **Defensor:** É forçado a responder polarizando o range (Raise-or-Fold) ou sofrendo de passividade crônica (Call de mãos marginais que não realizam equity).

## 2. Topologia do Motor Quântico (`useQuantumEngine`)

O motor atual será expandido para aceitar vetores de constraint diretos:

```typescript
interface NodelockConstraint {
  type: 'block_bet' | 'overbet' | 'check_100';
  sizePct: number; // ex: 0.20 para B20
  freqOverride: number; // ex: 1.0 para Nodelock absoluto
}
```

A injeção do Nodelock B20 causará as seguintes distorções forçadas no cálculo de Nash:

1. **`ip_bet_small` / `oop_bet_small`**: Saltará para 100% no nó escolhido.
2. **Entrapment Ratio**: Aumentará marginalmente (20%), evitando a Death Zone.
3. **Fator de Realização (R)**: O agressor receberá um bônus multiplicador (`R += 0.15`), pois o controle da ação garante realização limpa.

## 3. Modificação no `PerspectivePanel.tsx`

Criaremos uma alavanca na UI: **Tática de Ancoragem (Nodelock)**.

- Um botão Toggle: `[Ativar Block Bet (20%)]`.
- Quando ativo, a UI reage termodinamicamente:
  - O **Pot Size** da próxima street cresce apenas 40% (20% hero + 20% call do vilão) em vez da progressão geométrica pesada.
  - O **EV_Fold** será ancorado com o custo mitigado.
  - A **Esperança Matemática (Lógica)** receberá um *boost* de +EV devido à extração passiva induzida.

## 4. Integração Bayesiana (Axioma Lipe Piv)

Se a Credibilidade ($\kappa$) for baixa (vilão muito maníaco/aleatório), o Nodelock B20 perde força porque o vilão pode transformar o Block Bet num alvo de *Spazz Raise* induzido.

**Fórmula de Mitigação SOTA:**

```typescript
const b20Effectiveness = baseB20Ev * Math.min(1, kappa + 0.3);
// Se o vilão é caótico (kappa < 0.3), o EV do B20 é severamente punido na Métrica Soberana (PM).
```

## 5. Próximos Passos

1. **`engine/types.ts`**: Adicionar a tipagem de Nodelock.
2. **`useQuantumEngine.tsx`**: Injetar o redutor de SPR quando o Nodelock B20 estiver true.
3. **`PmLensPanel.tsx`**: Adicionar o checkbox visual de B20 e expor o ganho realçado no painel da LAYER 4 (PM).

---

## 6. Emenda de restauração — 2026-09-08

Este documento foi apagado em `a22df57e` (2026-09-01, fusão `.cerebro` → `.claude`),
junto com nove outros de `.claude/RELATORIOS/`. Os outros nove eram redundância,
obsolescência ou lixo — inclusive um `SUPERSEDED.md` que declarava a própria pasta
legada. **Este não era**, e a deleção o levou por proximidade, não por mérito.

Restaurado aqui por decisão do Tier 0, em `docs/architecture/` conforme a §9 do
`CLAUDE.md` deste projeto: não é registro situado no tempo, é arquitetura viva.

### O que foi medido antes de restaurar

A espec deixou de ser projeto: **está implementada**, e a §5 acima já não descreve
"próximos passos".

| Item da espec | Estado medido |
| :--- | :--- |
| `NodelockConstraint` (§2) | **implementado**, idêntico — `solver/types.ts` |
| Progressão de pote a 40% (§3) | **implementado** — `usePmLensCalculations.ts` |
| `R += 0.15` (§3) | **implementado**, literal |
| Alavanca "Tática de Ancoragem" (§3) | **implementada** — `PmLensPanel.tsx:544` |
| *Entrapment ratio* +20% (§3) | **não implementado** como efeito do nodelock |
| `b20Effectiveness` por κ (§4) | **não implementado** — `kappa` existe, o acoplamento não |

Os dois últimos são divergência entre documento e código. Ficam declarados, não
corrigidos: qual dos dois lados está certo é decisão de produto, e nada nesta
sessão a autoriza.

### Por que ele importa agora

O contraste ICMev × ChipEV executado em 2026-09-08 chegou por evidência ao
comportamento que este documento previu por teoria em março: sizing muito baixa
em alta frequência é a arma do lado de menor Risk Premium, e nenhum dos dois lados
quer inflar o pote. O B20 é a formalização disso.

