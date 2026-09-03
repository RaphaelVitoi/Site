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

### 1.1 Operar de host sem Windows PowerShell 5.1

A fase 5 parseia todo `.ps1` em stage com `powershell.exe` — o 5.1, que é o
interpretador que o hook e as tarefas agendadas de fato usam. **Ele não tem
build para Linux ou macOS, e não haverá**: é componente do Windows, não pacote
instalável. Agentes e runners de CI operam sem ele.

Nesse host o portão roda a **bateria substituta** (`Test-Ps51CompatibilidadeSubstituta`
em `scripts/ops/cwv_gate.ps1`). Ela não é dispensa — **tudo que acha bloqueia**:

| Verificação | Instrumento | Alcance |
| :--- | :--- | :--- |
| Não-ASCII sem BOM | bytes do arquivo | exata; é o defeito que a fase documenta |
| BOM UTF-8 duplicado | bytes do arquivo | exata; quebra nas duas versões (§6.4) |
| Não parseia nem no 7 | AST do `pwsh` | conservadora: falha no 7 ⇒ falha no 5.1 |
| Construto exclusivo do 7 | token + AST | `??` `??=` `?.` `?[` `&&` `\|\|`, ternário, `PipelineChain`, `-Parallel` |

As checagens de bytes rodam **sempre**, antes de qualquer ramo de interpretador:
elas nunca dependeram do 5.1.

Aprovar na bateria **não consome vaga de warning**. O teto de dois existe para
cobertura *perdida* — fases 1 e 2 sem CDP, onde nada foi medido. Aqui a
verificação aconteceu, e contá-la como degradação gastaria uma das duas vagas em
toda alteração de `.ps1` feita por agente. O resíduo aparece na linha
`Ps51PorBateria` (INFO) da tabela de higiene, numa linha amarela e no relatório.

**O que a bateria não alcança, e continua exigindo Windows:** cmdlet ou
parâmetro que não existe na 5.1, e recurso de classe do 7 — falham em *tempo de
execução*, e nenhum parser os pega. Antes de release, e para qualquer `.ps1` que
seja hook ou tarefa agendada, revalide em host Windows.

### 1.2 Âncoras num merge — obrigação é do que a resolução decidiu

O portão de registro (`scripts/ops/record_gate.py`) coleta caminhos com
`git diff --cached`, que compara o índice com HEAD — o **primeiro** pai. Num
merge isso varreria também tudo que veio do outro lado, incluindo o que já
cumpriu sua obrigação de âncora na branch de origem.

**A regra em vigor:** um caminho é *do merge* quando difere de **todos** os pais.
Batendo com qualquer pai, foi herdado, e o parecer é de quem o commitou lá —
`caminhos_herdados_de_merge()` faz essa subtração, e só num merge.

Ao resolver um merge, portanto, você deve revisão de âncora **apenas** para o
que a sua resolução mudou. Para o resto, o parecer correto é apontar a
reconciliação já feita na origem, não reescrevê-la.

Medição que originou a regra, 2026-09-01: o merge da fusão `.cerebro` →
`.claude` recobrou 15 âncoras já reconciliadas, em 12 caminhos byte a byte
idênticos ao lado remoto. Reconciliar de novo não acrescenta verificação — só
empurra o operador para o parecer genérico, e **parecer genérico é pior que
nenhum**, porque parece revisão sem ser. Guard em
`tests/test_record_gate_merge.py`.

---

## 2. Camada de dependências

```bash
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

### 8.0 Contexto e instrução default — qualquer agente

Todo agente, independentemente de identidade, Tier ou função, recebe por
padrão somente o núcleo abaixo e este contexto de governança. O núcleo de oito
skills é a configuração default, não uma lista fechada de capacidade.

| Núcleo default | Função transversal |
| :--- | :--- |
| `superpowers` | Planejamento, TDD, debugging e coordenação |
| `modern-web-guidance` | Web, APIs nativas, acessibilidade e compatibilidade |
| `typescript-lsp` | Diagnóstico estrutural TypeScript/JavaScript |
| `playwright` | Smoke/E2E e evidência visual |
| `claude-security` | Threat model e revisão de segurança de código |
| `code-review` | Revisão final, confiança e limites de publicação |
| `frontend-design` | Direção visual, UX e sistema de design |
| `plugin-dev` | Skills, plugins, hooks, MCPs e manifests |

Todas as demais skills, plugins e perfis são **OPCIONAIS**. O agente pode,
conforme a função e a tarefa concreta:

1. invocar uma capacidade opcional;
2. trocar uma capacidade do núcleo por outra mais adequada;
3. combinar mais de uma capacidade opcional;
4. aumentar temporariamente a quantidade de capacidades ativas;
5. retornar ao núcleo default assim que a tarefa especializada terminar.

A escolha deve ser proporcional e explícita no registro da tarefa: função,
capacidade adicional, motivo técnico, pré-requisito, superfície criada e
critério de desativação. A descrição curta da skill deve orientar a seleção;
as instruções completas ficam no `SKILL.md`. Catálogo instalado não significa
skill carregada, e skill carregada não significa execução comprovada.

| Modo | Camada | Plugin | Contrato operacional |
| :--- | :--- | :--- | :--- |
| DEFAULT | Orquestração | `superpowers` | Especificação, plano, TDD, debugging e delegação; não decide segurança do produto. |
| DEFAULT | Engenharia de plugins | `plugin-dev` | Alterações em skills, comandos, hooks, MCP e manifests; validar antes de distribuir. |
| DEFAULT | Web | `modern-web-guidance` | APIs nativas, acessibilidade, performance e compatibilidade; é a base técnica do frontend. |
| DEFAULT | Design | `frontend-design` | Direção visual, tipografia, tokens e UX; não substitui A11y, testes ou CWV. |
| DEFAULT | Código | `typescript-lsp` | Diagnósticos, definição e referências TS/JS; somente fonte de verdade do servidor LSP. |
| DEFAULT | Runtime web | `playwright` | Smoke/E2E e evidência visual depois da implementação; sem uploads ou submissões externas por padrão. |
| OPCIONAL | Segurança de API | `42crunch-api-security-testing` | OpenAPI, conformance, BOLA/BFLA e autorização; não duplicar como scan genérico. |
| DEFAULT | Segurança de código | `claude-security` | Threat model, findings verificados e patches em scratch; nunca aplicar, commitar ou publicar automaticamente. |
| DEFAULT | Revisão | `code-review` | Revisão de PR e confiança; comentário via `gh` exige autorização explícita separada. |
| OPCIONAL | Plataforma | `vercel` | Contexto Next/Vercel e inspeção read-only; deploy, link, env e alterações remotas ficam bloqueados até autorização. |

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

### 8.1 Perfis especializados — opcionais e selecionáveis

O núcleo default acima permanece em `enabledPlugins` globalmente. Capacidades
adicionais são **OPCIONAIS** e não entram no carregamento padrão. O seletor
`scripts/ops/Set-ClaudePluginProfile.ps1` pode ativar, trocar ou combinar perfis
quando a função exigir; a regra de exclusividade é uma proteção default contra
truncamento e sobrecarga, não uma proibição absoluta. Combinações maiores
exigem justificativa operacional e verificação dos pré-requisitos.

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

### 8.1.1 Hooks de integração — default seguro

Hooks de integração só podem constar como ativos quando houver, no mesmo
ambiente, executável, configuração, permissões compatíveis e evidência de
runtime. Referência declarada não é registro ativo.

A malha global `PreToolUse`, `PostToolUse` e eventos relacionados ao
`superbased-observer` está **DESATIVADA** porque o executável `observer.exe`, a
configuração `C:\Users\rapha\.observer\config.toml` e o processo residente
não foram encontrados. Esses hooks não fazem parte do contexto default de
nenhum agente e não devem ser reativados por inferência.

Enquanto a implementação não for restaurada e validada, o override
`C:\Users\rapha\.claude\settings.local.json` com `"hooks": {}` é a barreira
operacional. Qualquer futura reativação exige restaurar o alvo, executar um
smoke test de cada evento e confirmar ausência de falhas; sem isso, a
configuração correta permanece sem hooks globais.

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
dispensar a etapa, solicitar feedback textual e uma nota de `0` a `10`, que
**aceita decimal**. A nota entra no ledger **literal, sem arredondamento e sem
conversão de escala** — `7.5` é `7.5`, não `8`. Até 2026-09-02 esta linha dizia
"nota inteira", enquanto o script já validava `[decimal]`: era a prosa que
estava errada, e o Tier 0 alinhou o texto ao comportamento medido.

**A mesma linha citava `0.8` como exemplo de nota gravada literal, e o exemplo
era o próprio defeito que ela proíbe.** Medido em 2026-09-02: a nota da sessão
`claude-opus5-site-2026-09-02-integridade` foi dada como **8** e entrou no
ledger como **0.8** — divisão por dez, conversão de escala. A regra escrita para
proibir conversão de escala foi ilustrada com o produto de uma. O valor errado
propagou para esta prosa e para a memória persistente do agente antes que
alguém o notasse.

Ledger é append-only: o registro errado **não se reescreve**. Corrige-se por
`Record-AgentCalibrationCorrection.ps1`, que anexa um registro `correction`
apontando o `event_id` do alvo, com valor anterior, valor correto, motivo e
autoridade. E `New-AgentCalibrationDailyEvidence.ps1` **aplica** a correção
antes de qualquer contagem — sem isso ela seria decoração, e o valor errado
seguiria alimentando média, densidade e hipótese. A saída declara
`correcoes_no_ledger` e `correcoes_aplicadas`.

Registrar somente a resposta recebida pelo script
`Register-AgentCalibrationFeedback.ps1`; não inventar avaliação, nota ou
aprendizado. O ledger correspondente é encadeado por SHA-256, deve ser
verificado antes de uso e é tamper-evident, não fisicamente imutável.

O ciclo tem duas camadas obrigatórias: **(1) observação recursiva** dos
feedbacks, da evidência contextual, dos outliers e do efeito da hipótese
anterior; **(2) auditoria precursiva**, que formula uma hipótese
bayesiano-preditiva para o dia seguinte. Uma hipótese contém prior operacional,
evidência a favor e contra, previsão observável, métrica(s) afetada(s),
falsificador, critério de reversão e risco de degradação. Não declarar número
de posterior, Bayes factor ou probabilidade quantitativa sem prior, modelo de
verossimilhança e base empírica explicitamente verificáveis.

#### O portão de suficiência — a unidade é a sessão

**Revisado em 2026-09-02 por decisão do Tier 0. A unidade de contagem era o
dia; passou a ser a sessão.**

**Sessão** vai do **início ao fim de um trabalho**. Compactação de contexto
**não** encerra sessão, e sessão pode atravessar a meia-noite. Todos os
feedbacks de uma sessão declaram o mesmo `session_started_at`; divergência
denuncia sessão partida.

A métrica que autoriza avaliação é o número de **sessões distintas com
feedback**, mínimo **três**. Três feedbacks numa mesma sessão **também são
dado** — ficam retidos e reportados como densidade —, mas não abrem o portão
sozinhos: uma origem só não é recorrência.

A contagem é **acumulativa e não expira**. *Dados não morrem por ausência de
sessão no dia*: dia sem sessão é dia sem avaliação, não dia que apaga
evidência. O ledger é append-only e a contagem só reinicia após uma calibração
registrada.

Três coisas nunca contam para o limiar, e as três falham fechado:

| Não conta | Por quê |
| :--- | :--- |
| Feedback sem `session_id` | amostra sem origem identificada |
| Sessão com `session_started_at` divergente | sessão partida vira duas e infla o portão |
| Cadeia do ledger inválida | evidência não verificada |

Atingido o limiar, ainda é preciso **duas confirmações independentes do mesmo
padrão operacional** — isso é obrigação do auditor, não medição do script.
Enquanto qualquer condição faltar, o registro literal exigido é `dados
insuficientes — nenhuma calibração planejada`. Exceção ao limiar só existe por
instrução explícita do administrador, e consta do relatório.

#### Quando avaliar — aviso proativo, com lastro diário

O gatilho primário é **proativo e sem hora marcada**: ao perceber que o limiar
foi atingido, o agente **avisa** e propõe a calibração assistida, desde que
**não haja tarefa em andamento** — calibração não interrompe trabalho.

A corrida diária das **23:59** (`Register-AgentCalibrationDailyTask.ps1`) é
**lastro de auditoria**, não o gatilho: ela grava a evidência do dia inclusive
quando insuficiente, para que exista trilha dos dias em que nada abriu.

`New-AgentCalibrationDailyEvidence.ps1` mede; ele não interpreta nem planeja.
`tests/test_calibracao_portao_por_sessao.py` reprova se alguém voltar a contar
por dia, deixar densidade intra-sessão abrir o portão, ou fizer evidência
expirar.

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

- **Tier 0:** Raphael Vitoi (Soberania & Liderança: Direcionamento estratégico, formulação conceitual PMev, CEO e desenvolvedor multidisciplinar, veto e validação final de produto)
- **Tier 1:** Núcleo Cognitivo Mestre (`Claude 5 Sonnet/Opus`, `Gemini 3.7 Flash High/Pro`, `ChatGPT 5.6 Luna/Terra/Sol`, `Codex`, `Antigravity 2.0 / Antigravity IDE / VS Code`)
- **Tier 2:** Superagentes de Nuvem & Pesquisa (`Google Jules`, `Exa`, `Stitch`, `Devin`)
- **Tier 3:** Frota Especialista de 19 Agentes (`.claude/agents/`) + Companions (`GitHub Copilot`)
- **Tier 4:** Subagents Dedicados (`generalist` via `gemma4:26b-a4b-it` MoE, `research`/`architect` via `gemma4:31b-cloud`, `flutter_a11y_agent`, `self`, task-subagents com Thinking Mode `<|think|>`)
- **Tier 5:** Bots de Integração & Scanners (`Dependabot`, `Linear`, `Tactiq`, `Atlassian`, YouTube Intelligence via `gemma4:12b-unified-it`)
- **Tier 6:** Modelos Locais & Edge AI (`Ollama & llama.cpp: gemma4:31b-cloud, gemma4:26b-a4b, gemma4:12b, gemma4:e4b/e2b, qwen2.5-coder`, `Gemini Nano`, `C++ SIMD`)
- **Tier 7:** Barramento de Base (`FastAPI`, `FastMCP`, `aiohttp`, Quality Gate M.O. 13.F)

**Invariante de Commits e Mutações:**

Todo commit e registro deve declarar sinteticamente:

- **SHA:** Hash criptográfico Git
- **Assinatura:** Autor e Tier correspondente (ex: `Claude Opus 5 [Tier 1.B]`)
- **Propósito:** Razão de ser técnica da alteração e escopo protegido.

### Chico é o grupo; a assinatura é individual

**Chico é a identidade do projeto como grupo** — o que a malha é quando age em
conjunto, e o contexto agêntico do sistema interagindo consigo mesmo. É por isso
que o protocolo se chama Chico SOTA v8.0 GOLD.

**A assinatura é isolada, sempre individual.** O grupo não escreve registro nem
commit; quem escreve é um indivíduo dentro dele — `Claude Opus 5 [Tier 1.B]`,
`Codex [Tier 1.B]`, `antigravity@gemini-3.7-flash`. Os dois níveis coexistem e
não se substituem.

**Medição que originou a emenda, 2026-09-02.** O exemplo desta mesma linha
trazia `Chico v8.0 GOLD [Tier 1.B]` — o grupo ocupando o campo do autor —, e
duas linhas abaixo a seção exige que cada agente seja distinguível. Oito
registros em `reports/` seguiram o exemplo e estão assinados `chico` ou
`chico@v8-gold`, sem linhagem: são amostras sem origem identificada, do mesmo
tipo que o portão de calibração recusa quando falta `session_id`. Os outros 59
discriminam corretamente, e os doze commits mais recentes assinam
`Claude Opus 5 <noreply@anthropic.com>` — **prática medida vencendo exemplo
citado**, que é a §4 da raiz aplicada ao próprio documento.

Os oito registros antigos **não se reescrevem**: histórico publicado não
retroage. A divergência fica declarada, e o exemplo corrigido impede que cresça.

### Identidade de autoria — agente não assina como humano

A Assinatura acima vive no **corpo** da mensagem. Ela não basta: o GitHub liga um
commit a um perfil pelo **e-mail do autor**, não pelo nome nem pelo corpo. Um
agente que commita com o e-mail do administrador aparece, na interface, como se
o administrador tivesse escrito — e o corpo que o desmente só é lido por quem
abre o commit.

**Regra.** Commit feito por agente usa e-mail que **não resolve para o perfil de
nenhum humano** (`noreply@anthropic.com` para a linhagem Claude; o equivalente
para as demais). O nome do autor identifica o agente. A responsabilidade humana
é expressa por propriedade do repositório, autorização e merge — nunca por
autoria emprestada.

**Medição que originou a regra, 2026-08-30.** Nesta data, commits desta linhagem
saíram com o e-mail do administrador e o GitHub os exibiu como autoria dele —
inclusive uma **resposta de revisão** e um *learning* que o CodeRabbit gravou
como `Learnt from: RaphaelVitoi`, quando quem escreveu e justificou foi o
agente. No mesmo dia foi aberto um incidente sobre agente agindo sob a
identidade do administrador; os discriminantes que o resolveram foram **nome,
fuso horário e trailer** — precisamente porque o e-mail **não** discriminava.
Uma malha com múltiplos agentes que não distingue quem escreveu o quê não
consegue auditar a si mesma.

**Comentários e revisões no GitHub** não têm campo de autor separado: eles saem
sob a conta do token usado, e isso não é configurável pelo agente. Ali o único
discriminante possível é o rodapé de atribuição, que portanto é **obrigatório**
em todo comentário, revisão ou resposta de agente.

**Não reescrever histórico publicado para retroagir esta regra.** Aplica-se
daqui em diante, e a transição fica registrada. Força-push numa branch já
publicada quebra checkout alheio e âncora de revisão — custo maior que a
inconsistência que corrigiria.

---

## 9. Taxonomia Canônica de Relatórios, Auditorias, Handoffs e Documentação

O repositório estabelece uma separação formal e estrita de responsabilidades entre pastas para receber documentações oficiais, relatórios e memórias:

| Diretório | Responsabilidade Canônica | Tipo de Arquivo / Padrão de Nomenclatura | Esquema Obrigatório |
| :--- | :--- | :--- | :--- |
| **`reports/`** | Registros empíricos, auditorias situadas no tempo, validações, postulados e handoffs oficiais. | `AUDITORIA-YYYY-MM-DD-*.md`<br>`VALIDACAO-YYYY-MM-DD-*.md`<br>`POSTULADO-XXX-*.md`<br>`HANDOFF-YYYY-MM-DD-*.md`<br>`PLANO-XXX-*.md` | Frontmatter YAML de 13 campos validado por `scripts/ops/record_gate.py` |
| **`docs/`** | Documentação permanente, arquitetura viva, manuais, especificações e formalismos matemáticos. | `docs/architecture/*.md`<br>`docs/specs/*.md`<br>`docs/guides/*.md`<br>`docs/math/*.md` | Documentos Markdown com referências e âncoras canônicas |
| **`.claude/agent-memory/`** | Memória episódica e contextual viva consumida pelo runtime dos agentes e pelo RAG. | `.claude/agent-memory/<agente>/MEMORY.md`<br>`.claude/agent-memory/chico/HANDOFF_LATEST.md` | Estrutura de tópicos semânticos e aprendizados consolidados |
| **`data/`** | Catálogos estruturados, esquemas e configurações de sistema em formato serializado. | `system_config.json`<br>`routing_map.json`<br>`agents_manifest.json`<br>`SYSTEM_OPERATIONS_MANIFEST.json` | JSON formatado e tipado |
