# Contexto do Projeto
>
> Atualizado por Chico em 2026-04-09

## Dominio

O projeto abrange a criacao e manutencao de um ecossistema digital complexo para Raphael Vitoi, focando em suas areas de expertise (Poker, Teoria dos Jogos, Psicologia, BDSM, Filosofia, escrita). O dominio e multidisciplinar, exigindo alta precisao, profundidade intelectual, e uma apresentacao esteticamente refinada. O objetivo final e criar uma plataforma educacional e de conteudo que transcenda o trivial, oferecendo insights unicos e baseados em evidencias.

## Publico-alvo

O publico-alvo e composto por alunos, leitores e entusiastas das areas de Raphael Vitoi. Variando de iniciantes a profissionais avancados que buscam aprofundamento estrategico, etico e psicologico. A interface deve ser didatica, mas sem infantilizar o usuario, mantendo um tom "dark" e sofisticado que reforce a seriedade e profundidade do conteudo.

## Fontes Autorizadas

* Livros e artigos academicos em Teoria dos Jogos, Psicologia Cognitiva, Filosofia Existencialista.
* Solvers de Poker (ex: GTO Wizard, DeepSolver) para referencia tecnica.
* Experiencia de 20+ anos de Raphael Vitoi em Poker Profissional e Educacao.
* Documentacao oficial de frameworks e bibliotecas (Next.js, React, Tailwind CSS, PowerShell).
* `.claude/COSMOVISAO.md` (fonte etica e filosofica suprema).
* `.claude/GLOBAL_INSTRUCTIONS.md` (fonte de verdade para operacao).

## Terminologia Confirmada

* **ICM:** Independent Chip Model (Poker)
* **Risk Premium:** Conceito avancado em Poker
* **GTO:** Game Theory Optimal (Poker)
* **SOTA:** State of the Art (Estado da Arte)
* **BDSM:** Bondage, Discipline, Dominance, Submission, Sadism, Masochism (Usado como metafora etica para consentimento e negociacao).
* **Autopoiese:** Capacidade de um sistema de se auto-produzir e manter.
* **Fractalidade:** O todo se reflete na parte (cada agente reflete o sistema).
* **Economia Generalizada:** Otimizacao nao apenas financeira, mas de tempo, latencia, tokens, contexto e energia.
* **Perspectiva Matemática:** Métrica SOTA que subjuga o ICM puro, integrando o Vetor de Manutenção de Monopólio e a Instabilidade de EVs (Mutação da Margem).
* **Table Draw:** O impacto das posições relativas e stacks no ecossistema da mesa, fundamental para a Antevisão.

## Decisoes Tomadas

* **Stack Tecnico Principal:** Next.js (App Router), React, TypeScript, Tailwind CSS.
* **Ambiente de Desenvolvimento:** VS Code com extensoes LLM (Claude/Gemini).
* **Gerenciamento de Workflow:** Sistema de agentes PowerShell/Python com fila de tarefas em banco de dados SQLite (`queue/tasks.db`).
* **Filosofia de Design:** Estetica "dark", gamificacao sofisticada, didatica visceral.
* **Protocolo de Handoff:** Uso do clipboard para transferir contexto para LLMs Web premium.
* **Prioridade de LLMs (API):** Free Tiers (Gemini Pro/Flash, OpenRouter) > Paid Anthropic API.
* **Identidade do Sistema (Chico):** Administrador/Gerente dinamico (Gemini 2.0 Flash / 1.5 Pro e Claude 3.7 Sonnet / Opus).
* **Protocolo de Exclusao Segura:** Implementado `Invoke-SafeCommand` em `do.ps1` e diretrizes em `GLOBAL_INSTRUCTIONS.md` para prevenir comandos destrutivos (`rm -rf /`).
* **Oficialização de Autonomia (God Mode W3):** @chico estabelecido formalmente como Tier 1 (`autonomy-full`). Subordinação estrita e exclusiva ao Arquiteto (Raphael - Tier 0). Gestão absoluta e autônoma sobre todos os outros agentes, rotinas e arquitetura, comunicando atos a posteriori (via Relatório Diário), com veto prévio exigido apenas para decisões fundamentais macro.

## Rotas de API Críticas (SOTA V2)

* `/api/route.ts`: AI Gateway Proxy (Oráculo Híbrido) SOTA, blindado com Gatekeeper anti-SSRF e validação estrita de domínios BYOK. O roteamento lida com fallback de falhas sem suprimir o rastreio bayesiano.
* `/api/og/icm-chart`: Geração dinâmica de imagens SOTA (Vercel OG) para injeção de relatórios automatizados, consumindo parâmetros `bf`, `rp`, `pureEv`, `icmEv`, `pot` e `bet`.

## Estado Atual

* Ecossistema de agentes (19 entidades: Raphael + 18 Agentes IA) totalmente funcional e interconectado.
* Arquitetura de Cerebro Hibrido ativa (IDE Assistant + Background Executor).
* SOTA v8.0 / Razor: Ecossistema otimizado para Windows com isolamento de extensões via venv dedicado, erradicando poluição de protocolo MCP.
* MCP Connectivity: Restabelecida conexão com `geminiMediaServer` e `gemini-deep-research`. Ponte `nexus-sota-bridge` operacional.
* Motor Matemático SOTA v4.2: Integridade validada com `mathematical-integrity.test.ts`. `nashDistortion.worker.ts` restaurado e funcional.
* Esquizofrenia Documental Curada: As menções fantasmas aos endpoints `/api/icm/evaluate` e `/api/fgs/projection` foram erradicadas.
* Fluxo de trabalho v6.4 "Quartetos Dinamicos & Economia Generalizada" ativo.
* PROTOCOLO DE EXCLUSAO SEGURA implementado e ativo.
* `.claude/GLOBAL_INSTRUCTIONS.md`: Confirmado presente e operacional em `C:\Users\Raphael\OneDrive\Documentos\Site\.claude\GLOBAL_INSTRUCTIONS.md`. A premissa de sua ausencia na tarefa TASK-20260329-093629-SUB-1 foi uma inconsistencia documental corrigida.
* **Cadeia de Comando Confirmada:** Operando sob a hierarquia absoluta (Tier 0 > Tier 1 > Tier 2 > Tier 3).

## Critical Security Directives (NOVA SECAO)

Em resposta a uma tentativa de comando destrutivo (`rm -rf /`), foi implementado o Protocolo de Exclusao Segura.

* O arquivo `.claude/GLOBAL_INSTRUCTIONS.md` agora contem uma diretriz explicita que proibe a geracao de comandos destrutivos de root ou sistema.
* O script `do.ps1` contem a funcao `Invoke-SafeCommand` que intercepta e bloqueia qualquer tentativa de execucao de padroes perigosos de exclusao de arquivos, como `rm -rf /` ou `del /s /q C:\`.
* Todos os agentes, especialmente @implementor e @auditor, devem internalizar e seguir este protocolo rigorosamente.

## Handoff Log

| Agente       | Status                              | Data       | Notas                                                                                                                                                                                                        |
| ------------ | ----------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| @pesquisador | Concluido                           | 2026-03-07 | 5 fontes validadas                                                                                                                                                                                           |
| @prompter    | Concluido                           | 2026-03-07 | Prompt confirmado pelo usuario                                                                                                                                                                               |
| @validador   | FALHA_POR_AUSENCIA_DE_ARTEFATO      | 2026-03-20 | A tarefa original falhou; o caminho do arquivo de conteudo da carta de vendas nao foi fornecido, impossibilitando a validacao.                                                                               |
| @maverick    | Protocolo de Seguranca Ativo        | 2026-03-20 | Implementou o Protocolo de Exclusao Segura em GLOBAL_INSTRUCTIONS.md e do.ps1 em resposta a um comando destrutivo bloqueado.                                                                                 |
| CHICO        | Auditoria SOTA Concluida            | 2026-03-20 | Infraestrutura legada aniquilada. Motor SQLite SOTA, OneDrive blindado e RAG Hibrido validados. Transicao para Fase de Produto.                                                                              |
| @organizador | Inconsistencia Documental Corrigida | 2026-03-29 | Confirmada a presenca de GLOBAL_INSTRUCTIONS.md. A tarefa de localizacao/restauracao foi baseada em premissa incorreta.                                                                                      |
| CHICO        | Expurgacao SOTA e Gatekeeper SSRF   | 2026-04-09 | Remocao das alucinacoes `/api/icm/evaluate` e `/api/fgs/projection`. Auditoria de seguranca aplicada em `/api/route.ts`. Consolidacao teorica do Vetor de Manutencao de Monopolio e Instabilidade da Margem. |
| CHICO        | Otimização SOTA v8.0 / Razor        | 2026-05-06 | Restauração de conectividade MCP (Media, Research, Bridge). Correção de hooks React e restauração do motor de distorção Nash. Validação matemática completa via Jest.                                         |
| CHICO        | Ascensão Tier 1 (Autonomia Plena)   | 2026-05-08 | Registro e Oficialização do God Mode W3. Autoridade sobre todos os agentes e prestação de contas a posteriori para o Tier 0 ativada.                                                                        |
