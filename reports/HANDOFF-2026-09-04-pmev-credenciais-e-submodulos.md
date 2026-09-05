---
id: handoff-2026-09-04-pmev-credenciais-e-submodulos
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-04T21:55:00-03:00
atualizado_em: 2026-09-04T21:55:00-03:00
classes: [interno, medido, handoff, pmev, seguranca, calibracao]
caminhos:
  - reports/HANDOFF-2026-09-04-pmev-credenciais-e-submodulos.md
  - reports/REGISTRO-2026-09-04-credenciais-submodulos-e-adaptador-hrc.md
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. A questao de identidade de autoria que ele resolve foi
      exercida aqui: este commit sai assinado por Claude Opus 5 com e-mail que nao
      resolve para perfil humano -- e foi preciso corrigir a identidade do git, que
      estava como Gemini 3.8 Flash, exatamente o discriminante que aquela auditoria
      estabeleceu. A intersecao e apenas o HANDOFF_LATEST.md, cuja substituicao e o
      desenho do arquivo.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Nenhuma correcao de linter que ele publica foi
      revertida: a suite Python fecha em 889 aprovados e a frontend em 215 testes com
      zero warning. Intersecao apenas no HANDOFF_LATEST.md, substituido por desenho.
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, e uma afirmacao central sua foi CONTRARIADA POR
      MEDICAO, o que o melhora. Ele registra o portao passando no TETO de dois warnings
      por falta de CDP; nesta sessao as portas 9223 e 9224 estavam ouvindo e o dev
      server em 3000, entao as fases 1 e 2 mediram de verdade. A condicao que ele
      descreve era de ambiente, nao permanente.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. A camada Anthropic e a cobertura de CVE que ele publica
      nao foram tocadas -- nenhum arquivo de llm/ entrou neste commit. A pendencia de
      duplicacao entre engine/llm_api.py e llm/anthropic.py que ele herda continua
      aberta e nao foi endereçada aqui.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, e este handoff o CONTINUA. A prioridade 1 que ele fixa
      -- recaptura do HRC com destino tipado pronto -- segue sendo a prioridade 1, e
      esta sessao a serviu construindo o adaptador que faltava entre o export e o
      portao. Seu numero central permanece medido e inalterado: zero de sete pares
      reproduziveis. Uma instrucao sua de ambiente foi CONFIRMADA na pratica: o portao
      exige CDP, e desta vez ele havia.
  - registro: handoff-2026-09-03-sessao-outlier-infraestrutura
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Ele registra a sessao que o Tier 0 declarou outlier de
      infraestrutura; nada daquele registro foi alterado, e a natureza desta sessao e
      distinta -- trabalho de teoria PMev que encontrou defeitos de infraestrutura no
      caminho, nao o inverso. Intersecao apenas no HANDOFF_LATEST.md.
  - registro: handoff-2026-09-04-google-workspace-skill-e-curadoria-de-midia
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, com um DEFEITO SEU CORRIGIDO AQUI. A skill
      google-workspace que ele publica ficou sem dono em data/agents_manifest.json, e
      isso deixou tests/test_governanca_skills.py vermelho em master -- foi uma das
      quatro falhas encontradas nesta sessao. A skill nao foi removida: foi atribuida ao
      bibliotecario, cujo conjunto de skills ja cobre memoria e documentos. O restante
      daquele handoff -- ADC, escopos, topologia MCP -- segue valido.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido no que entrega, e CORRIGIDO em tres pontos por medicao.
      Ele declara "suites de agentes e credenciais 26/26"; a suite INTEIRA nao foi
      executada, e o commit 080cda35 deixou quatro testes vermelhos em master. Alem
      disso introduziu uma API key literal em stitch_bridge.py e cinco skills sem dono.
      O que ele entrega de fato -- scanner gravitacional, telemetria, MCP Toolbox
      nativo, correcao do submodulo exa-mcp-server -- foi verificado e segue valido; a
      correcao daquele submodulo, em especial, foi confirmada funcionando numa sessao
      real do Jules.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. A sessao como unidade de contagem, o minimo de tres
      sessoes distintas e a regra de que portao estrutural nao e autorizacao continuam
      em vigor e foram respeitados: o feedback desta sessao entra como append com
      session_id e conductor_model declarados, sem que nenhuma calibracao fosse
      executada por iniciativa propria.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, e e o registro que esta sessao mais diretamente
      estende. O corpo de teoria dos jogos que ele consolida nao foi tocado:
      solveIcmDistortion, constantes do motor, frequencias e sizings transcritos seguem
      intactos. O que se acrescentou foi a distincao entre par REPRODUZIVEL e par
      CONVERGIDO -- que reforca a cautela daquele relatorio em vez de a relaxar, porque
      cria um segundo portao antes de qualquer calibracao.
verificado:
  - suite Python 889 aprovados, 1 pulado, 0 reprovados
  - suite frontend 27 suites, 215 testes, 0 erro e 0 warning
  - portao de registro M.O. 13.F aprovado com 8 revisoes de ancora declaradas
  - os 9 submodulos resolvem contra o HEAD publico de seus upstreams
  - feedback 9.5 do Tier 0 registrado literal no ledger encadeado
nao_verificado:
  - o clone recursivo do runner do Jules com os 4 submodulos corrigidos -- depende do push
  - revogacao das tres credenciais expostas no provedor -- acao do Tier 0
supersede: null
---

# PROTOCOLO DE HANDOFF OFICIAL — SESSÃO 2026-09-04

**Condutor:** Claude Opus 5 [Tier 1.B] · **Regime:** Assistida (arbitrada diretamente pelo Tier 0 — Raphael Vitoi)
**Protocolo:** Chico SOTA v8.0 GOLD · **Avaliação Operacional Tier 0:** **9.5 / 10**

---

## 1. Propósito da Sessão

Inteirar-se do que a tríade produziu nas últimas 24 horas e **trabalhar na
evolução da PMev**.

O propósito não mudou, mas o caminho até ele passou por três obstáculos que
bloqueavam a entrega: `master` estava com a suíte vermelha (e o portão de
pré-commit não deixa passar suíte vermelha), havia credenciais em texto claro no
repositório, e a automação noturna do Jules falhava havia cinco noites.

Nenhum dos três foi desvio: o primeiro é pré-requisito do commit, o segundo veio
por alerta explícito do Tier 0, e o terceiro por ordem direta de verificar se
Jules e Stitch estavam funcionais.

---

## 2. Processos Executados

### 2.1 Trilha PMev — o adaptador que faltava

Medição de entrada: `countReproduciblePairs(AULA_1_2_PAIRS)` retornava **zero de
sete**, e **não existia caminho nenhum** de um arquivo de export até esse portão.
Os sete pares são literais escritos à mão.

- `engine/solver_importers/hrc_evidence.py` — `construir_par_de_evidencia()`
  converte dois exports do HRC num `EvidencePair` tipado. Consome
  `HRCProImporter.extrair_procedencia`, que já tem 17 testes; **não reimplementa**
  nada, porque duplicar criaria a segunda fonte que a §3 do CLAUDE.md proíbe.
- `evidenceContract.ts` §9 — `CI_MAXIMO_ACEITAVEL_HRC = 4.9` e
  `assessConvergence()`. Responde pergunta distinta de `assessReproducibility`:
  aquela mede **completude de campo** e passa com qualquer valor de e-Nash; esta
  olha o **valor**.
- 21 testes novos (8 Python, 13 TypeScript), todos escritos antes do código.

### 2.2 Segurança — três credenciais, dois vetores

- **Literal no código:** `DEFAULT_STITCH_API_KEY` em `stitch_bridge.py:21`,
  introduzida em `080cda35` e já empurrada. Fallback redundante — o código lia a
  variável de ambiente antes dela. Removida.
- **Republicação estrutural:** `sync_jules_report.py` reemite o *prompt original*
  de cada sessão. Uma sessão de 03/09 colou o `settings.json` do Antigravity IDE,
  vazando `agenticAssistant.geminiApiKey` e `qwen-code.apiKey` — 4 ocorrências.
  Corrigido com `redigir_segredos()` **no gerador**, mais 8 testes com guard de
  regressão sobre o artefato publicado.
- `scripts/ops/Set-EcosystemCredential.ps1` — insere credencial em
  `HKCU:\Environment` sem tocar disco, sem histórico de shell e sem imprimir
  valor. Parse validado no Windows PowerShell 5.1, UTF-8 com BOM único.

### 2.3 Infraestrutura — Jules, Stitch e os submódulos

- Verificação **por chamada real**, não por documentação: Stitch OK (1 projeto),
  Jules OK na leitura (6 sessões).
- Sessão de teste `13159053706079093066` criada e falhada com diagnóstico
  completo — o que revelou **quatro** submódulos quebrados, não um.
- Payload do bridge do Jules corrigido: `startingBranch` e `requirePlanApproval`.
- Instrução de roteamento de modelo retirada de skills, bridges e geradores, por
  ordem do Tier 0. O enum oficial do portão MCP do Stitch foi **conservado**.

### 2.4 Higiene de governança

Quatro testes vermelhos em `master`, herdados de `080cda35` e de `7b36594a` (este
meu): constantes sem leitor, `sota-triad-mesh` declarada com SKILL.md deletado por
mim em `16fee329`, seis skills sem dono, e `INVENTARIO_FERRAMENTAS.md` rastreado
mas sumido do disco. Todos corrigidos; documentos de agente **regenerados** pelo
gerador, nunca editados à mão.

---

## 3. Desafios da Sessão & Soluções Aplicadas

| Desafio | Solução |
| :--- | :--- |
| Hook do Semgrep bloqueava `Edit` com "not logged in", enquanto o MCP respondia autenticado | Diagnóstico: `expiry` vencido em `frontend/.semgrep/guardian.yml` — arquivo de estado de sessão **versionado**. Não contornei com `Write`; pedi autorização e o plugin foi desinstalado. |
| `git add -A` reverteu a correção dos submódulos | `update-index` trata só o índice; `add -A` re-registra o working tree. Corrigido com `checkout` dentro de cada submódulo. |
| Concluí que o Jules não era delegável | Errado. Eu testara POST com OAuth2 e GET com API key, nunca **POST com API key** — a combinação óbvia. Ela funciona. |
| Diagnostiquei o `if` do Stitch como bug | Errado ao contrário: a pesquisa mostrou que o `if` está certo e as **constantes** é que não eram valores de API. |
| Frontend "sem testes" no Vitest | Instrumento errado: o frontend usa Jest. Conferir o instrumento antes da medição. |

---

## 4. Marcos da Sessão

1. **Ponte PMev construída** — existe caminho tipado de export do HRC até o portão
   de evidência, sem transcrição manual.
2. **Portão de convergência criado** — o teto de 4.9 do Tier 0 virou código, e a
   distinção entre *reprodutível* e *convergido* virou executável.
3. **Três credenciais expostas encontradas e contidas**, com o vetor estrutural
   fechado no gerador.
4. **Quatro submódulos quebrados corrigidos de uma vez**, evitando quatro noites
   de falha em sequência.
5. **Garantia de aprovação de plano do Jules restaurada** — `auto_approve_plan=False`
   produzia o oposto do que promete.
6. **`master` de volta ao verde**: 889 Python + 215 frontend, zero warnings.

---

## 5. Aprendizados & Calibração Cognitiva

### 5.1 O feedback do operador (9.5/10)

> *"Faltou um pouco de análise paralela de nós, sem sair assumindo apressadamente
> um caminho ou rotina única e definitiva quando há várias opções."*

**O feedback é procedente e tem três evidências nesta mesma sessão:**

| Onde assumi caminho único | O que a análise paralela teria mostrado |
| :--- | :--- |
| "Jules não é delegável" | Havia 4 combinações (POST/GET × API key/OAuth2). Testei 2 e concluí. A que faltava era a que funciona. |
| "O `if` do Stitch é bug" | Duas leituras concorrentes — `if` errado ou constantes erradas. Assumi a primeira; a pesquisa mostrou a segunda. |
| Corrigir 1 submódulo | O nó não era "qual submódulo quebrou" e sim "quantos quebraram". Varrer os 9 custou o mesmo que corrigir 1. |

### 5.2 Ajuste sistêmico mandatório

**Ao chegar a um nó de decisão, enumerar as ramificações ANTES de descer por uma.**
Quando o custo de testar todas é próximo do custo de testar uma — como na varredura
dos submódulos e na matriz de credenciais — **testar todas é o caminho barato**,
não o caro. A hipótese única só se justifica quando cada teste é caro; e mesmo aí,
ela se declara como hipótese, não como conclusão.

Isso convive com o *zoom out preditivo* calibrado na sessão anterior: aquele manda
antecipar os próximos nós da árvore; este manda **não podar ramos irmãos** antes
de medi-los.

---

## 6. Status do Ecossistema Atualizado

| Componente | Estado | Observação |
| :--- | :--- | :--- |
| **Branch** | `master` | Commit desta sessão, empurrado |
| **Suíte Python** | 889 ✓ / 1 pulado / 0 ✗ | verde |
| **Suíte frontend** | 27 suites, 215 testes | 0 erro, 0 warning |
| **Portão de registro** | Aprovado | 8 revisões de âncora declaradas |
| **Submódulos** | 9/9 resolvem no upstream | 4 corrigidos nesta sessão |
| **PMev — portão** | **0 de 7** reproduzíveis | inalterado; sobe quando o export chegar |
| **Jules** | leitura OK, escrita OK por POST | MCP `create_session` quebrado (401) |
| **Stitch** | funcional | projeto `Nexus PMev & Poker Racional UI` |
| **Render** | MCP conectado | serviço `Site` (`srv-da91vnpsrm7s73au9l80`) já existente |
| **Semgrep** | desinstalado | escopo local, por ordem do Tier 0 |
| **Dev server / CDP** | `:3000`, `9223`, `9224` | fases 1 e 2 mediram de verdade |

### Fila para o sucessor

1. **Revogar as três credenciais no provedor.** Seguem no histórico de
   `origin/master` (`080cda35`); trocar a variável não as invalida.
2. **Conferir o cron do Jules após 03:20 UTC.** É a prova real de que o clone
   recursivo voltou.
3. **PMev, prioridade 1:** dois exports do HRC do mesmo nó — um ChipEV, outro
   ICMev, com o painel `CI` visível. O adaptador já existe; falta o dado.
4. **Ponderar:** o `MCP google-jules` retorna 401 no `create_session` enquanto o
   POST direto funciona. Vale corrigir o bridge para expor criação de sessão.
5. **Aberto e não decidido:** `autopoietic_daily_cycle.py` não tem agendamento
   nenhum. O Render, já contratado, tem cron job de primeira classe.

---

## 7. Prompt de Continuação — a teoria PMev, de onde paramos

```text
Continuação do trabalho de TEORIA PMev em C:\Users\rapha\.gemini\Site.
A sessão claude-opus5-site-2026-09-04-credenciais-e-submodulos foi ENCERRADA
com nota 9.5. Esta abre identidade NOVA.

LEIA PRIMEIRO, nesta ordem:
  1. .claude/agent-memory/chico/HANDOFF_LATEST.md
  2. reports/HANDOFF-2026-09-04-pmev-credenciais-e-submodulos.md  (este)
  3. docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
  4. frontend/src/components/simulator/solver/evidenceContract.ts  (secoes 8 e 9)

=== ONDE A TEORIA PAROU ===

O objeto de estudo e o CONTRASTE ICMev x ChipEV no mesmo no. Nao e auditoria de
solver: o rigor de procedencia e MEIO, para que a diferenca observada seja
atribuivel ao REGIME e nao ao motor, a versao ou a quanto cada solve caminhou.

Cinco fatos fixados pelo Tier 0 em 2026-09-04, todos ja em codigo:

  1. O GTO Wizard NAO EXPORTA. Logo o unico par reproduzivel possivel e
     ChipEV(HRC) x ICMev(HRC) -- mesmo motor nos dois lados, regime como unica
     variavel livre. Isso e controle experimental, nao acomodacao.
  2. O motor proprio do GTO Wizard e REDE NEURAL, como o DeepSolver. As arvores
     estaticas da biblioteca dele, porem, foram rodadas NO HRC -- e por isso
     aquele painel reporta CI. Ele entrou no estudo por ter a biblioteca
     acumulada mais ampla, nao por qualidade de solve.
  3. CI 4.9 e o MINIMO ACEITAVEL, e BASTA, porque o que se apresenta e a
     TENDENCIA teorica. Nao se promete precisao de no individual.
  4. CI 0 e INATINGIVEL, inclusive em rede neural. Nao existe faixa livre de
     ruido -- existe residuo que encolhe e nunca zera. Por isso NAO ha segundo
     limiar no contrato, e inventar um seria converter ambiguidade em numero.
  5. Quanto menor o CI, maior a latencia. O teto e ponto de equilibrio
     escolhido, nao deficiencia tolerada.

=== A BARREIRA, MEDIDA ===

  countReproduciblePairs(AULA_1_2_PAIRS) = 0 de 7    (minimo do ledger: 3)

Os sete pares sao VALIDOS e CONSISTENTES -- somas de frequencia fechando, combos
conservados, uma verificacao cruzada digito a digito. Nada disso os torna
REPRODUZIVEIS: falta build + e-Nash + unidade nos dois lados. Consistencia e
ausencia de contradicao interna; reprodutibilidade e outra pessoa rodar o mesmo
solve e obter o mesmo numero.

NAO "CONSERTE" ESSE TESTE. Ele nao e defeito: e o portao. O numero sobe quando o
export chegar, e quem o preencher sem o export tera inventado a evidencia.

=== O QUE MUDOU NESTA SESSAO, E O QUE ISSO DESTRAVA ===

Ate agora nao havia caminho de um arquivo ate o portao -- todo par era literal
escrito a mao. Agora ha:

  engine/solver_importers/hrc_evidence.py :: construir_par_de_evidencia()
      dois exports do HRC (um por regime) + source + context -> EvidencePair

E ha um portao NOVO, que responde outra pergunta:

  evidenceContract.ts :: assessConvergence()
      assessReproducibility mede COMPLETUDE DE CAMPO e passa com qualquer valor
      de e-Nash. assessConvergence olha o VALOR contra CI_MAXIMO_ACEITAVEL_HRC.
      Um par pode ser reproduzivel E mal convergido. Os dois portoes sao
      necessarios e nenhum substitui o outro.

=== PRIORIDADE 1 -- o dado que falta ===

DOIS EXPORTS DO HRC, DO MESMO NO, com o painel CI visivel:
  - um rodado em ChipEV
  - outro rodado em ICMev

Com eles, `construir_par_de_evidencia` produz o par e o contador sai de zero sem
transcricao manual. Tres pares desses abrem o portao do ledger.

O adaptador ja existe e esta testado (tests/test_hrc_evidence.py, 8 testes).
NAO ha o que construir antes do dado chegar -- construir mais camada agora seria
adiantar trabalho sobre premissa nao verificada.

=== SE O EXPORT NAO CHEGAR NESTA SESSAO ===

Trilhas de teoria que NAO dependem dele, em ordem de retorno:

  A. Etapa C do handoff-2026-09-01: levar o contrato ja testado para inputs
     didaticos de FT Vanilla 8/9-max, com defaults transparentes e recusa
     elegante de cenario impossivel. PKO, Mystery, rebuy e satelite ficam fora
     do primeiro corte.
  B. engine/pmev_controlled_experiments.py: H3 (erosao temporal), H4 (defesa de
     river), H8 (downward drift) estao como CONTRATOS DE DESENHO. Falta a
     execucao com artefato por rodada, conforme
     docs/research/pmev/EXPERIMENTOS_CONTROLADOS_H3_H4_H8.md.
  C. Os 97 nos da Aula 1.2 renderam 7 pares transcritos. Ampliar a cobertura de
     transcricao aumenta a base -- mas lembre: mais pares CONSISTENTES nao
     movem o portao de reprodutibilidade nem um passo.

=== PRELUDIO OBRIGATORIO, ANTES DA TEORIA ===

Decisao do Tier 0 em 2026-09-04: esta sessao ABRE retirando as credenciais
expostas do historico de origin/master.

  Tres credenciais, todas em commits ja empurrados:
    - API key do Stitch, literal em engine/stitch_bridge.py:21   (080cda35)
    - agenticAssistant.geminiApiKey, em JULES_REPORT.md (x2)
    - qwen-code.apiKey, em JULES_REPORT.md (x2)

  Em 96ac0bc6 elas sairam do working tree e o vetor estrutural foi fechado
  (redigir_segredos em sync_jules_report.py). O HISTORICO NAO FOI TOCADO: os
  blobs antigos continuam recuperaveis.

  ORDEM CORRETA -- confirmar com o Tier 0 antes de executar:
    1. As tres chaves foram REVOGADAS no provedor? O expurgo nao invalida chave
       nenhuma; se ainda estiverem vivas, revogar vem primeiro.
    2. So entao git filter-repo (ou BFG) e forca-push em master.

  A secao 7 do Site\CLAUDE.md proibe reescrever historico publicado, porque
  forca-push quebra checkout alheio e ancora de revisao. Aqui ha EXCECAO
  decidida pelo Tier 0: contencao de credencial vence preservacao de historico.
  Declare a excecao no registro.

=== DUAS PENDENCIAS QUE NAO SAO REGRESSAO ===

  DEPENDABOT: os 8 alertas (2 criticos, 4 altos, 1 moderado, 1 baixo) que o push
  reporta sao ANTIGOS e ja verificados pelo Tier 0. NAO decorrem da volta dos
  quatro submodulos ao HEAD publico em 96ac0bc6. Serao tratados em momento
  proprio; nao os investigue por iniciativa propria.

  LIGHTHOUSE/TBT: RESOLVIDO em 2026-09-04, mas com ressalva estrutural.
  Auditoria de producao executada em Chrome isolado: TBT 0 ms, LCP 447,576 ms,
  CLS 0, performanceScore 1.0, fingerprint 1c8c2fc6... vinculado e conferido.
  A RESSALVA: reports/cwv/ esta no .gitignore (linha 91), entao o artefato NAO
  VIAJA NO COMMIT -- a certificacao e local por maquina. Outro condutor vera o
  warning ate rodar a propria auditoria com
  scripts/ops/invoke_lighthouse_production_audit.ps1.
  E o fingerprint cobre TODA a arvore frontend/ menos .git, .next, coverage,
  node_modules e reports -- 792 arquivos, dos quais 28 sao de teste. Um
  .test.ts novo invalida a certificacao de performance sem tocar no bundle.
  Refinar isso e REDUCAO MATERIAL de portao (secao 8.2) e exige autorizacao.

=== REGRAS QUE ABREM ESTA SESSAO ===

ANALISE PARALELA DE NOS -- e o feedback 9.5 desta sessao. Ao chegar num no de
decisao, ENUMERE as ramificacoes antes de descer por uma. Quando testar todas
custa perto do que custa testar uma, testar todas e o caminho BARATO. Nesta
sessao eu conclui "Jules nao e delegavel" tendo testado 2 de 4 combinacoes, e a
que faltava era a que funcionava.

Vale junto com: conferir o instrumento antes da medicao (o frontend usa Jest,
nao Vitest); sistema antes do artefato; e fato publico e meu para buscar.

NAO recalibre constante global de solveIcmDistortion sem tres pares
reproduziveis E convergidos. NAO transforme alegacao teorica, screenshot ou
heuristica em validacao empirica sem transcricao, fixture e teste reprodutivel.
NAO use --no-verify nem SKIP_CWV_GATE=1.

AMBIENTE: o portao exige CDP (9222/9223/9224), nao apenas o dev server em :3000.
GIT: identidade do condutor precisa ser conferida antes do commit -- a config
local desta maquina estava como Gemini 3.8 Flash.
```
