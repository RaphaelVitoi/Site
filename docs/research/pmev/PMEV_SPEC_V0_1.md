---
id: research-pmev-spec-v0-1
tipo: especificacao
escopo: Site
autor: "Raphael Vitoi; Codex [Tier 1.B]"
criado_em: 2026-09-01T01:40-03:00
classes: [interno]
caminhos:
  - engine/pmev_spec.py
  - engine/pmev_late_registration.py
  - tests/test_pmev_spec.py
verificado:
  - contrato de estado, recuperacao ICMev e identidade H9 cobertos por testes unitarios locais, incluindo valores nao finitos, cardinalidade de payouts e preservacao proporcional da estrutura H9
nao_verificado:
  - validacao empirica, exportacao de solver, hand history e adaptador de runtime permanecem fora deste contrato minimo
---

# PMev Spec v0.1 — Contrato Minimo Reproduzivel

## Objetivo

Este documento fixa uma fronteira de pesquisa, nao uma declaracao de
superioridade empirica. O contrato permite que qualquer extensao PMev seja
comparada a um estado ICMev/Malmuth-Harville explicitamente recuperavel, antes
de receber interpretacao estrategica ou pedagogica.

## Baseline recuperavel

`engine.pmev_spec.PMevConfiguration` recupera o baseline somente quando:

1. o tier e `PMev-0`; e
2. recompensas dinamicas, transicoes estocasticas, crencas e opcionalidade
   estao desligadas.

`TournamentState` exige valores finitos, massa de stacks positiva, prize pool
positivo e uma quantidade de payouts que nao exceda os jogadores ativos. Ele
captura suas sequencias em tuplas imutaveis. Nao contem habilidade, ranges,
rake, bounties, historico de maos nem utilidade de carreira: cada extensao deve
declarar sua entrada e operador para que uma comparacao nao esconda dupla
contagem.

## Unidades

Stacks sao unidades de ficha; payouts sao uma unica unidade monetaria coerente
dentro do mesmo cenario. Em MTT, a referencia monetaria deste contrato e
ICMev/Malmuth-Harville. Comparacoes com ChipEV so podem ser apresentadas como
limite didatico, nunca como a linha-base universal da mesa final.

## H9 — Late registration

`engine.pmev_late_registration` mede a identidade contabil:

\[
\sum_i \Delta ICMev_i + (ICMev_{entrant} - contribuicao\_liquida) = 0.
\]

O benchmark rejeita rake, overlay, bounty, mystery bounty, novos lugares pagos,
reajuste livre de payout ou qualquer mudanca de massa monetaria. No caso-base,
o aporte liquido escala proporcionalmente cada payout preexistente: conservar
somente a soma sem preservar essa estrutura e uma intervencao distinta, nao uma
late registration neutra. Logo, ele nao estima ROI, habilidade, field futuro ou
justica normativa de late registration; ele apenas garante que o caso-base nao
perde valor contabil no caminho.

## Proximos contratos

- transicoes de blinds e payjumps com estado temporal observavel;
- importacao de arvores e ranges de solver com hash de origem;
- cenario multiway e pos-flop com pot, SPR e ranges declarados;
- testes de falsificacao antes de qualquer calibracao quantitativa;
- adaptadores de runtime, somente depois que os contratos de pesquisa forem
  consumidos por um ponto de integracao identificado.

## Verificacao

Os contratos executaveis e seus testes vivem em:

- `engine/pmev_spec.py` e `tests/test_pmev_spec.py`;
- `engine/pmev_late_registration.py` e `tests/test_pmev_spec.py`.
