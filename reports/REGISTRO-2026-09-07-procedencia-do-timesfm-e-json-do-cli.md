---
id: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-pmev"
criado_em: 2026-09-07T22:15:00-03:00
atualizado_em: 2026-09-07T22:15:00-03:00
classes: [interno, medido, procedencia, calibracao, correcao]
caminhos:
  - engine/timesfm_engine.py
  - api/v1/handlers.py
  - scripts/cli/nexus.py
  - frontend/src/lib/timesfm-client.ts
  - tests/test_timesfm_agent_calibration.py
  - tests/test_cwv_gate_truthfulness.py
revisoes_de_ancora:
- registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
  caminhos: [tests/test_cwv_gate_truthfulness.py]
  parecer: >-
    Aquele registro ancora o teste como guarda da veracidade do gate. A guarda
    permanece e ficou mais forte: a assercao deixou de fixar um dos dois ramos do
    relatorio e passou a cobrar o contrato, que e o TBT declarar procedencia em
    qualquer ramo e nunca vir do arbitro humano. Nenhuma verificacao foi removida.
- registro: auditoria-cwv-lighthouse-2026-09-01
  caminhos:
  - tests/test_cwv_gate_truthfulness.py
  - scripts/ops/invoke_lighthouse_production_audit.ps1
  parecer: >-
    A ancora e sobre a cadeia Lighthouse/CWV. Ela e justamente o que expos o
    defeito: a certificacao do TBT em 73b65165 tornou verdadeiro o ramo oposto ao
    que o teste fixava, e o teste reprovou sem que nada estivesse errado. A
    correcao preserva a exigencia de artefato valido; o que mudou foi o teste
    parar de medir o estado do repositorio.
- registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    Aquela auditoria trata de protocolos de handoff e relatorios no CLI. A
    alteracao aqui e restrita as tres emissoes de JSON, que passaram de
    console.print para print. Nenhum comando, contrato ou fluxo de handoff foi
    tocado.
- registro: frente-3-2026-08-29-guard-tri-camada
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    O guard tri-camada nao passa por nenhuma das tres linhas alteradas: elas sao
    a serializacao de saida de agent-metadata e de calibration-forecast. O guard
    segue integro e nao foi reexecutado porque nada nele mudou.
- registro: handoff-2026-08-29-diagnostico-de-memoria
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    O diagnostico de memoria daquele handoff usa outros comandos do CLI. A
    mudanca e de transporte de saida e nao altera dado, esquema ou campo algum do
    payload -- so impede que o Rich quebre a string ao meio.
- registro: handoff-2026-08-29-guard-corrigido-e-heranca
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    Mesma razao do frente-3: a correcao de heranca do guard e ortogonal a
    serializacao de JSON. Nenhuma das linhas que aquele handoff corrigiu foi
    tocada.
- registro: handoff-2026-08-29-roteamento-memoria-e-guard
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    Roteamento e memoria continuam como estavam. A unica intersecao possivel
    seria um consumidor que lesse o --json do CLI, e para esse a mudanca e
    corretiva: antes o payload podia chegar invalido.
- registro: registro-2026-08-29-sota-triad-mesh-integracao
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    A integracao da malha triad nao depende de como o CLI serializa. Se algum
    consumidor dela le --json, passa a receber JSON sempre parseavel, que era o
    que aquele registro ja pressupunha.
- registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
  caminhos: [scripts/cli/nexus.py]
  parecer: >-
    O saneamento do Ollama e o auto-diagnostico ficam em outros comandos. Nada do
    que aquele registro mediu muda: a alteracao e de tres chamadas de impressao.
- registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
  caminhos: [api/v1/handlers.py]
  parecer: >-
    A fronteira HTTP nao muda de forma: o handler de forecast passou a preencher
    dois campos NOVOS e opcionais (intended_model, weights_loaded) e a preencher
    model_used com a procedencia real. Nenhum campo foi removido nem teve o tipo
    alterado, entao nenhum cliente existente quebra.
- registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
  caminhos: [engine/timesfm_engine.py]
  parecer: >-
    Aquele registro integrou o motor TimesFM. O calculo que ele mediu esta
    intacto -- mean_prediction, quantis e drift saem identicos. O que mudou e
    exclusivamente o ROTULO de procedencia, que atribuia ao modelo do Google um
    numero produzido sem pesos carregados.
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    Aquele registro estabeleceu que o certificado tem de VIAJAR -- estar
    versionado, e nao so existir na maquina de quem mediu. A regra continua valida
    e foi ela que funcionou aqui: o artefato versionado expirou sozinho quando
    frontend/ mudou, o portao acusou o mismatch, e a recertificacao entra no mesmo
    commit da alteracao que a motivou. O conteudo mudou; a invariante, nao.
- registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
  caminhos:
  - reports/cwv/latest_lighthouse_production.json
  - scripts/ops/invoke_lighthouse_production_audit.ps1
  parecer: >-
    O que aquele registro conquistou -- TBT certificado e zero warnings no portao
    -- esta preservado e foi remedido: tbtMs 0 e fingerprint identico ao frontend/
    atual, com o portao de 5 fases em 0 erros e 0 warnings. O script ganhou uma
    correcao que aquele registro nao alcancou: a limpeza do perfil temporario
    falhava por lock do Chrome e derrubava o exit code de uma auditoria que dera
    certo. Nenhuma etapa da auditoria em si foi alterada.
- registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
  caminhos: [engine/timesfm_engine.py]
  parecer: >-
    Esta e a reconciliacao direta: aquela validacao ordenou o B04 em primeiro
    lugar e o declarou ABERTO, com a reproducao [1,2,3,4] -> [5.0,6.0,7.0] sob
    model_used do Google. Este commit fecha exatamente esse finding pelo caminho
    que ela indicou -- correcao aditiva no rotulo, sem tocar o calculo. Os outros
    oito findings abertos seguem abertos.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Fechar o finding B04 no ponto em que ele deixou de ser hipotese e virou numero
  consumido, e restaurar a suite verde apos a certificacao do TBT.
classe_tarefa: correcao-de-procedencia-e-restauracao-de-suite
criterio_de_aceite:
  - model_used declara a extrapolacao enquanto nenhum peso for carregado.
  - O id do modelo pretendido continua legivel, em campo proprio.
  - A suite volta a verde sem afrouxar nenhuma assercao.
verificado:
  - >-
    B04 medido em producao, nao em teste: a evidencia de calibracao de 2026-09-07
    projetava mean_trajectory [8.89, 8.78, 8.67] com drift -0.11 e
    risk_of_degradation 0.3983, declarando model_used
    'google/timesfm-2.0-500m-pytorch'. TimesFMEngine._model e None por construcao
    e nunca carrega pesos; o numero vem de last_val + trend*step com bandas
    1.28*std*sqrt(step) em forecast_univariate.
  - >-
    model_used passou a devolver 'analytic-linear-extrapolation (sem pesos de
    google/timesfm-2.0-500m-pytorch)'. O id pretendido foi preservado em
    intended_model e o estado em weights_loaded, nos quatro modelos que expunham
    o campo e nos quatro consumidores (API, CLI, cliente TS e evidencia diaria).
  - >-
    Os dois testes que fixavam o rotulo antigo passaram a exigir o contrario:
    model_used comeca por 'analytic-linear-extrapolation' e difere de
    intended_model enquanto weights_loaded for False.
  - >-
    O ramo --json de agent calibration-forecast emitia por console.print do Rich,
    que aplica word-wrap na largura do terminal. Com o model_used mais longo a
    string partiu ao meio e o payload deixou de parsear. As tres emissoes de JSON
    do CLI passaram a sair por print.
  - >-
    tests/test_cwv_gate_truthfulness.py prendia uma assercao ao ramo 'sem
    artefato Lighthouse valido' do gate. A certificacao do TBT em 73b65165 tornou
    o outro ramo verdadeiro e reprovou o teste sem que nada estivesse errado. A
    assercao passou a cobrar o contrato -- o TBT declara procedencia nos dois
    ramos e nunca vem do arbitro humano.
  - >-
    Suite completa 979 aprovados, 1 pulado, zero warnings. npx tsc --noEmit no
    frontend com exit 0.
  - >-
    O TBT foi RECERTIFICADO depois da alteracao em frontend/: tbtMs 0, lcpMs
    496.516, cls 0, performanceScore 1, e input_fingerprint_sha256
    c44eb9946f4489879fb0... identico ao fingerprint atual de frontend/ recalculado
    por lighthouse_cwv_audit.mjs --fingerprint. O mismatch que o portao acusou era
    consequencia esperada de tocar o cliente TS.
  - >-
    invoke_lighthouse_production_audit.ps1 saia com exit 1 numa auditoria
    bem-sucedida: o Remove-Item do perfil temporario falha por lock do Chrome em
    encerramento e, sob ErrorActionPreference='Stop', derrubava o codigo de saida.
    A limpeza passou a avisar em vez de abortar. O arquivo e ASCII puro e nao tem
    BOM; preservei esse estado, que e valido nas duas versoes do PowerShell -- a
    SS6.4 existe para o caso nao-ASCII, e introduzir BOM aqui seria mudanca de
    encoding nao pedida.
nao_verificado:
  - >-
    Nenhum dos outros oito findings abertos do Astra foi tocado. B03, B05, B06,
    B07, B08, B09, F06 e F07 seguem como estao.
  - >-
    Nao carreguei pesos do TimesFM nem avaliei se vale carrega-los. A correcao e
    de rotulo; se a projecao deve mesmo vir do modelo do Google e decisao do
    Tier 0.
  - >-
    O teste pulado (test_arvore_superada_do_repositorio_fica_fora) nao foi
    verificado: nao ha arvore declarada superada no repositorio.
  - >-
    NAO reexecutei invoke_lighthouse_production_audit.ps1 depois da correcao da
    limpeza: a porta 9230 seguia ocupada pelo Chrome efemero da execucao anterior,
    e o proprio script recusa encerrar processo que nao iniciou. O exit 0 do
    caminho corrigido, portanto, nao esta medido -- so o comportamento anterior
    esta. O artefato produzido antes da correcao e valido e foi verificado por
    fingerprint.
---

# Registro: a procedência do TimesFM, e o JSON que o Rich partia

**Sessão:** `claude-opus5-site-2026-09-07-pmev` · **Regime:** `assistida`

---

## 1. O B04 deixou de ser hipótese no dia em que alguém leu o número

A validação de `f0a9ac2d` ordenou o `B04` em primeiro lugar por um argumento de
governança: a §8.3 declara que o TimesFM projeta `H=3` sessões na evidência de
calibração, então o rótulo tem consumidor ativo.

Medido hoje, o consumidor não é potencial — está rodando. A evidência de
2026-09-07 traz:

```
"drift_direction": "DOWNWARD_DRIFT",
"drift_per_session": -0.11,
"risk_of_degradation": 0.3983,
"model_used": "google/timesfm-2.0-500m-pytorch"
```

**A malha estava prevendo o próprio declínio — 8,89 → 8,67 — e atribuindo a
previsão a um modelo cujos pesos nunca foram carregados.** `_model` é `None` por
construção, e `forecast_univariate` devolve `last_val + trend*step`.

O cálculo é legítimo como fallback. O defeito sempre foi o rótulo, e a §3
separa capacidade, procedência e autorização exatamente porque confundi-las
corrompe as três.

## 2. A correção é aditiva, e preserva a intenção

Nada foi removido. `model_used` passou a responder *"quem produziu este
número"*; `intended_model` guarda *"quem se pretendia usar"*; `weights_loaded`
diz qual dos dois vale. Um dia que os pesos carreguem, `model_used` volta a ser
o id do Google — e será verdade.

## 3. O JSON que o Rich partia ao meio

O valor honesto é mais longo que o mentiroso, e isso descobriu um defeito que
não tinha nada a ver com o TimesFM: `agent calibration-forecast --json` emitia
por `console.print`, que aplica word-wrap na largura do terminal. A string
quebrou dentro das aspas e o payload deixou de parsear.

**Um `--json` que passa pelo Rich não é JSON — é JSON até o primeiro campo
comprido.** As três emissões do CLI passaram a sair por `print`.

Registro do meu próprio erro de método: procurei por `console.print(json.dumps`
e concluí ter varrido tudo. O caso real era `console.print(res.model_dump_json`
e a busca não o alcançava. **Busca parcial dá a mesma falsa confiança que busca
vazia** — a pergunta certa é sobre a forma que o alvo teria, não sobre o
resultado que voltou.

## 4. O teste do TBT media o repositório, não o contrato

`test_cwv_gate_truthfulness` exigia a frase *"TBT permanece sem artefato
Lighthouse valido."*. O gate tem **dois** ramos nessa linha (`cwv_gate.ps1:1129`),
e a certificação do TBT em `73b65165` tornou verdadeiro o outro.

O teste reprovou sem que nada estivesse errado — ele alternava conforme o
fingerprint de `frontend/`. A asserção passou a cobrar o que dá nome ao teste: o
TBT declara procedência nos dois ramos, e nunca vem do árbitro humano, que
atestou INP e só INP.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** corrigir a procedência declarada pelo motor de séries temporais no
ponto em que ela já alimentava a evidência de calibração, e restaurar a suíte
verde sem afrouxar nenhuma asserção.
