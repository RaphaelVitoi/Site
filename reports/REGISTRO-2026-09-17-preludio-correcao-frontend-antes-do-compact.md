---
id: registro-2026-09-17-preludio-correcao-frontend-antes-do-compact
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T05:00:00-03:00'
atualizado_em: '2026-09-17T05:00:00-03:00'
classes: [interno, medido, handoff]
caminhos:
  - reports/REGISTRO-2026-09-17-preludio-correcao-frontend-antes-do-compact.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 3ee43c77
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, Chrome via DevTools
  data_das_medicoes: 2026-09-17
verificado:
  - jest integral 76 suites e 512 testes antes dos dois ultimos ajustes (401 em API sem sessao no proxy e sonda Gemma condicionada a sessao)
  - apos esses dois ajustes, jest dirigido em operatorProxy e gemmaDictationCleanup -- 7 aprovados
  - contraprova com git stash dos arquivos de producao -- 16 de 17 testes novos reprovam contra o codigo antigo; stash restaurado
  - Chrome real -- heroStack 77 sobrevive ao reload em /simulador; artigo sem mermaid baixa 0 chunk do mermaid e 8997 KB de script contra 11050 antes; analytics sem dado sintetico; /dashboard/files sem sessao vai ao login
  - erro Router action dispatched before initialization relatado pelo Tier 0 nao reproduziu em navegacao limpa de 6 rotas
  - security-review -- nenhum achado com confianca maior ou igual a 8; um achado de confianca 7 aberto abaixo
nao_verificado:
  - tsc e eslint nao reexecutados apos os dois ultimos ajustes
  - suite Python integral nao reexecutada apos o campo budget_limit e agents_registered em handlers.py; so 115 testes dirigidos
  - causa do erro de router atribuida a hot reload em cascata durante o stash e pop da contraprova -- inferencia, nao prova
  - login real ponta a ponta; provedores OAuth sem credencial neste ambiente
---

# Prelúdio — correção do frontend, antes do compact

Sessão `441017cf-947a-4236-9c6b-43b2fc3f5757`. **A sessão não acabou:** este prelúdio só dá lastro ao que foi medido antes que a janela comprima. A nota fica para o handoff.

## Já publicado nesta sessão

`origin/master` em `3ee43c77`:

- `dda2004f`: os 21 achados do backend.
- `9506d144`: frontend do lote do backend.
- `3ee43c77`: gateway de logs que o `.gitignore` tinha engolido.

## Em andamento, sem commit

A correção dos 16 achados de `reports/AUDITORIA-2026-09-17-frontend-padrao-ouro.md`, delegada pelo Tier 0 com a instrução "ao fim, se ok, commit e push, incluindo o relatório de calibração". O relatório de calibração é `reports/agent-calibration/daily/2026-09-16.json`.

| Achado | Estado | Onde |
| :--- | :--- | :--- |
| FE-01 login | feito | `frontend/src/components/auth/LoginContent.tsx`, `frontend/src/components/ui/layout/HeaderAuthAction.tsx`, `app/(auth)/login/page.tsx` |
| FE-02 hidratação | feito | `frontend/src/components/simulator/hooks/useDebouncedLocalStorage.ts` (flag `isLoaded`), `frontend/src/components/simulator/hooks/useSotaSync.tsx` (`isSotaPhysicsState`) |
| FE-03 dados fabricados | feito | `frontend/src/app/api/v1/predictive/route.ts`, `DashboardSOTA.tsx`, `TelemetryCharts.tsx`, `frontend/src/app/(lab)/templo/analytics/page.tsx`; rota órfã `api/v1/profile` removida |
| FE-04 operador | feito, **com pendência abaixo** | `frontend/src/lib/server/operator.ts` (`NEXUS_OPERATOR_EMAILS`, falha fechado), `proxy.ts` |
| FE-05 dashboard | feito | `frontend/src/app/(user)/dashboard/page.tsx` lendo `budget_limit` e `agents_registered` de `api/v1/handlers.py` |
| FE-06 arquivos | feito | `frontend/src/lib/server/operator-gateway.ts`, `app/api/vitoi/files/{list,view}` |
| FE-07 SniperAdvisor | feito | 6 vetores reais, sem percentual inventado |
| FE-08 microfone | feito | cleanup no efeito de `frontend/src/app/(lab)/templo/gemma/page.tsx` |
| FE-09 mermaid | feito | import sob demanda e SVG via `mermaid.render`; KaTeX **mantido** estático, por decisão |
| FE-10 telemetria | feito | lotes ≤ 60 KiB em O(n) e flush em `pagehide` |
| FE-11 slug | feito | `encodeURIComponent` |
| FE-12 CSP | **aceito sem mudança** | nonce forçaria render dinâmico em todas as páginas |
| FE-13 imagens | feito | `images.remotePatterns` Google e Discord |
| FE-14 localStorage | feito | quota, validação e flush na desmontagem |
| FE-15 login | feito | junto com FE-01 |
| FE-16 Supabase | feito em parte | `updateSession` saiu do proxy; `utils/supabase/{client,middleware}.ts` removidos; rota `/callback` e `server.ts` **mantidos**, por serem ponto de entrada por URL |

Ajustes feitos depois da validação no Chrome:

- `proxy.ts` responde 401 em JSON para API sem sessão.
- A sonda de saúde da página Gemma só roda com sessão.

Testes novos:

- `frontend/src/tests/simulator/sotaSyncHydration.test.tsx`
- `frontend/src/components/analytics/SniperAdvisor.test.tsx`
- `frontend/src/tests/lab/gemmaDictationCleanup.test.tsx`
- `frontend/src/lib/telemetry-client.test.ts`
- `frontend/src/tests/library/sotaMarkdownMermaid.test.tsx`
- `frontend/src/tests/api/operatorProxy.test.ts`
- `frontend/src/lib/server/operator.test.ts`
- `frontend/src/lib/server/operator-gateway.test.ts`
- `frontend/src/components/auth/LoginContent.test.tsx`
- `tests/test_db_summary_contrato.py`

## Falta, nesta ordem

1. **Achado da security-review (confiança 7):** o provedor Discord do `@auth/core` 0.41.3 não lê `profile.verified`, e o gate de operador confia só no e-mail. Adicionar callback `signIn` em `frontend/src/auth.ts` que recuse e-mail não verificado (`verified === true` no Discord, `email_verified === true` no Google), com teste.
2. **Frontend:** reexecutar `npm run typecheck`, `npx eslint .` e `npx jest` completos.
3. **Python:** `python scripts/ops/suite_verde.py`.
4. **Registro:** escrever `reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-frontend.md`.
   - Declarar em `pendencias_resolvidas` os ids `pend-2026-09-17-login-inexistente`, `pend-2026-09-17-operador-sem-allowlist`, `pend-2026-09-17-hidratacao-apaga-estado` e `pend-2026-09-17-diagnostico-fabricado`.
   - Registrar as decisões de FE-09, FE-12 e FE-16, e o erro de router não reproduzido.
5. **Portões:** rodar em seco `record_anchor_gate.ps1` e `record_gate.py`.
6. **Commit:** a identidade local está residual, então usar `git -c user.name='Claude Opus 5' -c user.email='noreply@anthropic.com' commit`. A mensagem leva a linha `Assinatura:` e o veredito do portão. Incluir o relatório de calibração, a auditoria, este prelúdio e a validação. As remoções já estão em stage.
7. **Push.**

## Armadilhas medidas nesta sessão

- **Heredoc do bash no Windows:** reduz `\\` para `\`, e isso quebrou a regex de escape do PDF duas vezes. Para arquivo com barra invertida, usar a ferramenta Write.
- **Nomes soltos no `.gitignore`:** `logs/` engoliu uma rota. Conferir `git check-ignore` em diretório novo antes do commit.
- **Stash e pop com dev server ativo:** dispara hot reload em cascata; é a causa provável do erro de router relatado.
- **`X-Frame-Options: DENY`:** impede medir rotas por iframe. Usar navegação real.
- **`innerText` com CSS `uppercase`:** devolve maiúsculas, e busca por texto precisa ignorar caixa.
