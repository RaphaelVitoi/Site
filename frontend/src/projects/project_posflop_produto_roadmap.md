---
name: Pós-Flop como Destino Final do Produto
description: O pós-flop ICM é a cereja do bolo do produto. Todas as derivações matemáticas (EV_fold, RIO, Ci, Er(S), EV_fold dinâmico) devem eventualmente ser transpostas para o contexto pós-flop, que é onde o framework diferencia o produto de qualquer solver.
type: project
---

# Pós-Flop como Destino Final do Produto

## Objetivo Estratégico

O pós-flop ICM é o destino final do produto — onde o framework Perspectiva entrega edge real que solvers não articulam. Todo trabalho matemático de validação deve ser conduzido com o pós-flop em mente como extensão natural.

**Why:** Pre-flop ICM está razoavelmente coberto pelos solvers (HRC, push/fold charts). O gap inexplorado está no pós-flop: como cada street muda o EV_fold, como o RIO se comporta conforme o pot cresce, como a pressão ICM distorce frequências de bet/check/raise em cada street. É aí que o framework Perspectiva tem vantagem competitiva máxima.

**How to apply:** Ao derivar qualquer fórmula matemática, verificar se há uma versão pós-flop natural. Se sim, registrar a extensão mesmo que a implementação seja futura.

---

## Mapeamento Pre-flop → Pós-flop por conceito

### EV_fold

- **Pre-flop:** EV_fold = −antes (constante por hand)
- **Pós-flop:** EV_fold = −investido nas streets anteriores (cresce a cada street). No river, EV_fold é o pot total investido — decisão binária pura.
- **Implicação:** Foldar no river é mais caro em chipEV mas o RP pode justificar por ICM. HRC pós-flop confirma essa tendência.

### RIO multiway

- **Pre-flop:** crescimento N² no dano esperado
- **Pós-flop:** RIO se amplifica com cada street jogada — pot entrapment. Jogador que entra no flop com pot odds "boas" fica aprisionado no turn/river por RIO crescente.

### Fator R (Realização de Equidade)

- **Pre-flop:** R depende de N oponentes e posição (HU ≈ 1.0, multiway cai)
- **Pós-flop:** R varia por street e textura. IP tem R maior que OOP. Nut advantage muda R. Já implementado no motor — base para extensão pós-flop.

### RP / Bubble Factor

- **Pre-flop:** calculado sobre all-in ou stack completa
- **Pós-flop:** RP se dilui conforme fichas entram no pot (rpDeriver já captura isso parcialmente). Cada BB no pot reduz RP residual mas aumenta valuation compensatório.

### Downward Drift

- **Pré-flop:** contexto de sizing
- **Pós-flop:** o mecanismo central. Apostas grandes migram para apostas menores que migram para checks. Já documentado no produto — mas a quantificação via k_A e bExponent precisa de integração com o motor pós-flop.

---

## Estado atual do rpDeriver

`rpDeriver.ts` já calcula RP diluído por street via Bubble Factor. É a ponte atual entre pre-flop ICM e pós-flop. Extensões naturais:

- RP dinâmico por street (flop/turn/river)
- Integração com Fator R por textura
- EV_fold dinâmico por street (não apenas threshold estático)

---

## Prioridade no roadmap

1. Fechar validação matemática pre-flop (em curso)

2. Transpor cada derivação para versão pós-flop (documento de extensão)
3. Implementar motor pós-flop usando rpDeriver como base
4. Integrar no MasterSimulator como modo "pós-flop"
