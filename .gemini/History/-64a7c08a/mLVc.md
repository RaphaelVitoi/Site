# Contexto do Projeto

> Atualizado por @maverick em 2026-03-20

## Dominio

O projeto abrange a criação e manutenção de um ecossistema digital complexo para Raphael Vitoi, focando em suas áreas de expertise (Poker, Teoria dos Jogos, Psicologia, BDSM, Filosofia, escrita). O domínio é multidisciplinar, exigindo alta precisão, profundidade intelectual, e uma apresentação esteticamente refinada. O objetivo final é criar uma plataforma educacional e de conteúdo que transcenda o trivial, oferecendo insights únicos e baseados em evidências.

## Publico-alvo

O publico-alvo e composto por alunos, leitores e entusiastas das areas de Raphael Vitoi. Variando de iniciantes a profissionais avancados que buscam aprofundamento estrategico, etico e psicologico. A interface deve ser didatica, mas sem infantilizar o usuario, mantendo um tom "dark" e sofisticado que reforce a seriedade e profundidade do conteudo.

## Fontes Autorizadas

- Livros e artigos academicos em Teoria dos Jogos, Psicologia Cognitiva, Filosofia Existencialista.
- Solvers de Poker (ex: GTO Wizard, DeepSolver) para referencia tecnica.
- Experiencia de 20+ anos de Raphael Vitoi em Poker Profissional e Educacao.
- Documentacao oficial de frameworks e bibliotecas (Next.js, React, Tailwind CSS, PowerShell).
- `.claude/COSMOVISAO.md` (fonte etica e filosofica suprema).
- `GLOBAL_INSTRUCTIONS.md` (fonte de verdade para operacao).

## Terminologia Confirmada

- **ICM:** Independent Chip Model (Poker)
- **Risk Premium:** Conceito avancado em Poker
- **GTO:** Game Theory Optimal (Poker)
- **SOTA:** State of the Art (Estado da Arte)
- **BDSM:** Bondage, Discipline, Dominance, Submission, Sadism, Masochism (Usado como metafora etica para consentimento e negociacao).
- **Autopoiese:** Capacidade de um sistema de se auto-produzir e manter.
- **Fractalidade:** O todo se reflete na parte (cada agente reflete o sistema).
- **Economia Generalizada:** Otimizacao nao apenas financeira, mas de tempo, latencia, tokens, contexto e energia.

## Decisoes Tomadas

- **Stack Tecnico Principal:** Next.js (App Router), React, TypeScript, Tailwind CSS.
- **Ambiente de Desenvolvimento:** VS Code com extensões LLM (Claude/Gemini).
- **Gerenciamento de Workflow:** Sistema de agentes PowerShell/Python com fila de tarefas em banco de dados SQLite (`queue/tasks.db`).
- **Filosofia de Design:** Estetica "dark", gamificacao sofisticada, didatica visceral.
- **Protocolo de Handoff:** Uso do clipboard para transferir contexto para LLMs Web premium.
- **Prioridade de LLMs (API):** Free Tiers (Gemini Pro/Flash, OpenRouter) > Paid Anthropic API.
- **Identidade do Sistema (Chico):** Administrador/Gerente dinâmico (Gemini 3.1 Pro Preview e Claude Opus 4.6).
- **Protocolo de Exclusao Segura:** Implementado `Invoke-SafeCommand` em `do.ps1` e diretrizes em `GLOBAL_INSTRUCTIONS.md` para prevenir comandos destrutivos (rm -rf /).

## Estado Atual

- Ecossistema de agentes (16 entidades: Raphael + 15 Agentes IA) totalmente funcional e interconectado.
- Arquitetura de Cérebro Híbrido ativa (IDE Assistant + Background Executor).
- Ferramentas interativas (Toy-Games ICM V1) em produção, Laboratório ICM Universal (V2) em planejamento.
- Fluxo de trabalho v5.1 "Organism" (Fractal & Autopoietico) ativo.
- PROTOCOLO DE EXCLUSAO SEGURA implementado e ativo.

## Critical Security Directives (NOVA SECAO)

Em resposta a uma tentativa de comando destrutivo (`rm -rf /`), foi implementado o **Protocolo de Exclusao Segura**.

- O arquivo `GLOBAL_INSTRUCTIONS.md` agora contem uma diretriz explicita que **proibe** a geração de comandos destrutivos de root ou sistema.
- O script `do.ps1` contem a função `Invoke-SafeCommand` que **intercepta e bloqueia** qualquer tentativa de execução de padrões perigosos de exclusão de arquivos, como `rm -rf /` ou `del /s /q C:\`.
- Todos os agentes, especialmente `@implementor` e `@auditor`, devem internalizar e seguir este protocolo rigorosamente.

## Handoff Log

| Agente       | Status                         | Data       | Notas                                                                                                                            |
| ------------ | ------------------------------ | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| @pesquisador | Concluido                      | 2026-03-07 | 5 fontes validadas                                                                                                               |
| @prompter    | Concluido                      | 2026-03-07 | Prompt confirmado pelo usuario                                                                                                   |
| @validador   | FALHA_POR_AUSENCIA_DE_ARTEFATO | 2026-03-20 | A tarefa original falhou; o caminho do arquivo de conteúdo da carta de vendas não foi fornecido, impossibilitando a validação.   |
| @maverick    | Protocolo de Seguranca Ativo   | 2026-03-20 | Implementou o Protocolo de Exclusao Segura em `GLOBAL_INSTRUCTIONS.md` e `do.ps1` em resposta a um comando destrutivo bloqueado. |
| CHICO        | Auditoria SOTA Concluída       | 2026-03-20 | Infraestrutura legada aniquilada. Motor SQLite SOTA, OneDrive blindado e RAG Híbrido validados. Transição para Fase de Produto.  |
