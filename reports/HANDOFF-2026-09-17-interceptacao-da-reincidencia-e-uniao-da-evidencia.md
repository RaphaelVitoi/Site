---
id: handoff-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-17T23:40:00-03:00'
atualizado_em: '2026-09-17T23:40:00-03:00'
classes: [interno, medido, governanca, frontend, simulador, calibracao]
caminhos:
  - reports/HANDOFF-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia.md
  - reports/AUDITORIA-2026-09-17-calibracao-do-padrao-linear-reativo.md
  - reports/AUDITORIA-2026-09-17-a-metrica-que-inocentava-o-padrao.md
  - reports/REGISTRO-2026-09-17-uniao-da-evidencia-aula12-com-o-motor-bayesiano.md
  - scripts/ops/saude_da_malha.py
  - scripts/ops/record_gate.py
  - tests/test_saude_da_malha.py
  - frontend/src/lib/aula12Evidence.ts
  - frontend/src/lib/bayesianRangeEngine.ts
  - frontend/src/lib/featureFlags.ts
  - frontend/src/components/simulator/ui/PkoDevControl.tsx
  - frontend/src/components/simulator/panels/BayesianBeliefPanel.tsx
  - frontend/src/tests/simulator/aula12Evidence.test.ts
  - frontend/src/tests/simulator/bayesianRangeEngine.test.ts
  - frontend/src/tests/simulator/pkoEmDesenvolvimento.test.tsx
  - reports/agent-calibration/feedback-ledger.jsonl
  - reports/agent-calibration/daily/2026-09-17.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: bc3560b8
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-17
verificado:
  - suite do simulador -- 373 testes em 55 suites, todos aprovados
  - contrato do detector de instrumento parado -- 13 testes, guardiao 0 erros e 0 warnings
  - contrato do interceptador de reincidencia -- 20 testes, mais smoke test contra o comando real que falhou
  - typecheck estrito (tsc --noEmit) sem erros e eslint limpo nos arquivos tocados
  - leitura independente da figura 8 da Aula 1.2, concordante digito a digito com a transcricao canonica
  - calibracao registrada no ledger -- fee1823b, sequencia 78, portao estrutural aprovado
  - cadeia do ledger integra apos a calibracao -- 79 registros, status valid
  - detector de saude da malha limpo apos o ciclo fechar
nao_verificado:
  - o interceptador PreToolUse em operacao real; ele foi ativado nesta sessao e so vale a partir da proxima
  - OCR das 96 figuras restantes do documento da Aula 1.2
  - build de producao e Lighthouse
  - o portao de 5 fases, que so roda no commit
pendencias:
  - id: pend-2026-09-17-calibracao-global
    o_que: Fazer a calibracao global numa sessao propria, conforme decisao do Tier 0 em 2026-09-17
    dono: Tier 0
    prazo: 2026-10-17
  - id: pend-2026-09-17-barreira-de-hooks-inexistente
    o_que: A SS8.1.1 declara um override com hooks vazio em settings.local.json como barreira operacional, e ele nao existe em nenhum dos dois arquivos de escopo de usuario
    dono: Tier 0
    prazo: 2026-10-17
pendencias_resolvidas:
  - pend-2026-09-17-prospect-risk-engine-sem-consumidor
---

# Handoff — interceptação da reincidência e união da evidência da Aula 1.2

**Sem feedback nesta data, por decisão do Tier 0.** Ausência de nota não é zero e não entra em média.
A calibração global fica para sessão própria.

## 1. O fio da sessão

Começou como continuidade operacional — reaplicar o núcleo, publicar o commit do Gemini — e virou uma
investigação sobre por que os mesmos erros se repetem. O percurso: **pagefile → PKO → arredondamento → união da
evidência → padrão linear-reativo → interceptação**. Cada etapa foi provocada por uma medição, e as três
viradas de rumo vieram de arbitragem do Tier 0, não de percepção do agente. Isso está registrado como o achado
central, não como nota de rodapé.

## 2. Entregas técnicas

### 2.1 Memória e reinício

Diagnóstico corrigido: **uso do pagefile não mede pressão de memória**. O commit pico estava em 37,81 GB contra
teto de 39,86 — 94,9%, folga real de 2,05 GB — enquanto o arquivo acusava 0,09 GB de uso, porque o Windows
*reserva* commit sem paginar. Pagefile fixado em 32 GB (inicial = máximo, eliminando expansão reativa), teto
para **63,86 GB**, verificado por gatilho de logon autolimpante.

A suíte integral exigiu **53,73 GB** — **13,87 GB acima do teto antigo**. Ela não era arriscada antes: era
impossível. Mas o teto novo sozinho não bastava — o pico bateu 100% mesmo com 32 GB, e só a poda da frota de
MCP (80 → 51 servidores) abriu a folga.

### 2.2 PKO isolado por portão de superfície

O isolamento do **cálculo** já existia e era bom. Faltava o da **exposição**: o controle era renderizado
incondicionalmente, sem variável de ambiente e sem flag. `NEXT_PUBLIC_PKO_DEV`, falha fechado, portão **dentro
do componente** para que todo ponto de uso futuro herde o isolamento. 6 → 13 testes.

### 2.3 União da evidência da Aula 1.2 com o motor bayesiano

Duas transcrições do mesmo documento coexistiam; **24 das 35 frequências do motor já existiam na fixture
canônica**. O motor passou a consumir `PAR_2_IP_APOS_CHECK` em vez de transcrever de novo, e ganhou o que só a
fixture tinha: **combos** (306,02 de 370,94 — o dado primário, contra a porcentagem arredondada) e
procedência declarada por valor.

**Nenhuma das duas era melhor que a outra** — a fixture vence em procedência, o motor em capacidade, e presumir
o contrário foi erro corrigido pelo Tier 0 em sessão.

### 2.4 Detector de instrumento parado

`scripts/ops/saude_da_malha.py`, impresso pelo `record_gate.py` — o canal que todo condutor já roda ao começar.
**Não mede nada de novo**: lê o que os instrumentos já gravam e transforma silêncio em número. Princípio:
**falhar aberto** — lastro ilegível é ALERTA, tarefa não consultável é `NÃO VERIFICADA`.

### 2.5 Interceptador de reincidência

`PreToolUse` sobre `Bash`, ativado em `~/.claude/settings.json`. Regras exigem memória prévia, detecção
sintática sem heurística e alternativa concreta. 20 testes, smoke test contra o comando real que falhou.

## 3. O achado central

**Das nove classes de erro desta sessão, sete já tinham memória gravada** — algumas havia duas semanas. Não foi
falha de aprendizado; foi falha de consulta. E o mesmo defeito apareceu em quatro escalas:

| Escala | Instrumento | Estado |
| :--- | :--- | :--- |
| Agente | 42 memórias gravadas | escritas, não aplicadas no momento da ação |
| Projeto | índice de pendências (15 abertas) | correto, e não consultado ao abrir a sessão |
| Malha | auditoria de calibração | lastro gravado 14 dias seguidos, não lido nos últimos cinco |
| Fornecedor | auditoria no Codex | caiu com a cota, **em silêncio** |

**Todos os instrumentos existiam. Nenhum era consultado no momento da decisão.**

A prova mais forte veio ao vivo: **a reincidência do heredoc ocorreu durante a construção do interceptador para
ela**, minutos depois de a memória ser gravada. Memória carregada no início compete por atenção; gatilho no
momento da ação não compete — acontece.

## 4. A métrica que inocentava o padrão

Duas medições dirigidas independentes dão a taxa de erro de ferramenta **abaixo** da base após os gatilhos
(3,1 contra 4,1 em `d86cbde0`; **2,7 contra 5,1** nesta sessão). Isso não refuta o padrão: **mede execução
quando o padrão é de escolha.** Uma ferramenta que executa perfeitamente a coisa errada conta como acerto.

O Tier 0 refinou o alvo: **intervenção é sintoma, reincidência é causa**. Hoje: 7 de 9 — 78%.

## 5. Calibração registrada

| Campo | Valor |
| :--- | :--- |
| `calibration_id` | `fee1823b-071a-4945-9dd0-9e3a2c89541d` |
| Padrão | `linear-reativo: ação no item sem perguntar de que classe ele é` |
| Corroborações | 5 feedbacks elegíveis, 4 sessões distintas |
| Portão estrutural | aprovado, sem override |
| Sequência / cadeia | 78 / `valid`, 79 registros |

**Previsão:** com o interceptador ativo, a reincidência de heredoc cai a zero em três sessões distintas, e a
proporção de feedbacks das famílias foco/periferia e linear/não-sistêmico cai abaixo de 38%.
**Falsificador:** se a proporção se mantiver ou subir, o alvo muda de disciplina do agente para restrição
estrutural de escopo.

Lastro do dia gravado e o detector fechou em *"Nenhum instrumento parado em silencio"* — **o alerta disse o que
fazer, foi feito, e ele apagou sozinho.**

## 6. Erros cometidos e corrigidos nesta sessão

1. Li pagefile ocioso como folga com o commit a 94,9%.
2. Afirmei não ter a Aula 1.2 sem rodar a busca; ela está em cinco formatos no repositório.
3. Atribuí 59 servidores MCP a "duas janelas da IDE"; era o **Antigravity 2.0**, que é o veículo.
4. Escrevi "terceira recorrência" contando à mão, com a fonte dizendo 38% — **dentro da resposta sobre o
   próprio padrão**.
5. Fui medir formatador e 361 arquivos depois de receber 12 lints: periferia com aparência de zoom out.
6. Reincidi no heredoc enquanto construía o interceptador para ele.
7. Três defeitos no detector de heredoc, pegos pelo teste antes de qualquer ativação.
8. `relative_to` estourava no detector de saúde — **ele quebrava ao descrever a falha**.

## 7. Estado para quem retomar

**Verificado:** 373/373 no simulador, 13/13 no detector, 20/20 no interceptador, `tsc` e `eslint` limpos,
cadeia do ledger íntegra, detector de saúde limpo.

**Não verificado:** o interceptador em operação real — ativado nesta sessão, vale a partir da próxima; OCR das
96 figuras restantes; build de produção e Lighthouse; o portão de 5 fases, que roda no commit.

**Primeiro comando da próxima sessão:** `python scripts/ops/record_gate.py` — agora ele mostra saúde da malha
**e** pendências. Foi não fazer isso que custou meio dia nesta.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** encerrar a sessão registrando a união da evidência, o isolamento do PKO, os dois mecanismos de sinal e a calibração do padrão linear-reativo.
