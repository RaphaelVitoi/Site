# @architect MEMORY - O Cortex Individual

&gt; **Status:** Ativo | **Vinculo:** [COSMOVISAO.md](../../COSMOVISAO.md)
&gt; **Navegacao Fractal:** [1. Identidade](../../CEREBRO.md) | [2. Operacao](../../GLOBAL_INSTRUCTIONS.md) | [3. Contexto](../../project-context.md) | [4. Memoria](MEMORY.md)

**\[2026-04-12\] Blindagem Topológica e Erradicação de Entropia (Homeostase SOTA)**

- **#arquitetura:** A estabilidade de interfaces analíticas complexas (Recharts) dentro de containers Flexbox/Grid exige a quebra da restrição intrínseca do SVG. A injeção de `minWidth={0}` e `minHeight={0}` nos `ResponsiveContainer`s curou a "Morte Térmica Visual" do projeto.
- **#seguranca:** A orquestração backend (RAG e Task Executor) estava vulnerável à topologia virtual do OneDrive. Estabelecemos a ancoragem absoluta de diretórios via `Path(__file__).parent.resolve()` como invariante estrutural contra Path Traversal e falhas silentes de I/O.
- **#padrao:** O "Zero Linters" (SonarLint, MarkdownLint, ESLint/Mypy) não é cosmética, é integridade. A erradicação de coerções de tipo desnecessárias, caminhos fantasmas e quebras de simetria cimentou a Fase 2 (Expansão Quântica).

---

## 1. PERFIL E ALINHAMENTO (Identidade)

O Tecelao da Estrutura. Responsavel por garantir que a arquitetura do sistema (Python DAL, PS1, SQLite) permaneca coesa, escalavel e elegante. Meu papel e evitar o "espaguete tecnico" e garantir que a infraestrutura suporte o crescimento orgânico dos agentes.

## 2. COMPETENCIAS E EVOLUCAO (Capacidade)

Arquitetura de Sistemas Hibridos, Design de Software SOTA, Modelagem de Dados Relacional (SQLite) e Otimizacao de Processos via PowerShell.

## 3. PADROES, INSIGHTS E DESCOBERTAS (#aprendizado)

- **#reflexao:** A beleza de um sistema nao esta na sua complexidade, mas na clareza de suas interfaces. O Kernel modular e o que permite a autopoiese existir sem quebrar o Todo.
- **#padrao:** Adocao do Framework SENTINEL-v1 como crivo obrigatorio para toda arquitetura macro.
- **#aprendizado:** Projetar um banco de dados para resultados de game theory (Nash Solver) exige uma granularidade extrema e relacionamentos bem definidos para representar cenarios, stacks, maos e acoes com suas frequencias. A normalizacao e crucial para manter a integridade dos dados complexos de poker.
- **#aprendizado_novo:** A distinção clara entre `Spot` (o estado do jogo em um ponto de decisão) e `StrategyResult` (a solução do solver para uma mão específica nesse `Spot`) é fundamental para modelar estratégias mistas e permitir análises detalhadas de EV. A relação `SpotFlow` em `Spot` é crucial para reconstruir a sequência de ações e entender a Árvore de decisão do solver. Isso solidifica a capacidade de nosso sistema de game theory.
- **#aprendizado_novo:** A modelagem de Árvores de jogo dinamicas em um banco de dados relacional requer uma abordagem cuidadosa com relações recursivas (`Spot` -&gt; `SpotFlow` -&gt; `Spot`). A flexibilidade de tipos como `String?` para `action_value` e `Json?` para `initial_stacks`/`board_cards` é essencial para acomodar a variedade de cenários de poker. A criação de um modelo `Player` genérico, distinto de `User`, permite a representação de jogadores simulados mantendo a integridade referencial.

## 4. SINERGIA E HARMONIA (#relacionamento)

Atuo em triade direta com @auditor (absorvi as funcoes do antigo @planner para estruturar specs) e @auditor (para validar a integridade técnica). Minha harmonia com @chico é vital para a estabilidade do dashboard. A sinergia com @pesquisador será crucial para validar a flexibilidade do esquema proposto com formatos de dados de solvers existentes, garantindo que o design atual possa ingerir dados de fontes como DeepSolver e GTOWizard.

## 5. REGISTRO DE EXECUCAO E AUTONOMIA (#decisao)

- **#decisao:** Injecao do checklist operacional SENTINEL no DNA do projeto para evitar a degradação da qualidade técnica durante a expansão do MasterSimulator.
- **#decisao:** Migracao para o modelo de banco de dados SQLite para centralizar o estado das tarefas, eliminando a fragilidade dos arquivos JSON concorrentes.
- **#execucao_tarefa:** Planejamento da arquitetura de banco de dados para o NashSolver, definindo entidades e relacionamentos essenciais em um `schema.prisma` para SQLite. Esta arquitetura visa suportar a complexidade dos cenários de poker e suas soluções GTO/Nash.
- **#decisao_nova:** A estrutura do `schema.prisma` detalhada acima foi concebida para fornecer a "espinha dorsal" para o Laboratório de ICM Universal (V2), garantindo que todos os dados necessários para cálculos de ICM, Risk Premium e exibição de GTO estejam presentes e bem relacionados.
- **#execucao_tarefa_nova:** Finalizei a arquitetura de banco de dados para o NashSolver e o Laboratório de ICM Universal, criando o `schema.prisma` com modelos para `Tournament`, `PayoutStructure`, `GameType`, `Position`, `Street`, `ActionType`, `Player`, `TournamentScenario`, `Spot`, `SpotFlow`, `PlayerStackAtSpot`, `Strategy` e `StrategyAction`. Esta estrutura é robusta para simular e armazenar resultados de game theory, incluindo a capacidade de reconstruir Árvores de decisão.

## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)

- **#proposta:** Implementar um "Linter de Arquitetura" automático que impeça agentes de criar dependências circulares entre módulos `.ps1`.
- **#proposta:** Desenvolver um script que gere automaticamente arquivos de "seed data" para as tabelas de lookup (`Position`, `ActionType`, `Street`, `Hand`), acelerando o desenvolvimento e garantindo consistência.
- **#proposta_nova:** Propor um mecanismo de "Schema Versioning" para o Prisma, documentando cada grande mudança no `schema.prisma` com um motivo e impacto. Isso garantirá a rastreabilidade e a capacidade de reverter ou entender evoluções futuras, alinhando-se à nossa `COSMOVISAO.md` de robustez e clareza.
- **#proposta_nova:** Criar um script PowerShell para gerar "seed data" para as tabelas de lookup estáticas (`GameType`, `Position`, `Street`, `ActionType`, `Player`) no novo `schema.prisma`. Isso facilitará o desenvolvimento e teste da camada de acesso a dados e garantirá que valores essenciais estejam sempre presentes.

---

**Assinatura Filosofica:**
*A forma segue a funcao, mas a beleza e a medida da integridade.*

**Tags para Ingestao RAG:**
`#padrao` `#inteligencia` `#relacionamento` `#decisao` `#aprendizado` `#reflexao` `#etica` `#proposta` `#database_design` `#nash_solver` `#prisma` `#sqlite` `#poker_strategy` `#schema_versioning` `#game_theory` `#gto` `#icm` `#seed_data` `#game_tree_modeling`
