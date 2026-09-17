---
id: registro-2026-09-17-preludio-decisoes-abertas-e-nao-verificados
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T17:30:00-03:00'
atualizado_em: '2026-09-17T17:30:00-03:00'
classes: [interno, medido, handoff]
caminhos:
  - reports/REGISTRO-2026-09-17-preludio-decisoes-abertas-e-nao-verificados.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 69c37f7d
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000
  estado_da_arvore: limpa e sincronizada com origin/master
  data_das_medicoes: 2026-09-17
verificado:
  - arvore limpa em 69c37f7d, igual a origin/master
  - as duas pendencias abertas nesta sessao constam do frontmatter de reports/VALIDACAO-2026-09-17-pko-em-desenvolvimento-e-correcao-matematica-dos-autos.md
nao_verificado:
  - nada novo foi medido para este prelúdio; ele consolida o que os registros da sessao ja declaram
---

# Prelúdio — decisões abertas, pendências e o não verificado

Sessão `441017cf-947a-4236-9c6b-43b2fc3f5757`. **A sessão não acabou:** este prelúdio organiza a próxima frente
antes do compact. A nota fica para o handoff.

## Onde a sessão está

Publicado em `origin/master` até `69c37f7d`, nesta ordem:

1. auditoria e correção do backend;
2. auditoria e correção do frontend;
3. verificação de produção, OAuth e microfone, e subconjunto do Font Awesome;
4. auditoria do simulador, PKO em desenvolvimento e correção matemática conforme os autos.

Registros-fonte desta frente:

- `reports/AUDITORIA-2026-09-17-simulador-padrao-ouro.md`
- `reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-simulador.md`
- `reports/VALIDACAO-2026-09-17-pko-em-desenvolvimento-e-correcao-matematica-dos-autos.md`
- `reports/VALIDACAO-2026-09-17-producao-oauth-microfone-e-fontawesome.md`

## A. Decisões do Tier 0 — pendências formais

| Id | Decisão | O que já está medido para decidir |
| :--- | :--- | :--- |
| `pend-2026-09-17-grandeza-rp-exibida` | RP exibido segue `(BF-1)/BF` ou passa a `(BF-1)/(BF+1)` | A equidade requerida já é exata nos dois motores. A troca muda todo RP da tela e exige revisar os RPs estáticos dos cartões de cenário (ex.: "RP 18.5%"). `(BF-1)/(BF+1)` é a forma exata no all-in *even money*; `(BF-1)/BF` não é exata em nenhuma convenção (LIMITE DECLARADO B06/F07). |
| `pend-2026-09-17-modelo-de-bounty-pko` | Modelo de bounty do PKO | O modelo exploratório soma o peso sobre o pool inteiro e satura no piso de −100% com qualquer peso de 5% a 50%. Os autos põem PKO fora do template vanilla. |

## B. Decisões do Tier 0 — sem pendência formal ainda

1. **Limite de 45 s em `tests/test_cwv_gate_truthfulness.py`.** O portão leva 11 s isolado. O teste passa isolado em 30 s, e com 4 execuções paralelas cada uma levou 38 s. Reprovou 3 vezes na suíte completa e passou no `pre-push`. Mudar o limite é mudar o instrumento que mede o portão: precisa de autorização.
2. **Laço CFR segue depois de convergir** com o painel visível: 99,6 iterações por segundo. Parar exige critério de convergência, e o diagnóstico atual é um *proxy* de regret.
3. **`ProspectRiskEngine` (Python) não tem consumidor de produto**, só testes. Foi corrigido conforme os autos, mas pela regra antientropia é candidato a ligar a um fluxo real ou a retirar.
4. **Estatísticas de vilão fixas no `GtoCfrSimulator`** (`vpip 25`, `pfr 20`, `agg 3`) no artigo "Estado da Arte": rotular como ilustração ou tirar. É decisão editorial.
5. **`npm start` é `next start`** com `output: 'standalone'`, que o Next diz não ser o modo suportado. Nenhum consumidor encontrado no repositório; depende de como o deploy sobe.
6. **`NEXTAUTH_URL` no `.env` aponta para `localhost:3000`.** O deploy precisa do domínio real.

## C. Não verificado — o que falta medir, e o que destrava cada item

| Item | Por que não foi medido | Como tratar |
| :--- | :--- | :--- |
| Lighthouse e CWV do build de produção | não foi rodado | `next build` e `next start` em :3100, e Lighthouse pelo DevTools contra a porta de produção |
| OAuth real com Google e Discord | exige credenciais de produção | o Tier 0 põe `AUTH_GOOGLE_ID/SECRET` e `AUTH_DISCORD_ID/SECRET` no ambiente, **nunca no chat**; o fluxo simulado já está coberto por `frontend/scripts/verificar-oauth-callback.mjs` |
| Formato real de `verified` e `email_verified` devolvido pelos provedores | idem | mesmo login real |
| Áudio real do microfone | o navegador automatizado não recebe permissão | teste manual do Tier 0 num navegador comum, ou Chrome lançado com `--use-fake-device-for-media-stream`, que exige autorização para relançar o navegador |
| PKO com aba oculta no Playwright | o Playwright mantém a aba visível | já coberto por teste de componente; medir com `page.evaluate` forçando `visibilitychange`, se preciso |
| Piso de RP −100% e de BF 0,5 | limite de engenharia, fora dos autos | decisão junto com a pendência da grandeza do RP |
| `PmevRangeViewer`, `ReferencialAula12` e `EquityCalculator` | fora do escopo lido na auditoria do simulador | próxima auditoria; a recaptura da Aula 1.2 já tem pendência própria (`pend-2026-09-13-recaptura-aula12`) |
| CPU e bateria por perfilador | só taxa de mensagens foi medida | trace de performance do DevTools com o simulador aberto |
| Erro de router em navegador de terceiros | reprodução só local | é corrida do HMR em dev, e produção não tem HMR; baixa prioridade |
| `GET /api/auth/session` 4 vezes no carregamento | medido só em dev, onde o StrictMode dobra | contar em `next start` |
| Tamanho do JS de produção depois das mudanças do simulador | não remedido | mesma medição de recursos usada para o Font Awesome |

## Ordem proposta para depois do compact

1. Itens de C que não dependem do Tier 0: Lighthouse de produção, contagem de sessão em produção, tamanho de JS e trace de CPU.
2. Apresentar as decisões de A e B com a recomendação de cada uma, numa pergunta só.
3. Executar o que o Tier 0 decidir, com teste e contraprova, e fechar as pendências por append em registro novo.
4. Handoff com o pedido de feedback e nota.

## Armadilhas medidas nesta sessão

- **Declarações geradas em `frontend/dist-workers/`** ficam desatualizadas e produzem erro falso no `tsc -p tsconfig.json`: rodar `npx tsc -b tsconfig.worker.json` antes.
- **O Prettier do repositório reformata o arquivo inteiro** (tabs para espaços): não rodar em arquivo existente, e editar cirurgicamente.
- **O Chrome automatizado limita `requestAnimationFrame`:** rolagem suave não chega ao destino, e taxas guiadas por quadro não se medem nele. Usar `scrollTo` com `behavior: 'instant'` e, para ritmo de quadro, o Chromium do Playwright.
- **O guardião do Jest conta warnings dentro do teto:** conferir a linha "Total de Warnings", não só aprovado ou reprovado.
- **Primeira visita ao dev server depois de muitas edições recompila a frio:** o portão de CWV pode reprovar o LCP. Carregar a home antes de commitar.
- **Heredoc do bash no Windows reduz `\\` a `\`:** para script com barra invertida, usar a ferramenta Write.
