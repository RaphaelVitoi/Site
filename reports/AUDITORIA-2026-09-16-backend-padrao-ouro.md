---
id: auditoria-2026-09-16-backend-padrao-ouro
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-16T23:40:00-03:00'
atualizado_em: '2026-09-16T23:40:00-03:00'
classes: [interno, medido, seguranca, backend]
caminhos:
  - reports/AUDITORIA-2026-09-16-backend-padrao-ouro.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 9c3c405a
  host: Windows 11 Pro 10.0.26200, Python do .venv do projeto
  banco: queue/tasks.db lido somente leitura; provas em QueueManager(':memory:')
  data_das_medicoes: 2026-09-16
verificado:
  - apply_god_mode sem agent_name opera com a identidade da tarefa running mais recente -- resposta de @curator aplicada como @chico, em default e em full
  - banco real queue/tasks.db lido em modo somente leitura -- autonomy_mode igual a full, fila vazia
  - _validate_forged_path aceita autonomy.json, .husky/pre-commit, .claude/settings.json, .vscode/tasks.json e conftest.py para agente sem privilegio em modo default
  - _validate_command aceita comando multilinha em modo partial
  - JWT no formato da anon key do Supabase, sem sub e sem aud, chega a tres handlers de produto; /api/files/view devolve 403; com SUPABASE_JWT_AUDIENCE=authenticated devolve 403
  - arbitrador extrai tarefa cuja dependencia nao esta pendente
  - AuditEngine grava 36379993 bytes para um corpo de 1360012 bytes -- fator 26.7
  - evento nao-dict em /api/logs/frontend gera AttributeError e descarta o lote
  - view de metricas conta como ultima hora um registro de 84 minutos atras
  - import_tree com 1143910 bytes leva 23 ms -- hipotese de bloqueio do event loop refutada
  - str de aiohttp.ClientResponseError contem a URL completa com key=
  - todos os chamadores atuais de engine.llm_api.call_gemini passam chave explicita
  - npm audit --audit-level=low -- 0 vulnerabilidades
  - pip_audit -r requirements.txt -- 5 advisories no chromadb 1.5.9, ja aceitas em data/python_cve_acceptances.json; ainda so PersistentClient no repositorio
  - pytest em 9 arquivos de backend -- 109 aprovados, 0 warnings
nao_verificado:
  - nenhum teste de carga; o balde de rate limit compartilhado (BK-06) e inferido do codigo
  - worker real e chamadas a LLM nao executados; as chaves estao revogadas
  - engine/ auditado apenas nos caminhos chamados pelos handlers e por engine/cognitive.py; a matematica dos solvers ficou fora
  - task_executor.py, memory_rag.py, cli/, tools/, mcp-bridge/ e o roteamento de llm/ nao foram lidos por inteiro
  - PRAGMAs inertes (BK-10) derivados da semantica documentada do SQLite, sem medicao de desempenho
  - findings anteriores B03, B04, B06, B08 e B09 nao foram remedidos nesta sessao
  - suite completa nao rodada; skill security-review nao rodada porque nenhum arquivo de codigo foi alterado
  - caminho Rust do arbitrador nao verificado -- nexus_core_rust ausente neste host
pendencias:
  - id: pend-2026-09-16-god-mode-identidade
    o_que: Passar task.agent a apply_god_mode nos dois chamadores e remover a deducao por running_tasks[0] (BK-01)
    dono: Tier 0
    prazo: 2026-09-23
  - id: pend-2026-09-16-god-mode-superficie-de-escrita
    o_que: Decidir entre allowlist de escrita e modo patch sem aplicacao para a materializacao de arquivos por LLM (BK-02)
    dono: Tier 0
    prazo: 2026-09-23
  - id: pend-2026-09-16-jwt-anon-key
    o_que: Exigir sub e role authenticated no JWT de produto do backend Python (BK-03)
    dono: Tier 0
    prazo: 2026-09-30
  - id: pend-2026-09-16-arbitrador-dependencias
    o_que: Bloquear extracao de tarefa com dependencia fora de completed ou cancelled (BK-04)
    dono: Tier 0
    prazo: 2026-09-30
---

# Auditoria do backend — 2026-09-16

**Escopo:** API Python (`api/v1`, 1.833 linhas), persistência (`database/`), worker
(`worker/`, `agents/execution.py`, `agents/autonomy.py`, `core/arbitrator.py`),
telemetria (`monitoring/audit_engine.py`), `utils/storage.py`, `utils/cache.py`,
chamadas de provedor em `llm/gemini.py` e `engine/llm_api.py`, e os 14 route
handlers do Next.js (`frontend/src/app/**/route.ts`).

**Método:** leitura integral dos arquivos acima; cada achado P0–P2 foi provado
por execução (scripts de prova fora do repositório, banco em memória, nenhuma
escrita no projeto). O que é inferência está marcado como tal.

**Numeração:** `BK-nn`, para não colidir com `B01–B09` da validação de 2026-09-07.

---

## Resumo

| # | Sev. | Achado | Prova |
| :-- | :-- | :--- | :--- |
| BK-01 | **P0** | Resposta de LLM aplicada com a identidade de *outro* agente | executado |
| BK-02 | **P0** | Saída de LLM grava em superfícies que executam código, já no modo `default` | executado |
| BK-03 | P1 | Anon key pública do Supabase autentica no backend Python | executado |
| BK-04 | P1 | Worker executa tarefa antes de a dependência terminar | executado |
| BK-05 | P1 | `/api/logs/frontend` amplifica 26,7× em disco, sem teto | executado |
| BK-06 | P1 | Rate limit único para todos os usuários do site | inferido do código |
| BK-07 | P1 | Recuperação de zumbis devolve tarefas de *outros* workers | inferido do código |
| BK-08 | P2 | "Latência média 1h" mede desde 00:00 UTC | executado |
| BK-09 | P2 | `/metrics` publica valores fabricados | leitura |
| BK-10 | P2 | PRAGMAs de desempenho não valem para as conexões que fazem o trabalho | semântica do SQLite |
| BK-11 | P2 | `claim_task` sobrescreve a hora de criação da tarefa | leitura |
| BK-12 | P2 | Filtro de comando do modo `partial` aceita quebra de linha | executado |
| BK-13 | P2 | `/api/v1/predictive` nunca alcança o backend quando há token | leitura |
| BK-14 | P2 | Ramo latente envia `API_SECRET_TOKEN` ao Google como chave Gemini | leitura + contagem de chamadores |
| BK-15 | P3 | Mensagem de erro interna devolvida ao cliente em 5 rotas | leitura |
| BK-16 | P3 | Limite de 10 MB do relay Gemma confia no `Content-Length` declarado | leitura |
| BK-17 | P3 | `pmev-pdf` pública: interpolação sem escape e sem teto | leitura |
| BK-18 | P3 | Parâmetros de RAG sem limite; `int()` inválido vira 500 | leitura |
| BK-19 | P3 | `/api/files/view` serve `.env` e `.svg` ativo na origem da API | leitura |
| BK-20 | P3 | Headers de segurança ausentes em 401/403/429 | leitura |
| BK-21 | P3 | Chave Gemini em query string | executado (parcial) |

---

## P0

### BK-01 — Resposta de LLM aplicada com a identidade de outro agente

`agents/execution.py:511` e `engine/cognitive.py:408` chamam
`apply_god_mode(response_text, manager)` **sem** `agent_name`. Sem ele,
`agents/autonomy.py:379-382` deduz a identidade como
`get_tasks(status="running")[0].agent`, ou seja, o agente da tarefa `running`
mais recente, **seja ela qual for**. O worker roda até 4 tarefas em paralelo
(`MAX_CONCURRENT_TASKS = 4`).

O comentário diz *"Obliteracao da escalada de privilegios (Zero-Trust)"*. O
comportamento é o oposto.

**Prova** (banco em memória; `@curator` reivindicado antes, `@chico` depois):

```
modo global=default  -> forge=('default', '@chico') exec=None
modo global=full     -> forge=('full', '@chico') exec=('full', '@chico')
```

No modo `full`, `@chico` está em `god_mode_agents`: escreve em caminho protegido
e executa `powershell.exe -ExecutionPolicy Bypass -Command <cmd>` sem o filtro de
encadeamento (`autonomy.py:185`).

**Estado real, lido somente leitura:** `queue/tasks.db` tem
`autonomy_mode = 'full'`. A fila está vazia agora; o risco se materializa assim
que o worker rodar duas tarefas simultâneas.

**Por que os testes não pegaram:** `tests/test_agents_sota.py:254` e `:285`
sempre passam `"@chico"` explicitamente. O caminho que a produção usa nunca foi
exercitado.

**Correção:** passar `task.agent` nos dois chamadores e tornar `agent_name`
obrigatório, sem dedução. Guard: um teste que chama `apply_god_mode` sem o
argumento tem de falhar.

### BK-02 — Saída de LLM grava em superfícies que executam código

`_forge_files` roda já no modo `default` (`autonomy.py:390-394`). A proteção é
uma denylist por *substring* (`PROTECTED_KERNEL_PATHS`) que cobre `autonomy.py`,
mas **não** `autonomy.json`, o arquivo que define `god_mode_agents` e
`sandbox_default` (`autonomy.py:330-346`).

**Prova:** `_validate_forged_path(..., "default", "@curator")` devolve `True`
para `autonomy.json`, `.husky/pre-commit`, `.claude/settings.json` (hooks),
`.vscode/tasks.json` e `conftest.py`.

**Cadeia:** o prompt inclui contexto web, memória RAG e, nas tarefas `AUTOFIX-*`,
a resposta anterior do LLM (`execution.py:338`). Uma injeção de prompt vinda de
qualquer uma dessas fontes vira escrita persistente num arquivo que o operador ou
a IDE executa depois. Gravar `autonomy.json` ainda promove o próprio agente a
god mode para as próximas tarefas.

**Correção:** isto é redução material pela §8.2, então a decisão é do Tier 0.
Alternativas, da menos à mais restritiva:

1. **Aditiva:** acrescentar `autonomy.json`, `.husky`, `.claude`, `.vscode`,
   `.github`, `conftest.py`, `package.json` e `pyproject.toml` à lista protegida,
   com comparação por componente de caminho em vez de substring.
2. **Allowlist:** gravação só sob diretórios declarados (ex.: `docs/`, `reports/`,
   `.claude/agent-memory/`).
3. **Modo patch:** a resposta vira diff em `reports/` e nada se aplica sem
   revisão.

---

## P1

### BK-03 — Anon key pública do Supabase autentica no backend Python

`verify_hs256_jwt` (`api/v1/middleware.py:110`) exige `exp`, mas não `sub` nem
`role`; `aud` e `iss` só são conferidos se as variáveis de ambiente existirem.
A anon key legada do Supabase é um HS256 assinado com o mesmo segredo, com
`role: anon`, sem `sub`, `exp` de ~10 anos, e é pública
(`NEXT_PUBLIC_SUPABASE_ANON_KEY`).

**Prova:**

```
anon POST /api/v1/perspective/tree -> HANDLER_REACHED user_id=None role=anon
anon POST /api/v1/timesfm/forecast -> HANDLER_REACHED user_id=None role=anon
anon POST /api/logs/frontend       -> HANDLER_REACHED user_id=None role=anon
anon GET  /api/files/view          -> 403
com SUPABASE_JWT_AUDIENCE=authenticated -> 403
```

A separação produto/operador de 2026-09-09 funciona: rota de operador continua
fechada. O que falta é a identidade de produto exigir *usuário*. Hoje o `.env`
local não define `SUPABASE_JWT_SECRET`, então o risco é **latente aqui e real em
qualquer deploy** que o defina.

**Correção:** rejeitar payload sem `sub` ou com `role != "authenticated"`, e usar
`aud = "authenticated"` como padrão em vez de opcional.

### BK-04 — Worker executa tarefa antes de a dependência terminar

`UniversalArbitrator._build_graph` (`core/arbitrator.py:62-67`) só conta
dependências que estão **na lista pendente**. Dependência `running`, `failed` ou
inexistente é ignorada, e a tarefa fica com `in_degree = 0`.

**Prova:** `B` com `depends_on: ["A"]`, `A` fora da lista pendente → extraída: `B`.

`QueueManager.get_next_task` (`queue_manager.py:391`) faz o certo
(`NOT IN ('completed','cancelled')`), mas o worker não o usa: chama
`get_tasks(pending)` e `extract_optimal_task` (`worker/loop.py:223-230`).
Consequência: subtarefas do `@dispatcher` rodam em paralelo com a predecessora, e
dependentes de tarefa falha rodam assim mesmo.

### BK-05 — `/api/logs/frontend` amplifica 26,7× em disco

Rota de produto, portanto alcançável por BK-03. `FrontendLogsRequest.events` é
`list[Any]`, sem teto. Cada `{}` vira uma linha JSONL de ~107 bytes.

**Prova:** corpo de 1.360.012 bytes → 36.379.993 bytes gravados (26,7×). Com o
limite padrão de corpo do aiohttp (1 MiB), são ~28 MB por requisição, e o rate
limit permite 300 por minuto.

Dois defeitos adicionais:

- Um evento que não seja dict (`"texto"`) gera `AttributeError` dentro de uma task
  *fire-and-forget* e **descarta o lote inteiro** (provado).
- `_flush_to_disk` faz `clear()` depois do `await`: eventos acrescentados durante
  a gravação somem sem ir ao disco (**inferido**, não medido).

**Correção:** teto de eventos por requisição (ex.: 100), validação de cada evento
por modelo Pydantic, e troca do buffer antes da gravação
(`buffer, self.active_buffer = self.active_buffer, []`).

### BK-06 — Rate limit único para todos os usuários do site (inferido)

`encaminharAoNexus` (`frontend/src/lib/server/nexus-proxy.ts`) chama o backend a
partir de `127.0.0.1` sem `X-Forwarded-For`. O `rate_limit_middleware` só lê o XFF
quando o remoto é loopback, e aqui ele não vem. Resultado: todos os usuários
dividem **um** balde de 300 req/min. Em container (Cloud Run), `request.remote` é
o proxy da plataforma, com o mesmo efeito. Não houve teste de carga.

### BK-07 — Recuperação de zumbis devolve tarefas de outros workers (inferido)

`_recover_zombies` (`worker/loop.py:58`) e `_cleanup_worker` (`:272`) fazem
`UPDATE tasks SET status='pending' WHERE status='running'`, sem filtro por dono.
`claim_task` foi escrito para vários workers (*"Outro worker concorrente ja
reivindicou"*), e não há trava de PID. Subir um segundo worker, ou desligar um
deles, recoloca na fila tarefas que o outro está executando: execução dupla, com
efeitos colaterais de BK-01/BK-02 em dobro.

---

## P2

### BK-08 — "Latência média 1h" mede desde 00:00 UTC

`v_nexus_realtime_metrics` (`queue_manager.py:291`) compara
`timestamp >= datetime('now','-1 hour')`. O valor gravado é ISO com `T`
(`2026-09-17T00:01:00+00:00`), e `datetime()` devolve com espaço
(`2026-09-17 01:25:26`). Como `'T' > ' '`, a comparação lexicográfica aceita
qualquer registro do mesmo dia UTC.

**Prova:** registro de 84 minutos atrás → contado como última hora.

**Correção:** `timestamp >= strftime('%Y-%m-%dT%H:%M:%S', 'now', '-1 hour')`.

### BK-09 — `/metrics` publica valores fabricados

`handle_prometheus_metrics` (`handlers.py:1345-1377`) emite
`nexus_hardware_vram_used_bytes 6151575960` como constante,
`nexus_circuit_breaker_state` fixo em `0` para dois backends, e CPU `8.0` e RAM
livre `6400` quando `psutil` não está instalado. Um painel lê isso como medição.
**Correção:** omitir a série quando não há medição.

### BK-10 — PRAGMAs de desempenho não valem para as conexões de trabalho

`cache_size`, `mmap_size`, `synchronous` e `threads` são por conexão no SQLite.
Eles são aplicados só na conexão de inicialização (`queue_manager.py:197-205`),
que é fechada logo depois; cada operação abre uma conexão nova
(`_get_async_db`), e o aiosqlite cria uma thread por conexão. Os comentários
anunciam 256 MB de cache e 2 GB de mmap *fixos*. Só `journal_mode=WAL` persiste.
Derivado da semântica documentada do SQLite; desempenho não medido.

### BK-11 — `claim_task` sobrescreve a hora de criação

`claim_task` e `recover_stalled_tasks` gravam em `timestamp`, a mesma coluna que
guarda a criação e alimenta a ordenação, o bônus de espera do arbitrador e o
`since_hours` de `/status`. Tarefa devolvida à fila perde a antiguidade. Além
disso, `Task.timestamp` aceita string livre via `POST /add` e é comparado
lexicograficamente em `cleanup` e `promote_starved_tasks`.

### BK-12 — Filtro do modo `partial` aceita quebra de linha

`_validate_command` bloqueia `; | && & $ \` > <`, mas não `\n`, e o comando vai
inteiro para `powershell -Command`. **Prova:**
`"echo ok\nRemove-Item -Recurse -Force .\\alvo"` → aceito. Denylist de tokens
(`"rm -rf /"`) também cai com um espaço a mais.

### BK-13 — `/api/v1/predictive` nunca alcança o backend quando há token

A rota chama `/predictive-profile` sem `Authorization`. Com `API_SECRET_TOKEN`
configurado, o backend devolve 401 e a *"SOTA INTEGRATION"* cai sempre no
fallback. Caminho morto, sem consumidor efetivo.

### BK-14 — Ramo latente envia `API_SECRET_TOKEN` ao Google

`engine/llm_api.py:68-70`: sem `api_key`, usa `API_SECRET_TOKEN`, a credencial de
serviço do backend, como chave Gemini **na query string** de
`generativelanguage.googleapis.com`. Medido: os chamadores atuais passam chave
(`_try_provider` itera sobre chaves não vazias; `memory_rag.py`, `cli/commands.py`
e `llm/providers.py` usam `llm.gemini`). É uma armadilha que nenhum caminho
aciona hoje. **Correção:** levantar erro em vez de substituir.

---

## P3

- **BK-15 — erro interno exposto.** `api/v1/telemetry` devolve `error.message` do
  Prisma em 500; `nexus-proxy.ts` devolve a mensagem do `fetch`;
  `sota/counterfactual` e `sota/icm-transitions` devolvem `Error.message`;
  `handle_web_search` devolve `resp.error` do provedor.
- **BK-16 — relay Gemma.** O limite de 10 MB lê `content-length`; corpo chunked
  sem o header passa como `0`, e `request.json()` lê sem limite. Exige sessão.
- **BK-17 — `sota/pmev-pdf` pública.** Campos do corpo entram em strings PDF
  `(...)` sem escapar `(`, `)` e `\`, e `expanded_hands` não tem teto. O dano fica
  no PDF devolvido ao próprio chamador, mais o custo de memória.
- **BK-18 — RAG sem limites.** `n_results` de `/ask-oracle` e `top_k`/`query` de
  `RAGQuery` não têm teto; `int("abc")` vira 500 em vez de 400; o cache em disco de
  `/rag/query` cria um arquivo por consulta distinta, sem evicção.
- **BK-19 — `/api/files/view`.** Serve qualquer arquivo sob a raiz, inclusive
  `.env` e `.git/config`, para a credencial de serviço, ou para qualquer processo
  local quando nenhum token está configurado. Com `raw=true`, um `.svg` sai como
  `image/svg+xml` na origem da API: script ativo se aberto no navegador.
- **BK-20 — headers.** `security_headers_middleware` é o mais interno, então 401,
  403 e 429 dos middlewares externos saem sem `nosniff` e `X-Frame-Options`.
- **BK-21 — chave em query string.** `llm/gemini.py:165`, `engine/llm_api.py:70` e
  `frontend/src/app/api/v1/rag/route.ts`. Medido: `str(ClientResponseError)` inclui
  `url=...?key=...`. `llm/gemini.py` reembrulha só status e mensagem, mas preserva
  a causa com `from e`; um `logger.exception` a montante gravaria a chave.
  **Não** foi encontrado log que o faça. Preferir o header `x-goog-api-key`.

---

## O que foi verificado e está correto

- **SQL:** todas as consultas de `queue_manager.py` são parametrizadas; os
  placeholders dinâmicos geram apenas `?`.
- **Storage:** `utils/storage.py` aceita um único componente de caminho, confere
  forma POSIX e Windows e confirma `is_relative_to` após `resolve()`.
- **JWT:** `alg` fixado em HS256 pelo header, `compare_digest`, `exp`
  obrigatório, `nbf`/`iat` com tolerância, rejeição de NaN/Inf.
- **Fronteira produto/operador (B07):** JWT não alcança `/api/files/view` (403).
- **Relay Gemma:** recusa `NEXT_PUBLIC_*`, credencial em URL, path e query.
- **Busca web:** só aceita links `http(s)` e marca o conteúdo como dado não
  confiável.
- **Hipótese refutada:** bloqueio do event loop por `import-solver`. Com 1,14 MB,
  `import_tree` leva 23 ms.

## Dependências

| Camada | Comando | Resultado |
| :--- | :--- | :--- |
| npm | `npm audit --audit-level=low` | 0 vulnerabilidades |
| Python | `pip_audit -r requirements.txt` | 5 advisories, todas em `chromadb 1.5.9`, sem versão corrigida |

As advisories do chromadb (PYSEC-2026-311/3813/3814/3815) têm aceite em
`data/python_cve_acceptances.json`, válido até aparecer servidor HTTP do Chroma.
Reverificado hoje: só existe `chromadb.PersistentClient` (`memory_rag.py:208`). A
condição de expiração não disparou.

## Findings anteriores

B05 fechou em 2026-09-09. B07 fechou pela separação produto/operador, e BK-03 é
a parte que ela não cobria. B03, B04, B06, B08 e B09 **não foram remedidos**
nesta sessão; o estado deles é o de `reports/PLANO-FRENTES-ABERTAS-2026-09-08.md`.

## Ordem sugerida

Impacto dividido pelo raio de alteração (§10.2):

1. **BK-01:** dois argumentos e um teste. Raio mínimo, fecha a escalada.
2. **BK-03:** três linhas no middleware.
3. **BK-08:** uma linha de SQL.
4. **BK-04:** trocar a extração do worker ou fazer o grafo considerar o status
   das dependências.
5. **BK-05:** teto e validação por evento.
6. **BK-02:** decisão do Tier 0 entre as três alternativas.
7. BK-07, BK-06 e o restante.
