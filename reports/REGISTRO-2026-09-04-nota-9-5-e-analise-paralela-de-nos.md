---
id: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-04T22:15:00-03:00
atualizado_em: 2026-09-04T22:15:00-03:00
classes: [interno, medido, calibracao]
caminhos:
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Ele ancora no ledger sem fixar contagem em prosa, o que
      o torna imune a este append por construcao. A prioridade PMev que registra continua
      sendo a prioridade e foi servida nesta sessao pela construcao do adaptador.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A sequencia 5 que ele cita segue intacta, e nada da
      curadoria de MCP que trata foi alterado -- nenhum manifesto ativo ou archive foi
      tocado nesta sessao. A unica intersecao e o ledger, e nele houve apenas append.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. As contagens de 2 e 3 registros que cita permanecem
      literalmente verdadeiras: append nao toca registro anterior. O ciclo de observacao
      recursiva que ela institui foi exercido aqui, com o padrao desta sessao nomeado e
      confrontado com o da anterior.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Ele nao fixa contagem em prosa. Sua Etapa C -- interface
      didatica de FT Vanilla -- segue aberta e foi reinscrita como trilha alternativa no
      prompt de continuacao desta sessao, caso o export do HRC nao chegue.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A quarentena reversivel de MCP e o roteamento lazy que
      publica nao foram tocados. Vale notar que a nota daquela sessao consta como 9.0 por
      correcao registrada, e nao como o 9.5 original -- isso ja estava assim antes desta
      sessao e nao foi alterado por ela.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A camada Anthropic nao foi tocada nesta sessao. A
      cobertura de CVE que ele trata ganha um dado NOVO, que nao o contradiz: o push de
      hoje recebeu aviso do GitHub sobre 8 vulnerabilidades no branch default, possivel
      efeito da volta de quatro submodulos ao HEAD publico. Fica declarado como pendencia,
      nao como conclusao.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. As duas confirmacoes independentes do padrao de
      subutilizacao de capacidade que ele declara seguem validas, e o padrao desta sessao
      e OUTRO -- assumir caminho unico num no de decisao. Sao observacoes distintas e
      nenhuma anula a outra. Sua medicao de zero de sete pares reproduziveis foi refeita
      hoje e confirmada.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido; e o handoff desta mesma sessao, publicado no commit
      96ac0bc6, e este registro completa o que ele anuncia. Ele declara a nota 9.5 e o
      feedback do Tier 0 em prosa; aqui o valor entra no ledger como sequencia 13, com
      session_id, conductor_model e supervision_mode declarados.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido quanto a sequencia 12 que registra, intacta apos este
      append. As correcoes que esta sessao fez sobre o commit daquele condutor estao
      declaradas no REGISTRO-2026-09-04-credenciais-submodulos-e-adaptador-hrc e nao
      alteram nada do ledger que ele cita.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. As sequencias 1, 5 e 6 e a nota 7.5 que cita seguem
      inalteradas. Nenhum arquivo de llm/ entrou nos commits desta sessao.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido, e continua sendo o registro que governa a forma deste
      append. A nota 9.5 entrou LITERAL, sem arredondamento e sem conversao de escala --
      que e exatamente a falha que ele documenta e proibe. Ledger segue append-only: as
      correcoes que ele originou permanecem e continuam sendo aplicadas antes de qualquer
      contagem.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A nota 10 e o outlier de aceleracao que registra seguem
      no ledger sem alteracao. Este append e de outra sessao, com outro condutor
      declarado, e nao interfere na leitura daquele outlier.
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido como MEDICAO DATADA, que e o que um artefato diario e.
      Ele registra o estado de 2026-09-02; hoje o agregado e 14 registros e 10 sessoes
      distintas. Isso nao o contradiz: a secao 8.3 e explicita em que a contagem e
      acumulativa e nao expira, e nenhuma linha que ele mediu foi alterada.
verificado:
  - feedback 9.5 gravado literal na sequencia 13, hash fe179235416c58b3
  - ledger com 14 registros e 10 sessoes distintas, cadeia SHA-256 integra
  - condutor claude-opus-5 e regime assistida declarados no registro
nao_verificado:
  - se as 8 vulnerabilidades reportadas pelo Dependabot no push de hoje decorrem da volta dos submodulos ao HEAD publico
supersede: null
---

# Registro — nota 9.5 e a análise paralela de nós

## O feedback, literal

> *"Feedback 9.5/10, excelente. Faltou um pouco de análise paralela de nós, sem
> sair assumindo apressadamente um caminho ou rotina única e definitiva quando há
> várias opções."*

## Por que ele é procedente, com três evidências da própria sessão

| Nó de decisão | O que assumi | O que a análise paralela mostraria |
| :--- | :--- | :--- |
| O Jules é delegável? | Testei POST+OAuth2 e GET+API key, concluí "não é delegável" | Havia **quatro** combinações (POST/GET × API key/OAuth2). A não testada era a que funciona. |
| O `if` do Stitch é bug? | Assumi que o `if` estava errado | Duas leituras concorrentes; a pesquisa mostrou que o `if` está certo e as **constantes** é que não eram valores de API. |
| Qual submódulo quebrou? | Corrigi `gemini-cli-jules` e ia esperar a próxima noite | O nó não era *qual* quebrou, era *quantos*. Varrer os 9 custou o mesmo que corrigir 1 — e eram **quatro**. |

## O ajuste, e por que ele não é "testar tudo sempre"

**Ao chegar a um nó de decisão, enumerar as ramificações antes de descer por uma.**

O discriminante é o **custo relativo**: quando testar todas as ramificações custa
perto do que custa testar uma — como na varredura dos submódulos e na matriz de
credenciais — testar todas é o caminho **barato**, não o caro. A hipótese única só
se justifica quando cada teste é caro. E mesmo aí, ela se declara como *hipótese*,
não como conclusão.

Isso convive com o **zoom out preditivo** calibrado na sessão anterior, e os dois
se completam: aquele manda antecipar os próximos nós descendo a árvore; este
proíbe **podar ramos irmãos** antes de medi-los.

## Contexto de amostra

O padrão desta sessão é **distinto** do que as sessões de 02 e 03/09 registraram
(subutilização de capacidade disponível, com duas confirmações independentes).
Nenhum anula o outro. Este é o primeiro registro deste padrão; uma segunda
confirmação independente ainda não existe, e sem ela não há promoção a padrão
consolidado — a §8.3 é explícita nisso.
