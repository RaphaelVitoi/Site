---
id: registro-2026-09-16-preludio-saneamento-pos-crise-de-quota
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-16T16:05:00-03:00'
atualizado_em: '2026-09-16T16:05:00-03:00'
classes: [interno, medido, preludio]
session_id: 5b136c4c-9182-4227-9bfc-d883a25c2a77
session_started_at: '2026-09-16T13:28:11-03:00'
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  node: '24.16.0'
  congelada_em: '2026-09-16'
verificado:
  - a701d994 -- import inexistente de monitoring.otel_config trocava o AuditEngine real pelo mock em silencio; imports separados
  - a701d994 -- toy_games_page.tsx restaurado (fonte editorial registrada apagada como orfa em 0ba0fe94); editorial-registry volta a passar
  - a701d994 -- 14 testes da fronteira produto/operador quebrados porque o token de teste nao tinha exp
  - a701d994 -- accent-cyan faltava no tema vivo (4 usos sem cor, provado no CSS gerado); globals.css orfao removido
  - a701d994 -- CSP sem nonce exige unsafe-inline; unsafe-eval so em dev; S104 global revertido para noqa de linha
  - 9b5c916d e 7c1b9274 -- 717df02f (Jules) integrado por merge local e revertido; bug alegado inexistente, sintaxe v4 invertida
  - 95f281c6 -- sonda do Oraculo so com sessao (401 a cada 30 s); init WASM sem API depreciada
  - 094cb419 -- .at() para [] 8,77x e .set([]) para indice 16,5x e 20,7x, medidos em Node 24.16; dependabot sem major em bloco
  - 14 PRs fechados com motivo medido e rodape de agente; 20 branches remotos apagados; remoto so com master; 0 PRs abertos
  - PR 53 desativava 5 testes do portao CWV renomeando para _test_; PR 52 trazia AUTH_SECRET literal e log de solver fabricado
  - stashes de 2026-09-15 arquivados nas tags arquivo/stash-2026-09-15-pmev-wasm-completo e -parcial; SHA conferido antes do drop
  - suite integral verde em 5285aaa6, 738d9a99 e 72fef364; jest 451/451; portao amarelo por falta de CDP em todos os commits
  - INVENTARIO_FERRAMENTAS.md sumiu as 14:04:21; quarta reproducao negativa da suite; sentinela persistente no logon desde o reboot
  - 5 copias de skills em config/skills (2 divergentes, 1 sem SKILL.md) movidas para quarentena e trocadas por junction
  - allowlist local de 202 para 158 regras; 4 curingas de execucao arbitraria e git push/config removidos
  - chave em texto claro removida de ~/.qwen/settings.json
  - ruff unificado no pyproject.toml; .ruff.toml apagado; 771 achados do editor a zero em engine, core, database, tests, scripts, llm, cli, memory e menores
  - sota_web_browse lia file:/// pelo modo CDP_BROWSER explicito; so http/https passam; StitchClient recusa base_url sem https; 4 testes com contraprova
  - isort classificava a stdlib math como primeira parte; preview do ruff vinha do settings de usuario do Antigravity IDE e foi neutralizado no workspace
nao_verificado:
  - quem apaga INVENTARIO_FERRAMENTAS.md -- sentinela sem evento desde o logon
  - telas afetadas por accent-cyan e CSP de producao abertas num navegador
  - ganho das trocas .at()/.set() medido nas funcoes reais do repositorio, e nao em lacos de mesma forma
  - extensoes rust-analyzer, Tailwind, markdownlint e ESLint apos Reload Window
  - CWV e acessibilidade dos commits da sessao -- CDP ausente
  - math/rio_extended.py nunca e importavel como math.rio_extended (a stdlib vence); sem consumidor, nao removido
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [scripts/ops/record_gate.py]
    parecer: Unica mudanca e try/except ValueError/pass trocado por contextlib.suppress(ValueError) em _grafias_de_citacao, mais o import; mesma excecao, mesmo efeito. A taxonomia nao e tocada e segue vigente.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos: [tests/test_agent_calibration_feedback.py]
    parecer: dict(Chave=...) virou literal {"Chave" ...} (C408) e o parametrize passou a nomear tupla (PT006); mesmos campos, mesmos casos. Nada do que o registro mediu muda.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: [tests/test_agent_calibration_feedback.py, tests/test_agent_calibration_provenance.py, tests/test_calibracao_fechamento_do_ciclo.py, tests/test_calibracao_portao_por_sessao.py]
    parecer: Mudancas de forma sem efeito no contrato de proveniencia. dict() para literal e nomes de parametrize em tupla; datetime.timezone.utc para datetime.UTC (mesmo objeto); pytest.fixture() para pytest.fixture; imports reordenados. Os casos que recusam veiculo, modelo e escopo invalidos sao os mesmos e a suite integral passou.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos: [tests/test_agent_calibration_feedback.py]
    parecer: dict(Chave=...) virou literal e o parametrize passou a nomear tupla; os casos testados sao identicos. O handoff continua descrevendo corretamente o arquivo.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: [tests/test_agent_calibration_feedback.py, tests/test_agent_calibration_provenance.py, tests/test_calibracao_fechamento_do_ciclo.py, tests/test_calibracao_portao_por_sessao.py]
    parecer: Mesmas mudancas de forma da auditoria de proveniencia (literais, parametrize em tupla, datetime.UTC, fixture sem parenteses, ordem de imports). A reconciliacao do handoff nao depende de nenhuma delas.
  - registro: registro-2026-08-29-o-fallback-que-nao-carrega
    caminhos: [tests/test_routing_policy.py]
    parecer: So a ordem de dois imports mudou (import re trocou de lugar com from pathlib); a contagem de linhas nao muda, entao as linhas 442, 451 e 463 citadas pelo registro seguem corretas.
  - registro: registro-2026-08-29-tres-orfaos
    caminhos: [llm/budget.py]
    parecer: So o import de datetime subiu na ordenacao (force-sort-within-sections). Nenhum simbolo, consumidor ou orfao citado pelo registro muda.
  - registro: agent-calibration-daily-2026-09-02
    caminhos: [tests/test_calibracao_portao_por_sessao.py]
    parecer: datetime.timezone.utc para datetime.UTC e imports reordenados; o portao por sessao testado e o mesmo e o diario de 09-02 segue valido como evidencia datada.
pendencias:
  - id: pend-2026-09-16-revogar-credenciais-vazadas
    o_que: Revogar o token AQ. do Google Cloud e a chave sk-or-v1 do OpenRouter expostos na saida de um comando desta sessao
    dono: Tier 0
    prazo: 2026-09-17
  - id: pend-2026-09-16-remover-pytest-cache-travado
    o_que: Remover .pytest_cache com takeown e icacls num PowerShell elevado; o usuario nao le a pasta
    dono: Tier 0
    prazo: 2026-09-23
  - id: pend-2026-09-16-confiar-workspace-na-extensao
    o_que: Aceitar a confianca do workspace na extensao do Claude Code; a chave c:/ minuscula esta sem confianca e descarta 13 regras
    dono: Tier 0
    prazo: 2026-09-23
  - id: pend-2026-09-16-branch-local-submodule-ownership
    o_que: Decidir o branch local chore/submodule-ownership-rationalization, 10 a frente e 427 atras, sem copia no remoto
    dono: Tier 0
    prazo: 2026-09-30
---

# Prelúdio — saneamento pós-crise de quota

A sessão continua aberta. Este registro fixa o que foi medido antes da compactação.
A nota do Tier 0 vem no handoff, com o mesmo `session_id`.

## Como a sessão chegou até aqui

Começou com um aviso do Pyright, um import que não resolvia. A causa era maior: o
import órfão trocava o `AuditEngine` real pelo mock. Depois, o Tier 0 pediu uma
varredura completa do estado deixado quando vários modelos ficaram sem quota ao
mesmo tempo. Na sequência, delegou em regime contínuo o tratamento de logs do
editor, a triagem de stashes e branches do Jules e, por fim, de todo o remoto.

## Três achados que mudaram decisões

1. **Remoção de arquivo por grafo de imports não enxerga registro.** O `knip` marcou
   `toy_games_page.tsx` como órfão, mas ele constava no registro editorial. O
   relatório do commit dizia "451 testes aprovados", e o teste do registro estava
   vermelho.
2. **Afirmação de PR não é medição, nem para mais, nem para menos.** O Bolt alegou
   de 13% a 30x sem medir nada. A medição deu de 8,77x a 20,7x. O ganho era real e
   os números, inventados. A substância foi incorporada; os PRs, não.
3. **Um PR com título de limpeza desativava testes do portão.** O #53 renomeava 5
   testes de CWV para `_test_`, e a suíte continuaria verde sem medir nada. A
   revisão aconteceu porque a triagem abriu o diff, e não só o título.

## Erros meus nesta sessão

- **Vazamento de credencial.** Num "comparar só por hash", uma função chamada `H`
  colidiu com o alias `Get-History`, e o erro ecoou duas credenciais na saída.
  Virou a memória `segredo-nunca-vira-argumento` e a pendência de revogação acima.
- **Crash por paralelismo.** Rodei o jest e o `pytest -n auto` ao mesmo tempo, e a
  sessão caiu antes do push. Nada se perdeu. Virou a memória
  `suites-pesadas-em-serie`.
- **Falso alarme na página do simulador (`frontend/src/app/(lab)/simulador/page.tsx`).** Tratei como import quebrado um nome de
  variável local; o typecheck desmentiu antes de qualquer edição.
- **Duas correções de lint que quebraram comportamento, pegas pelos portões.** Ao
  achatar um `if` aninhado em `scripts/cli/nexus.py`, só as três primeiras linhas do
  bloco subiram de nível e o resto ficou órfão; o parser do ruff acusou. E trocar a
  fixture por `usefixtures` em `tests/test_backend_hardening.py` desarmou o guard que
  lê a assinatura para provar a fixture; a suíte integral reprovou e a forma original
  voltou com `noqa`. Nos dois casos a regra do linter estava certa sobre a forma e
  cega para o contrato.

## Supressores de segurança decididos na unificação do ruff

Cada linha abaixo cita este registro como `Record-Id`. Nenhuma suprime um achado
ainda aberto: todas anotam um caso em que a regra não descreve risco real.

| Regra | Onde | Por que não é risco |
| :--- | :--- | :--- |
| S310 | `engine/sota_web_browse.py` (sondas CDP) | URL montada em loopback fixo `127.0.0.1:{porta}` |
| S310 | `engine/sota_web_browse.py` (`fetch_page_content`, `_sync_fetch`) | esquema validado antes: só `http://` e `https://` passam; `file:` lia arquivo local até esta sessão |
| S310 | `engine/avatars/query_current.py`, `scripts/llm_inference/run_inference.py` | Ollama e proxy de inferência em loopback literal |
| S310 | `scripts/ops/cwv_gate.py` | CDP em loopback fixo |
| S311 | `engine/pmev_hh_benchmark.py`, `engine/pmev_hh_canon.py` | bootstrap e amostragem reprodutíveis por seed; `secrets` não aceita seed |
| S108 | `scripts/ops/suite_verde.py` | `--basetemp` do pytest, recriado a cada corrida |
| S110 | `tests/test_stress_circuit_breaker.py` | simulação: a queda de uma camada segue para a seguinte, que é o que o teste mede |

`engine/jules_bridge.py` e `engine/stitch_bridge.py` ficaram isentos de S310 por
arquivo no `pyproject.toml`, com motivo: toda URL parte de base https constante, e o
`StitchClient` passou a recusar `base_url` sem https no construtor.

## O que fica para o handoff

- O estado do sentinela (`%LOCALAPPDATA%\sentinela-site\delecoes.jsonl`), lido antes
  de encerrar.
- A nota e o comentário do Tier 0.
- As pendências do frontmatter, que o portão exibe a cada commit até serem
  encerradas por append.
