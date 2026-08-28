# Governança — projeto `Site`

> **Este arquivo é um ponteiro. A governança canônica está em
> [`CLAUDE.md`](CLAUDE.md), na raiz deste projeto.**

Existe porque a convenção [`agents.md`](https://agents.md) é lida por agentes
que não carregam `CLAUDE.md` — Codex, Cursor e outros. Endereçabilidade
cruzada tem valor; **segunda cópia da governança não tem.**

## Por que ponteiro e não cópia

Entre 2026-08-24 e 2026-08-26 este arquivo existiu como fork do `CLAUDE.md`.
Em dois dias divergiu em três pontos, dois deles falsos — ambos nascidos de um
search-replace mecânico de `claude` para `Codex`:

| Divergência | Estado |
| :--- | :--- |
| Apontava para `..\AGENTS.md` na raiz multiprojeto | **não existia** |
| Dizia que os 19 documentos de agente ficam em `.Codex/agents/` | **falso** — `sync_agents_reality.ps1:54` escreve em `.claude/agents/`, e `.Codex/agents/` não existe |
| Trazia a §6, diretrizes de manutenção contínua | **conteúdo real** — incorporado ao `CLAUDE.md` §6 em 2026-08-28 |

Duas mentiras em dois dias, nenhuma delas detectada por nada. Documento de
governança duplicado não diverge *se* alguém descuidar — diverge **por
padrão**, porque a cópia não tem como saber que o original mudou.

## Se você é um agente lendo este arquivo

Leia `CLAUDE.md` neste mesmo diretório. Ele traz o portão obrigatório de
pre-commit, a camada de dependências, as fontes únicas de roteamento de modelo,
a obrigação de declaração e as diretrizes de manutenção contínua.

A governança multiprojeto, que vale para todos os projetos sob `~/.gemini`,
está em `../CLAUDE.md`.

---

*`tests/test_governanca_agents.py` reprova se este arquivo voltar a crescer
para além de um ponteiro, ou se o `CLAUDE.md` perder as seções que ele promete.*
