---
id: validacao-2026-09-17-correcao-dos-achados-do-simulador
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T14:30:00-03:00'
atualizado_em: '2026-09-17T14:30:00-03:00'
classes: [interno, medido, frontend]
caminhos:
  - reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-simulador.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  diretorio_de_trabalho: frontend
  branch: master
  commit_base: 4a112d31
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, Chrome via DevTools em contexto isolado com Worker, fetch e IntersectionObserver instrumentados
  observacao: o Chrome automatizado limita requestAnimationFrame, entao rolagem suave nao chega ao destino; as medicoes de visibilidade usaram scrollTo com behavior instant
  data_das_medicoes: 2026-09-17
verificado:
  - jest integral -- 86 suites e 542 testes, 0 erros e 0 warnings conferidos na linha do guardiao
  - tsc -p tsconfig.json com as declaracoes de dist-workers reconstruidas, tsc -p tsconfig.audit.json e eslint . -- sem erro
  - contraprova com git stash dos 12 arquivos de producao -- 14 de 14 testes novos reprovam contra o codigo antigo; stash restaurado com os 23 caminhos
  - contraprova do hook de visibilidade -- a semantica da primeira versao reprova o teste de ordem real de montagem; a versao com callback ref aprova
  - Chrome /biblioteca/estado-da-arte -- status Nenhum spot ativo, nenhum percentual de estrategia, sem o aviso Invalid payload discarded
  - Chrome /biblioteca/estado-da-arte -- 0 pedidos ao worker em 4 s com o painel acima ou abaixo da janela, 86 com o painel visivel
  - Chrome /simulador -- no carregamento, 0 mensagens a worker e 1 POST bayesiano, contra equity random, 2 DISTORTION e 3 POSTs antes
  - Chrome /simulador -- 8 edicoes do pote geram 1 POST bayesiano, contra 8 antes
  - Chrome Lente PM -- Calcular cenario leva a 64, e o slider responde a 30 e 85 depois dele; antes ficava em 64
  - Chrome Lente PM -- troca para o cenario 09 volta a equity a 50 e a lente mostra os stacks do cenario (UTG 35BB, EP 80BB, MP1 12BB...)
  - console do /simulador e do artigo sem erro nem aviso do projeto
nao_verificado:
  - Dashboard com PKO no navegador -- coberto so por teste de renderizacao com usePmLensCalculations simulado
  - taxa do laco rAF do CfrRegretPanel em primeiro plano; a pausa usa o mesmo hook medido no GtoCfrSimulator, mas o painel nao foi medido no Chrome
  - correcao numerica dos modelos PMev, perspectiva, RIO e insolvencia -- formulacao do Tier 0, fora do escopo
  - build de producao e Lighthouse depois destas mudancas
  - suite Python integral -- veredito declarado na mensagem de commit
pendencias_resolvidas:
  - pend-2026-09-17-cfr-estrategia-fabricada
  - pend-2026-09-17-equity-nativa-fixa
  - pend-2026-09-17-pko-divergente
---

# Correção dos achados da auditoria do simulador — 2026-09-17

Resolve os oito achados de `reports/AUDITORIA-2026-09-17-simulador-padrao-ouro.md`, sob a delegação do Tier 0 para
auditar, corrigir, otimizar e harmonizar o próximo aspecto de maior importância do frontend.

## O que mudou

| Achado | Correção |
| :--- | :--- |
| SIM-01 | A estratégia sai de regret matching sobre as EVs do spot (`frontend/src/lib/cfrSingleDecision.ts`). Sem spot, a tela diz "Nenhum spot ativo" e o selo fixo "GTO Stable" saiu. |
| SIM-02 | A equity passa a ter uma fonte só. O valor manual, o resultado de "Calcular cenário" e o reset por cenário escrevem no mesmo estado, em `frontend/src/components/simulator/hooks/useMasterCalculations.ts`. O worker de "aleatória contra aleatória" saiu. Trocar de cenário invalida a matriz pendente. |
| SIM-03 | `MasterSimulator` passa à Lente PM o spot ativo (stacks, prêmios, pote, investimento, posição, jogadores, blinds e PKO). A lente mantém seus controles de exploração. O Dashboard lê o PKO do contexto. |
| SIM-04 | O canal `DISTORTION` saiu do worker, do protocolo e da validação de resposta. `nashResults` é derivado do cálculo síncrono. |
| SIM-05 | Consulta bayesiana com espera de 250 ms e `AbortController`: uma requisição por pausa, e resposta superada não escreve. |
| SIM-06 | `frontend/src/components/simulator/hooks/useLoopVisibility.ts` pausa os dois laços de CFR com aba oculta ou painel fora da tela. O `GtoCfrSimulator` ganhou trava de ocupado, e mudar pote ou spot não recria mais o worker. |
| SIM-07 | Sem a leitura "winRate verdadeiro", taxa 0 é resultado e não ausência. |
| SIM-08 | `useLlamaEngine()` saiu do `MasterSimulator`. |

O modelo matemático não foi tocado. A única matemática nova é regret matching numa decisão com utilidades fixas,
algoritmo padrão, e o módulo diz no cabeçalho o que ele garante: convergência para a melhor resposta pura.

## Um defeito meu que só o navegador pegou

A primeira versão de `useLoopVisibility` recebia um `RefObject` e criava o `IntersectionObserver` no efeito de montagem.
O `GtoCfrSimulator` renderiza um placeholder antes de hidratar: o ref estava nulo nesse efeito, que nunca rodava de
novo. Os testes passaram, porque simulavam `isHydrated: true` desde o início. No Chrome, com o painel fora da tela e o
próprio `IntersectionObserver` da página dizendo `false`, o worker seguia recebendo 86 pedidos em 4 s.

A correção devolve um callback ref, que observa quando o elemento de fato entra no DOM. O teste novo reproduz a ordem
real, placeholder primeiro e painel depois, e reprova com a semântica antiga.

Duas medições intermediárias foram descartadas como instrumento inválido: a primeira rolava a página com
`scroll-smooth` num Chrome que limita quadros de animação, e a rolagem nunca chegava ao destino.

## Correção de uma afirmação publicada

`reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-frontend.md` e
`reports/VALIDACAO-2026-09-17-producao-oauth-microfone-e-fontawesome.md` registram a suíte Jest integral como "sem erro
nem warning". **Estava errado.** Todas as rodadas completas daquele dia terminaram com 2 warnings, dentro do teto do
guardião, e eu não li a linha que os contava:

- `frontend/src/tests/simulator/sotaSyncHydration.test.tsx` — o aviso de valor salvo com forma incompatível, que é o comportamento testado;
- `frontend/src/tests/api/proxy-routes.test.ts` — o log de backend inalcançável, também esperado.

Os dois registros publicados ficam como estão. Esta é a correção. Os dois avisos agora são asserções
(`jest.spyOn(console, 'warn')` com a mensagem esperada), e a suíte fecha com 0 warnings.
