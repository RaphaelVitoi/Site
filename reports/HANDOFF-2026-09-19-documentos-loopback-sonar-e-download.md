---
id: handoff-2026-09-19-documentos-loopback-sonar-e-download
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Codex GPT-5.6 Sol [Tier 1] -- sessao 01a0ba03-5e1a-7cb2-8127-1356fe6e105a"
criado_em: '2026-09-19T12:20:00-03:00'
atualizado_em: '2026-09-19T12:20:00-03:00'
classes: [interno, medido, continuidade, frontend, backend, qualidade]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  so: Windows
  navegador: 'Chrome Dev 156.0.8063.3, perfil User Data - SOTA, CDP 9222'
  modelo_condutor: gpt-5.6-sol
  veiculo_condutor: codex
  supervisao: assistida
  commit_alvo: proximo commit em origin/master
caminhos:
  - agents/execution.py
  - api/v1/handlers.py
  - api/v1/middleware.py
  - engine/dream_replay_simulator.py
  - engine/timesfm_engine.py
  - frontend/next.config.js
  - frontend/src/app/api/vitoi/files/view/route.ts
  - frontend/src/components/files/UniversalDocumentViewer.test.tsx
  - frontend/src/components/files/UniversalDocumentViewer.tsx
  - frontend/src/proxy.ts
  - frontend/src/styles/fontawesome/fa-regular-400.woff2
  - frontend/src/styles/fontawesome/fa-solid-900.woff2
  - frontend/src/styles/fontawesome/fontawesome-subset.css
  - frontend/src/styles/fontawesome/manifest.json
  - frontend/src/tests/api/operatorProxy.test.ts
  - tests/test_backend_hardening.py
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/REGISTRO-2026-09-19-loopback-e-visualizador-pdf-chrome.md
  - reports/HANDOFF-2026-09-19-documentos-loopback-sonar-e-download.md
revisoes_de_ancora: []
verificado:
  - feedback 9.8 registrado literalmente no sequence 79 do ledger
  - cadeia do ledger valida com 80 registros e tail fa7eec6abd6b3748cb9d494cf31ac69a0915d00f889f7f3b106b5bbf55870d51
  - Chrome real exibiu PDF incorporado e baixou o arquivo com o nome original
  - respostas PDF e Markdown distinguiram inline de attachment
  - suite frontend global aprovou 96 suites e 666 testes
  - suite Python global aprovou 1603 testes, com 1 pulado e zero warnings
  - bateria dirigida dos consumidores Python aprovou 127 testes e zero warnings
  - Ruff, Pyright, ESLint e TypeScript aprovaram sem deteccoes
nao_verificado:
  - CI remoto do commit alvo
  - Stands AdBlocker nao expoe pagina interna controlavel pelo CDP
---

# HANDOFF — documentos, loopback, download e saneamento Sonar

**Feedback do Tier 0:** `9.8/10` — “Excelente sessão. tiro 0.2 porque, por
mais que tenha achado eficiente, foi burocrático. Faltou proatividade e
sugestões de evolução.”

## Estado entregue

| Superfície | Resultado medido |
| :--- | :--- |
| Central de documentos | Backend alcançável, busca e listagem operacionais |
| Visualizador PDF | PDF nativo renderizado no Chrome Dev, com páginas e miniaturas |
| Download | `Content-Disposition` compartilhado e nome original preservado |
| Segurança local | Exceções limitadas a `localhost`, `127.0.0.1` e `::1`, em porta válida |
| Segurança externa | Lookalikes, userinfo, caminhos e origens web externas continuam recusados |
| Qualidade Python | Complexidade e literais Sonar corrigidos nos identificadores solicitados |
| FontAwesome | Subset e manifesto regenerados pelo gerador canônico após drift detectado |

O UUID observado anteriormente não era produzido pelo endpoint: vinha do modo
CDP `allowAndName`. No fluxo normal do navegador, o download passou a receber
`attachment`, `filename` e `filename*` e foi salvo como
`test_tratado_didatico_pmev.pdf`.

## Decisões preservadas

- A abertura de CORS não é global: somente hosts loopback analisados por URL,
  com esquema HTTP/HTTPS e porta válida, entram na exceção.
- O relaxamento de COEP é restrito à página autenticada de documentos e ao
  endpoint autenticado de visualização; o restante do site mantém o cabeçalho
  padrão.
- A CSP aceita frames internos necessários ao visualizador nativo, sem liberar
  frames web arbitrários.
- As refatorações Sonar extraem decisões internas, preservando assinaturas,
  retornos públicos e comportamento file-backed versus `:memory:`.

## Próxima evolução — ordenada por impacto sobre raio

| Prioridade | Evolução sugerida | Valor | Raio |
| ---: | :--- | :--- | :--- |
| 1 | Smoke hermético de nome de download para PDF, Markdown e imagem | Impede retorno de UUID ou extensão perdida em todos os tipos | Uma suíte da rota compartilhada |
| 2 | Matriz E2E do visualizador para PDF, texto, imagem, áudio e arquivo não visualizável | Valida globalmente o contrato comum, não apenas a área dev | Uma suíte browser autenticada |
| 3 | Sentinela explícita para distinguir falha do backend, bloqueio CSP/COEP e bloqueio de extensão | Reduz diagnóstico manual e evita culpar adblock sem evidência | Telemetria local da página de documentos |
| 4 | Comando único de fechamento que encadeie teste dirigido, suíte verde e resumo do gate | Reduz a burocracia percebida sem remover verificação | Orquestração em `scripts/ops`, sem alterar os gates |

As quatro são recomendações; nenhuma foi implementada nesta entrega. A primeira
é a próxima alteração de maior retorno e menor raio.

## Como tornar a próxima sessão menos burocrática

Aplicar três checkpoints visíveis: **causa confirmada**, **correção validada** e
**publicação confirmada**. Testes dirigidos ficam no primeiro ciclo; a suíte
global roda uma única vez sobre a árvore final e o marcador de
`suite_verde.py` reaproveita exatamente esse conteúdo no pre-push. O rigor é
mantido, mas a repetição e a narração intermediária diminuem.

## Continuidade

Não há correção funcional pendente desta frente. O único limite externo é que
CI remoto ainda não constitui evidência até executar sobre o SHA publicado.
Políticas corporativas do Registro e a página interna do Stands AdBlocker não
foram usadas como prova; a correção do produto independe delas.
