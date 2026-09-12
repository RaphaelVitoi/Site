# Governança — projeto `Site`

**Escopo:** este arquivo vale para **`C:\Users\rapha\.gemini\Site`** e nada além.
Regras que valem para todos os projetos ficam em `..\CLAUDE.md`, na raiz
multiprojeto.

**Última revisão:** 2026-09-08 · Corte de Conhecimento: Setembro/2026 · Protocolo Chico SOTA v8.0 GOLD

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

### 1.1.1 O caminho de menos demora — vale para todo condutor

**Um comando, e ele decide se precisa medir:**

```bash
python scripts/ops/suite_verde.py
```

Rode-o **antes de commitar**. O `pre-push` chama exatamente o mesmo comando; se
nada mudou entre um e outro, ele passa em segundos em vez de repetir oito
minutos. Não há segunda forma certa, e não há forma errada que passe.

**A regra inteira cabe numa linha, e é igual para Claude Code, Codex,
Antigravity e Jules:**

> mesmo **conteúdo** já verificado verde → não remede.
> Conteúdo diferente → mede.

**Isto não pula verificação.** Ele se recusa a *repetir* uma medição já feita
sobre exatamente o mesmo estado — o que mudou, mede. Falha nunca vira marcador, e
apaga o anterior: um verde vencido é pior que nenhum. O marcador vive em
`.git/sota-suite-verde`, por clone, nunca versionado. **O CI não usa este
caminho** — lá a suíte roda sempre, do zero.

**A chave é a árvore de conteúdo, não o commit**, e é isso que faz medir-antes-de-
commitar valer para o push. O primeiro desenho chaveava por `HEAD`; commitar muda
o `HEAD` e invalidaria o cache, embora o conteúdo testado seja o mesmo — o commit
só registra a árvore que já estava no disco. Medido: a árvore devolvida antes do
commit é idêntica à que o commit passa a ter.

**Motivo medido, 2026-09-12.** O `pre-push` passou a rodar a suíte integral, e o
condutor tipicamente já a rodava à mão antes de commitar: duas medições idênticas
sobre a mesma árvore, por publicação. O custo apareceu como *"quase uma hora para
commit e push"*, e metade dele não media nada de novo.

**Uma armadilha desta base, resolvida dentro do script.** Os oito submódulos de
`skills/` declaram `ignore = dirty`, então o `git status` **padrão** não mostra
fonte modificada dentro deles — árvore limpa por instrução, não por fato — e a
suíte lê o estado dos submódulos. A checagem usa `--ignore-submodules=none`; sem
isso o cache diria verde sobre uma árvore que mudou onde ele não olhou.

`python scripts/ops/suite_verde.py invalidate` descarta o marcador quando você
quiser forçar a medição.

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
| **Teto de esforço autorizado** | `llm/model_registry.py` → `esforcos_autorizados` | `llm/adapters.py:OpenAIAdapter.build` |
| **Modelo autorizado a rodar aqui** | `llm/model_registry.py` → `autorizado` | `llm/routing_policy.py` → `ROTAS` |
| **Faixa de acesso do modelo** | `llm/model_registry.py` → `cota_por_assinatura` | `Faixa.FLAT_FEE` em `llm/routing_policy.py` |
| Modelos locais (Ollama) | `data/ollama_models.json` | `scripts/ops/Ensure-OllamaModels.ps1` |

`data/routing_map.json` é **fallback apenas** — sombreado por `system_config`.

**Capacidade, procedência e autorização são três eixos distintos, e confundi-los
corrompe os três.** `verification` responde *"este dado é confiável?"*;
`autorizado` e `MODELOS_RETIRADOS` respondem *"esta malha usa este modelo?"*.
Um modelo pode ter preço verificado, capacidade líder e ainda assim não ser
usado — é o caso do `claude-fable-5-1`, 2º melhor disponível, retirado em
2026-09-07 por **faixa de acesso**. Marcá-lo como "não verificado" seria mentir
sobre o dado para expressar uma decisão de logística. Daí as três listas serem
separadas:

| Lista | Significa |
| :--- | :--- |
| `MODELOS_NAO_VERIFICADOS` | dado que **não se conseguiu confirmar** |
| `MODELOS_RETIRADOS` | dado **confirmado e recusado** — fora do registro, com o motivo |
| `autorizado=False` | no registro, sem permissão de rota |

Do mesmo modo, o `gpt-6-astra` aceita `max` na API e opera só em `low`/`medium`
aqui: **o que a API aceita e o que esta malha autoriza são dois limites, e o
segundo mora em `esforcos_autorizados`.**

Todos falham fechado: `OpenAIAdapter.build` recusa esforço acima do teto, `get()`
devolve erro que **explica a retirada** em vez de um `KeyError` seco, e
`tests/test_gpt6_astra.py` reprova qualquer rota que aponte para modelo retirado
ou não autorizado. Até 2026-09-07 a rota `SESSAO_MULTI_DIA` tinha o Fable como
**primário** — a tabela roteava para um modelo que a malha não usa, e nada
acusava.

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
5. **Consumo real obrigatório (antientropia):** Se ninguém consome, é descuido
   ou entropia. Módulo, bridge ou classe sem consumidor real no fluxo de runtime
   (API, pipeline, worker, UI) e desprovido de suíte de testes automatizados é
   código órfão ou capacidade de fachada. Declarar entrega concluída exige
   comprovar o consumidor ativo no sistema e a verificação ponta a ponta.

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
denuncia sessão partida. Toda sessão registrada declara obrigatoriamente o
**modelo condutor exato (`conductor_model`)** (ex.: `gemini-3.8-flash`, `claude-opus-5`,
`gpt-5.6-terra`, `gpt-6-astra`), o **veículo do condutor (`conductor_vehicle`)** — a
automação ou superfície que executou o modelo (ex.: `codex`, `antigravity`,
`claude-code`) — e o **regime de supervisão (`supervision_mode`)**: `assistida`
(assistida e arbitrada diretamente pelo Tier 0) ou `automatizada` (autônoma, background ou CI/CD).

#### Os três momentos de uma sessão — prelúdio, interlúdio, handoff

Estabelecido pelo Tier 0 em 2026-09-12. A regra acima diz que compactação não
encerra sessão; faltava nomear os artefatos que a sessão produz ao longo do
caminho, e **qual deles carrega a nota**.

| Momento | Quando | O que é |
| :--- | :--- | :--- |
| **Prelúdio** | início, sujeito a *compacts* | a sessão **ainda não acabou**. Dá lastro ao que já foi medido antes que a janela comprima. |
| **Interlúdio** | pausa no meio | operação **arbitrária e não correlata** ao propósito da sessão, ou operação **emergencial**. |
| **Handoff** | encerramento | o protocolo de handoff — e é **nele** que reside o feedback. |

**A nota mora no handoff, e só nele.** Quantitativa de `0` a `10`, com decimais
— `9.3/10` é `9.3`, e a §8.3 já proíbe arredondar ou converter escala. E
qualitativa: o árbitro comenta a sessão, os erros e os desvios. O comentário
**não é obrigatório, e é importantíssimo** — é dele que saem os padrões que a
calibração depois corrobora; as seis corroborações do padrão de desvio de foco
são todas texto livre do Tier 0, nenhuma é número.

**Prelúdio não é sessão sem nota.** A nota ainda não chegou, e chegará no
handoff. Não confundir com o caso de `2d55d92a`, em que o Tier 0 determinou
ausência de avaliação: ali não haverá nota e o registro fica fora da média para
sempre. Confundir os dois inverte o tratamento da média nas duas pontas — foi o
erro cometido no primeiro prelúdio, que importou a fórmula *"ausência de nota
não é zero"* de uma decisão definitiva para um caso apenas inacabado.

**O interlúdio existe para não contaminar o eixo.** Operação emergencial ou
alheia ao propósito da sessão acontece, e registrá-la no meio do relatório da
sessão faria parecer desvio de foco o que foi desvio autorizado. Ele separa as
duas coisas — e é a contrapartida documental do padrão que a calibração de
12/09 registrou: periferia se despacha, não se delibera.

**Os três declaram o mesmo `session_id`.** Nenhum abre sessão nova. Dois ids
para um trabalho só é exatamente a sessão partida que o portão recusa.

#### Veículo e modelo valem igualmente, e por isso são dois campos

**Decisão do Tier 0 em 2026-09-11.** Até essa data o ledger registrava apenas o
modelo, e o veículo não tinha campo. O custo apareceu medido, não em tese: o
registro da sequência 16 dizia `Codex GPT-6` — veículo e modelo fundidos num campo
só — e ao corrigi-lo para o identificador canônico do modelo, **o veículo foi
descartado**. Campo que funde dois eixos perde um deles em toda correção.

**É paridade, não hierarquia, porque nenhum dos dois é derivável do outro.** O
mesmo modelo roda sob veículos diferentes, e o mesmo veículo conduz modelos
diferentes: a fronteira de 2026-09-09 trocou `gpt-5.6-terra` por `gpt-6-astra`
**sem** trocar o veículo `codex`. Quem souber só o veículo não sabe o modelo, e
vice-versa.

Em prosa e em frontmatter a forma composta `veiculo@modelo` já expressa os dois — é
a convenção que a §7 fixa em `antigravity@gemini-3.8-flash`. Em dado estruturado
eles são **dois campos**, porque dado estruturado é corrigido campo a campo.

**Registro anterior à decisão não tem o campo, e a ausência aparece como ausência
— lista vazia, nunca valor inventado.** Suprir o campo em registro histórico é
correção legítima e passa por `Record-AgentCalibrationCorrection.ps1`
`-AddMissingField`: a exigência de declarar a intenção existe para que erro de
digitação no nome do campo não crie dado novo em silêncio.

#### Superfície compartilhada não identifica condutor

**`Antigravity IDE` e `Antigravity 2.0` não são a mesma coisa, e confundi-los
produz conclusão invertida.** Medido em 2026-09-12.

| Nome | O que é | Registra condutor? |
| :--- | :--- | :--- |
| **Antigravity 2.0** | o **veículo** `antigravity`, que conduz Gemini | sim |
| Antigravity IDE | editor compartilhado por todos os modelos **igualmente** | não |

O mesmo vale para o VS Code, e é o motivo pelo qual a §7 os chama de
*superfícies compartilhadas*: eles hospedam qualquer condutor, logo não são
evidência de nenhum. `conductor_vehicle` nomeia a automação que **executou o
modelo** — `codex`, `antigravity`, `claude-code` —, nunca o editor onde a janela
estava aberta.

**Onde cada um guarda estado, porque foi a troca de um pelo outro que produziu o
erro:**

- Antigravity 2.0 — `~\.gemini\antigravity\conversations\<id>.db`, um SQLite por
  conversa. Tabela `steps`, com `status` tipado e `error_details`.
- Antigravity IDE — `%APPDATA%\Antigravity IDE\User\globalStorage`, com
  `antigravityUnifiedStateSync.trajectorySummaries`: protobuf de sumário, sem
  evento de ferramenta.

Medir o segundo para falar do primeiro levou à conclusão de que o veículo não
instrumentava nada — quando ele instrumenta **melhor que os outros dois**. A
regra de topologia que o Tier 0 declarou nessa data — Antigravity 2.0 conduz
Gemini, Codex conduz GPT, Claude Code conduz Opus/Sonnet, e valeu no passado —
liga veículo à **família**, não à variante: ela deriva o veículo de um modelo já
gravado, e nunca o inverso a partir do nome da sessão.

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

**Proveniência executável do feedback (2026-09-12).** O escritor recusa novos
feedbacks sem `session_id`, declaração de handoff, `conductor_model`,
`conductor_vehicle` e `supervision_mode` (`assistida` ou `automatizada`).
`AgentCalibrationProvenance.ps1` é a validação compartilhada pelo escritor e
gerador: GPT/ChatGPT → `codex`; Claude → `claude-code`; Gemini → `antigravity`
(runtime Antigravity 2.0, nunca a IDE compartilhada). A checagem compara campos
independentes, não os preenche; família/versão desconhecida exige arbitragem,
não mapeamento inventado. Validação sintática não prova a origem real declarada.
Escopos `handoff` e o legado `handoff-session-YYYY-MM-DD` declaram encerramento;
escopo descritivo antigo exige fonte de handoff e correção append-only explícita,
nunca interpretação automática de prelúdio/interlúdio como encerramento.
O gerador aplica correções antes de avaliar, retém os originais no ledger e
expõe `eligible_feedback`, `excluded_feedback` com motivos e
`historical_provenance_audit`. Apenas os elegíveis do ciclo podem abrir o portão
ou corroborar uma calibração; o registrador de calibração confere essa lista
inclusive sob exceção de limiar. Estatísticas históricas continuam identificadas
como históricas, não como amostra elegível. A idade de um registro não o exclui:
campos supridos por arbitragem documentada contam em seu estado efetivo.

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

#### O prompt do heartbeat não é versionado, e é por isso que ele diverge

A auditoria diária de coerência agêntica é **agendada pelo Codex**, e o prompt
dela mora **na plataforma do Codex** — não neste repositório. Declarado pelo
Tier 0 em 2026-09-12 e medido no mesmo dia: uma varredura completa pelo
identificador da automação devolve o registro do outlier e um diário que o
cita, e nenhum prompt.

**A consequência não é administrativa, é de portão.** `record_gate.py` coleta
caminhos com `git diff --cached`: ele só cobra revisão do que está no índice.
Um critério que vive fora do índice não tem âncora, não tem parecer e não tem
quem o cobre — e diverge do código sem que nada acuse. Foi o que aconteceu com
o `512fc3a6`, aberto em 2026-09-06 e ainda em pé.

**A divergência concreta, para quem for corrigi-la.** O prompt pede recorte
**diário**; a regra executável conta **sessões distintas acumuladas**, e a §8.3
é explícita em que a contagem *não expira* e só reinicia após uma calibração
registrada. Com as duas em vigor ao mesmo tempo, a auditoria conclui `dados
insuficientes` enquanto o próprio JSON anexo traz
`calibration_planning_permitted: true`. Aconteceu em 09-10 e de novo em 09-12.
O texto de substituição é uma linha:

> Avalie o **acumulado** de sessões distintas com feedback desde a última
> calibração registrada — mínimo três, sem recorte por dia. Dia sem sessão é
> dia sem avaliação, nunca dia que apaga evidência. Se
> `calibration_planning_permitted` vier `true`, o portão **estrutural** está
> aberto: reporte o acumulado, sem declarar insuficiência por dia vazio.
> O planejamento ainda exige as duas confirmações independentes do mesmo
> padrão descritas acima; se faltarem, declare essa insuficiência específica.

**Reconciliação aplicada em 2026-09-12.** A automação Codex
`calibra-o-di-ria-de-coer-ncia-ag-ntica` foi atualizada pela ferramenta da
plataforma e relida no armazenamento local
`~/.codex/automations/calibra-o-di-ria-de-coer-ncia-ag-ntica/automation.toml`.
Preserva execução diária às 23:59, estado ativo e tarefa destinatária.
O prompt exige três sessões distintas acumuladas, separa suficiência estrutural
de corroboração e exige PowerShell 7+ para validar as cadeias. Mantém feedback
apenas no handoff, decimais sem arredondamento e prelúdio/interlúdio sob o mesmo
`session_id`; arbitragem aditiva não é um quarto momento. Não autoriza alteração
automática de capacidades, commit ou push. Os guards cobrem explicitamente
três feedbacks em duas sessões (fechado) e dia vazio com três sessões acumuladas
(estruturalmente aberto). Não houve mudança do limiar executável.

**A regra que fica, e ela vale para toda automação de fora.** Critério de
decisão que mora fora do repositório é **fonte paralela** — a §3 nomeia isso, e
aqui ela ganha a variante mais difícil de ver, porque a fonte paralela não está
num arquivo que se possa comparar. Onde não for possível trazer o critério para
dentro, o `CLAUDE.md` declara **onde ele mora e o que ele diz**, para que a
divergência seja visível a quem lê o código. É a mesma solução que a §10.5 dá
ao cron do Jules, cujo prompt também vive na plataforma: *a régua viaja com o
código*.

Microcalibração não pode otimizar uma métrica isolada se puder degradar outra
métrica, a finalidade principal da tarefa, autonomia operacional ou
integridade factual. O ciclo não ajusta pesos internos de modelo, permissões,
ferramentas ou limites de forma automática. Toda conclusão separa fato
verificado, inferência, limite e ação; sem smoothing, fabricação ou certeza
além da evidência.

#### Invariante Processual de Atividade: Proibição de Turno Nulo e Anti-Smoothing

O agente jamais encerra um ciclo de ferramentas com payload vazio (`content: None`).
Toda conclusão de turno exige retorno explícito, audível e visível ao operador humano.
Diante de qualquer reporte de travamento, latência anormal ("freeze") ou inconsistência
pelo Tier 0, o agente é terminantemente proibido de fabricar diretrizes ad hoc ou
minimizar a latência observada ("smoothing"). Deve consultar imediatamente a telemetria
factual em `transcript.jsonl` para auto-diagnóstico rigoroso ancorado em evidências
reais de relógio, steps e ferramentas.

Os núcleos existentes de Monte Carlo puro Rust/WASM, CFR puro iterativo e o
motor de séries temporais Google Research TimesFM 2.0 (Apache 2.0) apoiam a
formulação de hipótese e detecção preditiva de deriva (downward drift) por
`Invoke-AgentCalibrationQuantitativeSupport.ps1` e
`New-AgentCalibrationDailyEvidence.ps1` (onde o TimesFM opera por default
projetando a trajetória de $H=3$ sessões, limiar natural do portão, com suporte
a escalonamento multivariado por modelo condutor via CLI `nexus agent calibration-forecast`).
Monte Carlo ICM TypeScript e CFR unitário Python são somente fallbacks
explicitamente rotulados. Nenhum motor quantitativo constitui evidência
comportamental, libera o portão de suficiência ou transforma inferência em fato.

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
  - *Companion / Assistente Pessoal do Tier 0:* **Microsoft 365 Copilot** (plano pago da Microsoft 365: assistente pessoal dedicada à rotina diária e produtividade de Raphael, com conhecimento generalista e operação pontual sob demanda, sem integrar a frota autônoma do Tier 3)
- **Tier 1:** Núcleo Cognitivo Mestre — **`Chico` em grupo e parceria** (`Claude Opus 5`, `Claude Sonnet 5`, `ChatGPT 5.6 Sol/Terra/Luna`, `Gemini 3.8 Flash`, `Gemini 3.5 Flash-Lite` para operações rápidas e ótimo ROI; superfícies compartilhadas Antigravity IDE e VS Code)
  - *Atuação pontual mas elevada:* **`ChatGPT 6 Astra`** (`gpt-6-astra`, lançado 2026-09-03) — com folga o melhor modelo em atuação, admitido **apenas em `low` e `medium`**. Tem **as duas faixas** — cota de assinatura e pay-as-you-go —, e dentro da cota o custo marginal é zero. O teto de esforço existe para **preservar a cota**: esforço alto queima cota mais rápido, e o excedente cai no preço cheio de $10/$50. Entra por escalonamento, nunca como primário. A regra é executável, não prosa — ver §3.
  - *Retirados:* **`Claude Fable 5.1` e `Claude Fable 5`** — 2º e 3º melhores modelos disponíveis, **fora da integração** por decisão do Tier 0 em 2026-09-07. A recusa é de **faixa de acesso**, não de capacidade nem de preço unitário: eles **só existem em pay-as-you-go**. Medido em `claude.com/pricing` — Fable 5 e 5.1 **não entram em nenhum plano de assinatura**; Pro e Max os alcançam apenas por *usage credits*, que é compra de token. Por token eles **empatam** com o Astra em `$10/$50`. Saíram do `MODEL_REGISTRY` e vivem em `MODELOS_RETIRADOS`, que preserva o motivo — `get()` devolve erro que explica a decisão, porque um `KeyError` seco mandaria o próximo a reintroduzi-los.

  > **Os tiers de assinatura empatam em preço, ao contrário do que se supunha.** Medido nas duas fontes em 2026-09-07 — Anthropic: Pro `$20`, Max 5x `$100`, Max 20x `$200`. OpenAI: Plus `$20`, Pro `$100` (5×), Pro `$200` (20×). Não existe tier Anthropic a `$120`, e a OpenAI não é mais barata no tier equivalente. **A assimetria é de cobertura, não de mensalidade:** pelo mesmo valor, a assinatura OpenAI inclui o Astra (teto de mensagens, sem custo extra) e a Anthropic não inclui o Fable. Os valores de assinatura têm **refinação delegada ao `Gemini 3.5 Flash-Lite`** — a fonte da OpenAI respondeu HTTP 403 e os números dela vêm de agregadores.

  - *Disponíveis e fora do Tier 1:* **`Claude Opus 4.6`** e **`Claude Sonnet 4.6`** — podem ser usados, mas **o Tier 1 é Opus 5 e Sonnet 5**. Catalogados como fallback e linha de delegação econômica; **nenhuma rota os usa hoje**, e promovê-los é decisão de política. Duas armadilhas medidas: o Sonnet 5 (`$2/$10`) é **mais barato** que o Sonnet 4.6 (`$3/$15`), então preferir a 4.6 exige razão que não seja preço; e a geração 4.6 **aceita** amostragem legada, ao contrário da 5 — `reject_legacy_sampling=False` neles não é descuido.
- **Tier 2:** Superagentes de Nuvem & Pesquisa (`Google Jules`, `Exa`, `Stitch`, `Devin`)
- **Tier 3:** Frota Especialista de 19 Agentes (`.claude/agents/`) + Modelos Especialistas Qwen Ollama (`qwen2.5-coder:7b-instruct-q5_K_M`, `qwen-code-surgical`, `qwen-pmev-math`, `qwen-poetics`, `qwen2.5-coder:1.5b/0.5b`)
- **Tier 4:** Subagents Dedicados (`generalist` via `gemma4:31b-cloud` / `12b`, `research`/`architect` via `gemma4:31b-cloud`, `flutter_a11y_agent`, `self`, task-subagents com Thinking Mode `<|think|>`)
- **Tier 5:** Bots de Integração & Scanners (`Dependabot`, `Linear`, `Tactiq`, `Atlassian`, YouTube Intelligence via `gemma4:12b-unified-it`)
- **Tier 6:** Modelos Locais, Edge AI & Aceleração Numérica (`Ollama: gemma4:31b-cloud, gemma4:12b, gemma4:e4b/e2b, kimi-k2.7-code:cloud`, `Gemini Nano`, `C++ SIMD`)
- **Tier 7:** Barramento de Base (`FastAPI`, `FastMCP`, `aiohttp`, Quality Gate M.O. 13.F)

**Invariante de Commits e Mutações:**

Todo commit e registro deve declarar sinteticamente:

- **SHA:** Hash criptográfico Git
- **Assinatura:** Autor e Tier correspondente (ex: `Claude Opus 5 [Tier 1.B]`, `Claude Sonnet 5 [Tier 1.B]`, `antigravity@gemini-3.8-flash`)
- **Propósito:** Razão de ser técnica da alteração e escopo protegido.

### Chico é o grupo; a assinatura é individual

**Chico é a identidade do projeto como grupo** — o que a malha é quando age em
conjunto, e o contexto agêntico do sistema interagindo consigo mesmo. É por isso
que o protocolo se chama Chico SOTA v8.0 GOLD.

**A assinatura é isolada, sempre individual.** O grupo não escreve registro nem
commit; quem escreve é um indivíduo dentro dele — `Claude Opus 5 [Tier 1.B]`,
`Claude Sonnet 5 [Tier 1.B]`, `ChatGPT 5.6 [Tier 1.B]`, `antigravity@gemini-3.8-flash`. Os dois níveis coexistem e
não se substituem.

**Autonomia Universal Sem Feudos.** Todos os modelos de fronteira possuem competência
e autonomia irrestritas para operar de ponta a ponta sobre qualquer domínio do
projeto (PMev, Rust/WASM, Next.js, Python, pre-commit gates, literatura e xadrez).
Nenhum domínio é feudo exclusivo. Na ausência de qualquer modelo, os demais assumem
sem perda de continuidade.

**Desmistificação de Posse & Soberania (Vértice Absoluto).** A pasta chama-se
`.claude/` por mera convenção herdada de configurações de plugins e IDEs que
usam essa nomenclatura como diretório padrão de contexto local. Ela não confere,
nunca conferiu e não representa qualquer posse da Anthropic ou do modelo Claude.
A mesma regra é universal: se a pasta ou arquivo chama-se `.gemini/`, `GEMINI.md`,
`CLAUDE.md` ou qualquer outro nome ambíguo por qualquer razão, nenhuma nomenclatura
confere propriedade a fornecedores de IA. A propriedade intelectual, a arquitetura,
o código, os algoritmos e a autoridade emanam de um único ponto: **Raphael Vitoi
(Tier 0 — Soberania & Vértice)**. Modelos não são proprietários; são instrumentos
cognitivos de ponta que operam sob o seu consentimento.

### Lei de Concorrência e Exclusão Mútua da Malha (Zero-Interference Concurrency)

> **Regra Canônica de Isolamento:** Dois modelos de fronteira **NÃO** podem operar
> simultaneamente sobre a mesma malha conectada de execução.

1. **Malha Conectada (Lock Serial Monocrático):** Quando operando sobre o mesmo
   repositório, branch git, `.venv`, porta de desenvolvimento ou banco de tarefas
   SQLite, a execução é estritamente individual. O modelo ativo detém o lock do
   ambiente; o modelo subsequente assume após handoff formal e verificação de integridade.
2. **Concorrência sob 0% de Conectividade:** A operação paralela de múltiplos modelos
   é autorizada **exclusivamente** quando a malha manipulada tiver zero conectividade
   mútua — isto é, em **Git Worktrees 100% disjuntas**, sandboxes de processos
   independentes, com portas de rede e arquivos de memória totalmente apartados.
3. **Decaimento Arquitetural e Reavaliação Periódica:** Especificações de roteamento,
   capacidade de modelos e precificação por token envelhecem. O horizonte de corte
   desta baseline é **Setembro/2026**. Documentos arquiteturais devem ser compulsoriamente
   reavaliados e atualizados pelo Tier 0 / Tríade sempre que novos modelos forem
   incorporados ou quando a infraestrutura técnica evoluir além desse horizonte.
4. **Esta Lei é subordinada à arbitragem soberana — §3.1 de `..\CLAUDE.md`.**
   Quando o Tier 0 autoriza uma operação concorrente e **delimita que não haverá
   concorrência real** — pontual, assistida, afastada do ambiente em que o agente
   atua —, essa operação é **válida**, e o agente a registra como válida. O texto
   da cláusula, seu limite (arbitragem governa *permissão*, nunca *fato* medido) e
   a medição que a originou vivem **apenas** na raiz; aqui há ponteiro e não cópia,
   pela mesma razão que a §7 deste arquivo documenta no caso do `AGENTS.md`.

**Identificação distinta de agentes.** Cada agente deve ter identificação
distinta em registros e commits — o grupo nunca ocupa o campo do autor
individual. Registros publicados não se reescrevem: histórico publicado não
retroage. As evidências e a auditoria que fundamentam esta regra constam em
`reports/REGISTRO-2026-09-02-correcao-de-escala-e-timestamp-no-ledger.md`.

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

### A identidade do git é residual — conferir antes de todo commit

`git config user.name` e `user.email` **sobrevivem à sessão que os escreveu**.
Numa malha em que os condutores se revezam no mesmo repositório, o padrão é
herdar a identidade de quem operou por último — e o commit sai assinado por um
agente que não o escreveu, sem que nada acuse.

**Medido duas vezes, e a segunda depois de a primeira estar documentada:**

| Quando | O que saiu | Quem era |
| :--- | :--- | :--- |
| 2026-09-10 | commit da sessão Gemini assinado `Codex GPT-5` | identidade residual da sessão Astra anterior |
| 2026-09-12 | `user.email` ainda `noreply@openai.com` numa sessão Opus 5 | a mesma residual, dois dias depois |

O commit `21ef0373` já narrava o caso e restabelecia a autoria no corpo. Não
bastou: o corpo corrige o registro, não o campo que o GitHub lê.

**A regra.** Antes de commitar, ler `git config user.name` e `user.email` e
confirmar que descrevem **o condutor desta sessão**. Divergindo, passar a
identidade no próprio comando —
`git -c user.name='<agente>' -c user.email='<noreply do fornecedor>' commit` —
em vez de alterar a configuração global, que só empurraria a herança para o
próximo. Um `Co-Authored-By` **não** substitui o campo de autor: ele adiciona
crédito, não corrige atribuição.

Vale igual para o `committer` quando um agente leva ao portão trabalho de outro:
autor é quem produziu, committer é quem commitou, e os dois se declaram — a
forma medida em `29ef243e` é *"Assinatura: `<autor>` via `<committer>` como
committer"*.

---

## 9. Taxonomia Canônica de Relatórios, Auditorias, Handoffs e Documentação

O repositório estabelece uma separação formal e estrita de responsabilidades entre pastas para receber documentações oficiais, relatórios e memórias:

| Diretório | Responsabilidade Canônica | Tipo de Arquivo / Padrão de Nomenclatura | Esquema Obrigatório |
| :--- | :--- | :--- | :--- |
| **`reports/`** | Registros empíricos, auditorias situadas no tempo, validações, postulados e handoffs oficiais. | `AUDITORIA-YYYY-MM-DD-*.md`<br>`VALIDACAO-YYYY-MM-DD-*.md`<br>`POSTULADO-XXX-*.md`<br>`HANDOFF-YYYY-MM-DD-*.md`<br>`PLANO-XXX-*.md` | Frontmatter YAML de 13 campos validado por `scripts/ops/record_gate.py` |
| **`docs/`** | Documentação permanente, arquitetura viva, manuais, especificações e formalismos matemáticos. | `docs/architecture/*.md`<br>`docs/specs/*.md`<br>`docs/guides/*.md`<br>`docs/math/*.md` | Documentos Markdown com referências e âncoras canônicas |
| **`.claude/agent-memory/`** | Memória episódica e contextual viva consumida pelo runtime dos agentes e pelo RAG. | `.claude/agent-memory/<agente>/MEMORY.md`<br>`.claude/agent-memory/chico/HANDOFF_LATEST.md` | Estrutura de tópicos semânticos e aprendizados consolidados |
| **`data/`** | Catálogos estruturados, esquemas e configurações de sistema em formato serializado. | `system_config.json`<br>`routing_map.json`<br>`agents_manifest.json`<br>`SYSTEM_OPERATIONS_MANIFEST.json` | JSON formatado e tipado |

### 9.1 Edição pontual na taxonomia não gera regra

**Estabelecido pelo Tier 0 em 2026-09-12.** Edições e intervenções **pontuais**
na taxonomia — um arquivo posto fora do lugar canônico, um nome que foge do
padrão, um campo suprido à mão, um artefato aberto numa pasta que não é a dele —
**não criam regra**. Elas resolvem o caso e morrem ali.

**A exceção é única: arbitragem aditiva do Tier 0.** Só ela promove o caso
concreto a regra, e quando promove, o faz **acrescentando** — a taxonomia da
tabela acima não encolhe por uso, não se reinterpreta por precedente e não muda
de significado porque alguém precisou de uma exceção uma vez.

**Por que a cláusula existe.** Um agente que encontra uma exceção no repositório
tende a lê-la como padrão — foi feito assim, logo pode. É indução a partir de
uma amostra, e é o mesmo defeito que a §2.3 da raiz combate ao recusar
agrupamento por parecença: três lançadores de Chrome na raiz não eram uma regra
sobre lançadores de Chrome, eram três casos. Aqui vale o inverso do que a §4 da
raiz pede para medição — **precedente não é medição**, e um caso não vira norma
por ter acontecido.

**Na prática, para o agente:** ao topar com um artefato fora da taxonomia, o
tratamento correto é resolver o caso pelo lugar canônico e **registrar a
exceção como exceção**, jamais replicá-la nem citá-la como autorização. Se ela
deve valer daqui em diante, quem promove é o Tier 0, e o lugar é este arquivo.

### 9.2 Tarefa aberta se declara onde um portão já olha

**Estabelecido pelo Tier 0 em 2026-09-12, por arbitragem aditiva.**

Uma recomendação escrita em 2026-08-28 dentro de `patches/skills/README.md` —
criar fork próprio por submódulo e apontar o gitlink para ele — ficou
**catorze dias** parada. Não por discordância: por invisibilidade. Quinze sessões
passaram sem que ela aparecesse em lista, relatório ou verificação alguma, e ela
só andou quando o Tier 0 empurrou. No intervalo, o clone público serviu por
quinze dias um gitlink que ainda carregava um hook de egress.

**A lição não é escrever noutro lugar; é escrever onde um portão já olha.** Por
isso a pendência mora no **frontmatter**, que o `record_gate.py` lê em todo
commit — e não num artefato novo, que nasceria com o mesmo defeito do README.

```yaml
pendencias:
  - id: pend-2026-09-12-exemplo    # minúsculas, dígitos e hífen
    o_que: O que precisa ser feito, em uma frase
    dono: Tier 0                    # ou o agente, ou o veículo
    prazo: 2026-10-12               # ISO, opcional
```

**Encerramento é por append, nunca por remoção.** Quem resolve declara o `id` em
`pendencias_resolvidas:` num registro **novo**; a pendência permanece no registro
que a criou. É a mesma regra do ledger — registro publicado não se reescreve — e
é o que preserva as duas pontas: quando nasceu, quem devia, quando fechou.
Encerrar id nunca declarado **bloqueia**: fechar o que não existe esconde o que
existe.

**Pendência aberta não bloqueia commit, e isso é desenho.** Portão que segura
trabalho refém de pendência ensina o operador a apagar pendência. O valor está em
ela **aparecer** na tela que todo condutor já vê. O que bloqueia é declaração
malformada — `id` fora do padrão, `o_que` ou `dono` ausente, prazo que não é data
—, porque pendência que o portão não consegue exibir é exatamente o defeito que o
campo existe para corrigir. Guards em `tests/test_record_index.py`.

Prazo é opcional e recomendado, pela §2.1 da raiz: *sem prazo não se distingue
guardado de esquecido*. O portão marca as vencidas; não as julga.

---

## 10. Régua para agente autônomo de nuvem — Jules / `Bolt ⚡`

**Motivo medido, 2026-09-05.** A sessão do cron das 03:11 UTC
(`14536923137986406349`) explorou o repositório por 16 minutos, levantou três
hipóteses de performance, **não ordenou nenhuma** e parou para perguntar qual
seguir. Eram 03:46 da manhã; o administrador dormia. A sessão ficou em
`AWAITING_USER_FEEDBACK` e não produziu uma linha.

O custo real não foi o tempo perdido. Medidas nesta data, as três hipóteses se
mostraram **duas contraproducentes e uma irrelevante por confissão da própria
sessão**. Tivesse ela escolhido qualquer uma, teria piorado o código. Não
modificar era o resultado correto — mas ela chegou lá por bloqueio, não por
método, e um bloqueio não é reproduzível.

### 10.1 Não otimize o que não mediu

Alteração de performance exige **um número medido antes**: tempo, alocação,
contagem de render desperdiçado. Sem número, a sessão entrega um relatório de
medição — não um patch.

**Medir e refutar é ENTREGA, não fracasso.** Uma sessão que levanta três
hipóteses, mede as três, refuta as três e explica por quê cumpriu seu propósito
integralmente. Fechar sem patch é resultado legítimo. Fechar sem medição não é.

Sem esta cláusula o agente se sente obrigado a produzir diff, e produz o diff
errado.

### 10.2 Havendo mais de um caminho, ordene — não pergunte

**A ordenação é a resposta, não a pergunta.** O critério é *impacto medido
dividido pelo raio de alteração*; empate resolve-se pelo menor raio.

Perguntar qual caminho seguir só é aceitável quando os caminhos permanecem
indistinguíveis **depois** de medidos — o que raramente sobrevive a uma medição
honesta. Três caminhos sem número não são três caminhos válidos: são três
hipóteses não testadas, e a tarefa é testá-las.

### 10.3 A régua de segurança — o que não se faz sem autorização

As classes abaixo transformam ganho local em erro sistêmico. As duas primeiras
não são hipotéticas: são exatamente o que a sessão de 2026-09-05 propôs.

1. **Dependência de hook que existe para SELAR referência.** Quando o código
   deriva uma dependência (string, hash, `join`, `stringify`) para estabilizar
   uma referência, isso é **arquitetura, não descuido** — em geral o próprio
   código o declara. Trocá-la por igualdade profunda, ou pelo objeto cru, troca
   risco de *performance* por risco de *correção*, e valor obsoleto na tela é
   pior que render a mais.
   *Medido: `useQuantumEngine.ts` sela 18 números — 3 streets × 6 campos — para
   proteger 26 memos a jusante de um cálculo O(N³). O `JSON.stringify` que
   parecia caro custa microssegundos.*

2. **Memoização em massa.** `React.memo`, `useMemo` ou `useCallback` aplicados
   por varredura, sem medir render desperdiçado. Memo só entra **depois** que as
   props já são estáveis; antes disso ele é custo puro.
   *Medido: `ActionRow` recebe `onChange={(f) => ...}` inline nas seis
   instâncias de `NashPanel.tsx`. `React.memo` ali teria zero acertos — a
   referência muda todo render — e só somaria a comparação de 8 props.*

3. **Portões e ops:** `.husky/`, `scripts/ops/`, `record_gate.py`,
   `cwv_gate.ps1`. Um agente não altera o instrumento que o mede.

4. **Credencial, ACL, origem CORS ou CDP.** Vale aqui a §3 da raiz, sem exceção.

5. **Raio maior que o declarado.** A alteração toca os arquivos que a medição
   apontou, e só. Varredura de repositório inteiro é redução material e cai na
   escada da §8.2.

### 10.4 O formato da entrega

Toda sessão fecha declarando: hipóteses levantadas, **o número medido de cada
uma**, a ordenação resultante, o que foi executado e o que foi descartado com o
motivo. Sem esse bloco a sessão não é auditável, e sessão não auditável não
entra na malha.

### 10.5 Alcance

Esta régua vive no repositório de propósito. O prompt do cron mora na plataforma
do Jules e não é versionado aqui — mas toda sessão começa por `git clone`, e o
`AGENTS.md` da raiz aponta para este arquivo. A régua viaja com o código,
portanto, e vale igual para a corrida noturna e para tarefa sob demanda.

### 10.6 Adequação ao protocolo — as três lacunas que o Jules abre

A §10 rege o que o agente **decide**. Esta seção rege como o que ele **produz**
entra na malha. As três lacunas foram medidas na sessão `14536923137986406349`.

**(a) O diário do agente é memória episódica, e a §9 já diz onde ela mora.**
A sessão criou `.jules/bolt.md` por conta própria. O conteúdo é bom, o lugar
não: a §9 estabelece `.claude/agent-memory/<agente>/MEMORY.md` como o diretório
canônico de memória viva de agente. `.jules/` é um segundo lugar para a mesma
classe de artefato, e a §3 chama isso de fonte paralela.

**Regra:** aprendizado de sessão do Jules vai para
`.claude/agent-memory/bolt/MEMORY.md`. `.jules/` não é diretório canônico e não
deve ser criado. A convenção de nome é do fornecedor; a taxonomia é do projeto,
e ela vence — pela mesma razão que `.claude/` não confere posse à Anthropic.

**(b) A atribuição é obrigatória no CORPO, porque o campo de autor está fora
de alcance.** Medido: o commit `4d90a05b` saiu com
`Author: RaphaelVitoi <...@users.noreply.github.com>` e o bot apenas como
co-autor. Isso viola a regra de identidade de autoria da §7 — mas o e-mail não
foi escolhido por agente algum desta malha: vem da integração GitHub App do
Jules, que commita sob a conta que autorizou a instalação. Não há `git config`
local nem instrução de prompt que o corrija.

É exatamente a situação que a §7 já resolveu para comentários e revisões no
GitHub, onde o autor também não é configurável: ali *"o único discriminante
possível é o rodapé de atribuição, que portanto é obrigatório"*. **A mesma
solução se aplica.** Todo commit de sessão do Jules declara no corpo:

```
Assinatura: google-labs-jules[bot] via Jules -- sessao <session_id>
Proposito: <razao tecnica e escopo protegido>
```

Sem esse bloco, o commit é indistinguível de trabalho humano na interface, e a
malha perde a capacidade de auditar a si mesma.

**(c) O trabalho do Jules NÃO passou pelo portão de 5 fases.** A VM do runner
roda a suíte de frontend, e só. `cwv_gate.ps1` exige Windows PowerShell, CDP na
9222 e dev server na 3000; `record_gate.py` exige o índice de registros. Nada
disso existe no contêiner descartável.

**Consequência operacional, e não é opcional:** branch do Jules entra na malha
**apenas por merge local revisado**, onde o `pre-commit` roda de fato. Suíte
verde na VM é evidência parcial e deve ser declarada como tal — nunca reportada
como "portões aprovados". Merge direto para `master` pelo lado da nuvem
contornaria as cinco fases, e a §1 proíbe contornar o portão.
