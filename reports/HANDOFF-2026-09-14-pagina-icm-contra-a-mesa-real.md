---
id: handoff-2026-09-14-pagina-icm-contra-a-mesa-real
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-14T22:40:00-03:00'
atualizado_em: '2026-09-14T22:40:00-03:00'
classes: [interno, medido, handoff, pmev, frontend]
session_id: 2e4e2bd0-7571-49e4-bd33-1a04752a1609
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  next: '16.3.5'
  session_started_at: '2026-09-14T23:04:26Z'
  digest_amostra: b4e4f8ef6093
  congelada_em: '2026-09-14'
caminhos:
  - engine/pmev_benchmark_publico.py
  - scripts/validation/exportar_benchmark_icm_publico.py
  - tests/test_pmev_benchmark_publico.py
  - data/pmev_benchmark_icm_chipev.v1.json
  - frontend/src/lib/pmevBenchmark.ts
  - frontend/src/components/pmev/benchmark/RealTableLab.tsx
  - frontend/src/components/pmev/benchmark/ForestPlot.tsx
  - frontend/src/components/pmev/benchmark/BinnedCurveChart.tsx
  - frontend/src/components/pmev/benchmark/benchmark.module.css
  - frontend/src/app/(public)/biblioteca/icm-contra-a-mesa-real/page.tsx
  - frontend/src/app/(public)/biblioteca/page.tsx
  - frontend/src/constants/routes.ts
  - frontend/src/tests/library/pmevBenchmark.test.ts
  - frontend/src/tests/library/RealTableLab.test.tsx
  - engine/gemma_server.py
revisoes_de_ancora:
  - registro: registro-2026-08-29-tres-orfaos
    caminhos: [engine/gemma_server.py]
    parecer: >-
      O registro decide o veredito de _MODEL_31B, a constante ligada a MODEL_ID. A alteracao
      de hoje, do Tier 0, troca so a origem de TypedDict para typing_extensions; MODEL_ID,
      _MODEL_31B e a leitura de SOTA_LOCAL_MODEL ficam como o registro os deixou. O modulo
      importa e o ruff nao acusa nada.
verificado:
  - artefato publico deterministico -- 15459 estados em 4 estruturas, 64 KB, digest b4e4f8ef6093 identico nas duas geracoes
  - privacidade -- sem nome, id de torneio ou id de mao; teste Python e teste Jest reprovam se voltarem
  - paridade -- o ICM publicado pelo Python confere com calculateMalmuthHarville do TypeScript a 1e-9 em todas as mesas amostradas
  - contrato TS recusa schema desconhecido, ic95 invertido e heroi fora da mesa
  - 23 pytest de canon, benchmark e artefato; 19 jest de artefato, laboratorio e registro editorial; ruff, pyright, eslint e tsc audit sem achados
  - npm run build gera a rota como estatica entre 62 paginas
  - Playwright em 1366 e 390 px -- sem rolagem horizontal, zero erro e zero aviso no console, desfecho revelado so apos o clique
  - engine/gemma_server.py (alteracao do Tier 0, TypedDict de typing_extensions) importa, ruff sem achados
nao_verificado:
  - Lighthouse e CWV desta rota -- o portao de commit mede o site, nao esta pagina isoladamente
  - leitor de tela real; so a arvore de acessibilidade do Playwright e as tabelas equivalentes
  - o navegador que o Playwright usou abriu sozinho uma aba de login do Google, sinal de perfil pessoal do Chrome; nao houve interacao com ela e o perfil nao foi auditado
  - feedback do Tier 0 deste trecho da sessao -- a nota 9.5 ja registrada (sequencia 72) cobre o handoff anterior
---

# Handoff — a página "O ICM contra a mesa real"

Sessão `2e4e2bd0-7571-49e4-bd33-1a04752a1609`, Claude Opus 5 no Claude Code, assistida
pelo Tier 0. Continua o `handoff-2026-09-14-estruturas-canonicas-e-estados-coerentes-de-hh`
e o registro do benchmark ICM × ChipEV.

## O que foi pedido

Levar o recorte do benchmark ao site de forma didática, e construir a arquitetura que
entregue os dados tratados como molde para os próximos recortes.

## O molde

| Etapa | Onde | Contrato |
| :--- | :--- | :--- |
| Estado coerente | `engine/pmev_hh_canon.py` | só mesa com todas as fichas do torneio |
| Desfecho e métrica | `engine/pmev_hh_benchmark.py` | lugar lido da HH, bootstrap por torneio |
| Recorte público | `engine/pmev_benchmark_publico.py` | agregado, sem identificador, determinístico |
| Exportação | `scripts/validation/exportar_benchmark_icm_publico.py` | mãos locais, saída em `data/` |
| Contrato no site | `frontend/src/lib/pmevBenchmark.ts` | validação na carga e paridade com o kernel TS |
| Página | `/biblioteca/icm-contra-a-mesa-real` | nenhum número digitado à mão |

Próximo recorte: um novo módulo de agregado público e um novo contrato TS. As etapas 1, 2
e a forma de validar são reaproveitadas.

## Decisões de desenho

- Três cores com significado fixo: verde para ICM, dourado para fichas e branco para o
  desfecho. Prosa em EB Garamond, dados em Inter com algarismos tabulares.
- O laboratório esconde o desfecho até o clique. Primeiro a previsão, depois a realidade:
  é a lição de que uma mesa sozinha não prova nada.
- Gráficos em SVG servidos pelo servidor, cada um com tabela equivalente para leitor de
  tela. Faixa de calibração com menos de 30 estados não é desenhada, e a legenda declara
  quantos estados ficaram fora.
- Uma escala por métrica no gráfico de floresta, porque Brier, log-loss e US$² não se
  comparam.

## Alteração do Tier 0 incluída

`engine/gemma_server.py` passa a importar `TypedDict` de `typing_extensions`. A alteração é
do Tier 0, feita ao abrir o servidor, e entra neste commit com ele como coautor.
`typing_extensions` hoje só chega como dependência transitiva (está no `uv.lock`, não no
`pyproject.toml`). O import funciona, mas depende de um pacote que o projeto não declara.

## Prompt de continuação

> Retome a PMev no `Site`. A página `/biblioteca/icm-contra-a-mesa-real` mostra a linha de
> base empírica ICM × ChipEV. O próximo passo é o primeiro operador PMev medido contra ela,
> na mesma amostra (digest `b4e4f8ef6093`) e com as mesmas métricas. Os dados de mão são
> locais; para regenerar o artefato, rode o exportador apontando para eles.
