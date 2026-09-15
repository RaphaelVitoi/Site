---
id: registro-2026-09-14-benchmark-icm-chipev-em-hand-history-e-next-env
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-14T22:45:00-03:00'
atualizado_em: '2026-09-14T22:45:00-03:00'
classes: [interno, medido, pmev, benchmark, ci]
session_id: 2e4e2bd0-7571-49e4-bd33-1a04752a1609
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  next: '16.3.5'
  bootstrap: 2000 reamostragens por torneio, semente 20260914
  congelada_em: '2026-09-14'
caminhos:
  - engine/pmev_hh_benchmark.py
  - tests/test_pmev_hh_benchmark.py
  - .gitignore
  - .github/workflows/sota-ci.yml
  - frontend/next-env.d.ts
verificado:
  - o lugar final vem da propria hand history (finished the tournament in / wins the tournament); 216 de 216 jogadores com lugar nas duas fontes concordam com os resumos canonicos
  - STT 9 -- 8807 estados em 186 torneios; ICM melhor que uniforme em Brier de lugar (-0.0338, IC95 -0.0451 a -0.0227), log-loss (-0.0784, IC95 -0.1060 a -0.0490) e Brier ITM (-0.0177, IC95 -0.0273 a -0.0086); erro quadratico do premio ICM 203.9 contra ChipEV 218.8 (dif -14.9, IC95 -21.0 a -8.7)
  - SNG 45, so mesa final -- 4407 estados em 93 torneios; Brier de lugar -0.0608 (IC95 -0.0900 a -0.0325), log-loss -0.1497 (IC95 -0.2202 a -0.0824), Brier ITM -0.0097 (IC95 -0.0196 a -0.0013); premio ICM 9.55 contra ChipEV 15.68 (dif -6.14, IC95 -8.51 a -3.88)
  - Spin 3-max, controle -- ICM e ChipEV tem erro de premio identico em 2119 e 126 estados; contra o uniforme os intervalos cruzam zero
  - intervalo por bootstrap de torneio, nao de mao; nenhum parametro ajustado, avaliacao fora da amostra por construcao
  - next-env.d.ts saiu do indice e entrou no .gitignore; npm exec --workspace frontend -- next typegen o regenera identico ao versionado, e npm run typecheck passa em seguida
  - 17 testes sinteticos de canon e benchmark verdes; ruff e pyright sem achados
nao_verificado:
  - o passo de typegen no CI remoto -- so e medido no push
  - vies de selecao do heroi -- o estado e o da mesa do dono da mao, e o dono nao e um jogador aleatorio do field
  - estados sucessivos da mesma mao nao sao independentes dentro do torneio; o bootstrap por torneio trata a correlacao entre torneios, nao a estrutura dentro dele
  - qualquer operador PMev (f1 a f5) contra o ICM -- este registro mede so os baselines
  - o gerador de estados coerentes continua sem consumidor fora dos testes; o benchmark usa estados reais porque estado gerado nao tem resultado observado
---

# Benchmark ICM × ChipEV em hand history, e `next-env.d.ts` fora do índice

Os dois itens aprovados pelo Tier 0 ao fim da sessão.

## Resultado observado sem resumo

O resumo do PokerTracker 4 não era necessário para saber o resultado. A PokerStars grava
na própria mão em que o jogador sai `finished the tournament in Nth place`, e
`wins the tournament` para o campeão. O lugar final do dono das mãos é, portanto,
observado nos 191 torneios da família STT 9, e não só nos 9 canônicos. Conferido: os 216
jogadores que têm lugar nas duas fontes batem 216 vezes.

## O que o dado diz

| Família | Estados | ICM × uniforme (Brier de lugar) | ICM × ChipEV (erro² do prêmio) |
| :--- | ---: | :--- | :--- |
| STT 9 | 8.807 | **−0,034** [−0,045; −0,023] | **203,9 × 218,8** [−21,0; −8,7] |
| SNG 45, mesa final | 4.407 | **−0,061** [−0,090; −0,033] | **9,55 × 15,68** [−8,51; −3,88] |
| Spin 3-max (controle) | 2.245 | cruza zero | idêntico por construção |

O ICM supera as duas referências nas famílias com prêmio escalonado, com intervalo que
não cruza zero. No Spin, prêmio único torna ICM e ChipEV a mesma função, e o benchmark
reproduz isso exatamente. É a prova de que a métrica não fabrica diferença onde não há.

**O que isto é:** a primeira linha de base empírica do item 9. Qualquer operador PMev que
vier depois precisa bater o ICM nesta mesma amostra, com a mesma métrica e o mesmo
bootstrap.

**O que isto não é:** evidência sobre a PMev. Nenhum operador f1 a f5 foi avaliado.

## `next-env.d.ts`

O arquivo é gerado pelo Next, e o conteúdo muda conforme o comando que o gerou
(`.next/dev/types` no `dev`, `.next/types` no `build` e no `typegen`). Versionado, ele
alternava sozinho. Saiu do índice e entrou no `.gitignore`. Como o CI roda o `typecheck`
antes do `build`, ganhou o passo `next typegen`. Localmente, a mesma sequência passa.
