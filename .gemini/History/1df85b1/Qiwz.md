# HANDOFF DE SESSÃO: FUNDAÇÃO DO TEMPLO SOTA

## 1. ESTADO ATUAL DO SISTEMA (Vitórias Alcançadas)
- **Telemetria SOTA (Panóptico):** Totalmente operacional. Erros do Quiz são injetados no SQLite e renderizados como barras de "EV Loss" (Sangria). Estas barras agora são links ativos que redirecionam o aluno para as aulas corretas.
- **Oráculo de Custo Zero:** O botão "Consultar Oráculo" no Quiz dispara uma requisição para a porta `17042`. O `memory_rag.py` responde usando apenas o banco vetorial local (ChromaDB) com a flag `local_only=True`, blindando as API Keys de custos públicos.
- **Arma Anti-EPERM:** O script `scripts/utils/kill_eperm.ps1` foi forjado como a solução definitiva para o erro de arquivos travados do Prisma/Next.js no Windows.

## 2. PRÓXIMAS FRONTEIRAS (O Que Fazer a Seguir)
A infraestrutura basal está pronta e invulnerável. Temos duas opções principais de expansão de produto:

**OPÇÃO A: A MÁQUINA DE CONTEÚDO (Blog/Aulas)**
- Dar vida ao modelo `Content` do Prisma.
- Criar o parser dinâmico que lê Markdown do banco e renderiza páginas de aula/artigos lindamente no Next.js (MDX ou react-markdown).

**OPÇÃO B: O MOTOR PKO (Bounties no Simulador)**
- Evoluir o `MasterSimulator.tsx` e o motor matemático.
- Inserir inputs para Bounties (PKO) e calcular o "Bounty Power" e a alteração no Risk Premium.

## 3. DIRETRIZ PARA OS AGENTES IA
Ao ler este arquivo, entenda que a fase de "correção de infraestrutura" foi superada. A meta agora é expansão vertical de produto (Features) mantendo a Lei SOTA de Fricção Zero, Pure ASCII e estética Glassmorphism no frontend.