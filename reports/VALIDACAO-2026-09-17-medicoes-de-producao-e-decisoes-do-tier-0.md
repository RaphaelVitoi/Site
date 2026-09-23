---
id: validacao-2026-09-17-medicoes-de-producao-e-decisoes-do-tier-0
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T19:30:00-03:00'
atualizado_em: '2026-09-23T07:09:13-03:00'
classes: [interno, medido, frontend]
referencias_nao_resolviveis:
  - frontend/src/components/simulator/ui/SimulatorTour.tsx
caminhos:
  - reports/VALIDACAO-2026-09-17-medicoes-de-producao-e-decisoes-do-tier-0.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 69c37f7d
  host: Windows 11 Pro 10.0.26200, next build de producao servido pelo server.js standalone em :3100, copia do standalone sem .env para reproduzir a imagem Docker, Chrome via DevTools em contexto isolado, Chromium do Playwright
  auth_js: next-auth 5.0.0-beta.32
  data_das_medicoes: 2026-09-17
verificado:
  - imagem Docker reproduzida (server.js standalone, NODE_ENV=production, sem .env) -- /api/auth/session, /api/auth/providers e /api/auth/csrf respondem 500 UntrustedHost
  - contraprova de host -- com NEXTAUTH_URL a sessao ainda responde 500; com AUTH_URL responde 200 com corpo null
  - home em producao -- LCP 217 ms, CLS 0,00, TTFB 6 ms, sem limitacao de CPU ou rede
  - simulador em producao -- LCP 1.912 ms na primeira visita, dos quais o elemento e o texto do tour, exibido por setTimeout de 1.500 ms; na visita de retorno LCP 141 ms e CLS 0,00
  - simulador parado por 5 s -- 0 tarefas longas, heap de 11 MB, 24 arquivos JS com 1.435 KB decodificados
  - home em producao -- 17 arquivos JS, 259 KB transferidos e 836 KB decodificados
  - Lighthouse de producao -- home em desktop e mobile, e simulador em desktop, com 100 em acessibilidade, boas praticas, SEO e navegacao agentica e 0 auditorias reprovadas
  - GET /api/auth/session em producao -- 2 por carregamento (4 no dev); a segunda vem da propria aba, porque getSession publica num BroadcastChannel novo e o SessionProvider escuta no compartilhado (node_modules/next-auth/react.js linhas 106 e 301)
  - contraprova do contrato de deploy -- 3 de 4 testes novos reprovam antes da correcao; o que passa e o controle de que a imagem nao confia em qualquer host
  - contraprova do rotulo do vilao -- o teste novo reprova antes da correcao
  - test_gate_reports_positive_cwv_human_review_without_turning_it_into_coverage_pass passa com o teto de 90 s, em 44,5 s isolado
  - jest integral 89 suites e 567 testes, Total de Erros 0 e Total de Warnings 0; tsc nas duas configuracoes e eslint dos arquivos tocados limpos
nao_verificado:
  - OAuth real com Google e Discord, e o formato real de verified e email_verified -- dependem de credenciais postas no ambiente pelo Tier 0
  - audio real do microfone
  - CPU com interacao no simulador e no laco CFR -- o trace cobriu carregamento e pagina parada
  - tamanho do JS antes das mudancas do simulador -- nao ha build anterior para comparar; os numeros acima sao absolutos
  - PmevRangeViewer, ReferencialAula12 e EquityCalculator seguem sem auditoria
  - imagem Docker construida de fato -- a reproducao usou o standalone local, nao docker build
  - suite Python integral -- veredito declarado na conclusao da sessao
pendencias_resolvidas:
  - pend-2026-09-17-grandeza-rp-exibida
pendencias:
  - id: pend-2026-09-17-migracao-rp-canonico
    o_que: Migrar o RP para a grandeza canonica (E*-a)/(1-a) num ato so -- portador do BF, equidade requerida, calibracao do solver, telas, ancoras da Aula 1.2, artigos e toy games -- depois de fixada a convencao em que os estudos do PioSolver foram rodados
    dono: Tier 0
    prazo: 2026-10-17
  - id: pend-2026-09-17-prospect-risk-engine-sem-consumidor
    o_que: Ligar ProspectRiskEngine de engine/vitoi_perspective_engine.py a um fluxo real de produto ou move-lo para quarentena; hoje so os testes o consomem
    dono: Tier 0
    prazo: 2026-10-17
---

# Medições de produção e decisões do Tier 0 — 2026-09-17

Continua `reports/REGISTRO-2026-09-17-preludio-decisoes-abertas-e-nao-verificados.md`, na ordem que ele propôs:
medir o que não dependia do Tier 0, trazer as decisões juntas e executá-las com teste e contraprova.

## 1. O que a produção mediu

| Medida | Home | Simulador |
| :--- | ---: | ---: |
| LCP, primeira visita | 217 ms | 1.912 ms |
| LCP, visita de retorno | — | 141 ms |
| CLS | 0,00 | 0,00 |
| JS decodificado | 836 KB | 1.435 KB |
| Lighthouse (sem desempenho) | 100 × 4 | 100 × 4 |

**Os 1,9 s do simulador não são lentidão.** O maior elemento pintado é o texto do tour de boas-vindas, que
`frontend/src/components/simulator/ui/SimulatorTour.tsx` exibe com um atraso proposital de 1.500 ms e só na
primeira visita. Com o tour marcado como visto, o LCP cai para 141 ms. Nada foi alterado: o atraso é decisão de
experiência, e o número fica registrado para não ser lido como regressão.

**A sessão é pedida duas vezes, e não por código nosso.** Em produção são 2 chamadas (as 4 do dev vêm do
StrictMode). A segunda nasce 12 ms depois da primeira, no `BroadcastChannel` do next-auth 5.0.0-beta.32: o
`getSession` publica o aviso num canal novo, e o `SessionProvider` da mesma aba escuta no canal compartilhado e
recebe o próprio aviso. Custa uma requisição por carregamento.

## 2. Achado de deploy: login quebrado na imagem Docker

A imagem define `NODE_ENV=production` e o `.dockerignore` exclui `.env`. O Auth.js v5 só confia no host com
`AUTH_URL`, `AUTH_TRUST_HOST`, `VERCEL`, `CF_PAGES` ou fora de produção. Reproduzido com o `server.js` standalone
sem `.env`:

| Ambiente | `/api/auth/session` |
| :--- | :--- |
| nenhuma variável de host | 500 `UntrustedHost` |
| `NEXTAUTH_URL`, que era o documentado | 500 `UntrustedHost` |
| `AUTH_URL` | 200 |

O `NEXTAUTH_URL` só reescreve a URL da requisição e não entra na decisão de confiança. Por decisão do Tier 0:

- `frontend/.env.example` passa a documentar `AUTH_URL`, com o motivo.
- `frontend/Dockerfile` declara que `AUTH_SECRET` e `AUTH_URL` vêm do ambiente de deploy, e por que não usar
  `AUTH_TRUST_HOST`, que confiaria em qualquer cabeçalho `Host`.
- `frontend/src/tests/security/deployAuthUrl.test.ts` fixa o contrato.

O valor do domínio real continua com o Tier 0, no ambiente. O `.env` local não foi tocado: em desenvolvimento o
host já é confiável.

## 3. Decisões e execução

| Decisão | Execução |
| :--- | :--- |
| RP exibido | Mantido `(BF-1)/BF` por ora; migração completa em pendência nova (ver abaixo) |
| Modelo de bounty do PKO | Mantido em desenvolvimento; `pend-2026-09-17-modelo-de-bounty-pko` segue aberta |
| Teto do teste do portão | 45 s → 90 s, igual aos outros dois casos do mesmo arquivo |
| Laço CFR após convergir | Mantido rodando; já pausa fora da tela e com aba oculta |
| `ProspectRiskEngine` | Pendência formal com prazo; nada removido |
| Perfil de vilão fixo | Rótulo "Perfil ilustrativo" junto ao arquétipo, gerado do mesmo objeto |
| Deploy da autenticação | `AUTH_URL` documentado (seção 2) |

**Por que o RP não mudou, apesar da primeira decisão.** O Tier 0 escolheu primeiro o RP relativo canônico, sobre
uma descrição que tratava a troca como de exibição e rótulos. A medição feita antes de editar mostrou mais:

- `calculateRequiredEquity` em `frontend/src/lib/holdemEquities.ts` reconstrói o BF por `100/(100−RP)`. O RP
  antigo é o portador do BF entre os módulos, e é por ele que a equidade exata chega certa.
- Os coeficientes de `frontend/src/components/simulator/solver/nashSolver.ts` foram calibrados nessa escala.
- Os números fixos incluem as âncoras da Aula 1.2 (BTN 21,4% contra BB 12,9%, saídas desta mesma fórmula), os
  parâmetros dos toy games do PioSolver e o texto dos artigos. No canônico, 21,4% vira cerca de 12%.

Com isso reapresentado, o Tier 0 decidiu manter a escala e migrar tudo num ato só. Uma troca parcial deixaria a
tela e o texto didático em escalas diferentes para o mesmo spot.

**O teto de 90 s já tinha precedente no mesmo arquivo.** Os dois primeiros casos rodam o mesmo portão completo com
90 s, justificados por escrito. O terceiro ficou em 45 s. Depois da mudança, ele levou 44,5 s isolado: meio segundo
abaixo do teto antigo.

## 4. Fora do escopo, registrado

Durante a sessão o Tier 0 inseriu `data/hm2/` e, a pedido, a entrada `data/hm2/cluster/` saiu do `.gitignore`. O
`.gitignore` volta a ser idêntico ao do commit. Medido só por metadados: é o diretório de dados de um PostgreSQL
8.4 (1.154 arquivos, um banco de 6,96 GB, 12 arquivos acima de 100 MB, sem `postmaster.pid`). Nada foi versionado.
A exposição num repositório público fica para avaliação do Tier 0.
