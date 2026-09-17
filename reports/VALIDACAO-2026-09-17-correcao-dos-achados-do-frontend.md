---
id: validacao-2026-09-17-correcao-dos-achados-do-frontend
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T06:10:00-03:00'
atualizado_em: '2026-09-17T06:10:00-03:00'
classes: [interno, medido, seguranca, frontend]
caminhos:
  - reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-frontend.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 3ee43c77
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, Chrome via DevTools em contexto isolado, Python do .venv do projeto
  observacao: tamanhos de script medidos no dev server, sem minificacao; producao nao medida
  data_das_medicoes: 2026-09-17
verificado:
  - jest integral depois da ultima alteracao de codigo -- 77 suites e 516 testes aprovados, sem erro nem warning
  - tsc -p tsconfig.audit.json sem erro; eslint . com saida 0
  - contraprova com git stash dos arquivos de producao -- 16 de 17 testes novos reprovam contra o codigo antigo; stash restaurado
  - contraprova do callback signIn -- sem o callback em auth.ts os 3 testes de ligacao reprovam; com ele, aprovam
  - Chrome real -- heroStack 77 sobrevive ao reload em /simulador; artigo sem mermaid baixa 0 chunk do mermaid e 8997 KB de script contra 11050 antes; /templo/analytics mostra Nenhuma decisao gravada; /dashboard/files sem sessao vai ao login e a API responde 401
  - security-review sobre o diff -- nenhum achado com confianca maior ou igual a 8; o achado de confianca 7 (e-mail Discord nao verificado) foi corrigido e ganhou teste
  - ruff limpo em api/v1/handlers.py; tests/test_db_summary_contrato.py aprovado
  - suite Python integral, primeira corrida -- 1 reprovacao, test_o_corpus_resolve_tambem_sem_o_repositorio_irmao, causada pelas citacoes curtas destes tres relatorios (hooks/..., lib/server/...) que so resolviam pela raiz multiprojeto; corrigidas para caminho a partir da raiz do repositorio, o teste passa isolado e record_gate.py aprova em seco
  - record_anchor_gate.ps1 e record_gate.py em seco sobre o indice final -- aprovados
nao_verificado:
  - bundle de producao; next build sobrescreveria o .next do dev server em uso
  - login OAuth real de ponta a ponta; o ambiente nao tem AUTH_GOOGLE_ID nem AUTH_DISCORD_ID
  - microfone real no cleanup do reconhecimento de fala (FE-08 coberto por teste com SpeechRecognition simulado)
  - erro Router action dispatched before initialization -- nao reproduziu em navegacao limpa de 6 rotas; a causa atribuida (hot reload em cascata durante stash e pop com dev server ativo) e inferencia
  - portao cwv_gate roda no commit; seu veredito e declarado na mensagem de commit, nao aqui
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - frontend/src/app/(user)/dashboard/page.tsx
    parecer: >-
      Aquele registro ancora o dashboard pela decisao de falhar alto sem relay autenticado em vez de
      produzir 401 ou telemetria ficticia. A alteracao deste commit troca apenas o mapeamento de campos
      exibidos -- budget_limit e agents_registered lidos do backend no lugar de 15 agentes e evLoss 12
      fixos -- e nenhuma linha do diff toca token, relay ou dashboard-orchestrator. A decisao ancorada
      segue valida, e a mudanca vai no mesmo sentido dela: menos numero sem fonte na tela.
pendencias_resolvidas:
  - pend-2026-09-17-login-inexistente
  - pend-2026-09-17-operador-sem-allowlist
  - pend-2026-09-17-hidratacao-apaga-estado
  - pend-2026-09-17-diagnostico-fabricado
---

# Correção dos achados da auditoria de frontend — 2026-09-17

Resolve os 16 achados de `reports/AUDITORIA-2026-09-17-frontend-padrao-ouro.md`, por delegação do
Tier 0 ("Estou delegando as decisões a você"), com a instrução de commit e push ao fim. O estado
intermediário está no prelúdio `reports/REGISTRO-2026-09-17-preludio-correcao-frontend-antes-do-compact.md`.

## Decisões tomadas por delegação

| Pendência | Decisão |
| :--- | :--- |
| `login-inexistente` (FE-01, FE-15) | Login real por Google e Discord em `frontend/src/components/auth/LoginContent.tsx`, lendo `getProviders()`. Sem provedor configurado a tela **diz isso**, em vez de oferecer botão que não leva a lugar nenhum. Sem modo convidado: convidado sem sessão real seria outra fachada. |
| `operador-sem-allowlist` (FE-04, FE-06) | `NEXUS_OPERATOR_EMAILS` em `frontend/src/lib/server/operator.ts`, **falha fechado** com lista vazia. `proxy.ts` responde 401/403 em JSON para API e redireciona página. Arquivos do operador saem de `/api/proxy?url=` para rotas nomeadas em `app/api/vitoi/files/*`, com a verificação repetida no servidor. |
| `hidratacao-apaga-estado` (FE-02, FE-14) | `useDebouncedLocalStorage` devolve `carregado`; o provider só hidrata depois dele. Valor salvo passa por `isSotaPhysicsState`, gravação pendente sai na desmontagem, quota excedida não derruba o estado. |
| `diagnostico-fabricado` (FE-03, FE-05, FE-07) | Nenhum número sem fonte na tela. Perfil preditivo só existe para o operador (backend `/predictive-profile`); para os demais a UI declara "Perfil preditivo não medido". Telemetria vem do usuário da sessão. `/dashboard` lê `budget_limit` e `agents_registered` do backend. `SniperAdvisor` cobre os 6 vetores reais, sem percentual inventado. |

**Achado acrescentado pela security-review, confiança 7.** O provedor Discord do `@auth/core`
0.41.3 copia o e-mail sem ler `profile.verified`, e o portão do operador confia no e-mail. Quem
cadastrasse o e-mail do operador numa conta Discord sem confirmá-lo entraria como operador. Corrigido
com o callback `signIn` em `frontend/src/auth.ts`, que exige `verified === true` no Discord e
`email_verified === true` no Google; provedor sem regra declarada falha fechado
(`frontend/src/lib/server/verified-email.ts`).

## Decisões de escopo

- **FE-09 — mermaid sob demanda, KaTeX estático.** O mermaid só é baixado quando há diagrama e renderiza
  com `securityLevel: 'strict'`. O KaTeX ficou estático: a folha de estilo tem de estar presente no
  primeiro paint de artigo com fórmula, e carregá-la tarde troca 800 KB de dev por salto de layout.
- **FE-12 — CSP sem nonce, aceito.** Nonce obriga render dinâmico em todas as páginas e desliga o
  cache estático. O `'unsafe-inline'` fica registrado como risco aceito, não como corrigido.
- **FE-16 — Supabase parcial.** `updateSession` saiu do `proxy.ts` (chamada de rede sem consumidor em toda
  rota protegida) e `utils/supabase/{client,middleware}.ts` foram removidos. A rota `/callback` e
  `frontend/src/utils/supabase/server.ts` **ficaram**: são ponto de entrada por URL, e remover exige saber se há
  link externo apontando para eles — medição que este ciclo não fez.

## Contraprova

Os testes novos rodaram contra o código antigo com `git stash` dos arquivos de produção: 16 de 17
reprovam. O que passa nos dois é controle positivo. A primeira tentativa foi inválida — `git stash push`
recusou caminhos já removidos e não guardou nada — e foi refeita sem eles.

O callback `signIn` tem contraprova própria: o teste de função passaria mesmo sem o callback
registrado, então `frontend/src/tests/api/authVerifiedEmail.test.ts` captura a configuração entregue ao NextAuth.
Sem o callback, 3 de 3 reprovam.

## O erro de router relatado

`Internal Next.js error: Router action dispatched before initialization` não reproduziu em navegação
limpa por `/`, `/simulador`, `/templo/gemma`, `/templo/analytics`, `/biblioteca/geometria-do-risco` e
`/dashboard/files`. O relato do Tier 0 é evidência primária de que ocorreu; o que não se reproduziu é
o estado. A causa mais provável é o hot reload em cascata produzido pelo stash e pop da contraprova
com o dev server ativo — inferência, não prova.
