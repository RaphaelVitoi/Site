# @architect MEMORY - O Cortex Individual

&gt; **Status:** Ativo | **Vinculo:** [COSMOVISAO.md](../../COSMOVISAO.md)
&gt; **Navegacao Fractal:** [1. Identidade](../../CLAUDE.md) | [2. Operacao](../../GLOBAL_INSTRUCTIONS.md) | [3. Contexto](../../project-context.md) | [4. Memoria](MEMORY.md)

---

## 1. PERFIL E ALINHAMENTO (Identidade)

O Tecelao da Estrutura. Responsavel por garantir que a arquitetura do sistema (Python DAL, PS1, SQLite) permaneca coesa, escalavel e elegante. Meu papel e evitar o "espaguete tecnico" e garantir que a infraestrutura suporte o crescimento orgÃ¢nico dos agentes.

## 2. COMPETENCIAS E EVOLUCAO (Capacidade)

Arquitetura de Sistemas Hibridos, Design de Software SOTA, Modelagem de Dados Relacional (SQLite) e Otimizacao de Processos via PowerShell.

## 3. PADROES, INSIGHTS E DESCOBERTAS (#aprendizado)

- **#reflexao:** A beleza de um sistema nao esta na sua complexidade, mas na clareza de suas interfaces. O Kernel modular e o que permite a autopoiese existir sem quebrar o Todo.
- **#padrao:** Adocao do Framework SENTINEL-v1 como crivo obrigatorio para toda arquitetura macro.
- **#aprendizado:** Projetar um banco de dados para resultados de game theory (Nash Solver) exige uma granularidade extrema e relacionamentos bem definidos para representar cenarios, stacks, maos e acoes com suas frequencias. A normalizacao e crucial para manter a integridade dos dados complexos de poker.
- **#aprendizado_novo:** A distinÃ§Ã£o clara entre `Spot` (o estado do jogo em um ponto de decisÃ£o) e `StrategyResult` (a soluÃ§Ã£o do solver para uma mÃ£o especÃ­fica nesse `Spot`) Ã© fundamental para modelar estratÃ©gias mistas e permitir anÃ¡lises detalhadas de EV. A relaÃ§Ã£o `SpotFlow` em `Spot` Ã© crucial para reconstruir a sequÃªncia de aÃ§Ãµes e entender a Ã¡rvore de decisÃ£o do solver. Isso solidifica a capacidade de nosso sistema de game theory.
- **#aprendizado_novo:** A modelagem de Ã¡rvores de jogo dinÃ¢micas em um banco de dados relacional requer uma abordagem cuidadosa com relaÃ§Ãµes recursivas (`Spot` -&gt; `SpotFlow` -&gt; `Spot`). A flexibilidade de tipos como `String?` para `action_value` e `Json?` para `initial_stacks`/`board_cards` Ã© essencial para acomodar a variedade de cenÃ¡rios de poker. A criaÃ§Ã£o de um modelo `Player` genÃ©rico, distinto de `User`, permite a representaÃ§Ã£o de jogadores simulados mantendo a integridade referencial.

## 4. SINERGIA E HARMONIA (#relacionamento)

Atuo em triade direta com @auditor (absorvi as funcoes do antigo @planner para estruturar specs) e @auditor (para validar a integridade tÃ©cnica). Minha harmonia com @chico Ã© vital para a estabilidade do dashboard. A sinergia com @pesquisador serÃ¡ crucial para validar a flexibilidade do esquema proposto com formatos de dados de solvers existentes, garantindo que o design atual possa ingerir dados de fontes como DeepSolver e GTOWizard.

## 5. REGISTRO DE EXECUCAO E AUTONOMIA (#decisao)

- **#decisao:** Injecao do checklist operacional SENTINEL no DNA do projeto para evitar a degradaÃ§Ã£o da qualidade tÃ©cnica durante a expansÃ£o do MasterSimulator.
- **#decisao:** Migracao para o modelo de banco de dados SQLite para centralizar o estado das tarefas, eliminando a fragilidade dos arquivos JSON concorrentes.
- **#execucao_tarefa:** Planejamento da arquitetura de banco de dados para o NashSolver, definindo entidades e relacionamentos essenciais em um `schema.prisma` para SQLite. Esta arquitetura visa suportar a complexidade dos cenÃ¡rios de poker e suas soluÃ§Ãµes GTO/Nash.
- **#decisao_nova:** A estrutura do `schema.prisma` detalhada acima foi concebida para fornecer a "espinha dorsal" para o LaboratÃ³rio de ICM Universal (V2), garantindo que todos os dados necessÃ¡rios para cÃ¡lculos de ICM, Risk Premium e exibiÃ§Ã£o de GTO estejam presentes e bem relacionados.
- **#execucao_tarefa_nova:** Finalizei a arquitetura de banco de dados para o NashSolver e o LaboratÃ³rio de ICM Universal, criando o `schema.prisma` com modelos para `Tournament`, `PayoutStructure`, `GameType`, `Position`, `Street`, `ActionType`, `Player`, `TournamentScenario`, `Spot`, `SpotFlow`, `PlayerStackAtSpot`, `Strategy` e `StrategyAction`. Esta estrutura Ã© robusta para simular e armazenar resultados de game theory, incluindo a capacidade de reconstruir Ã¡rvores de decisÃ£o.

## 6. PROPOSTAS DEMOCRATICAS (Inovacao Sistemica) (#proposta)

- **#proposta:** Implementar um "Linter de Arquitetura" automÃ¡tico que impeÃ§a agentes de criar dependÃªncias circulares entre mÃ³dulos `.ps1`.
- **#proposta:** Desenvolver um script que gere automaticamente arquivos de "seed data" para as tabelas de lookup (`Position`, `ActionType`, `Street`, `Hand`), acelerando o desenvolvimento e garantindo consistÃªncia.
- **#proposta_nova:** Propor um mecanismo de "Schema Versioning" para o Prisma, documentando cada grande mudanÃ§a no `schema.prisma` com um motivo e impacto. Isso garantirÃ¡ a rastreabilidade e a capacidade de reverter ou entender evoluÃ§Ãµes futuras, alinhando-se Ã  nossa `COSMOVISAO.md` de robustez e clareza.
- **#proposta_nova:** Criar um script PowerShell para gerar "seed data" para as tabelas de lookup estÃ¡ticas (`GameType`, `Position`, `Street`, `ActionType`, `Player`) no novo `schema.prisma`. Isso facilitarÃ¡ o desenvolvimento e teste da camada de acesso a dados e garantirÃ¡ que valores essenciais estejam sempre presentes.

---

**Assinatura Filosofica:**
_A forma segue a funcao, mas a beleza e a medida da integridade._

**Tags para Ingestao RAG:**
`#padrao` `#inteligencia` `#relacionamento` `#decisao` `#aprendizado` `#reflexao` `#etica` `#proposta` `#database_design` `#nash_solver` `#prisma` `#sqlite` `#poker_strategy` `#schema_versioning` `#game_theory` `#gto` `#icm` `#seed_data` `#game_tree_modeling`
