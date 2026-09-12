---
id: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
tipo: validacao
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-12T22:04:11-03:00'
atualizado_em: '2026-09-12T22:41:07-03:00'
classes: [interno, medido, proveniencia, portao, governanca]
caminhos:
  - .husky/commit-msg
  - tests/test_hook_commit_msg.py
  - scripts/ops/record_gate.py
  - tests/test_record_index.py
  - CLAUDE.md
verificado:
  - o comando que o CLAUDE.md manda rodar ao voltar devolvia "Nada em stage" e nenhuma pendencia
  - a impressao das pendencias morava depois do retorno antecipado de main(), linha 735 contra 757
  - com a correcao, stage vazio imprime as sete pendencias abertas, zero vencidas
  - 16 dos 40 commits mais recentes nao trazem linha Assinatura -- contados um a um
  - os tres commits do Gemini de hoje rotulados Codex GPT-5 nao tem Assinatura nenhuma a comparar
  - o Tier 0 confirmou o recorte do dia -- tudo Gemini, uma unica entrada GPT
  - o portao novo barra o caso real medido -- autor Codex GPT-5 contra Assinatura antigravity@gemini-3.8-flash
  - a forma composta veiculo@modelo casa com o nome do campo de autor apos normalizacao -- as duas passam
  - merge, revert, fixup, squash e WIP seguem isentos -- exercidos no hook
  - ausencia de Assinatura avisa e nao bloqueia -- codigo de saida 0 conferido
  - a mensagem de recusa entrega o comando pronto e nomeia a proibicao do config global
  - tests/test_hook_commit_msg.py -- 29 aprovados, contra 22 antes
  - a identidade residual estava em .git/config LOCAL; a global e Raphael Vitoi, a do Tier 0
  - local reapontada para Claude Opus 5 por arbitragem do Tier 0; global conferida intacta depois
  - com a local nova, assinatura do condutor atual passa sem -c e a de outro condutor e recusada
  - tests/test_record_index.py -- 10 aprovados no recorte de pendencia, incluindo o guard novo
  - nenhum dos 22 testes preexistentes do hook regrediu com a alteracao
nao_verificado:
  - a suite integral ainda nao foi medida nesta arvore -- roda no pre-push por suite_verde.py
  - o comportamento do hook sob o antigravity CLI de verdade; so foi exercido por sh com ambiente controlado
  - se o Gemini passa a declarar Assinatura por conta propria, ou se precisa de instrucao no veiculo
pendencias:
  - id: pend-2026-09-12-promover-assinatura-a-bloqueio
    o_que: Decidir se a ausencia de Assinatura passa de aviso a bloqueio -- e reducao material pela escada da SS8.2 e atingiria o Tier 0 commitando a mao
    dono: Tier 0
    prazo: 2026-09-19
revisoes_de_ancora:
  # As tres alteracoes deste commit sao ADITIVAS e nao tocam nenhuma regra que os
  # registros abaixo afirmam: CLAUDE.md ganhou uma subsecao nova na SS7;
  # record_gate.py passou a imprimir pendencias tambem com stage vazio, sem mudar
  # verificacao alguma; test_record_index.py ganhou um guard; commit-msg ganhou a
  # checagem de identidade depois das regras que ja existiam.
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [CLAUDE.md, scripts/ops/record_gate.py]
    parecer: A taxonomia descreve onde cada artefato mora. Nem a subsecao nova da SS7 nem a impressao de pendencia com stage vazio movem artefato de pasta.
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos: [CLAUDE.md]
    parecer: Aquela auditoria mede o trabalho de uma sessao Gemini de 03-09. A subsecao nova torna a SS7 executavel daqui em diante e nao retroage sobre commit publicado.
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos: [CLAUDE.md, scripts/ops/record_gate.py, tests/test_record_index.py]
    parecer: E o registro que ABRIU a pendencia da identidade, e ela continua aberta -- este commit executa uma das duas metades. A correcao do record_gate conserta a visibilidade que aquela mesma auditoria prescreveu.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: [CLAUDE.md]
    parecer: Proveniencia de FEEDBACK no ledger; aqui se trata de autoria de COMMIT. Sao dois eixos distintos e nenhum campo do ledger mudou.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos: [CLAUDE.md]
    parecer: Endurecimento de infraestrutura de junho. Nada do que ele afirma depende da SS7, que so ganhou subsecao.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos: [CLAUDE.md]
    parecer: A hierarquia de 8 Tiers permanece literal. A subsecao acrescenta verificacao de identidade, nao altera Tier de ninguem.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos: [scripts/ops/record_gate.py]
    parecer: Aquele handoff enumerava pendencias em prosa -- exatamente o modo que a SS9.2 aposentou. A alteracao so faz a lista estruturada aparecer mais cedo.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: ['.husky/commit-msg', CLAUDE.md]
    parecer: E o registro que documenta a origem da regra de identidade -- commits desta linhagem saindo com o e-mail do administrador. Este commit executa aquela regra; o diagnostico dele continua valido palavra por palavra.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: [CLAUDE.md]
    parecer: Reconcilia o prompt do heartbeat do Codex com a regra executavel de calibracao. A subsecao nova nao toca limiar, sessao nem elegibilidade.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos: [scripts/ops/record_gate.py]
    parecer: Trata de isolamento entre condutores concorrentes. A impressao de pendencia com stage vazio nao muda quem detem o lock.
  - registro: plano-2b-painel-de-estado
    caminhos: [scripts/ops/record_gate.py]
    parecer: O plano descreve o painel que o portao imprime. Ganhou uma tela a mais -- a de stage vazio --, e nenhuma verificacao saiu.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos: [CLAUDE.md]
    parecer: Governanca piramidal e invariante de commits. O invariante segue o mesmo; o que mudou e que agora ha portao conferindo uma parte dele.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos: [scripts/ops/record_gate.py]
    parecer: A tese e que o portao VERIFICA o indice, e ela permanece intacta -- a impressao de pendencia nao e verificacao e nao bloqueia nada.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos: [CLAUDE.md, scripts/ops/record_gate.py]
    parecer: A subtracao de caminhos herdados de merge nao foi tocada; a alteracao vive em main(), depois de verificar().
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos: [scripts/ops/record_gate.py, tests/test_record_index.py]
    parecer: Resolucao de referencia por ponto de partida segue igual; o guard novo exercita main() com stage vazio e nao encosta no resolvedor.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos: [CLAUDE.md]
    parecer: Correcao append-only de escala no ledger de feedback. Autoria de commit e outro eixo, e nenhum registro foi reescrito aqui.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos: [CLAUDE.md]
    parecer: A unidade continua sendo a sessao distinta, minimo tres. A subsecao nova nao cita limiar.
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos: [CLAUDE.md]
    parecer: Chico e o grupo, a assinatura e individual -- e este commit reforca precisamente essa distincao, cobrando a assinatura individual no campo que o GitHub le.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos: [tests/test_record_index.py]
    parecer: O ciclo de calibracao nao le pendencia nem stage. O guard acrescentado e independente dos que aquele registro ancorou.
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos: [CLAUDE.md]
    parecer: A SS10.6(b) daquela regua ja exigia a Assinatura no corpo para o Jules, pelo mesmo motivo -- campo de autor fora de alcance. Este commit torna a exigencia verificavel; a regua nao muda.
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos: [CLAUDE.md]
    parecer: Teto de esforco e faixa de acesso nao sao tocados por verificacao de autoria.
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos: [scripts/ops/record_gate.py, tests/test_record_index.py]
    parecer: A alternancia de extensoes vive na resolucao de referencia, nao em main(). Nenhum caminho de resolucao foi alterado.
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos: [CLAUDE.md]
    parecer: A arbitragem governa permissao, nunca fato medido -- e e por ela que a promocao do aviso a bloqueio ficou como pendencia do Tier 0, e nao como decisao minha.
  - registro: registro-2026-09-08-ruff-format-e-o-ci-vermelho
    caminhos: [tests/test_record_index.py]
    parecer: Formatacao do arquivo preservada; o guard novo segue o mesmo estilo e o ruff aprovou.
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos: [CLAUDE.md]
    parecer: E o registro que pediu identificacao distinta de agentes. Este commit e a execucao daquele pedido, e nao contradiz nada do que ele mediu.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: [CLAUDE.md]
    parecer: O preludio trata do instrumento de calibracao que abria e nao fechava ciclo. Assunto distinto; nenhuma afirmacao dele depende da SS7.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos: [CLAUDE.md]
    parecer: Harmonizacao v8 GOLD de junho. A subsecao e aditiva e nao remove nada que aquele relatorio harmonizou.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos: [CLAUDE.md]
    parecer: Analise integral do ecossistema; nenhuma capacidade foi adicionada ou retirada por este commit.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos: [CLAUDE.md]
    parecer: As medicoes de impacto daquele relatorio nao dependem de verificacao de autoria e permanecem como estavam.
config_medida:
  hook: .husky/commit-msg
  fonte_do_autor: git var GIT_AUTHOR_IDENT
  bloqueia: divergencia entre autor e Assinatura declarada
  avisa: ausencia de Assinatura
---

# A identidade de autoria deixa de ser prosa

## 1. O comando que eu mesmo prescrevi devolvia nada

O handoff de ontem à noite e a §1.1.1 do `CLAUDE.md` mandam abrir o trabalho com
`python scripts/ops/record_gate.py`, porque é ele que imprime as pendências. Ao
voltar, o comando devolveu:

```
[REGISTRO] Nada em stage. Nada a verificar.
```

A impressão morava **depois** do retorno antecipado de `main()`. Quem começa o
trabalho, por definição, não tem nada em stage — logo a lista só aparecia para
quem já estava commitando, que é justamente quem não precisa dela.

**É a §9.2 reencenada dentro do instrumento que existe para cumpri-la.** A regra
diz *"tarefa aberta se declara onde um portão já olha"*, e o portão olhava tarde
demais. Corrigido, e com guard: `test_pendencia_aparece_mesmo_sem_nada_em_stage`.

## 2. O desenho óbvio não teria pego nenhum dos cinco

A pendência de prazo mais curto pede tornar a §7 executável. O caminho evidente
é comparar a `Assinatura:` do corpo com o campo de autor — e a medição o
desmontou antes de eu escrever uma linha:

| Medição | Valor |
| :--- | ---: |
| Commits recentes examinados | 40 |
| Sem linha `Assinatura:` | **16** |
| Commits do Gemini de hoje rotulados `Codex GPT-5`, sem Assinatura | **3 de 3** |

Não havia corpo a comparar. **A exigência da assinatura precisa vir primeiro; ela
é o que torna a comparação possível.** Uma regra vale o que a outra habilita.

## 3. O que ficou executável, e por que as duas metades diferem

| Verificação | Efeito | Razão |
| :--- | :--- | :--- |
| Autor diverge da Assinatura | **bloqueia** | evidência exata, zero falso positivo nas quatro formas de assinatura desta casa |
| Sem `Assinatura:` | **avisa** | a mesma exigência atingiria o Tier 0 commitando à mão |

O portão não adivinha condutor — não pode, e o dia de hoje é a prova: o rótulo
estava errado em cinco de seis. Ele compara o que o condutor **declarou** com o
campo que o GitHub lê, e a recusa entrega o comando pronto, nunca o `git config`
global que a §7 proíbe por só empurrar a herança adiante.

A comparação é normalizada porque `antigravity@gemini-3.8-flash` e
`Gemini 3.8 Flash` são a mesma identidade em duas convenções desta casa;
comparação literal reprovaria as duas.

## 4. O que continua aberto, e é decisão do Tier 0

A pendência `pend-2026-09-12-identidade-do-antigravity` **permanece aberta**, e
declará-la fechada seria falso: o caminho que os cinco commits errados tomaram —
nenhuma assinatura — hoje só avisa. Fechá-lo é redução material pela escada da
§8.2, e o hook não separa agente de humano sem confiar num campo que o próprio
agente escolhe — confiar nele daria ao agente o botão de se isentar.

Por isso a nova pendência é a decisão, não a implementação: a implementação é uma
linha, e já está escrita ao lado do aviso.

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`

## 5. Arbitragem do Tier 0 — a residual é local, e foi reapontada

Registrado por §3.1 da raiz: a operação é **válida**, não exceção tolerada.

Ao mandar mudar a assinatura, o Tier 0 arbitrou o que a §7 desaconselhava em
prosa. A medição feita antes de executar mostra que a prosa mirava o alvo errado:

| Escopo | Antes | Depois |
| :--- | :--- | :--- |
| `.git/config` (local) | `Codex GPT-5 <noreply@openai.com>` | `Claude Opus 5 <noreply@anthropic.com>` |
| global | `Raphael Vitoi <raphavitoi@gmail.com>` | **intacto** |

**A objeção da §7 era à global, e ela continua de pé.** Apagar a local sem
substituir seria pior que a residual: faria todo commit de agente sair no e-mail
pessoal do administrador, que é o incidente de 2026-08-30 em pessoa.

**O que muda o cálculo de risco é o portão desta mesma sessão.** O argumento
contra reapontar a local era que ela empurra a herança para o próximo condutor
em silêncio. Com a verificação de coerência, o silêncio acabou: o próximo
condutor que declarar a própria assinatura sob esta identidade é **barrado**,
com o comando de correção na tela. Verificado no ato — assinatura `Claude Opus 5`
passa sem `-c`; `antigravity@gemini-3.8-flash` sob esta local é recusada.

A herança deixou de ser defeito silencioso e virou aviso na cara de quem herdou.
