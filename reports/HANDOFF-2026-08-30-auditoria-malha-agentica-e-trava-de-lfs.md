---
id: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
tipo: handoff
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-30T18:05-03:00
commit: 3166f625
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
nao_verificado:
  - cwv_gate.ps1 nao rodou, por ausencia de PowerShell no ambiente; e os hooks do husky nao estao instalados neste clone, entao o portao nao disparou em commit nenhum desta sessao
  - sync_agents_reality.ps1 nao foi executado, e a sintaxe do .ps1 corrigido em A7 nao passou por parser
  - skill security-review indisponivel nesta sessao
  - pip-audit do venv instalado e auditoria OSV do uv.lock nao rodaram; so a declaracao foi auditada
  - meta de 60-70% de trafego local do ComplexityAnalyzer nao foi medida
  - as 19 skills marcadas nao-verificada no registro nao puderam ser confirmadas a partir do repositorio
  - A4 nao foi exercitado no Windows; o CONNECTION_CLOSED que substituiu o ENOENT e evidencia POSIX, nao prova na plataforma alvo
  - nenhum check de CI validou o merge, porque a conta esta travada
  - o valor e a existencia do debito de LFS nao foram vistos; a fatura nao e acessivel daqui
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

**A causa raiz, medida.** LFS cobra repositorio publico, e remover do HEAD nao
libera objeto. No historico completo -- que so apareceu depois de eu perceber
que o clone era **raso** e rodar `git fetch --unshallow` -- ha **17,03 GiB** em
3794 objetos distintos, contra 1 GiB de cota. Um unico objeto responde por 14,16
GiB: `.gemini/.ollama/models/blobs/sha256-4c27e0f5b5ad...`, o modelo Ollama que o
proprio `CLAUDE.md` cita como motivo da criacao da fase 5.

**95,6% do passivo esta sob prefixos que a fase 5 hoje ja bloqueia.** O portao
nasceu depois do estrago, e o estrago nao se desfaz sozinho. O conteudo legitimo
soma 0,64 GiB -- dentro da cota.

## 7. O que fica aberto, e para quem

**Do vertice, e nada disso e codigo:**

1. Chamado ao suporte do GitHub. Texto redigido e entregue, com evidencias,
   pedido de purga e isencao, e a pergunta que decide o proximo passo -- se
   apagar o repositorio destrava a conta, ou se o debito persiste. Deletar antes
   de saber custaria historico, issues e PRs **e** poderia manter a trava.
2. Rodar `.\\scripts\\routines\\sync_agents_reality.ps1` na sua maquina. Resultado
   esperado: `git status` vazio.
3. Abrir sessao MCP no Windows para fechar A4.

**Riscos que seguem de pe no repositorio:**

- **O portao nao protege nada desde 2026-08-21.** 114 execucoes, zero sucessos.
  Todo commit em `master` desde entao entrou sem lint, tipos, testes ou build.
  Isso e maior que qualquer achado que esta auditoria corrigiu.
- **Os hooks do husky nao estao instalados neste clone.** Portao nao instalado
  nao protege: foi assim que 16 GiB entraram apesar de a regra existir.
- **A fase 5 tem lacunas.** `frontend/backups/` e `.claude/.ARQUIVE/` nao sao
  bloqueados, e `.gemini_security/` escapa porque o teste e `-like ".gemini/*"`,
  que nao casa com `.gemini_security/`. Ali ha 152 MiB em tres HTML de 50 MiB.
- **Quando o billing destravar**, a primeira execucao real deve falhar em
  `ruff format --check .`, pelos 48 arquivos preexistentes. Nao e regressao do
  PR 24: a contagem no head e a mesma do `master`.
- **O `CLAUDE.md` tem duas secoes numeradas `## 7`.** Nao renumerei: deslocaria
  referencias cruzadas que nao auditei.

## 8. Calibracao (M.O. 8.3)

Registro literal exigido pelo limiar de suficiencia:

    dados insuficientes -- nenhuma calibracao planejada

Motivo: uma unica sessao identificada e nenhum feedback registrado ate o
fechamento deste handoff. O limiar pede tres feedbacks em duas ou mais sessoes,
com duas confirmacoes independentes do mesmo padrao. Nao ha amostra, e
`Register-AgentCalibrationFeedback.ps1` nao pode rodar aqui por ausencia de
PowerShell -- o registro do feedback desta sessao depende da maquina do
operador.

Nenhuma nota, aprendizado ou posterior foi inventado.
