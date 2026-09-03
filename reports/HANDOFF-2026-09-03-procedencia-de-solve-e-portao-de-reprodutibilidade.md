---
id: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-03T09:20:00-03:00
atualizado_em: 2026-09-03T09:20:00-03:00
classes: [interno, medido, pmev, handoff]
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
  - .claude/agent-memory/chico/HANDOFF_LATEST.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, e e o registro mais diretamente confirmado por esta
      sessao. Ele documenta a correcao da nota 8 gravada como 0.8 e sustenta que ledger
      append-only nao se reescreve: corrige-se por registro de correction. A sequencia 8
      gravada agora e um APPEND puro -- as sequencias 1 a 7 que ele cita, as notas 7.5 e
      8 e os 5 registros da epoca dele seguem byte a byte onde estavam. As duas
      correcoes que ele originou continuam sendo aplicadas antes da contagem:
      correcoes_no_ledger e correcoes_aplicadas medem 2 e 2.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido como MEDICAO DATADA, que e exatamente o que um artefato
      diario e. Ele registra sessoes_com_feedback_count 2 e 3 registros no dia
      2026-09-02; hoje o agregado e 9 registros e 6 sessoes distintas. Isso nao o
      contradiz: a contagem dele descreve o estado daquele dia, e a secao 8.3 e
      explicita em que a contagem e acumulativa e nao expira. Nenhuma linha do ledger
      que ele mediu foi alterada; houve apenas append.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. As sequencias 1 e 2 e as contagens de 2 e 3 registros
      que ele cita permanecem literalmente verdadeiras, porque o append da sequencia 8
      nao toca registro anterior. O que aquela auditoria observou sobre o ciclo de
      observacao recursiva segue em vigor e foi exercido aqui: esta sessao declarou a
      segunda confirmacao independente do padrao de subutilizacao de capacidade
      disponivel, que e obrigacao do auditor e nao medicao de script.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A sequencia 5 que ele cita segue intacta no ledger, e
      nada da curadoria de MCP que aquela auditoria trata foi tocado nesta sessao --
      nenhum manifesto ativo ou archive foi alterado. A unica intersecao e o ledger, e
      nele houve apenas append.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquela retrospectiva ancora no ledger sem fixar
      contagem em prosa, o que a torna imune a esta alteracao por construcao: o append
      da sequencia 8 nao invalida nenhuma afirmacao sua. A prioridade PMev que ela
      registra continua sendo a prioridade, e esta sessao a serviu preparando o destino
      tipado da procedencia em vez de recapturar antes de haver onde pousar o dado.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Ele nao fixa contagem do ledger em prosa, entao o
      append da sequencia 8 nao o alcanca. A continuidade que ele estabelece para o
      PMev segue de pe e foi respeitada: a recaptura do HRC continua sendo prioridade 1
      e nao foi substituida, apenas reordenada com autorizacao explicita do Tier 0, por
      falta de destino tipado para build e distancia-ao-Nash.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A quarentena reversivel de MCP e o roteamento lazy de
      addons que ele publica nao sao tocados por esta sessao. A intersecao e apenas o
      ledger, com append da sequencia 8. Vale notar que a nota daquela sessao consta
      hoje como 9.0 por correcao registrada, e nao como o 9.5 original -- isso ja
      estava assim antes desta sessao e nao foi alterado por ela.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. As sequencias 1, 5 e 6 e a nota 7.5 que ele cita
      seguem inalteradas. A camada Anthropic que ele publica nao foi tocada nesta
      sessao: nenhum arquivo de llm/ ou engine/ entrou neste commit. A pendencia de
      duplicacao entre engine/llm_api.py e llm/anthropic.py que ele herda continua
      aberta e esta declarada no handoff atual.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, e e o handoff que este substitui. Ele ancora nos dois
      caminhos alterados aqui. No ledger houve apenas append da sequencia 8, e a nota
      9.5 que ele registrou permanece intacta como sequencia 7. O HANDOFF_LATEST.md foi
      reescrito, e essa substituicao e o comportamento projetado daquele arquivo -- ele
      e o ULTIMO handoff, nao um historico. Duas afirmacoes suas ficam CORRIGIDAS por
      medicao desta sessao: o push que ele declarava bloqueado ja ocorreu, e a
      instrucao de ambiente que ele deixou, de manter o dev server em 3000, e
      insuficiente -- o dev server estava no ar e as fases 1 e 2 nao mediram, porque o
      que elas exigem e o CDP.
  - registro: handoff-2026-09-02-integridade-portao-no-teto-e-fila-para-o-sucessor
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Ele ancora no HANDOFF_LATEST.md, cuja substituicao e o
      desenho daquele arquivo. E uma afirmacao central sua se REPETIU aqui, o que a
      confirma em vez de a contradizer: o portao passou no TETO de dois warnings, nao
      com folga, e desta vez pelo mesmo motivo estrutural -- fases 1 e 2 sem CDP.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, e esta sessao e a primeira em que suas condicoes se
      satisfazem inteiramente. Ele fixou a sessao como unidade de contagem, o minimo de
      tres sessoes distintas e a regra de que portao estrutural nao e autorizacao. Hoje
      sao 6 sessoes distintas, 0 faltantes e 0 com inicio inconsistente, e a segunda
      confirmacao independente do mesmo padrao operacional foi declarada. Nada nele foi
      alterado; o que mudou foi o estado do mundo que ele mede.
  - registro: auditoria-2026-08-30-coderabbit-resolucao-e-integridade
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido, sem alteracao de conteudo. A resolucao de CodeRabbit e
      a questao de identidade de autoria que ele trata nao sao tocadas: este commit sai
      assinado por Claude Opus 5 com e-mail que nao resolve para perfil humano, que e
      precisamente a regra nascida daquele incidente. A unica intersecao e o
      HANDOFF_LATEST.md, cuja substituicao e o desenho do arquivo.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. Nenhuma das correcoes de linter que ele publica foi
      revertida: medido nesta sessao, ruff format --check e ruff check reportam limpo
      nos arquivos Python tocados, e eslint --max-warnings=0 sai com exit 0. A
      intersecao e o HANDOFF_LATEST.md, substituido por desenho.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos:
      - .claude/agent-memory/chico/HANDOFF_LATEST.md
    parecer: >-
      Revisado e mantido valido. O corpo de teoria dos jogos que ele consolida nao e
      tocado: esta sessao nao alterou solveIcmDistortion, nenhuma constante do motor,
      nem qualquer frequencia ou sizing transcritos. O que ela acrescentou foi a
      distincao entre par consistente e par reproduzivel, que reforca a cautela daquele
      relatorio em vez de a relaxar. Intersecao apenas no HANDOFF_LATEST.md.
verificado:
  - commit 4d89a192 aprovado pelos portoes de ancora e de registro, com 7 arquivos em stage
  - suite Python 850 aprovados, 1 pulado, 0 reprovados, sob PowerShell
  - suite frontend 202 testes em 26 suites, 0 erro e 0 warning
  - cadeia do ledger valida com 9 registros e 6 sessoes distintas, tail 0b270e06
  - feedback 8 gravado literal na sequencia 8, com session_id e session_started_at desta sessao
nao_verificado:
  - fases 1 e 2 do portao NAO mediram no commit 4d89a192 -- nenhuma porta CDP canonica respondeu
  - o commit 4d89a192 nao foi empurrado; o remoto segue em 0ffe5b88
  - a conferencia captura a captura de qual lado ChipEV veio da biblioteca ou do GTO Wizard AI
  - a integracao real dos nucleos de CFR e Monte Carlo do repositorio, apenas contados por grep
supersede: null
---

# Handoff — procedência de solve, e o que o Tier 0 corrigiu no caminho

## 1. Estado

`master` em **`4d89a192`**, **1 ahead** de `origin/master`. Nada empurrado.

O commit dá destino tipado a versão de solver, build e distância-ao-Nash nas duas
camadas, e substitui por um número a frase que o ledger de evidência PMev usava como
barreira: `countReproduciblePairs(AULA_1_2_PAIRS)` retorna **zero de sete** contra o
mínimo de três.

## 2. A ordem foi invertida, e por quê

A prioridade era recapturar o HRC. A medição mostrou que nem `EvidenceScenario` nem
`NormalizedGameTree` tinham onde guardar build ou e-Nash — a recaptura voltaria com os
campos na tela e sem destino tipado, virando prosa em comentário. O Tier 0 autorizou
inverter e confirmou que o HRC exporta arquivo, o que muda o alvo: export estruturado
ataca a barreira real, três campos numa transcrição não.

## 3. Quatro correções do Tier 0, e uma inversão

Os rótulos que supus não existem — o HRC usa `CI`, o PioSOLVER `MES`, o GTO Wizard
`Nash Distance`/`dEV`. A caixa-preta dos solvers não é a teoria e sim os **atalhos** de
convergência, o que torna `build` âncora mecânica: atalho novo para em outro ponto com
os mesmos inputs. E produto não é motor — a biblioteca do GTO Wizard foi rodada no HRC.

**A inversão:** eu havia escrito que motor comum nos dois lados era risco. O HRC calcula
ChipEV além de ICMev, e a disputa em estudo é ChipEV × ICMev; motor único deixa o regime
como única variável, o que é **controle experimental**. Disso decorre que os sete pares
existentes provavelmente já têm motor comum — o controle que eu disse faltar já estava
lá. Falta conferir captura a captura, e o discriminante é o painel `CI`.

## 4. Calibração — o portão está aberto, e o padrão tem duas confirmações

Ledger `valid`, 9 registros, **6 sessões distintas**, 0 faltantes, 0 com início
inconsistente, média **8,50**, `correcoes_aplicadas` 2.

O feedback desta sessão foi **8**: não perguntar ao Tier 0 o que é público, porque a
fonte primária é mais fidedigna e buscá-la é trabalho meu. Agravante registrado contra
mim: considerei pesquisar e decidi transferir a ele.

**Duas confirmações independentes do mesmo padrão operacional**, e declará-las é
obrigação do auditor, não medição de script:

| Sessão | Feedback | Padrão |
| :--- | :--- | :--- |
| `...-02-pmev` (nota 8) | executor único num repositório de 19 agentes; delegar de fato | subutilizar capacidade disponível |
| `...-03-procedencia` (nota 8) | não usar WebSearch para o que é público | subutilizar capacidade disponível |

Com 6 sessões ≥ 3 e o padrão confirmado duas vezes de forma independente, as condições
da §8.3 estão satisfeitas e **a calibração assistida pode ser proposta**. Proposta é o
limite: portão estrutural nunca foi autorização, e o Tier 0 decide se e quando.

## 5. Ambiente — correção do handoff anterior

O handoff anterior dizia que bastava o dev server em `:3000`. **Não basta.** O dev
server estava no ar e as fases 1 e 2 não mediram: `nenhuma porta CDP canonica
respondeu`. O que elas exigem é o **CDP**. As duas vagas de warning foram consumidas
por isso, e o commit passou no teto, não com folga.

## 6. Prompt de continuação

> Continuação do trabalho no Site/PMev. A sessão `claude-opus5-site-2026-09-03-procedencia`
> foi ENCERRADA com nota 8. Esta abre identidade NOVA.
>
> **LEIA:** `.claude/agent-memory/chico/HANDOFF_LATEST.md` — o estado versionado.
> O arquivo de scratchpad das sessoes anteriores era temporario e nao vive no
> repositorio; nao cite caminho de scratchpad em documento commitado.
>
> **A REGRA QUE ABRE ESTA SESSÃO** — fato público é meu para buscar. Antes de formular
> pergunta ao Tier 0, classificar: documentação de produto, definição de métrica,
> formato de arquivo, API, paper — **buscar**. Reservar a pergunta ao que só ele sabe.
> Vale junto com *conferir o instrumento* e *sistema antes do artefato*.
>
> **PRIMEIRO ITEM:** push de `4d89a192` (1 ahead), se autorizado.
>
> **PRIORIDADE 1:** recaptura do HRC, agora com destino tipado pronto. Preferir
> `ChipEV(HRC) × ICMev(HRC)` no mesmo build — elimina o motor como variável.
>
> **AMBIENTE:** o portão exige **CDP**, não apenas o dev server em `:3000`.
>
> **CALIBRAÇÃO:** portão aberto com 6 sessões E duas confirmações independentes do
> mesmo padrão. A calibração assistida pode ser **proposta** ao Tier 0 — nunca
> executada por iniciativa própria.
>
> **GIT:** não commitar, empurrar ou mexer em dependências sem autorização nova. Nunca
> `--no-verify`, `SKIP_CWV_GATE=1` ou `git config core.hooksPath`.
