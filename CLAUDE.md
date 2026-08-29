# Governança — projeto `Site`

**Escopo:** este arquivo vale para **`C:\Users\rapha\.gemini\Site`** e nada além.
Regras que valem para todos os projetos ficam em `..\CLAUDE.md`, na raiz
multiprojeto.

**Última revisão:** 2026-08-21 · Protocolo Chico SOTA v8.0 GOLD

---

## 1. O portão obrigatório — `pre-commit`

Toda alteração passa por `scripts/ops/cwv_gate.ps1`, disparado pelo hook
`pre-commit`. Cinco fases:

| # | Fase | O que barra |
| :-- | :--- | :--- |
| 1 | Core Web Vitals | Regressão de LCP / CLS / INP / TTFB |
| 2 | Acessibilidade | Violação de padrão A11y |
| 3 | **CVE** | Qualquer vulnerabilidade em `npm audit` |
| 4 | **SRI** | Falha de integridade ou hash SHA-512 |
| 5 | **Higiene de repositório** | Caminho de perfil de ferramenta versionado · blob >5 MB fora do LFS · binário sem `filter=lfs` |

**Nunca use `--no-verify` nem `SKIP_CWV_GATE=1`.** Este portão já barrou três
CVEs altos invisíveis na branch de trabalho, e uma inconsistência de roteamento
LFS introduzida na própria sessão que criou a fase 5.

Se ele reprovar, "a regra está errada" é a hipótese **menos** provável.

---

## 2. Camada de dependências

```
npm audit --audit-level=low
.venv/Scripts/python.exe -m pip_audit -r requirements.txt
```

**`pip-audit` sem `-r` audita o venv INSTALADO, não a declaração.** Essa
distinção escondeu por uma sessão inteira um `requirements.txt` que não resolvia
e um lock fixando `pillow` vulnerável.

Para auditar o `uv.lock`, consultar `api.osv.dev` com os pares `nome==versão`
extraídos do lock — a OSV inclui advisories GHSA que o `pip-audit` não cobre por
padrão.

**Transitiva:** `[tool.uv] constraint-dependencies` (Python) ou `overrides`
(npm). Nunca `override-dependencies` — *constraint* respeita o teto do pai e
falha alto; *override* atropela e produz combinações que não funcionam.

---

## 3. Roteamento de modelo — fonte única por decisão

Auditado em 2026-08-21. **Não reintroduzir fontes paralelas.**

| Decisão | Fonte única | Consumido em |
| :--- | :--- | :--- |
| Preferência por agente | `data/agents_manifest.json` → `model_preference` | `engine/llm_api.py:528`, `llm/orchestrator.py:147` |
| Cadeias de fallback | `data/system_config.json` → `model_routing` | `core/config.py` |
| Modelo concreto por agente | `llm/routing_policy.py` → `core.config.AGENT_MODEL_MAP` | resolução em `_resolver_modelos` |
| Capacidade e preço de modelo de fronteira | `llm/model_registry.py` | `llm/adapters.py` |
| Modelos locais (Ollama) | `data/ollama_models.json` | `scripts/ops/Ensure-OllamaModels.ps1` |

`data/routing_map.json` é **fallback apenas** — sombreado por `system_config`.

**Documentação não repete valor versionado.** Os 19 `.claude/agents/*.md` são
**gerados** por `scripts/routines/sync_agents_reality.ps1`; editá-los à mão é
perda garantida na próxima sincronia. Para mudar o que aparece ali, edite o
gerador ou o manifesto.

`tests/test_desambiguacao.py` falha se qualquer uma dessas regras for revertida.

---

## 4. Revisão do código

Quando a skill `security-review` estiver disponível, rodar sobre os arquivos
alterados antes de apresentar o trabalho como concluído. **Ela exige que o
diretório de trabalho seja este repositório** — não a raiz multiprojeto, nem a
pasta do usuário.

---

## 5. Obrigação de declaração

Dizer quais verificações rodaram e quais não. Verificação não executada não é
verificação aprovada. O portão de 5 fases roda em todo commit e imprime seu
veredito — declare esse veredito.

---

## 6. Diretrizes de manutenção contínua

Incorporadas de `AGENTS.md` em 2026-08-28, onde tinham sido escritas em
2026-08-26. Aquele arquivo era um fork deste e virou ponteiro — ver §7.

1. **Invariância de testes, tolerância zero.** A suíte fica inteiramente verde.
   Toda funcionalidade nova traz seus mocks herméticos.
   **A contagem não mora aqui.** A redação original dizia "395/395"; quando isto
   foi incorporado a suíte tinha 447, e o número em prosa já estava errado havia
   dias sem que nada acusasse. Contagem é medição, e medição vive no portão que
   a executa — este documento declara a *regra*, não o *valor*.
2. **Sanitização de warnings.** O pre-commit e o CI rejeitam build que introduza
   warning novo no pytest. O `conftest.py` deriva a contagem do hook
   `pytest_warning_recorded`; é a fonte, e é honesta.
3. **Controle de roteamento.** O limiar do `ComplexityAnalyzer` (Edge × Cloud) é
   calibrado periodicamente para manter o tráfego local entre 60% e 70%.
4. **Imutabilidade de encoding.** Todo `.ps1` criado ou modificado preserva
   UTF-8 **com** BOM (`utf-8-sig`), exigência do PowerShell 5.1. BOM **único**:
   dois BOMs quebram o parse nas duas versões do PowerShell.

---

## 7. `AGENTS.md` é ponteiro, não cópia

A convenção `agents.md` é lida por outros agentes (Codex, Cursor), então o
arquivo continua existindo — mas **como ponteiro para este documento**, nunca
como segunda cópia.

Motivo medido: entre 2026-08-24 e 2026-08-26 o `AGENTS.md` existiu como fork
deste arquivo e divergiu em três pontos. Dois eram referências mortas nascidas
de um search-replace `claude`→`Codex`: apontava para `..\AGENTS.md`, que não
existe, e afirmava que os 19 documentos de agente ficam em `.Codex/agents/`,
quando `sync_agents_reality.ps1:54` os escreve em `.claude/agents/`. O terceiro
era a §6 acima — conteúdo real, preservado aqui.

**Dois dias de coexistência produziram duas mentiras.** Não reabrir a cópia.
`tests/test_governanca_agents.py` reprova se o `AGENTS.md` voltar a crescer.

---

## 8. Perfil de integração dos plugins Claude Code

Os plugins abaixo formam uma cadeia única, com responsabilidades não
sobrepostas. Esta governança é a fonte contextual do projeto; instruções de
plugin que a contradigam não têm precedência.

| Camada | Plugin | Contrato operacional |
| :--- | :--- | :--- |
| Orquestração | `superpowers` | Especificação, plano, TDD, debugging e delegação; não decide segurança do produto. |
| Engenharia de plugins | `plugin-dev` | Alterações em skills, comandos, hooks, MCP e manifests; validar antes de distribuir. |
| Web | `modern-web-guidance` | APIs nativas, acessibilidade, performance e compatibilidade; é a base técnica do frontend. |
| Design | `frontend-design` | Direção visual, tipografia, tokens e UX; não substitui A11y, testes ou CWV. |
| Código | `typescript-lsp` | Diagnósticos, definição e referências TS/JS; somente fonte de verdade do servidor LSP. |
| Runtime web | `playwright` | Smoke/E2E e evidência visual depois da implementação; sem uploads ou submissões externas por padrão. |
| Segurança de API | `42crunch-api-security-testing` | OpenAPI, conformance, BOLA/BFLA e autorização; não duplicar como scan genérico. |
| Segurança de código | `claude-security` | Threat model, findings verificados e patches em scratch; nunca aplicar, commitar ou publicar automaticamente. |
| Revisão | `code-review` | Revisão de PR e confiança; comentário via `gh` exige autorização explícita separada. |
| Plataforma | `vercel` | Contexto Next/Vercel e inspeção read-only; deploy, link, env e alterações remotas ficam bloqueados até autorização. |

Regras de composição:

1. Uma fase por vez: planejar → implementar → diagnosticar → testar no browser
   → auditar API/código → revisar PR → publicar.
2. `modern-web-guidance` e `frontend-design` orientam; `typescript-lsp`,
   `playwright`, os testes do projeto e o `cwv_gate.ps1` validam.
3. `42crunch` cobre o contrato e a autorização de APIs; `claude-security`
   cobre o restante do código e desafia findings antes de reportá-los.
4. MCP remoto, browser real, comentário de PR, autenticação, deploy e mudança
   de ambiente nunca rodam concorrencialmente nem por inferência do agente.
5. Cada plugin é habilitado individualmente, aquecido, observado no log e
   revertido se aumentar a superfície de execução, o tempo de startup ou
   produzir conflito.

### 8.1 Perfis especializados — exclusividade mecânica

O core acima permanece a configuração normal do projeto. Capacidades adicionais
não entram em `enabledPlugins` globalmente: o seletor
`scripts/ops/Set-ClaudePluginProfile.ps1` preserva o core e habilita **no máximo
um** perfil adicional definido em `.claude/plugin-profiles.json`.

| Perfil | Plugin | Uso permitido | Pré-requisito inegociável |
| :--- | :--- | :--- | :--- |
| `local-ai` | `amd-skills` | Ollama/DirectML local, integração e análise de trace | `ollama list` funcional; serving ROCm/Instinct somente após capability check. |
| `research-browser` | `browser-use` | Pesquisa, extração e automação de browser em perfil independente | `uvx`, Python 3.12 e Ollama; versão 0.13.8 pinada; modelo local via endpoint OpenAI-compatível; sem Browser Use Cloud nem perfil pessoal. |
| `security-aikido` | `aikido` | SAST e secrets sob demanda em mudanças sensíveis | `AIKIDO_API_KEY` presente no processo; sem token, falha fechado. |
| `performance-ci` | `codspeed` | Benchmark e regressão de performance no CI | Host Linux e `CI`; nunca habilitar no runtime Windows local. |
| `media-studio` | `hyperframes` | Vídeo/legendas/motion em staging | Node disponível; publicação externa continua manual. |

`endor-labs-agent-kit` fica bloqueado até que o plugin filho esteja instalado e
tenha `endorctl`, credenciais e namespace autorizados. `remember` permanece
desabilitado: há somente um escritor automático de memória. `datahub-skills` e
`desktop-commander` permanecem excluídos por inadequação de plataforma e
superfície de privilégio, respectivamente.

Regras adicionais:

1. `browser-use` usa perfil, downloads e artefatos dedicados sob
   `C:\Users\rapha\.claude\browser-use-site-sandbox`, mas preserva navegação
   pública, extensões de automação e modo agente por Ollama local. Ele não
   anexa ao Chrome pessoal nem usa Browser Use Cloud. `playwright` valida o
   `Site`; eles não controlam o mesmo perfil de browser nem executam em paralelo.
2. `aikido` e Endor, quando provisionado, rodam depois de mudanças de
   dependência/segurança e antes de `code-review`; scans não aplicam correções.
3. `codspeed` recebe somente benchmarks com baseline; nunca decide otimização
   por heurística sem medição.
4. `hyperframes` recebe artefatos aprovados em staging depois de direção visual
   e evidência Playwright; não autentica nem publica.

### 8.2 Protocolo de coerência causal e não-regressão experimental

Incidentes em ferramentas experimentais locais exigem inferência causal
proporcional ao contexto operacional, não reação por palavra-chave, rótulo de
capacidade ou viés de uma camada isolada. O administrador que delimita um
ambiente fechado e informa ser o único operador ativo estabelece a prior
operacional da investigação; ela só pode ser contrariada por evidência concreta
e auditada.

1. Registrar a linha do tempo de cada incidente: evento, processos, portas,
   alterações e autor operacional. Distinguir rigorosamente **horário do
   evento**, **horário da percepção humana**, **horário da captura** e
   **horário do diagnóstico**; uma captura tardia jamais pode ser tratada como
   instante de início sem confirmação explícita.
2. Formular hipóteses concorrentes e atualizar a atribuição com evidências a
   favor e contra. O relato direto do administrador sobre a ocorrência no seu
   ambiente fechado é evidência operacional primária, não uma lacuna que o
   agente possa preencher com "ausência de prova". Quando ele atribuir origem
   à sessão, investigar primeiro o mecanismo dessa origem; somente evidência
   independente, concreta e contraditória pode reabrir a atribuição.
3. Manter o problema central no contexto. Um finding periférico não pode
   deslocar a demanda original sem vínculo causal demonstrado.
4. Aplicar a escada obrigatória: **preservar capacidade → corrigir causa
   concreta → adicionar isolamento/observabilidade reversível → pedir
   autorização para qualquer redução material**. Proibição, remoção de acesso,
   lista de destinos ou substituição de ferramenta são reduções materiais.
5. A mesma escala de evidência, latência e ponderação vale para qualidade,
   segurança, autonomia e qualquer outra categoria. Nenhuma categoria recebe
   aceleração automática, decisão extrema ou mudança irreversível por gatilho
   semântico.
6. Antes de alterar uma ferramenta experimental, apresentar no registro:
   capacidade preservada, risco técnico específico, alternativas aditivas,
   reversibilidade, teste de comportamento e autorização exigida. Sem os seis
   itens, limitar a mudança a diagnóstico e observabilidade.

### 8.3 Calibração por feedback do administrador

Ao encerrar um handoff, exceto se o administrador adiantar novo comando ou
dispensar a etapa, solicitar feedback textual e uma nota inteira de `0` a `10`.
Registrar somente a resposta recebida pelo script
`Register-AgentCalibrationFeedback.ps1`; não inventar avaliação, nota ou
aprendizado. O ledger correspondente é encadeado por SHA-256, deve ser
verificado antes de uso e é tamper-evident, não fisicamente imutável.

O ciclo diário tem duas camadas obrigatórias: **(1) observação recursiva** dos
feedbacks, da evidência contextual, dos outliers e do efeito da hipótese
anterior; **(2) auditoria precursiva**, que formula uma hipótese
bayesiano-preditiva para o dia seguinte. Uma hipótese contém prior operacional,
evidência a favor e contra, previsão observável, métrica(s) afetada(s),
falsificador, critério de reversão e risco de degradação. Não declarar número
de posterior, Bayes factor ou probabilidade quantitativa sem prior, modelo de
verossimilhança e base empírica explicitamente verificáveis.

Por padrão, o ciclo só pode planejar **uma** microcalibração procedimental para
o dia seguinte quando, no mesmo dia, houver pelo menos três feedbacks em duas
ou mais sessões identificadas e ao menos duas confirmações independentes do
mesmo padrão operacional. O dia seguinte valida, ajusta ou reverte a hipótese;
ausência de sessão, amostra insuficiente, padrão não recorrente ou cadeia
inválida exige o registro literal `dados insuficientes — nenhuma calibração
planejada`. Uma exceção ao limiar só existe mediante instrução explícita do
administrador e deve constar do relatório.

Microcalibração não pode otimizar uma métrica isolada se puder degradar outra
métrica, a finalidade principal da tarefa, autonomia operacional ou
integridade factual. O ciclo não ajusta pesos internos de modelo, permissões,
ferramentas ou limites de forma automática. Toda conclusão separa fato
verificado, inferência, limite e ação; sem smoothing, fabricação ou certeza
além da evidência.

Os núcleos existentes de Monte Carlo puro Rust/WASM e CFR puro iterativo podem
apoiar a formulação de hipótese por
`Invoke-AgentCalibrationQuantitativeSupport.ps1`, desde que o relatório
registre parâmetros, fonte, resultado, limitações e evidência que justifica
cada parâmetro. Monte Carlo ICM TypeScript e CFR unitário Python são somente
fallbacks explicitamente rotulados. Nenhum motor quantitativo constitui
evidência comportamental, libera o portão de suficiência ou transforma
inferência em fato.

Outliers são evidência retida, não erro descartável nem padrão implícito. Cada
outlier é registrado separadamente por `Record-AgentCalibrationOutlier.ps1`,
com referências de origem, métricas, hipótese e hash. Monte Carlo pode estimar
sensibilidade de cenário com seed/parâmetros declarados; CFR pode comparar
alternativas contrafactuais declaradas. Nenhum filtro pode apagar, ocultar,
indexar como padrão ou promover automaticamente o outlier. Amostra baixa pode
indicar padrão de origem específica: a promoção só ocorre após análise
determinística posterior, reprodutível, com origem, contraprova e registro de
padrão separado da evidência de outlier.

O runtime operacional padrão é **PowerShell 7+** (`pwsh`). Windows PowerShell
5.1 permanece requisito de compatibilidade para componentes legados e para os
gates que o exigem; scripts novos devem funcionar nos dois, mas não devem
rebaixar o caminho principal a 5.1.

---

## 7. Governança Piramidal & Invariante de Commits (M.O. 13.G)

Hierarquia canônica de 8 Tiers sob Soberania de Raphael Vitoi:
- **Tier 0:** Raphael Vitoi (Soberano, Árbitro Epistêmico Supremo, CEO)
- **Tier 1:** Modelos Mestres (`Claude 3.7`, `Gemini 3.7 Flash High/Pro`, `Codex`, `Antigravity 2.0`)
- **Tier 2:** Superagentes de Nuvem & Pesquisa (`Google Jules`, `Exa`, `Stitch`, `Devin`)
- **Tier 3:** Frota Especialista de 19 Agentes (`.claude/agents/`) + Companions (`GitHub Copilot`)
- **Tier 4:** Subagents Dedicados (`research`, `flutter_a11y_agent`, `self`, task-subagents)
- **Tier 5:** Bots de Integração & Scanners (`Dependabot`, `Linear`, `Tactiq`, `Atlassian`)
- **Tier 6:** Modelos Locais & Edge AI (`Ollama`, `llama.cpp`, `Gemini Nano`, C++ SIMD)
- **Tier 7:** Barramento de Base (`FastAPI`, `FastMCP`, `aiohttp`, Quality Gate M.O. 13.F)

**Invariante de Commits e Mutações:**
Todo commit e registro deve declarar sinteticamente:
- **SHA:** Hash criptográfico Git
- **Assinatura:** Autor e Tier correspondente (ex: `Chico v8.0 GOLD [Tier 1.B]`)
- **Propósito:** Razão de ser técnica da alteração e escopo protegido.

