---
id: validacao-2026-09-17-pko-em-desenvolvimento-e-correcao-matematica-dos-autos
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T16:30:00-03:00'
atualizado_em: '2026-09-17T16:30:00-03:00'
classes: [interno, medido, frontend, modelo]
caminhos:
  - reports/VALIDACAO-2026-09-17-pko-em-desenvolvimento-e-correcao-matematica-dos-autos.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 4a112d31
  host: Windows 11 Pro 10.0.26200, dev server Next 16.3.5 em :3000, next start de producao em :3100, Chrome via DevTools e Chromium do Playwright, Python do .venv do projeto
  autos_consultados: docs/PERSPECTIVA_MATEMATICA_PMEV_MASTER.md (Teoremas 1, 2, 3, 6, 7), docs/research/validacao_matematica_hipoteses_v1.md (D1 a D3), LIMITE DECLARADO B06/F07 em frontend/src/lib/rpDeriver.ts e engine/vitoi_perspective_engine.py, biblioteca/estruturas-de-torneio
  data_das_medicoes: 2026-09-17
verificado:
  - PKO no Chrome dev -- secao com selo Em desenvolvimento, comeca desligado; o texto do painel Nash sem a secao PKO e identico com peso 25 por cento, 5 por cento e depois de desligar
  - PKO no Chrome dev -- exportacao HRC com PKO ligado gera o arquivo sota_paradoxo_9p.json sem alerta; antes lancava erro
  - leitura PKO satura no piso de RP em qualquer peso, de 5 a 50 por cento; exibida como piso, com a falta de calibracao declarada
  - Teorema 2 -- caso canonico residual 4 BB e pote 36 BB mede BF 0,812, RP -23,2 por cento e E* abaixo das pot odds; antes o RP saia 0
  - BF pos-flop do nao-heroi -- antes entre 0,02 e 0,3 nos 10 cenarios nao baseline e em todas as streets, invertendo com o papel de heroi; depois entre 1,17 e 2,73 e igual qualquer que seja o heroi; o BF do heroi nao mudou
  - Teorema 6 -- a equidade requerida do motor Python passa a ser BF*a/(BF*a+1-a); com psi neutro coincide com B*BF/(P+B+B*BF) em 12 combinacoes; a recomposicao antiga ficava 11,11 pontos abaixo em BF 5 e a 0,5, como os autos mediram
  - Teorema 7 e D2 -- RIO com (jogadores-1) ao quadrado confere com a prova formal RIO(N) = N^2 p_d aposta com N oponentes; sem correcao
  - D1 -- EV_fold(ICM) positivo e alcancavel pelo bonus de laddering, sem clamp; sem correcao
  - Teorema 6 no TypeScript -- calculateRequiredEquity ja usava a forma exata; sem correcao
  - ritmo do laco CFR do Lab em primeiro plano, medido no Chromium do Playwright a 100,5 quadros por segundo -- 99,6 iteracoes por segundo com o painel na tela, 0 fora da tela
  - contraprova contra 4a112d31 -- 16 de 20 testes TS novos reprovam; os 4 que passam sao controles (formula do heroi, solver com RP >= 0, componente novo, exportacao); o teste Python nao coleta sem a correcao
  - jest integral 88 suites e 562 testes, 0 erros e 0 warnings; tsc nas duas configuracoes e eslint limpos; ruff limpo nos arquivos Python tocados; 39 testes Python do motor de perspectiva aprovados
  - next build de producao com 64 paginas sem warning; next start em :3100 -- 7 rotas respondem, secao PKO e piso visiveis, Lente PM carrega, 0 icones vazios, console limpo
nao_verificado:
  - aba oculta no Playwright; a pausa por visibilitychange esta coberta por teste de componente
  - modelo de bounty para PKO -- fora do escopo do template vanilla pelos autos; nao calibrado
  - conversao da grandeza exibida de RP de (BF-1)/BF para (BF-1)/(BF+1) -- os autos nao escolhem entre as duas
  - piso numerico de RP -100 por cento e de BF 0,5 -- limite de engenharia, nao consta dos autos
  - Lighthouse e CWV do build de producao
  - suite Python integral -- veredito declarado na mensagem de commit
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - frontend/src/components/simulator/solver/nashSolver.ts
    parecer: >-
      Aquele registro ancora o solver na trilha PMev e manda nao recalibrar coeficiente global por observacao isolada.
      Nenhum coeficiente mudou. A unica alteracao em solveIcmDistortion e o limite inferior da entrada de RP, de 0 para
      -100, para que o RP negativo do Teorema 2 do tratado canonico chegue ao solver. Para RP >= 0 a saida e identica,
      coberta por teste, e com RP negativo a direcao medida e a do bluffcatcher obrigatorio (menos fold, mais call). A
      diretriz daquele registro segue valida e cumprida.
pendencias:
  - id: pend-2026-09-17-grandeza-rp-exibida
    o_que: Decidir se o RP exibido segue (BF-1)/BF ou passa a (BF-1)/(BF+1), a forma exata no all-in even money; a equidade requerida ja e exata nos dois motores
    dono: Tier 0
    prazo: 2026-10-17
  - id: pend-2026-09-17-modelo-de-bounty-pko
    o_que: Definir o modelo de bounty do PKO; o exploratorio soma o peso sobre o pool inteiro e satura no piso com qualquer peso
    dono: Tier 0
    prazo: 2026-10-17
---

# PKO em desenvolvimento e correção matemática conforme os autos — 2026-09-17

Responde às quatro instruções do Tier 0 sobre os itens não verificados de
`reports/VALIDACAO-2026-09-17-correcao-dos-achados-do-simulador.md`.

## 1. PKO sob "Em desenvolvimento"

O simulador principal não tinha controle de PKO: `NashPanel` recebia `pkoValue` e `onPkoChange` e ignorava os
dois. A única interação com operação existente era a exportação HRC, que lançava erro com PKO ligado.

Os autos resolvem o desenho. `biblioteca/estruturas-de-torneio` diz que PKO está fora do escopo do template
vanilla, porque bounties exigem modelo próprio. Então:

- `frontend/src/components/simulator/ui/PkoDevControl.tsx` insere as opções no painel Nash, com o selo "Em desenvolvimento", começando desligadas.
- As saídas estabelecidas seguem vanilla: frequências, RPs, Lente PM, Dashboard, pós-flop, perspectiva e exportação HRC. O peso saiu dos cálculos de `useQuantumEngine`, da lente e do Dashboard.
- Ligado, o PKO só produz uma leitura paralela (`pkoPreview`): RP base vanilla ao lado do RP base com o peso.
- A exportação HRC descreve a estrutura e não recebe mais o peso exploratório, que `frontend/src/lib/hrcExport.ts` já dizia não ser configuração de bounty.

A leitura revelou um fato do modelo herdado: ele soma o peso sobre o pool inteiro de prêmios, e com qualquer peso o
RP vai ao piso. A tela diz isso, em vez de exibir −100% como medida. A calibração fica como pendência.

## 2. Correção matemática conforme os autos

A régua foram os teoremas explícitos do tratado canônico e as derivações formais. Cada um foi medido contra o código
antes de qualquer mudança.

| Autos | Código | Resultado |
| :--- | :--- | :--- |
| T1 e D1: EV_fold(ICM) pode ser positivo | `dynamicEvFold` com bônus de laddering, sem clamp | confere |
| T6: E\* = B·BF/(P+B+B·BF) | `calculateRequiredEquity` no TS | confere |
| T6 e B06/F07: equidade exata | Python recompunha a grandeza inexata `(bf-1)/bf` | **corrigido** |
| T2: RP_River < 0 quando E\* < B/(P+2B) | `bfToRp` e `riskAdvantage` devolviam 0 para BF ≤ 1; solver com piso 0; Python com BF ≥ 1 | **corrigido** |
| T7 e D2: RIO ~ O(N²), com N oponentes | `(jogadores − 1)²` | confere |

**Um artefato que a correção do T2 teria exposto.** Antes de liberar o RP negativo, medi onde o BF fica abaixo
de 1. O resultado: nos 10 cenários fora da baseline, e em todas as streets, o BF do jogador que não é o herói ficava
entre 0,02 e 0,3, e invertia de lado junto com o papel de herói.

`derivePostFlopRps` tirava esse BF dos ramos da decisão do herói. A contribuição do outro jogador já está no pote,
então a stack dele não muda quando o herói vence, e a perda sai perto de zero. O piso em 0 escondia o artefato, e o RP
pós-flop do adversário saía sempre 0. Liberar o sinal sem corrigir isso publicaria −5.000% como teorema.

A correção calcula o BF de cada lado pela própria decisão, com o mesmo pote e o mesmo custo e os papéis trocados.
Para o herói a fórmula é a mesma, e o teste confirma o valor anterior. Só depois o sinal foi liberado.

**O que os autos não decidem, e ficou com o Tier 0.** O RP exibido segue `(BF-1)/BF`. Trocar para `(BF-1)/(BF+1)`,
a forma exata no all-in *even money*, mudaria todo RP da tela e os rótulos dos cenários. O LIMITE DECLARADO
B06/F07 já reservava essa escolha ao Tier 0, e os teoremas não a fazem. A equidade requerida, que é o que decide a
ação, já é exata nos dois motores.

## 3. Ritmo do laço CFR do Lab

Contorno autorizado: o Chrome automatizado limita `requestAnimationFrame`, então a medição usou o Chromium do
Playwright contra o dev server. Esse navegador rodou a 100,5 quadros por segundo, confirmando que não havia
limitação. O laço fez 99,6 iterações de CFR por segundo com o painel na tela, uma por quadro, e 0 com o painel fora.

**Observação sem ação:** com o painel visível, o laço segue indefinidamente depois de convergir. Parar por
convergência exigiria um critério de parada, e o diagnóstico atual é um *proxy* de regret. Fica registrado.

## 4. Build de produção

`next build` com todas as mudanças, 64 páginas sem warning, e `next start` em :3100. Resultados:

- 7 rotas respondem, e `/dashboard` redireciona;
- a seção de PKO mostra o selo e o piso;
- as streets exibem RP;
- a Lente PM carrega;
- nenhum ícone vazio e console limpo.
