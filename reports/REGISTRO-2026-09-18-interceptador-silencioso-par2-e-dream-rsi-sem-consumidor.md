---
id: registro-2026-09-18-interceptador-silencioso-par2-e-dream-rsi-sem-consumidor
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-18T01:10:00-03:00'
atualizado_em: '2026-09-18T01:10:00-03:00'
classes: [interno, medido, governanca, simulador]
caminhos:
  - reports/REGISTRO-2026-09-18-interceptador-silencioso-par2-e-dream-rsi-sem-consumidor.md
  - reports/HANDOFF-2026-09-17-interceptacao-da-reincidencia-e-uniao-da-evidencia.md
  - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
  - engine/pmev_dream_bridge.py
  - engine/discovery_recorder.py
  - engine/dream_replay_simulator.py
  - conductor/dream_gate.py
  - task_executor.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: d8e446e3
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-18
verificado:
  - interceptador PreToolUse em operacao real -- barrou heredoc proposital depois da correcao do caminho
  - causa da falha silenciosa reproduzida pelo mesmo shell -- caminho reduzido a C:Usersrapha.gemini, command not found
  - teste de contrato que trava a classe (hook com barra invertida), provado com isca que reprova e real que aprova
  - SHA-256 dos dois .docx da Aula 1.2 no repositorio difere do SHA da versao transcrita na fixture
  - consumidores dos 7 modulos Dream-RSI por import e por mencao textual, fora dos testes
  - push de d8e446e3 com suite integral -- 0 erros, 0 warnings, 1 nao executado
nao_verificado:
  - de qual dos dois .docx foram extraidas as imagens lidas em 2026-09-17; o indice de imagens nao registra SHA
  - se o Dream-RSI tem consumidor previsto e ainda nao ligado; a medicao e do codigo, nao da intencao
pendencias:
  - id: pend-2026-09-18-dream-rsi-sem-consumidor-no-runtime
    o_que: Ligar ao fluxo real, ou declarar como experimental, pmev_dream_bridge, discovery_recorder e dream_replay_simulator -- hoje so os testes os alcancam
    dono: Tier 0
    prazo: 2026-10-18
  - id: pend-2026-09-18-revogar-openrouter-vazada-em-uso
    o_que: Revogar no painel do OpenRouter a chave de digital c20c081d -- vazada em 2026-09-16, VIVA (HTTP 200 contra 401 do controle negativo) e em uso como OPENROUTER_API_KEY; criar a nova antes e atualizar HKCU
    dono: Tier 0
    prazo: 2026-09-19
pendencias_resolvidas:
  - pend-2026-09-17-auditoria-de-calibracao-com-dono-unico
  - pend-2026-09-17-gatilho-de-calibracao-nao-avisa
  - pend-2026-09-16-remover-pytest-cache-travado
  - pend-2026-09-17-barreira-de-hooks-inexistente
  - pend-2026-09-16-revogar-credenciais-vazadas
  - pend-2026-09-12-scope-da-sequencia-11
  - pend-2026-09-12-outlier-7e5ca052
  - pend-2026-09-16-lldb-dap-ausente
  - pend-2026-09-17-metrica-de-escolha-nao-de-execucao
  - pend-2026-09-16-confiar-workspace-na-extensao
  - pend-2026-09-13-frontend-src-projects
  - pend-2026-09-16-branch-local-submodule-ownership
  - pend-2026-09-17-evidencia-fora-de-fixtures
revisoes_de_ancora:
  - registro: auditoria-2026-09-12-proveniencia-executavel-do-feedback
    caminhos:
      - CLAUDE.md
    parecer: "A unica alteracao no CLAUDE.md e o ultimo paragrafo da secao 8.1.1 (barreira de hooks). A proveniencia executavel do feedback vive na secao 8.3, que nao foi tocada; o que este registro atesta segue valido."
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: "Alteracao restrita a secao 8.1.1: troca a barreira de hooks que nao existia pelo estado medido e registra o interceptador de reincidencia. Nao toca a infraestrutura nem a paridade de governanca que este checkpoint registra."
  - registro: handoff-2026-09-12-reconciliacao-calibracao-e-proveniencia
    caminhos:
      - CLAUDE.md
    parecer: "Nenhuma regra de calibracao, portao de suficiencia ou proveniencia da secao 8.3 mudou. A alteracao e so o paragrafo final da secao 8.1.1, sobre hooks."
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: "Alteracao restrita a secao 8.1.1, sobre a barreira de hooks. A harmonizacao V8.0 GOLD auditada por este relatorio nao depende desse paragrafo."
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: "A taxonomia de relatorios, documentacao e memoria (secao 9) nao mudou. A alteracao e o paragrafo final da secao 8.1.1, sobre hooks."
---

# Interceptador silencioso, correção sobre o par 2, e Dream-RSI sem consumidor

## 1. O interceptador que parecia ativo e não rodava

O handoff de 2026-09-17 declarou o interceptador de reincidência **ativado** e listou como não verificado apenas
*"o interceptador em operação real"*. Na abertura desta sessão, uma isca — um heredoc proposital — **passou**.

A causa, reproduzida pelo mesmo shell que o host usa:

```
bash: line 1: C:Usersrapha.gemini.venvScriptspython.exe: command not found
```

O comando do hook foi gravado com barras invertidas. O Claude Code executa hooks num shell POSIX, onde barra
invertida é escape: o caminho virou `C:Usersrapha.gemini...`, o comando falhou em **toda** chamada, e a falha de
hook é **não bloqueante** — a ferramenta seguia normalmente. Configuração presente, script correto, testes
verdes, smoke test aprovado, e o interceptador **nunca executou uma vez**.

Corrigido com barras normais; uma segunda isca foi barrada com o motivo, a alternativa e a memória. O host
recarregou a configuração sem reiniciar a sessão.

**Por que o smoke test de ontem não pegou:** ele invocava o script com `sys.executable` e caminho de objeto
`Path` — o caminho certo. Testou o **script**, não o **comando que o host roda**. É a mesma distância entre o
instrumento e o que ele mede que a memória `conferir-o-instrumento-antes-da-medicao` descreve.

**A classe, não o caso:** `test_comando_de_hook_nunca_usa_barra_invertida`, no contrato do núcleo da raiz, lê
todo hook declarado no escopo de usuário e reprova barra invertida. Provado com isca (settings falso com barra
invertida reprova) e contra o real (aprova). O hook foi registrado no núcleo compartilhado, que a sessão
anterior havia contornado ao declará-lo direto no `settings.json`.

## 2. Correção: a leitura da figura 8 não encolhe a pendência da recaptura

Em 2026-09-17 afirmei que a leitura independente da figura 8 *"refuta a pendência para o par 2"*. **Estava
errado**, e a afirmação teria encolhido uma pendência que não encolheu:

- `pend-2026-09-13-recaptura-aula12` trata de **reprodutibilidade do solver** — resolver o spot de novo no HRC e
  no GTO Wizard e capturar build e ε-Nash. Reler uma captura não resolve spot nenhum.
- A transcrição canônica declara o documento `7ca7c89f…`. Os dois `.docx` presentes no repositório têm SHA
  `e0087b4d…` e `b3fc15ba…`. **Nenhum é a versão transcrita.**

O que a leitura mostra, e só isso: **a figura 8 de uma versão posterior do documento traz os mesmos dígitos da
versão transcrita**, inclusive os combos. É estabilidade daquela figura entre versões — evidência fraca de que a
transcrição não divergiu do material vigente, e nenhuma evidência de reprodutibilidade.

**A pendência permanece em 0 de 7.** Registro também a consequência: desde `0b5332ac` o motor bayesiano consome
em produção uma evidência cuja versão de origem não está disponível. Isso já estava implícito na pendência; fica
agora explícito para quem ler o motor.

## 3. Dream-RSI: capacidade entregue com testes e sem consumidor no fluxo real

Os commits `43b8618a` a `d8e446e3` integraram o Dream-RSI em sete módulos. Consumidores medidos por import e por
menção textual, excluídos os testes e o próprio registro:

| Módulo | Consumidor fora dos testes |
| :--- | :--- |
| `conductor/dream_gate.py` | **`task_executor.py:235`** — grava metadado da tarefa |
| `core/discovery_tree_schemas.py` | os demais módulos do Dream-RSI (tipos) |
| `core/exploration_policy.py` | `dream_replay_simulator` |
| `engine/dream_timesfm_forecaster.py` | `exploration_policy` |
| `engine/dream_replay_simulator.py` | `discovery_recorder` |
| `engine/discovery_recorder.py` | **nenhum** |
| `engine/pmev_dream_bridge.py` | **nenhum** |

**Só o `dream_gate` está ligado ao runtime.** A cadeia recorder → replay → política → previsor é alcançada
apenas pelos testes, e a ponte com o PMev também. Pela §6.5 do `CLAUDE.md`, capacidade sem consumidor no fluxo
real é código órfão ou fachada — **o que a medição não decide é se é o caso aqui ou trabalho em andamento**,
como a sessão da Aula 1.2 estava ao ser publicada. Fica como pendência, não como veredito.

## 4. Pendências encerradas por delegação do Tier 0

**Delegação de 2026-09-18:** *"delego as resoluções de tds as pendencias a vc. padrão ouro."* Cada
encerramento abaixo tem o motivo medido; nenhum foi fechado por conveniência.

| Pendência | Desfecho | Evidência |
| :--- | :--- | :--- |
| `auditoria-de-calibracao-com-dono-unico` | **resolvida** | detector corrigido para medir o `.md` da auditoria, não a data da calibração (o proxy havia calado o alarme com a auditoria parada desde 09-13); failover exercido — auditoria de 2026-09-18 escrita por outro condutor; detector limpo pelo motivo certo |
| `gatilho-de-calibracao-nao-avisa` | **resolvida** | portão aberto aparece no canal que todo condutor roda (`record_gate.py`), coberto por `test_portao_aberto_aparece_com_a_contagem_de_sessoes` |
| `remover-pytest-cache-travado` | **resolvida** | pasta de dono `BUILTIN\Administradores` removida em sessão elevada; não volta: o `pyproject.toml` desliga o cache (`-p no:cacheprovider`) |
| `barreira-de-hooks-inexistente` | **resolvida** | §8.1.1 reescrita para o estado medido; entrada inexistente removida do núcleo; contrato do núcleo 9/9 |
| `revogar-credenciais-vazadas` | **dividida** | Google vazada (`d36e5d3e`) **revogada** — 401, instrumento validado por controle negativo e positivo; 31 ocorrências de 11 credenciais mortas saneadas em disco. OpenRouter vazada segue **viva e em uso** → sucessora `pend-2026-09-18-revogar-openrouter-vazada-em-uso` |
| `scope-da-sequencia-11` | **reconciliada: inelegível permanente** | o id da sessão não aparece em relatório algum; o candidato provável não tem frontmatter nem cita a sessão. A §8.3 proíbe inferir o vínculo — o registro fica retido como histórico |
| `outlier-7e5ca052` | **reavaliado** | contexto semelhante ocorreu (triagem de segurança); contramedida parcialmente comprovada; reavaliação retida no ledger de outliers como `4e9af621` (sequência 13) |
| `lldb-dap-ausente` | **resolvida** | LLVM 23.1.1 instalado via winget; `lldb-dap.executable-path` apontado no `.vscode/settings.json` do projeto, sem expor `clang` no PATH global; binário executa. **Não verificado:** sessão de depuração completa |
| `metrica-de-escolha-nao-de-execucao` | **encerrada por arbitragem** | o Tier 0 descartou em 2026-09-17 a linha de métrica por reincidência (*"acho que não precisamos mais de reincidência"*); a calibração `fee1823b` adotou outras métricas |
| `confiar-workspace-na-extensao` | **resolvida** | três chaves no `~/.claude.json` para a mesma pasta, variando só a grafia; a `c:/` minúscula sem confiança. `scripts/ops/alinhar_confianca_do_workspace.py` estende confiança **só** a chave cuja pasta já era confiada em outra grafia — alinhou também `C:/Users/rapha`, já confiada. **Não verificado:** persistência depois que sessões abertas reescreverem o arquivo |
| `frontend-src-projects` | **resolvida** | 125 arquivos (112 `.md`, 12 `.png`, 1 `.html`), zero consumidores, zero padrões de credencial. Preservados byte a byte em `remediacao_backup_aplicado\site-frontend-src-projects-20260918\` (impressão do conjunto `9cb088d1…` igual à versionada) e removidos da árvore pública. Histórico **não** reescrito (§2.4 da raiz). A única referência de código era um guarda que exige que `subagents/` não esteja versionado — segue verde, 18/18 |
| `branch-local-submodule-ownership` | **decidida: arquivar, não mesclar, não apagar** | 1.980 arquivos tocados, 1.928 inexistentes no master — quase todos `core/vendor/eigen`, vendorização que o master rejeitou; ~20 arquivos de trabalho único (auditorias de 22/08, manifestos editorial e de cenários, contrato de ambiente). Bundle verificado de 3,7 MB em `remediacao_backup_aplicado\`. **Limite:** a cópia não sai deste disco — a área de rollback é ignorada pela raiz por desenho e o remoto do `Site` é público |

| `evidencia-fora-de-fixtures` | **resolvida** | `aula12Pairs.ts` movido de `solver/__fixtures__/` para `solver/evidencia/` — o arquivo não é fixture de teste, é o conjunto de evidência canônico (SHA, dupla leitura cega) e já era consumido por código de produção. Atualizados 5 imports TS, a documentação da ponte, o docstring do motor Python, o teste Python e os metadados de caminho do espelho `data/aula12_pairs.json` (o teste de paridade confere pares e SHA, que não mudaram). `tsc` limpo, 117/117 em 6 suítes TS, 13/13 no Python. Os registros históricos que citam o caminho antigo **não** são reescritos; o commit os revisa por âncora |

### A pendência de credenciais revelou três erros de instrumento

Registrados porque o risco era alto: todos teriam levado a conclusão de segurança errada.

1. O endpoint `generativelanguage` respondia `ACCESS_TOKEN_TYPE_UNSUPPORTED` a toda chave `AQ.` — não media nada.
2. Uma função auxiliar engolia o `stderr` do `gcloud` e devolvia vazio, lido como "nenhuma chave".
3. O endpoint do Stitch responde **200 no `initialize` e no `tools/list` até para chave inventada**. Só o
   `tools/call` discrimina (401 contra 200). Isso invalida também a afirmação de 2026-09-17 de que a chave
   Stitch atual "funciona porque responde 200" — nada foi provado naquele dia além da diferença de digitais.

Nenhuma ação de revogação ou saneamento foi tomada antes do controle negativo validar o instrumento.

## 5. Verificação declarada

Rodou: duas iscas do interceptador (antes e depois da correção), reprodução da falha pelo shell do host, teste
de contrato com isca, SHA-256 dos dois documentos, busca de consumidores por import e por string, push com
suíte integral (`0 erros / 0 warnings`, 1 não executado — `test_arvore_superada_do_repositorio_fica_fora`, sem
árvore superada a excluir).

Não rodou: identificação de qual `.docx` originou as imagens de 2026-09-17, e qualquer leitura da intenção por
trás do Dream-RSI.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** fechar o não verificado do handoff anterior com o que a isca revelou, corrigir uma afirmação que teria encolhido uma pendência indevidamente, e tornar visível a capacidade sem consumidor.
