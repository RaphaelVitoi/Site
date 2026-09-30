---
id: REGISTRO-2026-09-30-auditoria-backend-e-correcao-dos-portoes
tipo: registro
escopo: auditoria de seguranca do backend (api/, llm/, database/) e correcao dos controles que a medicao expos
autor: Space-Bunny-Alpha [Tier 1]
criado_em: '2026-09-30'
verificado:
  - pytest tests/ (1840 passed, 1 skipped, 17min06s) -- BASELINE, antes de qualquer alteracao
  - ruff check . -- exit 0
  - npm run typecheck -- exit 0
  - npm run lint -- exit 0
nao_verificado:
  - A auditoria NAO mediu o frontend em profundidade (22 rotas mapeadas, 25% lidas)
  - Nao mediu `wasm-equity/`, `core/nexus-core-rust/`, `engine/` alem de varredura de padroes
  - A correcao de `SUPABASE_JWT_SECRET` nao foi aplicada ao ambiente -- e decisao do Tier 0
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - api/v1/middleware.py
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Auditoria de backend fortaleceu o middleware com trilha de recusa e tratamento de correlacao de erro sem quebrar contratos existentes.
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos:
      - .gitignore
      - frontend/jest.config.js
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Ignora lock do semgrep no gitignore e adiciona testes de servidor no jest.config.js preservando o baseline de frontend.
  - registro: handoff-2026-09-25-modelos-locais-saneamento-e-homeostase
    caminhos:
      - scripts/ops/Start-LocalLlama.ps1
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Ajuste de compatibilidade de subexpressao PowerShell no status sem alterar o runtime ou o gerenciamento dos modelos.
  - registro: registro-2026-09-25-integracao-qwen-coder-e-blindagem-testes
    caminhos:
      - scripts/ops/Start-LocalLlama.ps1
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Inicializacao do Qwen Coder e compatibilidade de terminal preservadas.
  - registro: registro-2026-09-25-modelos-locais-llama-g9v3-ling3
    caminhos:
      - scripts/ops/Start-LocalLlama.ps1
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Operacao dos modelos locais e status reporting via PowerShell preservados.
  - registro: registro-2026-09-29-saneamento-lint-e-calibracao
    caminhos:
      - .claude/agent-memory/gemma4/MEMORY.md
    parecer: >-
      Revisado em 2026-09-30 e mantido valido. Consolidacao do handoff de gemma4 mantendo a proveniencia e aprendizados sistemicos.
---

# REGISTRO — Auditoria de backend e correção dos portões que a medição expôs

## 1. O que este registro é

Correção dos achados de uma auditoria de segurança do backend, executada em
2026-09-30 sob instrução do Tier 0. A auditoria **não alterou nada**; este
registro documenta a **correção**, e cada linha de código alterada carrega o
motivo medido que a justifica.

O princípio que organizeu o trabalho: **nenhuma mudança sem medição que a
justifique, e nenhuma medição que eu não tenha executado.** Onde a hipótese
inicial estava errada, o código foi corrigido — não a medição.

## 2. Achados corrigidos

| ID | Sev | Achado | Correção | Verificado por |
| :--- | :--- | :--- | :--- | :--- |
| SEC-01 | **Critical** | Token Semgrep (`access_token` JWT de 911 chars + `refresh_token`) rastreado, invisível a **dois** portões | Chave **revogada** pelo Tier 0; `git rm --cached`; `.gitignore`; 2 padrões novos + `.lock` na varredura | `test_credenciais.py` 10 passed + **mutação** que faz reprovar |
| SEC-02 | **High** | `/api/files/view` servia `.claude/secrets/auth_secret.txt` — o `AUTH_SECRET` | Lista derivada do `docker-compose.yml`; banco por sufixo; regra do próprio nome de diretório | `test_servico_de_arquivo_2026_09_30.py` 12 passed |
| SEC-13 | **High** | `pyjwt` 2.13.0 com 7 CVEs sem piso, incluindo algorithm confusion (CVE-2026-102273) | `pyjwt>=2.14.0` em `constraint-dependencies`; lock resolveu 2.15.1 | `npm run python:audit` → **No known vulnerabilities** |
| SEC-16 | Medium | `oauthlib` 3.3.1, timing oracle em PKCE (CVE-2026-49265) | `oauthlib>=4.0.0` no piso; cadeia `chromadb→kubernetes` morta | `pip-audit` exit 0 |
| SEC-05 | Medium | `iss`/`aud` conferidos só quando declarados, sem aviso quando ausentes | Aviso no caminho do JWT; as 3 variáveis no `_env.example.ps1` com o motivo | `test_claims_opcionais_2026_09_30.py` 14 passed |
| SEC-06 | Medium | `provider` sem allowlist, `Literal` desligado por `# type: ignore` | Allowlist **derivada do tipo** (`get_args`), `cast` tipado | `ruff` limpo + **pyright 33→32** |
| SEC-07 | Medium | Nenhum 401/403/429 registrado — telemetria de erro sem telemetria de ataque | `_recusa()` + `_correlacao()` + registro de 429 | `test_trilha_de_recusa_2026_09_30.py` 23 passed |
| SEC-10 | Low | Query de web search sem teto | `MAX_WEB_SEARCH_QUERY_CHARS = 512` | ruff + suíte |

**Portões quebrados corrigidos (achado estrutural, não listado acima):**
`npm run python:audit`, `python:test`, `python:test:fast`, `python:coverage` e
`python:test:watch` usavam `uv run <script>`, que falha com `uv trampoline
failed to canonicalize script path`. **A suíte de 1840 testes não rodava por
nenhum caminho do `package.json`.** Todos agora usam `python -m`, que desvia do
trampolim. Verificado: `uv run --no-sync pytest` falha, `uv run --no-sync
python -m pytest` retorna `pytest 9.1.1`.

## 3. Os três achados que a correção produziu

Nenhum destes estava no relatório original. Todos apareceram porque a correção
tem teste, e o teste mede em vez de supor.

**3.1 — Um segundo defeito no mesmo lugar de SEC-02.** `parts[:-1]` exclui o
próprio nome, então `/app/queue` — volume montado pelo `docker-compose.yml:17` —
devolvia servível, ainda que `/app/queue/tasks.db` fosse recusado. O arquivo
dentro estava barrado; o caminho do volume, não. Achado pelo teste que deriva os
volumes do YAML em vez de hardcodar o caso medido.

**3.2 — O padrão de OAuth que escrevi erraria no caso mais comum.** A primeira
versão casava com YAML (`refresh_token: abc`) e **não** com JSON
(`"access_token": "abc"`) — são duas aspas, a da chave e a do valor, e o padrão
aceitava uma. Token em JSON é a forma mais comum de vazar esse par.

**3.3 — `python:typecheck` não mede tipos.** É `ruff check .`, o mesmo comando
do lint. O pyright real dá **32 erros** (31 `reportArgumentType` em
`llm/openrouter_pool.py`, 1 em `scripts/ops/avaliar_impacto_sessao.py`).
Ligar o portão como está reprovaria o build. **Não ligado** — decisión
deliberada, registrada aqui. Um dos 32 era o SEC-06, que o `# type: ignore`
escondia.

## 4. Estado medido do ambiente (2026-09-30)

Este bloco é o que mudou o understanding, e veio do aviso do Tier 0 sobre
chaves no HKCU/HKLM.

| Chave | Onde está | Medido como |
| :--- | :--- | :--- |
| 45 chaves LLM (Gemini, OpenRouter por tier) | **Registro** — `HKCU:\Environment` e `HKLM\...\Session Manager\Environment` | `winreg.EnumValue`, o mesmo caminho que `llm/openrouter_pool.py:74-92` usa |
| `API_SECRET_TOKEN` | **`.env` em disco** — `load_env()` (`utils/env_loader.py:72`) | ausente no Registro; presente em `os.environ` após `load_env()` |
| `SUPABASE_JWT_SECRET` | **em lugar nenhum** | ausente no Registro **e** no `.env` |

**Consequência que a auditoria original não tinha:** com
`SUPABASE_JWT_SECRET` ausente, `_handle_jwt_token_auth` responde **500** e as
**22 rotas de identidade de produto estão inacessíveis**. As 17 rotas de
credencial de serviço funcionam. Três rotas Next.js
(`sota/timesfm-forecast`, `sota/pmev-heatmap`, e o RAG) encaminham exigindo
sessão e recebem 500.

Isto **não é vulnerabilidade** — é o modo de falha correto (fail-closed). É
achado **operacional**: o produto está sem identidade de usuário nesta máquina
e nada no código o sinaliza.

### 4.1 A causa não é ausência de configuração — é divergência de nomes

**Correção do que este registro afirmava antes.** Escrevi que
`SUPABASE_JWT_SECRET` não tinha "caminho canônico" e que a correção seria
gravá-la no `.env`. **Estava errado.** O caminho existe e é
`scripts/ops/Set-SupabaseKey.ps1` — parametrizado (`param` obrigatório, sem
valor no repositório), HKCU **e** HKLM, com broadcast `WM_SETTINGCHANGE`
(`SendMessageTimeout`, `HWND_BROADCAST`, 5000 ms) para propagação sem
reinicialização.

> **Lei de Concorrência — arquivo de outro condutor.** No momento em que este
> registro é escrito, `Set-SupabaseKey.ps1` está **untracked** e
> `git log --all -- scripts/ops/Set-SupabaseKey.ps1` devolve vazio: ele **não
> tem nenhum commit**. Timestamp de criação: 2026-09-30 02:52, durante esta
> sessão, e **não é uma alteração minha** — não o criei nem o editei. Sob a Lei
> de Concorrência (CLAUDE.md §0), não toco, não versiono e não commito. A
> leitura do conteúdo (para diagnosticar a divergência de nomes) é inofensiva e
> foi feita. A decisão de commitar é do condutor que o criou.

#### 4.1.1 Medido depois da inserção: **duas barreiras, e corrigir uma não basta**

O Tier 0 inseriu a chave (2026-09-30, ~03:05) e o registro foi lido de novo.
Resultado — **o backend continua sem ver**:

| Medida | Valor |
| :--- | :--- |
| `HKCU:\Environment` contém | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_TOKEN`, `SUPABASE_KEY` (len 44, valor não reproduzido) |
| `HKCU` contém `SUPABASE_JWT_SECRET`? | **não** |
| `os.environ` do processo, após `load_env()` | `SUPABASE_ACCESS_TOKEN` **ausente** |
| `os.environ` → `SUPABASE_JWT_SECRET` | **ausente** |
| `middleware._jwt_secret()` | **falso** |

**Barreira 1 — nome.** O script grava `SUPABASE_ACCESS_TOKEN`; o middleware
exige `SUPABASE_JWT_SECRET`. São **segredos diferentes**: o primeiro é o access
token da Management API (`sbp_…`), o segundo é o JWT secret do projeto, que
assina os tokens de sessão. Gravar o primeiro não habilita o segundo. O
comprimento (44) é compatível com ambos — quem decide é o **nome**, e o nome é
justamente o que diverge.

**Barreira 2 — herança de ambiente.** `Set-SupabaseKey.ps1` emite
`WM_SETTINGCHANGE` e a propagação vale para **instâncias novas**. Um processo
já em execução não a recebe. Além disso, `middleware.py:57` faz
`SUPABASE_JWT_SECRET = os.environ.get(...)` **no import** — se a variável não
estiver ali, fica `None` para sempre. (`_jwt_secret()`, linha 69, relê a cada
chamada e por isso escaparia do congelamento — mas a barreira 1 impede que
haja valor a ler.)

**Consequência para quem for corrigir:** renomear a variável no script resolve a
barreira 1 e **ainda exige reiniciar o processo do backend** para a barreira 2.
Fazer só um dos dois produz o mesmo sintoma e uma conclusão errada de novo.

**O que eu recomendo, e não fiz:** reconciliar os nomes dentro de
`Set-SupabaseKey.ps1` (gravar também `SUPABASE_JWT_SECRET`), com o valor do
JWT secret como parâmetro separado do access token da Management API — são
segredos com âmbitos e permissões diferentes, e um `param` único para os dois é o
que produziu a confusão. **Decisão do Tier 0:** o arquivo é de outro condutor
e o valor é segredo.

O problema é que **o script e o middleware não falando o mesmo idioma**:

| Sistema | Variável | Consumidor |
| :--- | :--- | :--- |
| `Set-SupabaseKey.ps1:32` grava | `SUPABASE_ACCESS_TOKEN` | **nenhum** — `git grep` em `*.py`/`*.ts`/`*.mjs` devolve ZERO |
| idem | `SUPABASE_TOKEN` | **nenhum** |
| idem | `SUPABASE_KEY` | **nenhum** |
| `middleware.py:57,69` exige | `SUPABASE_JWT_SECRET` | — e **nenhum script o grava** |
| `frontend/src/utils/supabase/server.ts:9` usa | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | o frontend, para o SDK do Supabase |

Os três primeiros são os nomes da CLI/Management API do Supabase. O quarto é o
**JWT secret do projeto** — outra coisa. O quinto é a `anon` key, pública por
desenho, e usá-la como segredo de verificação é exatamente o que BK-03 mediu e
bloqueou no verificador.

Ou seja: rodar o script **não** resolve, e é justamente por isso que a
identidade de produto está inerte mesmo com o script disponível e correto. A
correção é reconciliar os nomes — decisão do Tier 0, por tocar segredo e
contrato entre três sistemas. O contrato está escrito em `_env.example.ps1`
com o caminho, os três nomes em conflito e a razão de cada um.

## 5. Divergência de leitura que vale registro

**5.1 — Fonte da credencial.** Escrevi primeiro que as chaves viviam todas no
Registro. **Estava errado para `API_SECRET_TOKEN`.** A fonte é dupla: chaves LLM
no Registro (45, via `winreg`), credencial de serviço no `.env`. Um registro
que diz "no Registro" sem distinguir produziria exatamente a falha que ele
existe para documentar — configurar no lugar errado e concluir que a chave não
pega. `_env.example.ps1` agora declara as duas fontes com o comando de cada uma.

**5.2 — Caminho canônico do JWT secret.** Escrevi que não havia caminho e que a
correção seria gravar no `.env`. **Estava errado**, e a correção está em §4.1:
o caminho existe (`Set-SupabaseKey.ps1`) e está correto; o que falta é ele
falar o nome que o middleware lê.

As duas correções ficam registradas porque o erro de leitura é o mais
caro desta lista: um registro que afirma o caminho errado de uma credencial
não é apenas inexacto — **faz o próximo agente gravar no lugar errado e
concluir que a chave não pega.**

## 6. O padrão que liga os achados mais graves

**Controle escrito que não mede.** Três instâncias, três namespaces:

| Controle | O que afirma | O que media |
| :--- | :--- | :--- |
| `PADROES_DE_CREDENCIAL.json` | barra credencial em arquivo rastreado | zero padrões para JWT; `.lock` fora da varredura |
| `npm run python:audit` | barra dependência vulnerável | falha com `uv trampoline` — não executa |
| `python:typecheck` | verifica tipos | `ruff check .` — o mesmo do lint |

Os dois primeiros **reportavam verde**. A suíte passou 1840 vezes, o portão de
âncora rodou em todo commit, e nenhum dos dois viu o token de 911 caracteres nem
as 7 CVEs. A correção dos três é o núcleo deste registro; os achados
individuais são consequência.

**O CI não tem etapa de auditoria de dependência nem de segredo** — medido:
`grep -E 'pip-audit|npm audit|bandit|trivy|codeql|secret'` em
`.github/workflows/sota-ci.yml` devolve zero ocorrências. Os portões são
**locais**. Um consumidor de branch clone, roda `npm test` e vê verde, sem
nenhum dos três rodar. **Recomendação para o Tier 0:** levar
`test_credenciais.py` e `npm run python:audit` ao `sota-ci.yml`. Não fiz essa
alteração: é mudança de pipeline, e a §3.1 da raiz exige arbitragem explícita.

## 7. Testes adicionados

Todos em padrão RED→GREEN, cada um com a medição que o motivou no docstring.

| Arquivo | Testes | Fecha |
| :--- | :--- | :--- |
| `tests/test_credenciais.py` (+4) | 10 | SEC-01 |
| `tests/test_servico_de_arquivo_2026_09_30.py` (novo) | 12 | SEC-02 + o defeito de §3.1 |
| `tests/test_trilha_de_recusa_2026_09_30.py` (novo) | 23 | SEC-07 |
| `tests/test_claims_opcionais_2026_09_30.py` (novo) | 14 | SEC-05 |

**Aceite demonstrado, não afirmado:** plantei um token sintético em
`.tmp_audit_probe/probe.lock` e o portão acusou **os dois** padrões no `.lock` —
o arquivo que antes era cego. Mutação faz reprovar; reversão faz passar. Probe
removido, árvore limpa. Sem isso, "o portão foi corrigido" seria uma afirmação;
com isso, é uma demonstração.

## 8. Verificação

```
ruff check .                          exit 0
pyright                               32 erros (era 33; SEC-06 removido)
npm run python:audit                  No known vulnerabilities found, 5 ignored
uv lock                               pyjwt 2.13.0→2.15.1, oauthlib 3.3.1→4.0.0
pytest tests/ (baseline, antes)       1840 passed, 1 skipped, 17min06s
```

**A suíte completa com as correções aplicadas está em execução no momento em
que este registro é escrito** e o resultado ainda não é declarado. Pelo
`CLAUDE.md` §5, verificação não executada não é verificação aprovada: **nada é
commitado até a suíte fechar em verde.**

Uma execução intermediária reportou `1 failed, 220 errors` — e a causa foi
medida, não suposta: **duas suítes minhas rodando simultaneamente** no mesmo
`.venv` e no mesmo SQLite. Os quatro arquivos afetados passam isolados
(`test_vram_vulkan.py` 11 passed, `test_cwv_gate_truthfulness.py` 27 passed).
Isto é registrado porque a leitura errada seria "a correção quebrou 220 testes",
e essa leitura é mais destrutiva do que a verdade.

## 9. Não corrigido, deliberadamente

| Item | Razão |
| :--- | :--- |
| `python:typecheck` → pyright | 32 erros. Ligar reprovaria o build. Corrigir os 32 é trabalho próprio. |
| 32 erros do pyright | 31 em `llm/openrouter_pool.py`, 1 em `scripts/ops/avaliar_impacto_sessao.py`. Fora do escopo desta correção. |
| SEC-03 (rate limit × 20 réplicas) | Correção é no edge (Cloud Armor). Mudança de infraestrutura. |
| SEC-04 (cookie órfão) | Removê-lo pode quebrar consumidor não medido. Exige decisão. |
| SEC-08 a SEC-11 | Baixa severidade; agrupados numa fase própria. |
| `SUPABASE_JWT_SECRET` ausente | É segredo. A escrita é do Tier 0; o caminho está documentado. |
| Purga de histórico do git | O token foi **revogado**, o que o invalida independentemente do histórico. O `CLAUDE.md` desaconselha reescrever branch publicada. |
| Auditoria de segredo no CI | Mudança de pipeline — exige §3.1. |

## 10. Regras que valem para a próxima sessão

1. **Portão verde que nunca falhou não está demonstrado.** Plante a falha e
   veja reprovar. Vale para qualquer controle novo.
2. **Padrão de segurança se prova nos DOIS formatos.** YAML e JSON, `.yml` e
   `.lock`, positivo e negativo. Lacuna de segurança que sobrevive a dois
   portões tinha duas metades, e corrigir uma deixa a outra.
3. **`# type: ignore` é uma decisão, não conveniência.** O SEC-06 estava
   escondido por um. Quando a supressão é legítima, o motivo vai ao lado.
4. **Fonte de verdade da credencial precisa de dois fatos:** onde está **e**
   quem lê. Neste projeto a resposta é dupla, e dizer só uma produz erro.
5. **Mede a hipótese antes de consertar.** Em três casos a hipótese inicial
   estava errada e o código estava certo — corrigi o teste, não o código.
