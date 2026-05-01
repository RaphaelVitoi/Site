TAREFA: Produzir aula completa sobre ICM e Risk Premium aplicados a decisoes de Final Table

---

## O QUE O USUARIO QUER

Raphael Vitoi, educador de poker desde 2013 e embaixador DeepSolver e GTOWizard, quer transformar seu material tecnico ja existente ("Entendendo o ICM e suas heuristicas") em uma aula completa, didatica e estruturada, entregue como documento .md.

A aula deve funcionar como conteudo educacional autonomo: um jogador profissional de nivel intermediario deve conseguir ler do inicio ao fim e sair com dominio pratico de ICM e Risk Premium aplicados a decisoes pos-flop em Final Tables, sabendo usar ferramentas (GTO Wizard, DeepSolver) para continuar treinando sozinho.

O material original de Raphael contem conceitos proprios de alta qualidade (Toy-Games progressivos, Teto do RP, RP de ida vs volta, mesa como organismo) que formam o nucleo da aula. A pesquisa complementar identificou gaps relevantes que devem ser preenchidos com rigor: ICM pos-flop sistematizado, Downward Drift, Payout Structure com dados, heuristicas de mesa e dados quantitativos do custo de ignorar ICM.

---

## POR QUE

ICM pre-flop e pre-flop all-in ja sao bem cobertos em cursos e livros existentes. ICM pos-flop -- como o ICM afeta sizing, ranging, a decisao de bluffar, de defender, de checar premiums -- e area negligenciada onde o edge real existe para jogadores no range AVG 109-530. Raphael identificou isso em 2013 como area com potencial de edge que a maioria do mercado ainda ignora em 2026.

A aula existe para fechar esse gap: dar ao jogador intermediario o mapa completo de como ICM opera desde a mao 1, atravessa o pos-flop inteiro, e determina decisoes que a maioria esta tomando errada sem saber.

---

## COMPORTAMENTO ESPERADO

Um jogador profissional intermediario (AVG 109-530, solido em ChipEV, capaz de usar GTO Wizard) le a aula do inicio ao fim e consegue:

1. Calcular e intuir o Risk Premium de qualquer configuracao de stacks antes de agir
2. Explicar por que "fichas perdidas valem mais que fichas ganhas" e o que isso muda concretamente no pos-flop
3. Reconhecer os 8 erros mais comuns que cometia e ter correcoes concretas para cada um
4. Usar o conceito de Teto do RP para entender por que overbluffar o CL e suicidio ICM
5. Aplicar o Downward Drift (sizing drift pos-flop sob ICM) de forma consciente
6. Usar GTO Wizard ou DeepSolver para comparar spots em ChipEV vs ICM e treinar sozinho

A aula deve ter progressao didatica clara: fundamentos -> toy-games como laboratorio -> ICM pos-flop real -> variaveis contextuais -> aplicacao pratica.

---

## RESTRICOES DO USUARIO

- O material original de Raphael e a espinha dorsal da aula. Os conceitos proprios (Toy-Games progressivos, Teto do RP, RP de ida vs volta, mesa como organismo, pacto silencioso) devem ser preservados integralmente e tratados como nomenclatura oficial da aula -- nao renomear, nao diluir, nao substituir por terminologia externa.
- A voz da aula e a de Raphael Vitoi: direta, sem condescendencia, densa em conteudo, capaz de conectar matematica com intuicao sem abrir mao da precisao. Sem validacao emocional vazia. Sem elogio excessivo ao leitor.
- A matematica deve estar presente e correta, mas servir a intuicao -- o leitor deve sair entendendo o mecanismo, nao decorando formulas.
- O publico ja sabe o que e poker, ja usa solvers, ja tem conceito de EV e equity. Nao explicar o basico de poker. Nao tratar o leitor como iniciante.
- O formato de entrega e documento .md estruturado, escrito em portugues (pt-BR).
- Critica ao uso mecanico de solvers deve ser preservada -- solvers como ferramenta, nao como oraculo.
- Nao inventar hands ou exemplos nao fundamentados. Todo exemplo deve ser pedagogicamente solido e verificavel.
- Conexoes interdisciplinares (Prospect Theory, Teoria de Sistemas, Teoria dos Jogos) sao bem-vindas quando iluminam o conceito -- proibido usar analogias fracas ou decorativas.

---

## DOCUMENTACAO RELEVANTE

Os seguintes arquivos foram lidos para construcao deste prompt:

- `C:\Users\Raphael\OneDrive\Documentos\Site\docs\tasks\aula-icm-rp\pesquisa.md` -- relatorio completo de pesquisa com material local, fontes web, conceitos nao cobertos no material original, gaps identificados, conexoes interdisciplinares e estrutura proposta
- `C:\Users\Raphael\OneDrive\Documentos\Site\.claude\agents\planner.md` -- instrucoes do agente que vai receber este prompt (PRD.md e SPEC.md como entregaveis)

O material primario de Raphael (`Entendendo o ICM e suas heuristicas.docx`) nao foi lido diretamente nesta sessao -- o conteudo esta descrito em detalhe no prompt de entrada e no pesquisa.md. O @planner deve ler o arquivo original antes de escrever qualquer secao que reproduza ou derive dos toy-games.

---

## ESTRUTURA SUGERIDA DA AULA

Esta estrutura e orientacao para o @planner -- pode ser ajustada com base na investigacao, mas a progressao logica deve ser mantida.

### Modulo 1: O Problema e o Mapa
- Por que ICM importa desde a mao 1 (nao so na bubble)
- O que e Risk Premium: definicao precisa, calculo, intuicao
- RP vs Bubble Factor: relacao entre as duas metricas
- Visualizacao concreta: calculadora ICM mostrando valuations de stacks em FT tipica

### Modulo 2: Toy-Games como Laboratorio [nucleo do material original]
- Justificativa metodologica: por que toy-games sao a ferramenta certa para isolar variaveis
- Parte I: 5 toy-games com RP progressivo no OOP (RP 0 -> 24)
  - Board 22223, AA/QQ/JJ vs KK, pot 100, unica aposta 100
  - O que muda na defesa de bluffcatchers a cada incremento de RP
- Parte II: 3 toy-games com RP invertido no IP (RP alto no IP, baixo no OOP)
  - Por que OOP folda mais quando IP tem RP alto (contra-intuitivo e pedagogicamente central)
  - O que o CL perde ao perder fichas: pressao futura como ativo
- Conceitos emergentes: Teto do RP, Vantagem/Desvantagem de Risco, Pacto Silencioso, Nash sob ICM

### Modulo 3: ICM Pos-Flop -- A Fronteira
- Por que o edge real esta no pos-flop (nao mais no pre-flop)
- Downward Drift: como ICM transforma sizings e acoes ao longo das streets
- SPR e distribuicao do RP por street
- Covering advantage e seu efeito compounding
- Premium hands check-back: quando checar AA inteiro e correto
- Custo quantificado de jogar ChipEV em spots ICM (>10% buy-in, >30% em 3-bet pots)
- Exercicio guiado: como comparar ChipEV vs ICM side-by-side no GTO Wizard/DeepSolver

### Modulo 4: Variaveis Contextuais
- Payout structures: flat vs top-heavy e impacto mensuravel no RP (diferenca de 5.7% no RP medio)
- FGS vs ICM classico: quando o modelo padrao falha e o que usar
- KO/Bounty tournaments: RP positivo + equity drop negativo (como os dois interagem)
- CL dynamics: responsabilidade de pressionar vs risco de perder leverage futura

### Modulo 5: Aplicacao Pratica e Erros Comuns
- Os 10 erros mais comuns do jogador AVG 109-530 com correcoes concretas
- Heuristicas de mesa: checklist de decisao ICM pos-flop em tempo real
- Como estruturar sessoes de estudo solo com solvers para treinar ICM pos-flop
- Conexoes interdisciplinares como lente interpretativa:
  - Prospect Theory: loss aversion como espelho psicologico da matematica do ICM
  - Teoria de Sistemas: mesa como organismo, propriedades emergentes, feedback loops
  - Teoria dos Jogos: Nash sob restricoes de utilidade nao-linear

---

## ELEMENTOS DIFERENCIADORES (o que torna esta aula unica)

1. **Metodologia de toy-games**: isolamento de variaveis para construir intuicao antes de aplicar a situacoes reais -- diferencial metodologico de Raphael
2. **Conceitos proprios nomeados**: Teto do RP, RP de ida vs volta -- nomenclatura clara e propria que o mercado nao usa
3. **ICM pos-flop como tese central**: a maioria do conteudo existente trata ICM como fenomeno pre-flop. Esta aula trata ICM pos-flop como o edge inexplorado real
4. **Critica fundamentada aos solvers**: solvers como mapa, nao como territorio -- posicao que diferencia o conteudo de tutoriais de ferramentas
5. **Conexoes interdisciplinares reais**: Prospect Theory, Teoria de Sistemas e Teoria dos Jogos usadas como lentes interpretativas, nao como ornamento

---

## TOM E ESTILO

Voz de Raphael Vitoi: alta densidade de conteudo, linguagem direta, disposicao para contra-intuitividade, zero tolerancia a simplificacoes que distorcem. O leitor e tratado como profissional capaz -- a aula exige esforco e oferece profundidade em troca.

Nao didatismo condescendente. Nao analogias fracas. Nao conclusoes que o leitor "deveria" tirar sem a argumentacao que as sustenta.

Exemplos concretos quando necessario. Matematica quando ilumina. Analogias apenas quando encurtam o caminho sem distorcer o mapa.

---

## CRITERIOS DE SUCESSO

- [ ] A aula cobre os 5 modulos na ordem proposta com progressao logica verificavel
- [ ] Os 8 toy-games do material original estao reproduzidos corretamente com analise completa
- [ ] Os conceitos proprios de Raphael (Teto do RP, RP de ida vs volta, mesa como organismo, pacto silencioso) estao presentes e nomeados com a terminologia original
- [ ] ICM pos-flop e tratado como secao central, nao como apendice
- [ ] O Downward Drift esta explicado com exemplo concreto (sizing de c-bet sob ICM vs ChipEV)
- [ ] O dado quantitativo do custo de jogar ChipEV (>10% buy-in) esta presente e contextualizado
- [ ] Os 10 erros comuns do publico-alvo estao listados com correcao concreta para cada um
- [ ] O checklist de decisao ICM pos-flop em tempo real esta incluido e e aplicavel sem solver
- [ ] Conexoes interdisciplinares (Prospect Theory, Teoria de Sistemas) estao presentes e nao sao decorativas
- [ ] A critica ao uso mecanico de solvers esta presente e fundamentada
- [ ] O documento e escrito em portugues (pt-BR) e entregue como .md estruturado
- [ ] Um jogador intermediario consegue usar a aula para treinar sozinho com GTO Wizard ou DeepSolver
