# 🛠️ INVENTÁRIO DE FERRAMENTAS SOTA (v6.3)

> **Mantenedor:** CHICO | **Data:** 2026-03-16
> **Status:** Elevado ao Estado da Arte
> **Filosofia:** Fricção Zero, Economia Generalizada e Autopoiese.

---

## 🧠 1. Ecossistema de IA (Cérebro Híbrido)

- **Claude 3.7 Sonnet / Opus (Anthropic):** Usado via interface Web (Assinatura Pro) para macro-arquitetura e "Cirurgias de Código". Ingestão via `do.ps1 -Ingest`.
- **Gemini 2.5 Pro / Advanced (Google):** Usado via interface Web para processamento de contextos gigantescos e ideação estratégica com o `@maverick`.
- **Gemini 2.5 Flash / Pro (API Local):** O motor SOTA de execução em background. Ágil, de altíssima eficiência e baixo custo para a fila de tarefas local.
- **DeepSeek R1 / Llama 3 (OpenRouter):** Terceira via de roteamento na DAL Python, garantindo resiliência total sem custo adicional (Free Tier SOTA).

## ⚙️ 2. Motor de Orquestração (O Córtex Local)

- **Python 3.12+:** O coração do Orquestrador (`task_executor.py`). Gerencia multithreading, God Mode 2.0 e chamadas assíncronas de API.
- **SQLite3 (Motor de Fila):** Banco de dados ACID para gerenciamento de tarefas (`tasks.db`), obliterando gargalos de concorrência que existiam com arquivos JSON.
- **PowerShell 5.1 / 7+:** A Membrana Inteligente (`do.ps1`). Interage com o usuário, roteia intenções via Regex e processa injeção de dados em Base64 Puro ASCII para o Python.
- **ChromaDB:** Banco de dados vetorial para RAG (Retrieval-Augmented Generation), gerenciado pelo `@bibliotecario` para reter o histórico sem estourar a janela de tokens.

## 🌐 3. Stack do Produto Final (Front-end e Aplicação)

- **Next.js 16 (App Router):** Framework principal. Renderização híbrida impecável (SSR/SSG).
- **React 19:** Biblioteca base, maximizando performance e flexibilidade de componentes.
- **Prisma ORM:** Tipagem forte de ponta a ponta para a camada de dados.
- **SQLite (Produção via Turso / Coolify):** O banco do produto. Em cenários Serverless, usamos o Turso (borda). Em VPS Soberana (Coolify), usamos o arquivo local diretamente.

## 🛡️ 4. Infraestrutura e Qualidade (Defesa SOTA)

- **Git / GitHub:** Versionamento absoluto. Ponto de partida para os deploys magnéticos (CI/CD).
- **Pydantic:** Validação implacável de schemas no orquestrador Python.
- **VS Code:** O Templo de Criação. Interface visual onde a Tríade de Governança opera.

---

> _Aviso do Administrador:_
> Qualquer tecnologia que exija esforço humano repetitivo (entropia) ou não possua resiliência por design deve ser substituída ou obliterada. O ecossistema SOTA adapta as ferramentas, e não o contrário.
