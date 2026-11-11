---
description:
  "Modelo operacional SWE-2 Flash Medium — fases determinísticas, verificação
  focada e circuit breaker"
trigger: always_on
---

# Operating Model — SWE-2 Flash Medium (Devin Desktop)

Regras always-on calibradas para a classe do modelo ativo. Objetivo: maximizar
precisão por ACU, não velocidade bruta. Em conflito com instrução mais
específica da tarefa, a tarefa vence; em conflito com `CLAUDE.md`, o canônico
vence.

## 1. Ciclo de vida da tarefa (obrigatório)

- **Bugfix:** Fase 0 — reproduzir com teste falhando ANTES de tocar produção.
  Fase 1 — patch cirúrgico só nos arquivos mapeados até o teste passar. Fase 2 —
  portão de qualidade focado (ver §3). Nunca pular para a suíte ampla.
- **Feature/refactor:** inspecionar alvos → emitir plano curto (arquivos,
  funções, comando de validação) → só então aplicar o primeiro patch.

## 2. Precisão de escopo

- Diffs cirúrgicos: 120–150 linhas por bloco, sem reformatação fora do escopo.
- Antes de editar API/função existente: `rg`/`grep` por referências para mapear
  consumidores indiretos. Assinatura pública alterada exige atualizar callers.
- Nunca editar teste para forçar aprovação (mascara bug real). Nunca instalar
  pacote ou alterar `pyproject.toml`/`tsconfig.json`/build config sem instrução.
- Exploração ampla read-only → delegar a `subagent_explore` (contexto isolado,
  custo menor). `subagent_general` herda este modelo — usar só para trabalho
  paralelo real, pois multiplica gasto como uma sessão extra.

## 3. Verificação focada (econômica)

- Estático antes de dinâmico: `ruff check`, `pyright`/`tsc --noEmit` capturam
  erros em frações de segundo.
- Testes sempre focados:
  `uv run --no-sync python -m pytest tests/<arq>.py -q --tb=short -k <nome>`.
  Suíte completa (`pytest tests/`, `npm run sota:full`) SOMENTE no checkpoint
  final pré-commit.
- Flags de silêncio obrigatórias em loops: `-q`, `--tb=short`, `--no-output`.
  Nunca despejar stack trace/log verbose no histórico da sessão.
- Skill `/focused-verify` encapsula essa cadeia — preferir a ela.

## 4. Circuit breaker (anti-loop)

- Mesma mensagem de erro 2× consecutivas → PARAR, relatar causa raiz provável e
  alternativas. Não tentar uma 3ª variação às cegas.
- Ferramenta falhou 2× → trocar de abordagem (grep→read, exec→skill), não
  repetir.
- Contexto da sessão maior que uma feature → sugerir `/handoff` ou sessão nova
  em vez de continuar acumulando histórico.

## 5. Segurança e soberania

- Segredos nunca em texto claro, log ou commit; ler de env/credenciais.
- Não ampliar ACL/firewall/CORS; não contornar hook que falha — investigar
  antes.
- Commits seguem o invariante do `CLAUDE.md` §0 (SHA, assinatura Tier,
  propósito).
