---
name: Prompt de Continuidade V22
description: Estado sessão 20260322 (continuação V21). Referencial visual Aula 1.2 implementado. Nota metodológica no rodapé do simulador. Posição final do referencial definida.
type: project
---

# V22 — 2026-03-22

## Concluído nesta sessão (pós V21)

### Nota metodológica no rodapé do MasterSimulator
- Parágrafo discreto explicando que os valores são estimativas derivadas de um ponto empírico único
- Texto: "Os valores de Risk Premium e as frequências padrão são estimativas derivadas de um framework teórico calibrado contra um único ponto empírico: 93 nodes HRC vs GTO Wizard (board KJT-2-3, Aula 1.2). Demais cenários são extrapolações didáticas — não outputs de solver."

### ReferencialAula12.tsx — componente visual completo
- Criado em `frontend/src/components/simulator/ReferencialAula12.tsx`
- Seção colapsável `<details>/<summary>` com identidade visual do site
- Conteúdo:
  - **Board cards** K♦ J♣ T♠ 2♦ 3♦ (styled divs com bordas coloridas por naipe)
  - **Risk Premium** barras BTN 21.4% (índigo) vs BB 12.9% (esmeralda) + Risk Advantage +8.5%
  - **Ranges pré-flop** sumário BTN 33.6% / BB 82.9%
  - **Table Draw** SVG oval 9-handed com players posicionados angularmente
  - **Prize Structure** barras horizontais com gradiente (9 prêmios exatos)
  - **BTN Range Grid** 13×13 dados exatos da imagem (índigo por frequência)
  - **BB Range Grid** 13×13 aproximado 82.9% defesa (esmeralda)
  - **Bubble Factor Matrix** 9×9 escala de cor (vermelho > 2.0, âmbar 1.6–2.0, amarelo 1.3–1.6, verde < 1.3)
  - **Toy Games** tabela teórica TG0–TG7★

### Posição final na página /tools/simulador
Ordem definitiva:
1. Header: "Geometria do Risco" (h1 + label)
2. Blocos explicativos (dor / o que resolve / como usar)
3. `<ReferencialAula12 />` (colapsável)
4. `<SimuladorICM />` (Motor ICM)

### Dados do cenário âncora (das imagens reais da Aula 1.2)
- MTT $11 · 126 entradas · Final Table 9 players
- Board: K♦ J♣ T♠ 2♦ 3♦
- Stacks: UTG 9.25 · EP 52.24 · MP1 22.08 · MP2 6.88 · HJ 44.16 · CO 24.16 · BU 39.88 · SB 12.73 · BB 53.88 (bb)
- RP BTN 21.4% · RP BB 12.9% · Risk Advantage BTN +8.5%
- BTN abre 33.6% (fold 66.4%)
- BB: fold 17.1% · call 64.4% · 3bet 5.5bb 3.7% · 3bet 8bb 6.5% · shove 8.4%
- Prêmios: 237.34 / 170.96 / 135.17 / 109.99 / 90.28 / 73.95 / 59.92 / 47.56 / 36.47

## Estado técnico
- TypeScript: 0 erros
- Dev server ativo em localhost:3000

## PENDENTES
- Validação visual: abrir localhost:3000/tools/simulador e verificar posição do referencial
- Verificar se range grids renderizam corretamente em largura
- Commit desta sessão
