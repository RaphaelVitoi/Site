---
id: auditoria-2026-09-13-a-regua-errada-sobre-a-coisa-certa
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T02:11:47-03:00'
atualizado_em: '2026-09-13T02:11:47-03:00'
classes: [interno, medido, calibracao, processo, handoff]
caminhos:
  - reports/AUDITORIA-2026-09-13-a-regua-errada-sobre-a-coisa-certa.md
verificado:
  - feedback 9.0 gravado literal na sequencia 67 -- texto Menor periferia, mais horizontalidade.
  - cadeia do ledger valida em 68 registros, cauda 897805b8
  - medicao da sessao pelo instrumento canonico -- 1328 chamadas, 40 erros, 3.0 por cento, metodo is_error
  - taxa caiu de 4.1 na manha para 3.1 e depois 3.0 por cento no mesmo dia
  - quatro feedbacks elegiveis em DUAS sessoes distintas; calibration_planning_permitted false
  - sete commits publicados nesta metade da sessao, de deb246c0 a 6f7f99c3
  - quatro pendencias encerradas por append -- autoria dos forks, render desperdicado, identidade do antigravity, promover assinatura
  - duas pendencias novas abertas no caminho, e uma delas ja foi encerrada no mesmo dia
  - suite Python 1190 aprovados e 1 pulado; frontend 406 aprovados em 52 suites
nao_verificado:
  - nenhuma captura de tela foi obtida; o pane do navegador devolveu imagem preta em tres tentativas
  - o hook novo nao foi exercido sob o Antigravity CLI real, so por sh com ambiente controlado
  - as outras cinco grades de 13 colunas nao foram remedidas apos a correcao da sexta
revisoes_de_ancora:
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: auditoria-2026-09-12-a-tarefa-que-ficou-em-aberto-e-a-memoria-de-curto-prazo
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-11-fechamento-automatico-do-dia-10-e-o-outlier-sem-sessao
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-11-teoria-sota-e-saneamento-multimodal
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
  - registro: agent-calibration-daily-2026-09-02
    caminhos: ['reports/agent-calibration/feedback-ledger.jsonl']
    parecer: APPEND UNICO ao ledger -- a sequencia 67, com a nota 9.0 do handoff desta sessao. Declarado uma vez para os 29 registros que ancoram o ledger, em vez de reescrito em 29 variantes que diriam a mesma coisa. Nenhum registro anterior foi tocado, a cadeia SHA-256 segue valida em 68 e as estatisticas que cada auditoria citou continuam verdadeiras para a data em que foram medidas.
config_medida:
  sequencia_do_feedback: 67
  chamadas: 1328
  erros: 40
  taxa_pct: 3.0
  sessoes_distintas: 2
---

# A régua errada sobre a coisa certa

**Nota 9.0 do Tier 0, sequência 67:** *"Menor periferia, mais horizontalidade."*

## 1. O que a sessão fez

Sete commits, quatro pendências encerradas por append.

| Commit | O que fechou |
| :--- | :--- |
| `deb246c0` | a §7 vira executável; pendência aparece com stage vazio |
| `ed93f449` | a identidade residual é **local**, e foi reapontada por arbitragem |
| `ac6a6046` | o bloqueio dos PRs upstream sai de diagnosticado para **medido** |
| `d6417118` | autoria dos quatro commits de fork, corrigida antes do primeiro PR |
| `c8f828ed` | o número que faltava ao `React.memo` do `PerspectiveChart` |
| `6246ec5b` | a identidade do Antigravity, determinada pelo Tier 0 |
| `6f7f99c3` | a grade 13×13 que não cabia, e o aviso que virou bloqueio |

## 2. O aprendizado — um padrão, sete instâncias

A nota anterior cobrou **horizontalidade**. Olhando os erros desta sessão em
conjunto, eles não são sete defeitos distintos: são **o mesmo defeito sete
vezes**, e nomeá-lo é o que faltava.

> **Eu media a coisa certa com a régua errada.** Em nenhum dos casos a
> observação estava errada; errada estava a *unidade*, a *linha de base* ou o
> *contêiner* contra o qual eu comparava.

| Onde | A régua que usei | A régua certa |
| :--- | :--- | :--- |
| Quebra da sidebar | largura da **viewport** | largura do **painel** |
| Tipografia da célula | `rem` fixo | `cqw` — proporcional à célula |
| Teste de render desperdiçado | referências **depois** da interação | incluindo a **linha de base** anterior |
| Catálogo de identidade no `grep` | expressão regular | string literal (`-F`) |
| Cache da suíte | `HEAD` (na sessão anterior) | árvore de conteúdo |
| Prova de que a reescrita não mudou nada | ler o diff | **SHA da árvore** |
| Bloqueio dos PRs | documentação | a tentativa real |

Os três últimos deram certo — e deram certo **porque** a régua foi escolhida
antes. Isso é o que torna o padrão útil em vez de uma lista de culpas: a mesma
pergunta que evita o erro é a que produz a prova.

**A pergunta, em uma linha:** *contra o que isto está sendo comparado, e essa é
a grandeza que decide?*

## 3. A periferia, que é a outra metade da nota

O Tier 0 apontou, e está correto: *"tudo isso me parece periférico"*. A sessão
gastou horas em governança de autoria quando o alvo declarado era produto.

**O registro já continha a regra.** A §8.3 do `CLAUDE.md` traz, do interlúdio de
12/09, exatamente *"periferia se despacha, não se delibera"*. Eu deliberei —
escrevi catálogo, portão, guards, documentação e registro para uma classe de
problema que merecia despacho.

**O que distingue despachar de deliberar, medido nesta sessão:** o ponteiro no
`CLAUDE.md` custou **24 revisões de âncora**; o mesmo conteúdo em
`data/agent_identities.json` custou **zero**. Quando o Tier 0 mandou tirar o
ponteiro, os erros do portão caíram de 22 para 2 num único comando. A diferença
entre as duas formas não era de qualidade — era de **preço**, e eu não o havia
medido antes de escolher.

**Corolário para a próxima sessão:** antes de escrever governança, medir o custo
de âncora da forma escolhida. Um arquivo de dados que um portão lê custa nada; a
mesma frase em prosa no documento mais ancorado do repositório custa 24
pareceres.

## 4. Erros que se repetiram apesar de estarem escritos

Três, e os três já tinham registro anterior:

1. **`subprocess` / pipe sem `encoding`** — `UnicodeDecodeError`, pela **terceira**
   vez no mesmo dia, depois de eu ter corrigido o defeito no código e o ter
   citado num comentário.
2. **Heredoc com escapes** — quebrou um teste em `\n` literais, e existe memória
   persistente minha dizendo *escrever arquivo é Write/Edit*.
3. **`: ` dentro de escalar YAML** — bloqueou o portão duas vezes, com a mesma
   mensagem de erro nas duas.

É a redundância que a nota de ontem já nomeava. A diferença é que hoje ela custou
segundos, não ciclos de publicação: em todos os três havia portão ou teste
pegando antes do commit.

## 5. Estado ao fechar

| | |
| :--- | :--- |
| `HEAD` | `6f7f99c3`, limpo e sincronizado |
| Suíte Python | 1190 aprovados, 1 pulado |
| Suíte frontend | 406 aprovados em 52 suítes |
| Feedback-ledger | 68 registros, cauda `897805b8` |
| Taxa de erro | 3,0% — contra 4,1% na manhã |
| Pendências | 5 abertas, nenhuma vence antes de 12/10 |
| Portão de calibração | 4 elegíveis em **2** sessões — fechado |

**Assinatura:** `Claude Opus 5 [Tier 1.B]` — sessão `claude-opus5-site-2026-09-12-preludio`
