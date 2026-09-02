---
id: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: devin@cognition
criado_em: 2026-09-01T11:30-03:00
atualizado_em: 2026-09-01T11:30-03:00
classes:
- interno
- medido
config_medida:
  raiz: C:/Users/Administrator/repos/Site2
  so: Windows
  python: 3.14.7
  ruff: 0.16.3
  congelada_em: '2026-09-01'
caminhos:
- api/v1/server.py
- api/v1/handlers.py
- api/v1/middleware.py
- scripts/ops/cwv_gate.ps1
- tests/test_backend_hardening.py
verificado:
- api_server_handlers_hardening
- cwv_gate_cross_platform
- test_cwv_gate_truthfulness
nao_verificado: nenhuma -- testes de integracao de rota e gate executados
revisoes_de_ancora:
- registro: plan-dependency-boundary-reconciliation-2026-09-01
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: A mudanca troca a montagem de tres caminhos ($ReportDir, interpretador
    da venv e verificador SRI) do perfil do usuario para a raiz do proprio repositorio.
    Nenhuma fase, limite ou criterio de aprovacao do portao muda, e o achado ancorado
    segue valido no mesmo arquivo.
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: A mudanca troca a montagem de tres caminhos ($ReportDir, interpretador
    da venv e verificador SRI) do perfil do usuario para a raiz do proprio repositorio.
    Nenhuma fase, limite ou criterio de aprovacao do portao muda, e o achado ancorado
    segue valido no mesmo arquivo.
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: A mudanca troca a montagem de tres caminhos ($ReportDir, interpretador
    da venv e verificador SRI) do perfil do usuario para a raiz do proprio repositorio.
    Nenhuma fase, limite ou criterio de aprovacao do portao muda, e o achado ancorado
    segue valido no mesmo arquivo.
- registro: handoff-2026-08-29-auditoria-integridade-repositorio
  caminhos:
  - scripts/ops/cwv_gate.ps1
  parecer: A mudanca troca a montagem de tres caminhos ($ReportDir, interpretador
    da venv e verificador SRI) do perfil do usuario para a raiz do proprio repositorio.
    Nenhuma fase, limite ou criterio de aprovacao do portao muda, e o achado ancorado
    segue valido no mesmo arquivo.
---

# REGISTRO: fronteira HTTP endurecida e portao de qualidade independente de perfil

## 1. O que mudou

Quatro achados da analise de backend de 2026-09-01, na fronteira entre a API aiohttp e o
resto do sistema:

1. **Rotas orfas.** `handle_list_files`, `handle_view_file` e `handle_web_search` existiam em
   `api/v1/handlers.py` e nunca entraram na tabela de rotas: o dashboard chamava um endpoint
   que o backend implementava e recebia 404. A montagem da aplicacao virou
   `create_app(manager)`, testavel sem abrir socket.
2. **Falha de bind engolida.** `start_api_server()` apenas logava o `OSError`. Sob
   `asyncio.gather`, o processo seguia vivo com worker rodando e API ausente -- uma fila sendo
   consumida sem porta de entrada. A excecao passa a subir para quem chamou.
3. **Vazamento em 500.** Handlers devolviam `str(e)` cru: caminho de disco, nome de tabela e
   fragmento de SQL atravessavam a fronteira HTTP. `_internal_error()` devolve mensagem fixa
   mais um `error_id`, e mantem o detalhe apenas no log do servidor.
4. **JWT permissivo.** O algoritmo era inferido do formato do token (tres segmentos), nunca
   lido do header; so `exp` era conferido. Agora `alg` precisa ser HS256 declarado, e `nbf`,
   `iat`, `iss` e `aud` entram na verificacao -- `iss`/`aud` apenas quando o ambiente os
   declara, para nao quebrar quem nao os configura.

## 2. Mitigacao do que dependia de um ambiente especifico

`scripts/ops/cwv_gate.ps1` fixava o perfil de uma maquina: o diretorio de relatorios, o
interpretador da venv e o verificador SRI eram montados a partir de `$env:USERPROFILE` mais um
caminho de perfil. Em qualquer outro checkout -- CI, clone novo, outra conta -- o verificador
apontava para o vazio e a fase falhava por endereco, nao por achado.

Os tres passam a derivar de `$RepoRoot`/`$PSScriptRoot`, que o script ja calculava para as
demais entradas. O unico `$env:USERPROFILE` remanescente e o do fnm, que enderaca uma
toolchain por usuario e ja e condicionado a `Test-Path`.

Isso remove a necessidade da juncao de perfil que vinha sendo usada como contorno: o portao
mede o repositorio onde ele mesmo esta.

## 3. O que continua fora de alcance nesta maquina

Duas medicoes nao foram feitas, e nenhuma delas e uma aprovacao silenciosa:

- **CWV e A11y**: o portao declara `NAO MEDIDO` quando nao ha runtime CDP. Nao ha navegador
  instrumentado aqui, entao as fases 1 e 2 permanecem nesse estado -- que e um resultado
  registrado, nao um verde.
- **Frontend**: o build depende de binarios versionados em Git LFS que nao materializam porque
  o orcamento de LFS do repositorio esta esgotado. O clone foi feito com o smudge desligado.
  Isso e resolvivel apenas do lado da conta que hospeda o repositorio.

## 4. Medicao

- `tests/test_backend_hardening.py`: 21 aprovados, 0 warnings.
- `tests/test_cwv_gate_truthfulness.py` e `tests/test_cli_nexus.py`: 59 aprovados.
- Duas falhas seguem abertas e sao anteriores a este trabalho, em `tests/test_governanca_skills.py`
  e `tests/test_record_index.py`; nao sao tocadas aqui e serao tratadas em registro proprio.
