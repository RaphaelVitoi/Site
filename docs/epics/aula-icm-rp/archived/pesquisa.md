# Relatorio de Pesquisa: Aula ICM e Risk Premium em Final Tables

**Autor da aula:** Raphael Vitoi
**Publico-alvo:** Jogadores profissionais intermediarios (AVG 109-530)
**Data da pesquisa:** 2026-03-08

---

## 1. Materiais Locais Encontrados

### 1.1 Material Primario
- **Entendendo o ICM e suas heuristicas** (`C:\Users\Raphael\Downloads\Entendendo o ICM e suas heuristicas.docx`)
  - Documento completo de Raphael Vitoi
  - Conteudo: Toy-games progressivos (ChipEV -> RP crescente), conceito de Teto do RP, inversao de RP, simulacoes ICM com calculadora, analise de valuations
  - Estrutura: Parte I (5 toy-games com RP crescente no OOP) + Parte II (3 toy-games com RP invertido no IP)
  - Copia identica em `C:\Users\Raphael\Bodog.com Poker\Desktop\Entendendo o ICM e suas heuristicas (1).docx`

### 1.2 Materiais Complementares
- **deepsolver.docx** (`C:\Users\Raphael\OneDrive\Documentos\deepsolver.docx`)
  - Tutorial transcrito do DeepSolver (Smart Tree, nodelocking, estrategias GTO)
  - Relevancia: demonstra ferramentas de solver que complementam o estudo de ICM pos-flop

- **Selouan - ICM.docx.url** (`C:\Users\Raphael\OneDrive\Documentos\Selouan - ICM.docx.url`)
  - Link para OneDrive com material do Selouan sobre ICM (inacessivel diretamente)

### 1.3 Materiais de Contexto (Bodog Desktop)
- Prints de fases de torneio (FT KO, FT Vanilla, Semi Final, Bubble, ITM, EG) - uteis como referencia visual
- Documentacao Virtus Aurora - plataforma educativa de poker de Raphael

---

## 2. Fontes Web Relevantes

### 2.1 GTO Wizard (Raphael e embaixador)

**How ICM Impacts Postflop Strategy**
- URL: https://blog.gtowizard.com/how-icm-impacts-postflop-strategy/
- Conceitos-chave extraidos:
  - **Downward Drift**: "Big bets become small bets, small bets become checks/calls, checks/calls become folds"
  - **Low-Variance Line Selection**: solvers priorizam pot-building via sizings menores e mais seguros
  - Exemplo concreto: A8s3r flop, BTN 40BB vs BB 70BB - ChipEV c-bet 100% mixed sizes vs ICM c-bet 100% quase exclusivamente small sizing
  - BB covering player: menos folds, mais calls, 12% check-raise (vs 10% em ChipEV)
  - **Covering Advantage Compounding**: leverage de decisao em multiple streets

**How ICM Quietly Shapes Postflop Strategy From the Start**
- URL: https://blog.gtowizard.com/how-icm-quietly-shapes-postflop-strategy-from-the-start/
- ICM afeta desde a primeira mao: 200-runner MTT tem RP de ~1.8% desde o inicio
- Efeitos sao "silenciosos" mas pervasivos - acumulam-se em small adjustments
- Preflop: ajustes minimos. Postflop: divergencia mensuravel quando agregado

**How Payout Structures Reshape Postflop Strategy**
- URL: https://blog.gtowizard.com/how-payout-structures-reshape-postflop-strategy/
- Diferenca de 5.7% no RP medio entre extremos do espectro de payout
- **Flat structures**: RP alto, jogo conservador, ladder climbing valioso
- **Top-heavy**: RP baixo, mais agressividade permitida
- BB leads em flat structures predominam em boards pareados (maos fortes sao muito mais fortes)

**Mastering Postflop ICM: Avoid These Common Mistakes**
- URL: https://blog.gtowizard.com/mastering-postflop-icm-avoid-these-common-mistakes/
- Erro #1: nao comparar ICM vs ChipEV como baseline
- Erro #2: ignorar ajustes de sizing (ICM reduz agressividade ~12%)
- Erro #3: tratar premium hands igual - no bubble, UTG checa AA inteiro (vs bet em ChipEV)
- Erro #4: nao considerar incentivos de sobrevivencia
- Erro #5: analisar spots isolados sem contexto de stack configuration

**Theoretical Breakthroughs in ICM**
- URL: https://blog.gtowizard.com/theoretical-breakthroughs-in-icm/
- CSTE (Chip-Scaled Tournament Equity): metrica normalizada para comparacoes cross-format
- Jogar ChipEV contra oponentes ICM-aware: perda > 10% do buy-in em bubble/FT, escalando para 30% em 3-bet pots
- Novo metodo de calculo ICM com margem de erro < 0.0000003%

**When Does ICM Become Significant in MTTs?**
- URL: https://blog.gtowizard.com/when-does-icm-become-significant-in-mtts/

**ICM Basics**
- URL: https://blog.gtowizard.com/icm-basics/

### 2.2 Dara O'Kearney e Barry Carter

**Endgame Poker Strategy: The ICM Book**
- Primeiro livro a fazer deep dive em ICM aplicado a torneios
- Evolucao de Bubble Factor para Risk Premium como metrica mais intuitiva
- Capitulo final sobre ICM pos-flop reconhece que o tema merece um livro inteiro

**Postflop ICM Simplified (Curso)**
- URL: https://simplifypoker.com/courses/post-flop-icm-simplified/
- Curso dedicado exclusivamente a ICM pos-flop
- Lancado apos GTO Wizard disponibilizar ICM postflop solving em 2024

**Understanding Risk Premium (size matters)**
- URL: https://www.poker.org/poker-strategy/dara-okearney-understanding-risk-premium-size-matters-aPFY60b5iBDG/
- RP como equity extra necessaria alem do pot odds para justificar call de all-in
- Stack size effects: big stack RP baixo, short stack RP baixo (exceto bubble), medium stack RP alto

### 2.3 Outras Fontes Relevantes

**Bubble Factor (GTO Wizard)**
- URL: https://blog.gtowizard.com/what-is-the-bubble-factor-in-poker-tournaments/
- Bubble Factor e Risk Premium medem a mesma coisa com calculos diferentes
- RP e mais simples de internalizar e aplicar em tempo real

**FGS - Future Game Simulation**
- URL: https://www.icmizer.com/en/blog/how-fgs-future-game-simulation-calculator-works/
- FGS supera limitacoes do ICM: considera blinds futuros, posicoes na mesa
- Tratamento do torneio como campanha de guerra evolving
- Ferramentas: ICMIZER 3, HRC, GTO Wizard

**Vectors of Pressure: A Geometric Model of Bubble Play**
- URL: https://www.poker.pro/strategy/vectors-of-pressure-a-geometric-model-of-bubble-play/
- Modelo geometrico da pressao de bubble

**5 ICM Tips to Crush Poker Tournaments in 2026**
- URL: https://www.pokernews.com/strategy/crush-poker-tournaments-this-year-with-these-5-icm-tips-46532.htm

**Post-Flop All-Ins: When to Shove the Flop Under ICM Pressure**
- URL: https://www.pokernews.com/strategy/post-flop-all-ins-when-to-shove-the-flop-under-icm-pressure-49000.htm

### 2.4 Conexoes Interdisciplinares

**Prospect Theory e Loss Aversion no Poker**
- Kahneman & Tversky (1979): decisoes sob incerteza priorizam evitar perdas sobre ganhos equivalentes
- Paper de Duke University: "Common Ratio Effect and Ambiguity Aversion in Poker" - fatores alem de EV, pot odds e equity alteram percepcao de decisoes
- Tese de Princeton: "The Economics of Uncertainty: Prospect Theory in Practice at the Poker Table" - jogadores exibem loss aversion; jogadores perdendo sao mais risk-seeking (break-even effect)
- **Conexao direta com ICM**: a assimetria "fichas perdidas valem mais que fichas ganhas" e uma manifestacao matematica da loss aversion no dominio do poker

---

## 3. Conceitos-Chave Adicionais (Nao Cobertos no Material Original)

### 3.1 Conceitos Teoricos
1. **CSTE (Chip-Scaled Tournament Equity)** - metrica normalizada para comparar exploitability entre formatos
2. **Downward Drift** - heuristica de GTO Wizard: big bets -> small bets -> checks -> folds
3. **ICM desde a mao 1** - RP de ~1.8% em 200-runner MTT desde o inicio, nao so na bubble/FT
4. **Custo mensuravel de jogar ChipEV em spots ICM**: >10% buy-in em bubble/FT, >30% em 3-bet pots
5. **FGS vs ICM** - FGS como evolucao que corrige limitacoes do ICM (blinds futuros, posicao)

### 3.2 Heuristicas Praticas para Aplicacao em Tempo Real
1. **RP de ida vs RP de volta** (ja coberto no material original - conceito proprio de Raphael)
2. **Teto do RP** (ja coberto - conceito proprio de Raphael)
3. **Sizing Drift**: reduzir sizings em ~12-15% sob ICM vs ChipEV
4. **Premium Hands Check-back**: em high-pressure spots, checar premium hands inteiras (AA no bubble)
5. **Stack Coverage Assessment**: antes de cada decisao pos-flop, avaliar quem cobre quem
6. **Medium Stack Trap**: stacks medios tem RP mais alto e sao os mais vulneraveis

### 3.3 Erros Comuns do Publico-Alvo (AVG 109-530)
1. Treinar pos-flop exclusivamente com ChipEV (ignorando ICM pos-flop)
2. Aplicar ICM apenas pre-flop e em decisoes all-in
3. Usar sizing de cash game em FTs
4. Nao considerar stack configurations da mesa inteira
5. "ICM suicide" - tightar demais horas antes da bubble real
6. Overbluffar o chip leader coberto (nao entender Teto do RP)
7. Ignorar a influencia de payout structure no RP
8. Nao ajustar para bounty/KO tournaments (RP positivo + equity drop negativo)
9. Interpretar "fichas perdidas valem mais" literalmente demais (CL parando de jogar)
10. Nao entender que eventos entre 2 jogadores afetam valuations de TODOS

---

## 4. Sugestoes de Estrutura e Angulos para a Aula

### 4.1 Estrutura Proposta (Progressao Didatica)

**Modulo 1: Fundamentos (30-40min)**
- O que e ICM e por que importa desde a mao 1
- Risk Premium: definicao, calculo, intuicao
- RP vs Bubble Factor: por que RP e mais pratico
- Demonstracao com calculadora ICM: valuations de stacks

**Modulo 2: Toy-Games Classicos (40-50min)** [material original de Raphael]
- Parte I: RP progressivo no OOP (5 cenarios)
- Parte II: RP invertido no IP (3 cenarios)
- Conceitos emergentes: Teto do RP, Vantagem/Desvantagem de Risco
- "Pacto silencioso" e Equilibrio de Nash sob ICM

**Modulo 3: ICM Pos-Flop - A Fronteira (40-50min)** [conteudo novo]
- Downward Drift: como ICM transforma sizings e acoes
- SPR e distribuicao do RP ao longo das streets
- Ranges condensados vs lineares/polarizados sob pressao
- Covering advantage e seu efeito compounding
- Exercicios com GTO Wizard: comparacao ChipEV vs ICM side-by-side

**Modulo 4: Variaveis Contextuais (20-30min)**
- Payout structures: top-heavy vs flat e seus efeitos no RP
- FGS vs ICM: quando o ICM classico falha
- KO/Bounty: RP positivo + equity drop negativo
- CL dynamics: responsabilidade de pressionar vs risco de perder leverage

**Modulo 5: Aplicacao Pratica e Erros Comuns (20-30min)**
- Top 10 erros de jogadores AVG 109-530
- Heuristicas de mesa: checklist de decisao ICM pos-flop
- Framework de "Antevisao" (conceito original de Raphael)
- Exercicios para treino solo com solvers

### 4.2 Angulos Diferenciadores
1. **Interdisciplinaridade**: conectar ICM com Prospect Theory (loss aversion como mecanismo psicologico que espelha a matematica do ICM)
2. **Toy-games como laboratorio**: metodologia propria de Raphael que isola variaveis
3. **ICM pos-flop como edge inexplorado**: tese central de que o edge esta no pos-flop, nao mais no pre-flop
4. **Critica aos solvers**: solvers como equacao estrategica, nao como resposta final
5. **Mesa como organismo**: conceito sistemico onde cada stack influencia todos os outros

---

## 5. Gaps Identificados no Material Original

### 5.1 Gaps a Preencher
1. **Ausencia de exemplos reais de FT**: toy-games sao excelentes para isolar conceitos, mas faltam hands reais de FTs mostrando ICM em acao
2. **Payout structure nao explorado**: o material menciona top-heavy vs flat mas nao aprofunda com dados
3. **FGS nao mencionado**: nenhuma referencia a Future Game Simulation como evolucao do ICM
4. **Bounty/KO nao abordado**: nenhuma mencao ao impacto de bounties no RP
5. **Heuristicas de aplicacao em tempo real**: faltam regras praticas tipo "checklist de mesa"
6. **ICM multi-way pos-flop**: toy-games sao HU; situacoes 3+ jogadores pos-flop nao exploradas
7. **Sizing strategy pos-flop sob ICM**: o Downward Drift nao e nomeado ou sistematizado
8. **Exercicios praticos com ferramentas**: nao ha guia de como usar GTO Wizard/DeepSolver para treinar ICM pos-flop
9. **Dados quantitativos do custo de ignorar ICM**: o dado de >10% buy-in de perda nao aparece

### 5.2 Elementos que o Material Original Faz Excepcionalmente Bem
1. Progressao didatica dos toy-games (escalonamento de RP)
2. Conceito de "Teto do RP" - original e poderoso
3. "RP de ida" vs "RP de volta" - nomenclatura propria clara
4. Inversao do RP (Parte II) - contra-intuitividade como ferramenta pedagogica
5. Analise de valuations com calculadora - visual e concreto
6. Conceito de "mesa como organismo" - pensamento sistemico
7. "Pacto silencioso" e Nash como consequencia natural
8. Critica fundamentada aos solvers como ferramenta limitada

---

## 6. Conexoes Interdisciplinares Relevantes

### 6.1 Teoria dos Jogos
- **Nash Equilibrium sob restricoes**: ICM como caso especial de jogos com utilidade nao-linear (fichas nao tem utilidade linear como em cash games)
- **Jogos de soma nao-zero**: FT como jogo onde a soma dos EVs movedicos e redistribuida, nao criada/destruida
- **Mecanismo de compromisso (commitment device)**: o "Teto do RP" funciona como um commitment device natural - o jogador nao pode se comprometer a pagar alem do teto

### 6.2 Behavioral Economics
- **Prospect Theory (Kahneman & Tversky)**: a funcao valor assimetrica (perdas pesam ~2x mais que ganhos equivalentes) e isomorfica a regra "fichas perdidas valem mais que fichas ganhas"
- **Framing Effect**: jogadores que pensam em "fichas" vs "dinheiro" tomam decisoes diferentes; ICM forca o frame correto
- **Sunk Cost Fallacy**: jogadores que ja investiram muito no torneio tendem a tightar excessivamente (ICM suicide)
- **Endowment Effect**: jogadores supervalorizam seu stack atual vs o valor real ICM

### 6.3 Teoria de Sistemas
- **Emergencia**: o RP medio da mesa e uma propriedade emergente da configuracao de stacks - nao e redutivel a nenhum stack individual
- **Feedback loops**: CL pressiona -> stacks medios tightam -> CL acumula mais -> pressao aumenta (loop positivo)
- **Equilibrio dinamico**: a mesa busca um equilibrio onde cada jogador maximiza seu EV dentro das restricoes dos demais

### 6.4 Analogias Iluminadoras
- **Ecossistema predador-presa**: CL como predador apex, short stacks como presas, medium stacks como especies intermediarias que evitam conflito
- **Termodinamica**: fichas em torneio como energia - conservada no total mas com "entropia" crescente (concentracao progressiva)
- **Teoria da utilidade marginal decrescente**: cada ficha adicional vale menos (exatamente o mecanismo do ICM)
