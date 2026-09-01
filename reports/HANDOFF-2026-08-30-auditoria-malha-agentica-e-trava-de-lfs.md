---
id: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
tipo: handoff
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-30T18:05-03:00
atualizado_em: 2026-09-01T01:07-03:00
commit: f55a6486
classes: [interno]
caminhos:
  - data/skills_registry.json
  - data/agents_manifest.json
  - tests/test_governanca_skills.py
  - tests/test_routing_policy.py
  - tests/conftest.py
  - tests/test_architectural_stress_and_failover.py
  - llm/routing_policy.py
  - scripts/routines/sync_agents_reality.ps1
  - .mcp.json
  - pyproject.toml
  - CLAUDE.md
  - package.json
  - .husky/pre-commit
  - .husky/commit-msg
  - .husky/pre-push
  - .claude/agent-memory/auditor/MEMORY.md
  - .claude/agent-memory/chico/MEMORY.md
  - reports/AUDITORIA-2026-08-30-malha-agentica-e-subagentica.md
commits:
  - "6ae093a3 -- auditoria por medicao da malha agentica, sem correcoes"
  - "d91e2b38 -- A2, A3 e A7 corrigidos"
  - "b2b7f768 -- A1, skills vira contrato com registro e 9 guardas"
  - "702a70a9 -- formatacao ruff do arquivo novo, para nao somar divida"
  - "1e4d94e3 -- A5 parcial, e a retificacao do que era erro meu"
  - "27468c74 -- A8 com 2 guardas, A9 enumerado, A6 recusado com motivo"
  - "54a8027a -- A4, layout de venv sai do .mcp.json"
  - "60258885 -- furo na propria guarda de frontmatter, achado pelo CodeRabbit"
  - "3a9bb283 -- identidade de autoria agentica na M.O. 13.G"
  - "3166f625 -- merge do PR 24 em master, autorizado pelo vertice"
  - "2c3d439c -- este registro de handoff"
  - "a97c7eca -- feedback 9/10 do vertice, sem promocao a padrao"
  - "f1cfcc0d -- hooks do husky ligados em todo clone"
  - "bf9f982e -- modelo obsoleto em prosa removido dos 18 MEMORY.md"
  - "60a395a8 -- merge do PR 25 em master, autorizado pelo vertice"
  - "f55a6486 -- primeiro commit e push na maquina do operador exercitaram pre-commit e pre-push"
verificado:
  - suite 353 -> 365 passed sob Python 3.13, com o delta inteiramente explicado (+1 de A2, +9 da guarda de A1, +2 da de A8)
  - as 13 falhas e 72 erros remanescentes sao preexistentes e por modulo ausente no container; nenhum mudou de estado
  - onze guardas novas, cada uma quebrada de proposito antes de ser aceita, e cada sonda revertida depois
  - os 19 documentos de agente reproduzidos byte-a-byte pelo template antes de qualquer alteracao do manifesto
  - ruff check limpo; arquivos fora de ruff format em 48, identico ao master, entao o PR nao somou divida
  - npm audit --audit-level=low sem vulnerabilidades
  - pip-audit sobre requirements.txt com 4 advisories em chromadb, e o aceite de risco conferido no codigo (so PersistentClient)
  - LFS medido no historico COMPLETO apos git fetch --unshallow, 284 commits desde 2026-05-01
  - 3794 objetos LFS distintos somando 17,03 GiB, com 95,6% sob prefixos que a fase 5 ja bloqueia
  - autoria do commit 2b066450 conferida como externa a esta sessao por nome, e-mail, fuso -03:00 e reflog
  - "hook commit-msg exercitado por quatro sondas: fora do padrao e titulo de 119 caracteres reprovam; mensagem valida e merge passam"
  - "`npm run prepare` move `git rev-parse --git-path hooks` de `.git/hooks` para `.husky`"
  - 18 dos 19 MEMORY.md declaram modelo em prosa e nenhum confere com o manifesto (10x gemini-2.5-pro, 7x gemini-2.0-flash, 1x gemma-4-E2B-it)
  - "2026-08-31, maquina do operador: `git config core.hooksPath` responde `.husky`; a configuracao efetiva aponta para o destino esperado do `prepare`, mas a execucao de `npm install` em ambiente limpo nao foi observada"
  - "2026-08-31, maquina do operador: sync_agents_reality.ps1 executado sob PowerShell, 19 identidades sincronizadas, arvore limpa depois -- A7 e a remocao dos 18 MEMORY.md sobreviveram a sincronia"
  - "sync_agents_reality.ps1:9 deriva a raiz de $PSScriptRoot, entao o diretorio de invocacao nao altera onde os 19 documentos sao escritos"
  - "2026-09-01, `f55a6486` e o push normal subsequente executaram pre-commit e pre-push na maquina do operador; as cinco fases, a ancora e o registro imprimiram veredito sem bypass"
nao_verificado:
  - cwv_gate.ps1 nao rodou, por ausencia de PowerShell no ambiente; o wiring dos hooks foi corrigido no repositorio mas deliberadamente desligado neste container, entao o portao nao disparou em commit nenhum desta sessao
  - skill security-review indisponivel nesta sessao
  - pip-audit do venv instalado e auditoria OSV do uv.lock nao rodaram; so a declaracao foi auditada
  - meta de 60-70% de trafego local do ComplexityAnalyzer nao foi medida
  - as 19 skills marcadas nao-verificada no registro nao puderam ser confirmadas a partir do repositorio
  - A4 nao foi exercitado no Windows; o CONNECTION_CLOSED que substituiu o ENOENT e evidencia POSIX, nao prova na plataforma alvo
  - nenhum check de CI validou o merge, porque a conta esta travada
  - o valor e a existencia do debito de LFS nao foram vistos; a fatura nao e acessivel daqui
  - "o hook pre-commit nao pode ser exercitado aqui: chama cwv_gate.ps1 via pwsh, ausente no ambiente, e sai 127 -- medido"
  - o script `prepare` nao foi validado pelo caminho real (`npm ci` num runner limpo), porque o CI nao roda; so o mecanismo foi testado a mao
revisoes_de_ancora:
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/auditor/MEMORY.md
      - .claude/agent-memory/chico/MEMORY.md
    parecer: "As memorias foram ampliadas em 2026-09-01 para registrar a execucao real dos hooks em f55a6486; a evidencia original de integridade e codificacao permanece historica."
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/auditor/MEMORY.md
      - .claude/agent-memory/chico/MEMORY.md
    parecer: "A atualizacao preserva o handoff de 2026-08-30 e acrescenta somente a evidencia posterior de execucao de pre-commit e pre-push, sem reclassificar suas verificacoes historicas."
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/MEMORY.md
    parecer: "A memoria de Chico recebeu um adendo operacional de hooks em 2026-09-01; o escopo e as conclusoes do relatorio de teoria dos jogos nao foram alterados."
---

# Handoff -- a malha auditada, e a trava que o CI escondia

## 1. O que a auditoria mediu

O pedido foi auditar a malha agentica e subagentica. O metodo foi medicao no
repositorio, nao leitura de documentacao -- e a diferenca entre as duas apareceu
logo.

**O eixo que a governanca disciplinou esta integro.** O roteamento de modelo tem
fonte unica, os 19 documentos de agente sao byte-a-byte identicos ao template
gerado a partir do manifesto, os 15 niveis de subagente resolvem, e a
consolidacao de memoria de 2026-08-28 esta correta e guardada.

**O eixo que ela nao cobriu estava cego.** Das 31 skills declaradas nos 19
agentes, **zero resolviam** e 21 nao resolviam em lugar nenhum. Os conjuntos
declarado e existente eram **disjuntos**. Dezenove documentos de identidade
publicavam capacidade que nada validava e nada carregava.

A causa e estrutural, nao um esquecimento: o campo `skills` **nao tem consumidor
de runtime**. Seus unicos leitores eram o gerador de documentos e uma assercao
que verificava que o campo *e uma lista* -- nunca que os nomes existem. Ao longo
do dia o mesmo padrao apareceu em `routing_pattern` e em `fallback_model`: tres
dos campos declarativos do manifesto sao decorativos. `specialized_scripts` e o
unico que resolve, e resolve **porque aponta para caminhos** -- caminho quebrado
quebra visivelmente, nome errado nao quebra nada. So mente.

## 2. Os nove achados e o destino de cada um

| # | Achado | Destino |
| :-- | :--- | :--- |
| A1 | camada de skills nao resolve nem e guardada | contrato com `skills_registry.json` e 9 guardas |
| A2 | teste de integridade dos 19 agentes so passava numa maquina | ancorado no proprio arquivo de teste |
| A3 | guard imprimia VERDE em execucao interrompida por erro de coleta | gancho `pytest_collectreport` |
| A4 | `.mcp.json` codificava layout de venv de uma plataforma | `uv run --no-sync`, layout sai do arquivo |
| A5 | docstring dizia 6 niveis de subagente onde ha 15 | passa a apontar para o enum |
| A6 | manifesto se le local-first, politica roda cloud-first | **avaliado e recusado**, motivo medido |
| A7 | `$Model` removido em 2026-08-21, ainda interpolado | interpolacao removida |
| A8 | dois `fallback_model` nao resolviam em registro nenhum | corrigidos, mais 2 guardas |
| A9 | nota do chromadb citava 1 de 4 advisories | as 4 enumeradas |

**A6 e o mais instrutivo dos nove.** Tentei inserir o aviso de autoridade no
proprio manifesto e **quebrou 9 testes na hora**: quatro consumidores tratam
*toda* chave como agente. Revertido no mesmo minuto. Fazer o campo aceitar
metadado exigiria mexer no carregamento de roteamento -- o caminho mais quente
do sistema -- para corrigir uma leitura cosmetica de um arquivo que ninguem le
cru, e cujos documentos gerados ja apontam para a autoridade real. Recusa com
custo medido vale mais que correcao com custo ignorado.

## 3. Duas retificacoes contra mim mesmo

Ambas nasceram de aplicar a propria correcao, e ambas estao no corpo do
relatorio, nao em rodape.

**A contagem de orfas.** Escrevi "11 skills existem e ninguem declara". Errado:
os 8 diretorios sob `skills/` sao submodulos git de extensoes do Gemini CLI,
outra classe de artefato. O numero correto era **3**.

**O item de `CONFLITOS_MANIFESTO` foi RETIRADO, nao corrigido.** Eu afirmara que
ele "declara 2 divergencias onde ha 17 de 19". Sao grandezas diferentes: aquele
dicionario documenta conflito de **classe de tarefa**, e 2 esta correto; os 17/19
sao divergencia entre `primary_model` e o modelo resolvido pela politica, que e
**por design**. Ao procurar conflitos nao declarados encontrei tres candidatos --
mas so porque classifiquei `VERIFICACAO` como classe "leve", balde que **eu
inventei**. Nenhum conflito faltava declarar.

A segunda importa mais que a primeira: eu quase "consertei" codigo que estava
certo, com base em leitura minha errada.

## 4. O furo dentro da propria guarda

O CodeRabbit apontou que
`test_skill_local_declara_o_proprio_nome_no_frontmatter` buscava `name:` no
**arquivo inteiro**. Uma skill sem frontmatter, com `name:` em qualquer linha do
corpo Markdown, passava.

Verifiquei e procedia. O incomodo nao e o bug: e que era **uma guarda satisfeita
por coincidencia**, exatamente a classe de defeito que esta auditoria persegue --
cometida dentro dela, no mesmo PR em que documento que campo sem guarda
apodrece. O teste tambem nao fazia o que o proprio nome prometia.

Sonda A (sem frontmatter, `name:` no corpo) **passava** antes e reprova depois.

## 5. O incidente de autoria, e o que ele ensinou

O vertice relatou push de agente sem autorizacao explicita. Investiguei primeiro
o mecanismo mais proximo -- eu -- e o descartei com evidencia: meus commits todos
na branch designada, nenhum em `master`, reflog com exatamente os meus.

O commit `2b066450` saiu com identidade `Raphael Vitoi <raphaelvitoi@gmail.com>`,
trailer `Co-Authored-By: chico@antigravity` e **fuso -03:00**, contra `+00:00`
dos meus. Nao houve sobreposicao de arquivos.

**O que os discriminantes revelaram e o achado.** Nome, fuso e trailer
resolveram o caso **precisamente porque o e-mail nao discriminava**. Commits
desta linhagem sairam com o e-mail do administrador e o GitHub os exibiu como
autoria dele -- inclusive uma resposta de revisao e um *learning* que o
CodeRabbit gravou como `Learnt from: RaphaelVitoi`, quando quem escreveu foi o
agente.

Dai a regra nova na M.O. 13.G: agente nao assina commit com e-mail que resolve
para perfil humano. Escrita no `CLAUDE.md`, nao em `git config`, porque config de
shell nao e herdada pelo proximo agente. Historico publicado **nao** foi
reescrito: force-push em branch publicada quebra checkout alheio, e a transicao
fica registrada em vez de escondida.

## 6. A cadeia que levou do CI a uma trava de conta

O CI estava vermelho. A cadeia de eliminacao, em ordem, e cada elo com evidencia:

1. **Nao e deste PR** -- falha identica no SHA-base do `master`.
2. **Nao e flake** -- re-run gasto, falhou igual.
3. **Nao e workflow invalido** -- o job dependente sai `skipped`, entao o grafo
   foi parseado.
4. **Nao e SHA de action inexistente** -- os 5 pins conferem com as tags upstream.
5. **Nao e politica de Actions** -- esta em "Allow all actions".
6. **Nao era o CodeRabbit** -- o re-run apos o cancelamento falhou igual.

E entao a anotacao do proprio GitHub encerrou:
`The job was not started because your account is locked due to a billing issue`.

**Aqui eu errei uma eliminacao, e o erro merece registro.** Eu havia levantado
billing como hipotese principal e a matei pelo motivo errado: "repo publico logo
minutos ilimitados". Minutos ilimitados nao imunizam contra bloqueio de conta.
A hipotese certa foi descartada por argumento ruim.

**A hipotese causal forte, ainda nao confirmada pela conta.** LFS cobra
repositorio publico, e remover do HEAD nao libera objeto. No historico completo
-- que so apareceu depois de eu perceber que o clone era **raso** e rodar
`git fetch --unshallow` -- ha **17,03 GiB** em 3794 objetos distintos. A
franquia Free atual documentada e de 10 GiB, nao 1 GiB; portanto a formulacao
anterior da cota estava errada. Um unico objeto responde por 14,16 GiB:
`.gemini/.ollama/models/blobs/sha256-4c27e0f5b5ad...`, o modelo Ollama que o
proprio `CLAUDE.md` cita como motivo da criacao da fase 5. O historico explica
uma hipotese material para a trava, mas so o suporte pode confirmar se ele e a
causa de conta que bloqueia Actions.

**95,6% do passivo esta sob prefixos que a fase 5 hoje ja bloqueia.** O portao
nasceu depois do estrago, e o estrago nao se desfaz sozinho. O conteudo legitimo
soma 0,64 GiB -- dentro da cota.

## 7. O que fica aberto, e para quem

**Do vertice, e nada disso e codigo:**

1. Chamado ao suporte do GitHub. **Aberto como #4716843**, com inventario local,
   conta Free sem uso medido corrente e a pergunta que decide o proximo passo:
   qual condicao de conta bloqueia Actions e qual remediacao e suportada. Ate a
   resposta humana, nao adicionar forma de pagamento, nao reescrever historico,
   nao apagar repositorio e nao comentar novamente no ticket. Deletar antes de
   saber custaria historico, issues e PRs **e** poderia manter a trava.
2. ~~Rodar `sync_agents_reality.ps1` na sua maquina.~~ **Fechado em 2026-08-31**
   -- ver §7.1.
3. Abrir sessao MCP no Windows para fechar A4.
4. Registrar o feedback 9/10 no ledger encadeado com
   `Register-AgentCalibrationFeedback.ps1`. Ate la ele vive neste relatorio e
   **nao** na cadeia de hash -- distincao mantida na §8.1.

### 7.1 Adendo de 2026-08-31 -- o que a maquina do operador confirmou

Duas pendencias da §7 original foram exercitadas na plataforma alvo. As duas
passaram, e uma delas quase produziu um falso resultado.

**Os hooks estao configurados.** `git config core.hooksPath` responde `.husky`
no clone do operador. Isso confirma o estado efetivo esperado do `prepare`, mas
nao prova que o ciclo de vida `npm install` o tenha produzido: essa execucao em
ambiente limpo continua nao observada. O que **nao** esta fechado e o efeito:
nenhum commit foi feito ali desde a ativacao, entao o `cwv_gate.ps1` ainda nao
imprimiu veredito. Config correta nao e portao exercitado -- e a mesma distincao
que originou o achado.

**A sincronia dos 19 documentos e idempotente, e a arvore ficou limpa.** O
script foi executado sob PowerShell, sincronizou as 19 identidades e nao deixou
diff. Isso confirma duas propriedades observadas: (1) a sintaxe do `.ps1`
corrigido em A7 passa pelo parser real; (2) a remocao do modelo obsoleto dos 18
`MEMORY.md` sobreviveu a esta sincronia. A arvore limpa, por si so, nao prova
que uma memoria antes ausente foi criada nem que todo arquivo e byte-a-byte
identico ao template; essas afirmacoes permanecem dependentes das verificacoes
dedicadas registradas na auditoria.

**A armadilha que nao disparou.** O script foi invocado de dentro de
`scripts\routines\`, nao da raiz. Se ele resolvesse caminhos pelo diretorio
corrente, teria escrito 19 documentos em `scripts\routines\.claude\agents\` e a
arvore limpa seria um falso negativo -- o diff real estaria em arquivos nao
rastreados que o `git status` mostraria, mas cuja ausencia eu teria lido como
sucesso. Nao aconteceu: `sync_agents_reality.ps1:9` deriva a raiz de
`$PSScriptRoot`, nao do CWD. Verificado no codigo antes de aceitar o resultado,
e nao depois -- que e exatamente a ordem que a §8.3 registra como a licao desta
sessao. **Primeira aplicacao dela, e ela pagou.**

### 7.2 Adendo de 2026-09-01 -- o efeito do portao foi observado

O teste que em 2026-08-31 ainda estava aberto foi exercitado no commit
`f55a6486` e novamente no push normal subsequente. `pre-commit` executou as
cinco fases do `cwv_gate.ps1`, a verificacao de ancora e o gate de registro; o
pre-push executou o audit sem `--no-verify` ou outro bypass. O resultado foi
**FRAGIL**, com zero erros: INP/TBT ainda requerem interacao humana e trace
laboratorial, e uma verificacao `color-contrast` do axe permanece inconclusiva.
Essas sao limitacoes medidas, nao aprovacao plena nem violacao confirmada.

O push foi aceito por `origin`. Isso prova publicacao Git e execucao local dos
hooks; nao prova que GitHub Actions tenha sido desbloqueado ou executado, pois
essa superficie nao foi lida nesta etapa.

**Riscos que seguem de pe no repositorio:**

- **O CI remoto continua sem evidencia nova.** A execucao local dos hooks foi
  observada em 2026-09-01, mas push aceito nao prova GitHub Actions desbloqueado
  nem substitui uma execucao remota verde.
- **Os hooks do husky nunca estiveram ligados — causa encontrada e corrigida.**
  Portao nao instalado nao protege, e foi assim que 16 GiB entraram apesar de a
  regra existir. Eram **dois** defeitos independentes, e o primeiro era
  versionado: (1) os tres hooks estavam commitados como `100644`, sem bit de
  execucao, em todo clone; (2) `core.hooksPath` nunca foi versionado, e config
  local nao viaja com o repositorio. O `husky` sequer e dependencia do projeto
  — mas os hooks sao `#!/bin/sh` puros, sem shim, entao nao precisam do pacote.
  Corrigido com `git update-index --chmod=+x` nos tres e um script `prepare`
  que roda `git config core.hooksPath .husky` a cada `npm install`, sem
  adicionar dependencia.
- **A fase 5 tem lacunas.** `frontend/backups/` e `.claude/.ARQUIVE/` nao sao
  bloqueados, e `.gemini_security/` escapa porque o teste e `-like ".gemini/*"`,
  que nao casa com `.gemini_security/`. Ali ha 152 MiB em tres HTML de 50 MiB.
- **Quando o billing destravar**, a primeira execucao real deve falhar em
  `ruff format --check .`, pelos 48 arquivos preexistentes. Nao e regressao do
  PR 24: a contagem no head e a mesma do `master`.
- **O `CLAUDE.md` tem duas secoes numeradas `## 7`.** Nao renumerei: deslocaria
  referencias cruzadas que nao auditei.

## 8. Calibracao (M.O. 8.3)

### 8.1 Feedback recebido

O vertice avaliou a sessao ao encerrar o handoff.

    Nota: 9/10

    "Fluido, conciso, direto ao ponto e sem se perder em questoes frivolas fora
     do escopo. So nao dou dez por falta de proatividade e preditividade um
     pouco."

Transcrito como recebido, com uma unica normalizacao de digitacao evidente
("pouco" -> "ponto" na primeira frase). Nenhuma palavra foi acrescentada,
suavizada ou interpretada.

O registro no ledger encadeado depende da maquina do operador --
`Register-AgentCalibrationFeedback.ps1` nao roda aqui por ausencia de
PowerShell. **Ate o comando ser executado, este feedback consta neste relatorio
e NAO no ledger**, e essa distincao importa: relatorio nao e cadeia de hash.

### 8.2 Calibracao planejada

Registro literal exigido pelo limiar de suficiencia:

    dados insuficientes -- nenhuma calibracao planejada

O limiar **continua nao atendido mesmo com o feedback acima**. Ele pede tres
feedbacks em duas ou mais sessoes identificadas, com duas confirmacoes
independentes do mesmo padrao operacional. Ha **um** feedback, em **uma** sessao.

Isto e deliberado e merece o registro explicito: a critica recebida e
acionavel, e transforma-la agora numa microcalibracao seria exatamente o que a
8.3 proibe -- generalizar padrao a partir de amostra unica. Uma observacao de
uma sessao e evidencia retida, nao padrao confirmado.

### 8.3 Observacao retida, sem promocao a padrao

A critica aponta **falta de proatividade e preditividade**. Sem trata-la como
padrao, ficam registradas as ocorrencias concretas desta sessao que a
sustentam, para que uma sessao futura possa confirma-la ou refuta-la contra
evidencia propria:

1. Medi o payload LFS do checkout (377 MiB) e so **depois** percebi que o clone
   era raso. A verificacao de profundidade deveria ter precedido a medicao, nao
   sucedido -- o numero certo (17,03 GiB) so apareceu na segunda tentativa.
2. Descartei a hipotese de billing com o argumento "repo publico logo minutos
   ilimitados", que nao cobre LFS. A hipotese certa foi eliminada por
   raciocinio incompleto, e teve de ser retomada depois.
3. Contei 11 skills orfas antes de verificar que 8 daqueles diretorios eram
   submodulos. A checagem de natureza do artefato deveria ter vindo antes da
   contagem.
4. Perguntei "quer que eu siga para A4?" em vez de propor a ordem, que o vertice
   entao teve de delegar explicitamente.

As quatro tem a mesma forma: **medir antes de estabelecer a precondicao da
medicao**. Se o padrao se confirmar em sessao futura, a calibracao candidata e
verificar precondicao antes de produzir numero -- mas isso e hipotese para o
ciclo seguinte, nao calibracao deste.

Nenhuma nota, aprendizado, posterior ou probabilidade foi inventado.

---

## 9. Prompt de continuidade

> Voce assume o `Site`, unico repositorio git desta raiz. Leia `CLAUDE.md`
> inteiro antes de propor arquitetura -- em especial a §3 (fonte unica por
> decisao), a §5 (obrigacao de declaracao) e a §8.2 (coerencia causal). A M.O.
> 13.G ganhou em 2026-08-30 uma regra de identidade de autoria: **agente nao
> assina commit com e-mail que resolve para perfil humano**. Commite como
> `Claude <noreply@anthropic.com>`; a responsabilidade do vertice se expressa por
> propriedade e merge, nunca por autoria emprestada.
>
> **Rode `git status` antes de tudo e nunca use `git add -A` as cegas.** Outra
> sessao (`chico@antigravity`) edita este repo em paralelo e empurra direto no
> `master` -- aconteceu tres vezes em 2026-08-30, uma delas a tres segundos de um
> commit meu. Nao houve sobreposicao, mas isso foi sorte, nao desenho.
>
> **O CI nao roda.** A anotacao do GitHub confirma uma trava de billing, mas a
> causa de conta ainda esta com o suporte. O historico LFS e uma hipotese forte:
> 17,03 GiB em 3794 objetos distintos, contra a franquia Free atual documentada
> de 10 GiB, sendo 95,6% sob prefixos que a fase 5 ja bloqueia e um unico blob
> de modelo Ollama respondendo por 14,16 GiB. Sao 225 execucoes com **zero**
> sucessos desde 21/08. Nenhum push resolve isso; nao gaste re-run. Enquanto
> durar, todo verde declarado em commit e medicao local, nao veredito de portao
> remoto -- diga qual dos dois voce esta reportando.
>
> **Os hooks foram ligados em 2026-08-30 e o wiring foi confirmado na maquina
> do operador em 2026-08-31** (`git config core.hooksPath` responde `.husky`).
> Num clone novo o wiring so passa a valer apos um `npm install`, porque quem o
> aplica e o script `prepare`. Feito isso, `pre-commit` chama `cwv_gate.ps1` via
> `pwsh`: em ambiente sem PowerShell ele sai 127 e bloqueia todo commit.
> **Nunca use `--no-verify`.** Se o portao nao puder executar, declare isso --
> portao que nao roda nao e portao burlado, mas tambem nao e portao aprovado.
> **O teste de efeito foi fechado em 2026-09-01:** `f55a6486` e o push normal
> subsequente imprimiram as cinco fases, a ancora e o registro. O portao ficou
> `FRAGIL`, com zero erros e duas limitacoes medidas; isso nao autoriza chamar a
> cobertura de CWV/A11y de plena.
>
> Quando o billing destravar, a primeira execucao real deve falhar em
> `uv run ruff format --check .`: sao **48 arquivos** preexistentes fora de
> formatacao, medidos no `master`. Nao e regressao de PR nenhum, e cabe num
> commit mecanico separado.
>
> **A regra que esta sessao pagou para aprender: verifique a precondicao antes
> de produzir o numero.** Medi LFS de um clone raso e errei por 45x; contei
> skills orfas antes de ver que eram submodulos; eliminei a hipotese certa de
> billing com um argumento que nao cobria LFS. As tres tem a mesma forma. Antes
> de publicar qualquer medicao, pergunte de que universo ela saiu.
>
> **E a irma dela: teste que passa nao prova nada ate mostrar que sabe
> reprovar.** Toda guarda escrita aqui foi quebrada de proposito antes de ser
> aceita. Mesmo assim escrevi uma que podia ser satisfeita por coincidencia, e
> foi um bot que achou.
>
> Pendencias abertas, nenhuma delas codigo: o chamado ao suporte do GitHub
> (texto pronto), abrir sessao MCP no Windows para fechar A4, e registrar o
> feedback 9/10 no ledger encadeado.
>
> Fechadas em 2026-08-31, com a evidencia na §7.1: a sincronia dos 19
> documentos, os 18 `MEMORY.md` com modelo obsoleto (gemeo do A7) e o wiring
> dos hooks. O **efeito** do portao foi adicionalmente observado em 2026-09-01,
> conforme §7.2; a cobranca de GitHub Actions continua uma superficie distinta e
> nao foi inferida a partir do push aceito.
