---
id: registro-2026-09-04-credenciais-submodulos-e-adaptador-hrc
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-04T21:40:00-03:00
atualizado_em: 2026-09-04T21:40:00-03:00
classes: [interno, medido, pmev, seguranca, infraestrutura]
caminhos:
  - engine/solver_importers/hrc_evidence.py
  - engine/jules_bridge.py
  - engine/stitch_bridge.py
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - scripts/ops/sync_jules_report.py
  - scripts/ops/Set-EcosystemCredential.ps1
  - data/agents_manifest.json
  - JULES_REPORT.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - data/agents_manifest.json
    parecer: >-
      Revisado e mantido valido. Ele ancora no manifesto para tratar da fusao
      cerebro->claude e do quality gate; nada disso foi tocado aqui. A alteracao deste
      commit e cirurgica e de outra natureza -- remove a declaracao orfa `sota-triad-mesh`
      de dois agentes e atribui seis skills que existiam em disco sem dono. Nenhum campo
      de roteamento, modelo ou identidade que aquele relatorio descreve foi alterado.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - data/agents_manifest.json
    parecer: >-
      Revisado e mantido valido, e este commit o CONFIRMA em vez de contradizer. Aquela
      auditoria examina o trabalho do condutor anterior; aqui mediu-se que o commit
      080cda35 daquele condutor deixou quatro testes vermelhos em master -- tres
      constantes sem leitor e cinco skills sem dono. Nao e reparo de conclusao daquela
      auditoria: e achado novo, posterior a ela, e agora corrigido.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - data/agents_manifest.json
    parecer: >-
      Revisado e mantido valido, e e o registro mais diretamente servido por este commit.
      Foi o achado A1 daquela auditoria que criou o skills_registry justamente porque
      skill declarada era afirmacao de capacidade sem verificacao. O que se faz aqui e
      exercer aquele mecanismo: `sota-triad-mesh` era declarada por chico e pesquisador e
      seu SKILL.md fora deletado em 16fee329 sem limpar as declaracoes. A trava de LFS
      nao foi tocada.
  - registro: handoff-2026-08-30-status-malha-agentica-e-routing
    caminhos:
      - data/agents_manifest.json
    parecer: >-
      Revisado e mantido valido. O roteamento que ele documenta -- model_preference,
      primary_model, fallback_model, tier -- nao foi alterado em nenhum dos 19 agentes.
      A unica chave tocada e `skills`, em sete deles. Os documentos em .claude/agents/
      foram REGENERADOS por scripts/routines/sync_agents_reality.ps1, nunca editados a
      mao, como a secao 3 do CLAUDE.md exige.
  - registro: registro-2026-09-02-etapa-b-river-e-classe-de-acao-no-cenario
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      Revisado e mantido valido. A classificacao de acao por ramo e nao por rotulo que
      ele estabelece continua intacta: `classifyAction` e `classifyActionNoCenario` nao
      foram tocadas. Este commit ACRESCENTA uma secao 9 ao contrato -- convergencia -- e
      nao altera nenhuma regra de validacao, tolerancia ou conservacao que aquele
      registro fixou.
  - registro: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      Revisado e mantido valido. O contrato de evidencia que ele funda permanece com a
      mesma forma: `Measured<T>`, a distincao entre ilegivel e zero, e as violacoes
      declaradas. O acrescimo desta sessao respeita a premissa central daquele registro
      -- nao converter ambiguidade em numero confiavel -- e a aplica de novo ao recusar
      inventar um segundo limiar de CI.
  - registro: registro-2026-09-03-procedencia-de-solve-e-o-portao-de-reprodutibilidade
    caminhos:
      - frontend/src/components/simulator/solver/evidenceContract.ts
    parecer: >-
      Revisado e mantido valido, e este commit o CONTINUA sem alterar nenhuma de suas
      afirmacoes. `countReproduciblePairs(AULA_1_2_PAIRS)` continua retornando ZERO de
      sete, medido nesta sessao -- o portao dele nao foi afrouxado nem contornado. O que
      se acrescenta responde a outra pergunta: aquele portao mede COMPLETUDE DE CAMPO e
      passa com qualquer valor de e-Nash; `assessConvergence` olha o VALOR contra o teto
      de 4.9. Sao portoes distintos e ambos necessarios. A previsao daquele registro, de
      que o numero so sobe quando o export chegar, segue de pe.
  - registro: registro-2026-09-04-refinamento-sota-radar-telemetria-scanner-e-mcps
    caminhos:
      - engine/jules_bridge.py
      - engine/stitch_bridge.py
    parecer: >-
      Revisado e CORRIGIDO EM TRES PONTOS por medicao desta sessao, sem reescrever o
      documento. Ele publica os dois bridges; aqui mediu-se contra as APIs reais que
      (1) as constantes de modelo nao tinham leitor possivel, porque nem a API do Jules
      nem o portao do Stitch aceitam o valor que elas nomeiam; (2) o payload do Jules
      usava `branch` e `autoApprovePlan`, nomes que a v1alpha nao reconhece -- o segundo
      invertia a garantia de aprovacao de plano; (3) o bridge do Stitch trazia uma API
      key LITERAL em DEFAULT_STITCH_API_KEY, que foi empurrada para origin/master. As
      demais entregas daquele registro -- scanner gravitacional, telemetria, MCP Toolbox
      -- nao foram tocadas e seguem validas.
verificado:
  - suite Python 889 aprovados, 1 pulado, 0 reprovados, sob PowerShell
  - suite frontend 27 suites e 215 testes, 0 erro e 0 warning
  - os 9 submodulos declarados resolvem contra o HEAD publico de seus upstreams
  - sessao Jules 13159053706079093066 criada por POST com x-goog-api-key, provando que a API aceita API key na escrita
  - a chave literal removida de stitch_bridge.py NAO e a que esta em STITCH_API_KEY -- sao credenciais distintas, medido por SHA-256
  - JULES_REPORT.md tinha 4 ocorrencias de credencial em texto claro; apos redacao restam 0
  - countReproduciblePairs(AULA_1_2_PAIRS) segue retornando zero de sete
  - Set-EcosystemCredential.ps1 aprovado no parser do Windows PowerShell 5.1, UTF-8 com BOM unico e corpo ASCII
nao_verificado:
  - se o clone recursivo do runner do Jules passa com os 4 submodulos corrigidos -- exige push, e o remoto ainda nao os tem
  - se a API do Stitch aceita modelId com os rotulos da UI (Balanced/Speed); nao testado por nao haver contrato publico do portao
  - se as tres credenciais expostas foram revogadas no provedor -- acao do Tier 0, fora do alcance deste repositorio
  - se o commit local 9f962565 do submodulo exa-mcp-server continha correcao de CVE que a volta ao HEAD publico reintroduz
supersede: null
---

# Registro — credenciais expostas, quatro submódulos quebrados e a ponte do HRC

## 1. O que esta sessão mediu, e por que três coisas diferentes vieram juntas

A sessão abriu para trabalhar na evolução da PMev e encontrou, no caminho, duas
classes de defeito que bloqueavam a entrega: `master` estava com quatro testes
vermelhos, e o portão de pré-commit não deixa passar suíte vermelha. Corrigir
deixou de ser desvio e virou pré-requisito.

O terceiro achado — credenciais em texto claro — apareceu porque o Tier 0
avisou, no meio da correção, que havia API keys por perto.

## 2. A trilha PMev — a ponte que faltava

**Não havia caminho de um arquivo de export até o portão de reprodutibilidade.**
Os sete pares da Aula 1.2 são literais escritos à mão em `aula12Pairs.ts`; um
export que chegasse teria de ser transcrito de novo, que é exatamente o que
`evidenceContract.ts` existe para impedir.

`engine/solver_importers/hrc_evidence.py` fecha isso. Ele **não reimplementa** a
extração de procedência: consome `HRCProImporter.extrair_procedencia`, que já
tem 17 testes cobrindo os casos difíceis. Duplicá-la criaria a segunda fonte que
a §3 do CLAUDE.md proíbe.

**Quatro correções do Tier 0 mudaram o desenho, não a redação:**

| Correção | Consequência de projeto |
| :--- | :--- |
| O GTO Wizard não exporta | O par só pode ser `ChipEV(HRC) × ICMev(HRC)`. Um ramo de GTO Wizard seria código morto por construção. |
| Seu motor é rede neural, como o DeepSolver | Exploitability de rede e CFR convergido não são a mesma grandeza — reforça HRC × HRC. |
| CI 4.9 é o mínimo aceitável | Virou `CI_MAXIMO_ACEITAVEL_HRC`, e `assessConvergence` julga contra ele. |
| CI 0 é inatingível, inclusive em rede neural | **Recusei inventar um segundo limiar.** Não existe faixa livre de ruído. |
| O objeto é a tendência teórica, não precisão pontual | Removi o catálogo de ressalvas que eu havia construído — deslocaria a leitura do que está em estudo. |

O portão de reprodutibilidade **não foi tocado**: segue em zero de sete.
`assessConvergence` responde outra pergunta, e os dois portões são necessários.

## 3. Segurança — três credenciais, dois vetores distintos

**Vetor 1, literal no código.** `DEFAULT_STITCH_API_KEY` em
`engine/stitch_bridge.py:21`, introduzida em `080cda35` e empurrada. Era
*fallback redundante*: o código já lia `STITCH_API_KEY` do ambiente antes dela.
Não habilitava nada — só vazava.

**Vetor 2, e este é estrutural.** `sync_jules_report.py` republica o **prompt
original** de cada sessão no relatório versionado. Uma sessão de 03/09 foi criada
colando o `settings.json` do Antigravity IDE, que carregava
`agenticAssistant.geminiApiKey` e `qwen-code.apiKey`. Quatro ocorrências foram
commitadas.

**Sanear o `.md` não resolveria**: o prompt vive do lado do Google Jules e
voltaria na sincronização seguinte. A correção está em `redigir_segredos`, no
ponto exato em que texto de terceiro cruza para dentro de arquivo versionado. Ela
redige o **valor** e preserva o nome do campo — saber *que* havia uma chave é
auditoria, saber *qual* era é o vazamento.

O discriminante é a **forma do valor**, nunca o nome do campo: `"provider":
"api-key"` tem `key` no nome e é configuração legível.

## 4. Os quatro submódulos, e o erro de método que quase custou quatro noites

O Jules falhou **cinco noites seguidas** (01 a 04/09) no `git clone --recursive`.
O Gemini corrigiu `skills/exa-mcp-server` em `080cda35`.

Disparei uma sessão de teste. O clone principal concluiu, o `exa-mcp-server`
clonou — **e falhou em `skills/gemini-cli-jules`**, pelo mesmo motivo.

Em vez de corrigir esse e esperar a próxima noite, varri os nove. **Quatro
estavam quebrados**, todos apontando para commits locais nunca empurrados:

| Submódulo | Apontava | Agora |
| :--- | :--- | :--- |
| `skills/gemini-cli-jules` | `c3d79f1b50be` | `9f2fc14a41e8` |
| `skills/gemini-cli-security` | `59a60d7892c6` | `2227f3cf7150` |
| `skills/gemini-deep-research` | `320a7ae4db0d` | `35618d38b95d` |
| `skills/gemini-supermemory` | `6a80d44f830d` | `035c843d5614` |

**Erro de método registrado:** corrigi primeiro só o índice, com
`git update-index`. Um `git add -A` posterior **reverteu tudo**, porque ele
re-registra o working tree — e lá os submódulos seguiam no commit quebrado. A
correção só é real com `checkout` dentro de cada submódulo.

## 5. O payload do Jules — um parâmetro de segurança que não alcançava mecanismo

Medido contra a documentação oficial e confirmado por sessão criada de verdade:

| Bridge enviava | API espera | Efeito |
| :--- | :--- | :--- |
| `githubRepoContext.branch` | `startingBranch` | branch ignorado; rodava no default |
| `autoApprovePlan` | `requirePlanApproval` | **garantia invertida** |

A documentação é literal: *"If not set, plans are auto-approved."* Como
`autoApprovePlan` não era campo reconhecido, sumia — e `auto_approve_plan=False`
produzia **o oposto** do que promete: plano executado sem revisão humana, sem
aviso.

O teste antigo passava porque media o bridge **contra ele mesmo**. Foi preciso
criar uma sessão real para descobrir.

## 6. Instrução de automação sobre modelos — retirada por ordem do Tier 0

Medido: nem a `createSession` do Jules nem o portão MCP do Stitch aceitam os
valores que as constantes nomeavam. O seletor existe, mas vive **na UI** dos dois
produtos. O enum oficial do portão do Stitch foi **conservado** — é o contrato da
porta e não acompanha o nome comercial do modelo do dia.

## 7. O que fica aberto

O push é o que falta para o Jules: ele clona de `origin/master`, e o remoto ainda
tem os quatro ponteiros quebrados. Enquanto isso, o cron das 03:20 UTC falha de
novo — agora em `gemini-cli-jules`.

E as três credenciais expostas seguem no histórico de `origin/master`. Trocar a
variável resolve o uso; a exposição só termina com revogação no provedor.
