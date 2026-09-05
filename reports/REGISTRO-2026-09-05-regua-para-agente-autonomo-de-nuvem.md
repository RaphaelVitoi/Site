---
id: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-05-fechamento-do-ciclo"
criado_em: 2026-09-05T00:00:00-03:00
atualizado_em: 2026-09-05T00:00:00-03:00
classes: [interno, medido, governanca]
caminhos:
  - CLAUDE.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    A alteracao do CLAUDE.md e PURAMENTE ADITIVA: 84 linhas adicionadas, 0
    removidas, medido por git diff --numstat. Nenhuma linha existente foi
    removida ou alterada -- a contagem de linhas iniciadas por '-' no diff e
    zero. A secao 10 comeca onde o arquivo terminava.
  - >-
    As tres hipoteses de performance da sessao Jules 14536923137986406349
    foram medidas no codigo real antes de serem refutadas, e cada refutacao
    esta citada na propria secao 10 com o numero que a sustenta.
  - >-
    StreetChipEvFreqs tem forma fixa e rasa: 3 streets x 6 campos numericos =
    18 numeros. Conferido em frontend/src/components/simulator/solver/types.ts.
  - >-
    ActionRow recebe onChange como arrow function inline nas seis instancias de
    frontend/src/components/simulator/panels/NashPanel.tsx. React.memo ali teria
    zero acertos por comparacao de referencia.
  - >-
    useQuantumEngine.ts declara a selagem de referencia no proprio codigo, e
    contem 26 chamadas de useMemo/useCallback a jusante dela.
  - >-
    Suite de governanca verde: 44 testes em test_governanca_agents,
    test_desambiguacao e test_record_index.
  - >-
    Nenhuma das oito referencias de caminho citadas na secao 10 esta morta.
  - >-
    A sessao alcancou COMPLETED as 11:50:06 UTC e fez push da branch
    bolt-journaling-optimization-learnings-14536923137986406349, com um unico
    commit 4d90a05b que cria .jules/bolt.md com 6 linhas. Conteudo lido e
    conferido como fiel aos numeros medidos nesta auditoria.
  - >-
    O commit 4d90a05b tem como autor
    RaphaelVitoi <171359821+RaphaelVitoi@users.noreply.github.com>, endereco que
    resolve para o perfil humano no GitHub, com google-labs-jules[bot] apenas
    como co-autor -- violacao da regra de identidade de autoria da secao 7.
  - >-
    A branch parte de 2381a85d, o master REMOTO, e nao contem os dois commits
    locais desta sessao. Nada foi mesclado nem reescrito.
nao_verificado:
  - >-
    Se o runner do Jules de fato LE AGENTS.md ou CLAUDE.md ao clonar. E
    convencao, nao garantia contratual, e nao foi possivel observar o
    comportamento do runner de dentro dele.
  - >-
    Por que a sessao prosseguiu ate COMPLETED depois do comando de parada do
    Tier 0 as 11:46:56. Medido que prosseguiu; nao diagnosticado o motivo.
  - >-
    Se a autoria humana do commit 4d90a05b e configuravel no lado do Jules. A
    hipotese de que vem da integracao GitHub App e a mais provavel, e NAO foi
    confirmada contra documentacao ou painel.
  - >-
    Se as tres hipoteses refutadas escondem algum gargalo real de performance.
    Nada foi medido em runtime: a refutacao e sobre a forma do dado e sobre a
    estabilidade das props, nao sobre um profile de execucao.
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      A secao 9, que aquele registro fixou, nao e tocada: 0 linhas removidas no
      diff inteiro. A secao 10 nao cria diretorio nem padrao de nomenclatura
      novo, e este proprio registro segue a taxonomia dela.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - CLAUDE.md
    parecer: >-
      Aquela auditoria avaliou trabalho de uma sessao especifica contra a
      governanca vigente. A governanca vigente permanece integra e apenas ganha
      uma secao ao final; nenhum criterio que a auditoria aplicou muda de
      redacao ou de numero.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      A secao 10 nao afrouxa nenhuma barreira de hardening: ao contrario,
      acrescenta cinco classes que um agente de nuvem nao pode tocar sem
      autorizacao, e duas delas -- portoes/ops e credencial/ACL/CORS -- sao
      reafirmacao das barreiras que aquele checkpoint estabeleceu.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
    parecer: >-
      A hierarquia de 8 Tiers nao e alterada. A secao 10 rege o comportamento de
      um agente ja existente na topologia -- Jules, Tier 2 -- sem mover sua
      posicao nem criar tier novo.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
    parecer: >-
      Nada sobre LFS, filtros ou roteamento de binario e mencionado na secao
      10, e nada daquele handoff e removido. A secao trata exclusivamente de
      criterio de decisao de um agente autonomo antes de emitir diff.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer: >-
      A governanca piramidal e o invariante de commits seguem literais. A secao
      10 nao altera assinatura, autoria nem Tier; ela adiciona um criterio
      PREVIO a emissao de diff, que e etapa anterior a qualquer commit.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer: >-
      A regra de ancora em merge, na secao 1.2, nao e tocada. Este proprio
      commit e ordinario, nao um merge, e portanto a subtracao de caminhos
      herdados nao se aplica -- as treze revisoes deste bloco sao de caminho
      que mudou de fato.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - CLAUDE.md
    parecer: >-
      A secao 8.3 e sua proibicao de conversao de escala permanecem com a
      mesma redacao. A secao 10 nao menciona nota, ledger nem calibracao, e nao
      cria segunda fonte para nenhuma dessas decisoes.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
    parecer: >-
      A metrica do portao de suficiencia -- sessoes distintas com feedback,
      minimo tres -- nao e tocada, e o termo "sessao" da secao 10 refere-se a
      sessao de nuvem do Jules, nao a sessao de calibracao. Os dois sentidos
      convivem sem colisao porque cada um esta declarado no seu escopo.
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      A Lei de Concorrencia continua valendo e a secao 10 e coerente com ela: o
      Jules opera em VM descartavel com clone proprio, que e o isolamento de 0%
      de conectividade que aquela lei exige para operacao paralela. A secao 10
      nao autoriza o agente de nuvem a tocar a malha principal.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Harmonizacao preservada: a secao 10 e acrescimo ao final, sem renumerar,
      remover ou reescrever secao anterior -- 0 linhas removidas no diff.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      A analise integral descreve o ecossistema como ele era; a secao 10 nao
      remove nem renomeia componente algum daquele mapa. Acrescenta regra de
      conduta a um componente ja mapeado.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Nenhuma metrica quantitativa daquele relatorio depende do texto da
      governanca, e nenhuma foi recalculada aqui. A secao 10 nao altera limiar,
      teto nem contagem existente.
---

# Régua para agente autônomo de nuvem -- e o incidente que a produziu

## (1) O incidente

A sessão de cron do Jules `14536923137986406349` foi criada em 2026-09-05 às
03:11:18 UTC. Ela explorou o repositório por dez minutos, levantou três
hipóteses de performance, **não ordenou nenhuma** e parou para perguntar ao
administrador qual seguir. A pergunta chegou às 03:21 UTC. Eram 03:46 no fuso
local quando ele a leu; ele dormia.

A sessão ficou em `AWAITING_USER_FEEDBACK` por oito horas e não produziu uma
linha de código.

## (2) O que a medição mostrou -- e por que "escolher" teria sido pior

As três hipóteses foram medidas nesta data, no código real. Nenhuma sobreviveu.

| Hipótese da sessão | Medição | Veredito |
| :--- | :--- | :--- |
| `JSON.stringify` caro em `useQuantumEngine.ts` | `StreetChipEvFreqs` = 3 streets x 6 campos = **18 números** | premissa falsa |
| `React.memo` nos componentes de `simulator/ui/` | `ActionRow` recebe `onChange` inline nas **6** instâncias de `NashPanel.tsx` | zero acertos, custo puro |
| `crypto.randomUUID()` | "probably not the biggest bottleneck", nas palavras da própria sessão | irrelevante por confissão |

O `JSON.stringify` que ela queria remover **não é descuido**: o código o declara
como *"SOTA FIX: Selagem de Referências (Evita vazamento de rerenders e GC
Thrashing O(N^3))"*. Ele sela 18 números para proteger 26 `useMemo` a jusante.
Trocá-lo por igualdade profunda arriscaria invalidar a selagem e disparar o
cálculo O(N^3) a cada render -- regressão ordens de magnitude pior que o ganho
imaginado, e com risco de valor obsoleto na tela, que é erro de correção.

**Se ela tivesse escolhido qualquer uma das três, teria piorado o código.** Não
modificar era o resultado correto. Ela chegou lá por bloqueio, não por método --
e bloqueio não é reproduzível.

## (3) A lacuna real não era falta de régua de parada

Ao ser confrontada com as refutações, a sessão citou a **própria diretriz
original**:

> *"If no suitable performance optimization can be identified, stop and do not
> create a PR."*

O prompt **já mandava parar**. Ela não parou: perguntou. Logo, a lacuna nunca
foi ausência de ordem de parada, e sim ausência de **critério para chegar à
parada sozinha**. Sem "meça antes" ela não tinha como concluir que nenhuma
otimização era adequada; sem "ordene em vez de perguntar", a saída natural
virou a pergunta noturna.

É essa lacuna que a §10 do `CLAUDE.md` preenche, e por isso ela combina as duas
cláusulas: a §10.1 torna *medir e refutar* uma entrega válida, e a §10.2 põe a
ordenação no lugar da pergunta.

## (4) O aprendizado chegou -- por branch, não por PR

Durante a sessão, o prognóstico registrado aqui era de perda: a sessão anunciou
que escreveria `.jules/bolt.md` e, no mesmo parágrafo, que **finalizaria sem
criar PR**. Medido naquele instante, `.jules/` não existia, não havia `bolt.md`
em lugar algum, e o runner trabalha em VM descartável -- sem PR e sem push, o
arquivo morreria com a máquina.

**O prognóstico estava errado, e a correção fica registrada em vez de
silenciada.** A sessão fez push de uma branch:

```
origin/bolt-journaling-optimization-learnings-14536923137986406349
4d90a05b docs: add bolt learnings about memoization and sealing
.jules/bolt.md | 6 ++++++
```

Branch não é PR, e por isso a afirmação da sessão não era falsa -- era
incompleta. O aprendizado chegou ao repositório remoto e está disponível para
revisão.

O conteúdo é fiel: `bolt.md` registra os dois antipadrões com os números
corretos -- `ActionRow` recebendo `onChange` inline, e os ~18 campos de
`streetFreqs` selando 26 hooks a jusante contra O(N^3) e stale closures.

**A lacuna de destino era real, e foi fechada nesta sessão.** O acerto da sessão
foi de comportamento, não de regra: nada obrigava a gravar em lugar nenhum, e a
branch avulsa foi escolha dela. Autorizado pelo Tier 0, isso virou a §10.6 (a)
do `CLAUDE.md`: aprendizado de sessão do Jules mora em
`.claude/agent-memory/bolt/MEMORY.md`, que é onde a §9 já situa memória
episódica de agente. `.jules/` seria um segundo lugar para a mesma classe de
artefato -- a fonte paralela que a §3 proíbe.

## (5) Desfecho da sessão

A sessão saiu de `AWAITING_USER_FEEDBACK` às 11:44 UTC, gerou plano às 11:45:12,
teve o plano auto-aprovado **um segundo depois**, produziu artefatos, rodou a
suíte de frontend, fez push da branch às 11:49:31 e alcançou `COMPLETED` às
11:50:06.

O Tier 0 emitiu comando de parada durante a execução, às 11:46:56 e novamente
depois; **a sessão prosseguiu até finalizar**. O comando de parada não
interrompeu o ciclo em andamento. Isso é observação de comportamento, não
acusação de defeito -- pode ser latência entre a mensagem e o loop do agente,
ou ausência de ponto de interrupção no meio de um plano aprovado. Fica medido e
não diagnosticado.

## (6) Violação de identidade de autoria, medida

O commit `4d90a05b` saiu assim:

```
Author:            RaphaelVitoi <171359821+RaphaelVitoi@users.noreply.github.com>
Co-authored-by:    google-labs-jules[bot] <...@users.noreply.github.com>
```

**O agente assinou como o administrador.** Aquele endereço resolve para o perfil
`RaphaelVitoi` no GitHub, e a interface exibirá o commit como autoria humana; o
bot ficou como co-autor, exatamente o inverso do correto.

É a repetição literal do que a §7 deste arquivo já documenta como medição de
2026-08-30 -- *"commits desta linhagem saíram com o e-mail do administrador e o
GitHub os exibiu como autoria dele"* -- e é o motivo pelo qual a regra existe:
uma malha com múltiplos agentes que não distingue quem escreveu o quê não
consegue auditar a si mesma.

A causa aqui é diferente da de agosto, e importa: **o e-mail não foi escolhido
por um agente desta malha.** Ele vem da integração GitHub App do Jules, que
commita sob a conta que autorizou a instalação. Não é corrigível por
configuração de `git config` local nem por instrução no prompt, e portanto **a
§7 não alcança este caminho**.

Nada foi reescrito. Histórico publicado não retroage, e a branch permanece como
está -- o registro da divergência é a correção disponível.

A §7 já havia resolvido a situação análoga: em comentários e revisões no GitHub
o autor também não é configurável, e ali *"o único discriminante possível é o
rodapé de atribuição, que portanto é obrigatório"*. A §10.6 (b) aplica a mesma
solução ao commit do Jules -- `Assinatura` e `Proposito` no corpo, com o
`session_id`. Não corrige o campo `Author`, que está fora de alcance; torna o
commit distinguível apesar dele.

## (7) O que a sessão do Jules NÃO verificou, e por que importa

A sessão reportou *"frontend test suite passed all 27 tests, enforcing the SOTA
Quality Guard"*. A suíte de frontend rodou, e passou -- mas **o portão de 5
fases não rodou**, e não poderia ter rodado.

`cwv_gate.ps1` exige Windows PowerShell, CDP na porta 9222 e dev server na
3000. `record_gate.py` exige o índice de registros do repositório. Nada disso
existe no contêiner descartável do runner. Chamar a suíte de frontend de "SOTA
Quality Guard" superestima a cobertura: é uma das fases, e não é nenhuma das
cinco que o `pre-commit` executa.

Daí a §10.6 (c): branch do Jules entra na malha **apenas por merge local
revisado**, que é onde as cinco fases de fato rodam. Verde na VM é evidência
parcial, e declará-la como portão aprovado seria o tipo de afirmação que a §5
deste arquivo proíbe.

O intervalo de um segundo entre `planGenerated` e `planApproved` é
`auto_approve_plan=True`: **nenhum humano revisou o plano**. Aqui era inofensivo,
porque o plano era não mexer em código. Mas é a mesma configuração que teria
aprovado sozinha um plano de `React.memo` em massa, se a sessão tivesse escolhido
aquele caminho às 03:21.

Com auto-aprovação, não existe portão entre o plano e o diff. **A régua no clone
passa a ser a única barreira**, e é por isso que a §10.5 insiste que ela viva no
repositório e não no prompt da plataforma.
