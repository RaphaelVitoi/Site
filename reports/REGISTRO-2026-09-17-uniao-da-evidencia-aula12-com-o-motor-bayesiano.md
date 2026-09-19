---
id: registro-2026-09-17-uniao-da-evidencia-aula12-com-o-motor-bayesiano
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T21:40:00-03:00'
atualizado_em: '2026-09-17T21:40:00-03:00'
classes: [interno, medido, frontend, simulador, governanca]
caminhos:
  - reports/REGISTRO-2026-09-17-uniao-da-evidencia-aula12-com-o-motor-bayesiano.md
  - frontend/src/lib/aula12Evidence.ts
  - frontend/src/lib/bayesianRangeEngine.ts
  - frontend/src/lib/featureFlags.ts
  - frontend/src/components/simulator/ui/PkoDevControl.tsx
  - frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx
  - frontend/src/tests/simulator/aula12Evidence.test.ts
  - frontend/src/tests/simulator/bayesianRangeEngine.test.ts
  - frontend/src/tests/simulator/pkoEmDesenvolvimento.test.tsx
  - scripts/ops/record_gate.py
referencias_nao_resolviveis:
  - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: bc3560b8
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-17
verificado:
  - suite do simulador integral -- 368 testes em 55 suites, todos aprovados
  - typecheck estrito (tsc --noEmit) sem erros e eslint limpo nos arquivos tocados
  - leitura independente da figura 8 do documento da Aula 1.2, concordante digito a digito com a transcricao canonica
  - auditoria aritmetica dos 16 conjuntos de frequencia do motor -- 3 nao fecham em 100, todos por 0.1
  - sobreposicao medida entre motor e fixture -- 24 das 35 frequencias do motor ja existiam na fixture canonica
  - contraprova por isca em dois portoes -- PKO (7 de 13 reprovaram sem o portao) e gradiente (1 de 22)
nao_verificado:
  - OCR das 96 figuras restantes do documento; apenas a figura 8 foi lida nesta sessao
  - build de producao e Lighthouse
  - o portao de 5 fases, que so roda no commit -- nada foi commitado
pendencias:
  - id: pend-2026-09-17-evidencia-fora-de-fixtures
    o_que: Mover a evidencia canonica de __fixtures__ para um caminho de producao, agora que codigo de producao a consome
    dono: Tier 0
    prazo: 2026-10-17
  - id: pend-2026-09-17-motor-consumir-evidencia-nos-demais-nos
    o_que: Ligar os demais nos do bayesianRangeEngine a ponte de evidencia, um par por vez
    dono: Tier 0
    prazo: 2026-10-17
revisoes_de_ancora:
  - registro: registro-2026-09-17-spot-aula12-filtragem-e-indiferenca-nash
    caminhos:
      - frontend/src/lib/bayesianRangeEngine.ts
      - frontend/src/tests/simulator/bayesianRangeEngine.test.ts
    parecer: "Harmonizacao e conexao do motor bayesiano com a evidencia canonica da Aula 1.2 sem duplicacao."
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - scripts/ops/record_gate.py
    parecer: "Adicao de hook acessorio de saude da malha ao record_gate sem alteracao na taxonomia."
---

# União da evidência da Aula 1.2 com o motor bayesiano

**Arbitrado pelo Tier 0 nesta data:** *"pode unir a força de ambas"*, *"e harmonizar"*, e a diretriz que
governa o desenho — *"não deixe a regra enrijecer quando o contexto próprio é óbvio e indica o caminho"*.

## 1. O que existia em duplicidade, medido

Duas transcrições do mesmo documento coexistiam, feitas em processos diferentes e por duplas diferentes:

| Fonte | Origem | O que traz |
| :--- | :--- | :--- |
| `frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts` | dupla leitura cega sobre 14 capturas | combos, `unreadable` com motivo, SHA-256 do documento, índice da figura, rótulo do nó, regime e solver |
| `frontend/src/lib/bayesianRangeEngine.ts` | sessão com o Gemini 3.8 Flash (`bc3560b8`) | grid 13x13 por mão, classificação, explicação tática, gradiente de indiferença, filtragem por rua, texturas alternativas |

**Das 35 frequências distintas hardcoded no motor, 24 já existiam na fixture.** A duplicação era de dado, não
de capacidade.

**Nenhuma das duas é melhor que a outra, e presumir isso foi erro meu, corrigido pelo Tier 0 em sessão**
(*"não assuma sempre que todos os nós estão melhores"*). Elas são melhores em **eixos diferentes**: a fixture
em procedência, o motor em capacidade. A união entrega os dois eixos.

## 2. O achado aritmético que motivou a investigação

Varredura dos 16 conjuntos de frequência do motor: **3 não fecham em 100**, todos por exatamente 0,1 —
ChipEV c-bet flop (100,1), Fold/Call/Raise 5bb (99,9) e Check/Bet/Shove do turn (100,1). Desvio simétrico de
uma décima é assinatura de arredondamento na fonte, não três acidentes.

O painel exibia os dois lados da contradição na mesma tela: o botão anuncia `C-Bet 97.7%` enquanto as partes
somam 97,8.

**O resíduo é desprezível como número e não é desprezível como geometria:** tanto a barra global quanto o
`computeSplitGradient` acumulavam o valor cru, e o CSS trunca o que passa de 100% e deixa buraco no que falta.

## 3. A leitura independente da figura 8

Antes de saber que a fixture existia, li a captura de origem — `img_008`, GTO Wizard, nó BTN após BB check,
board Kd Jc Ts — e extraí:

| Ação | Frequência | Combos |
| :--- | ---: | ---: |
| Check | 2,3% | 8,38 |
| Bet 1.1 (20%) | 8,7% | 32,14 |
| Bet 2.8 (50%) | 82,5% | 306,02 |
| Bet 4.2 (75%) | 6,6% | 24,40 |
| **soma** | **100,1%** | **370,94** |

A fixture registra esse nó como `PAR_2_IP_APOS_CHECK`, com índice de figura 8 e exatamente os mesmos dígitos.
A transcrição nasceu de dupla leitura cega; esta sessão foi, sem planejar, **uma terceira leitura cega, e ela
concordou**. O painel lateral da captura confirma 370.9 combos, batendo com a soma.

## 4. O desenho, e a regra que ele respeita

O contrato de evidência é explícito: *"o validador NUNCA normaliza, redistribui ou conserta frequência;
redistribuição silenciosa é exatamente o defeito que este contrato existe para impedir"*.

**A regra não proíbe a versão melhor — proíbe que a melhora apague a diferença entre o medido e o
calculado.** A saída não é reescrever 82,5 para fechar em 100: é usar **combos**, que não são uma correção da
porcentagem, são a grandeza da qual a porcentagem foi derivada e arredondada.

`frontend/src/lib/aula12Evidence.ts` converte um cenário de evidência em ações de desenho, e **toda largura
declara sua origem**:

| Base | Quando | O que significa |
| :--- | :--- | :--- |
| `combos` | a captura expõe todos os combos | 306,02/370,94 é o fato, não normalização |
| `combos-com-inferido` | falta **um** combo e a captura declara o total | sai por subtração: aritmética sobre valores lidos |
| `frequencia` | a captura não expõe combos (o HRC não expõe) | derivação declarada, nunca silenciosa |

A frequência nunca é tocada: continua sendo o dígito da captura, inclusive quando a soma dá 100,1.
`somaDasFrequencias` existe para que o resíduo seja **exibível** em vez de escondido.

**O caminho `combos-com-inferido` nasceu de uma correção do Tier 0 em sessão.** O primeiro desenho rebaixava
o conjunto inteiro para frequência se **um** combo fosse ilegível — rigidez, porque a própria captura declara
o total e a subtração resolve. *"Não deixe a regra enrijecer quando o contexto próprio é óbvio e indica o
caminho."* Os limites da inferência são travados por teste: dois ilegíveis não saem por uma subtração só, e
total menor que a soma conhecida cai para frequência em vez de produzir combo negativo.

## 5. O que mais entrou nesta sessão

**PKO isolado por portão de superfície.** O isolamento do *cálculo* já existia e era bom — seis testes provavam
que ligar o PKO não altera saída vanilla nem entra no export HRC. Faltava o isolamento da *exposição*: o
controle era renderizado incondicionalmente, sem variável de ambiente e sem flag, de modo que uma capacidade
que o próprio código chama de "em desenvolvimento" chegava a produção. O portão vive **dentro do componente**,
não em quem o renderiza, para que todo ponto de uso futuro herde o isolamento. Falha fechado: só o valor
exato `true` habilita. `NEXT_PUBLIC_PKO_DEV` documentado no `.env.example`.

**Hipótese levantada e refutada, registrada como refutada.** A troca do guarda `!(pkoValue > 0)` por
`pkoValue <= 0`, feita no `a6d100e1`, remove a forma que tolera `NaN`. Medido: os únicos produtores são
`setPkoValue(0)`, o peso padrão e o `parseFloat` de um input do tipo `range`, que nunca devolve vazio, e o
valor não é persistido. **Não há caminho para `NaN`; a troca é segura.** Fica a observação de que a proteção
deixou de existir se a entrada mudar.

## 6. Verificação declarada

Rodou: suíte do simulador integral (**368 testes, 55 suítes, todos aprovados**), `tsc --noEmit` sem erros,
`eslint` limpo nos arquivos tocados, e contraprova por isca em dois portões — removido o gate do PKO, **7 de
13** reprovaram; removida a normalização do gradiente, **1 de 22** reprovou. Ambos restaurados e verdes.

Não rodou: OCR das outras 96 figuras, build de produção, Lighthouse e o portão de 5 fases — **nada foi
commitado nesta sessão**.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** unir a procedência da evidência canônica da Aula 1.2 à capacidade do motor bayesiano, e isolar a superfície do PKO.
