---
id: registro-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-18T12:30:00-03:00'
atualizado_em: '2026-09-18T12:30:00-03:00'
classes: [interno, medido, governanca, simulador, pmev]
caminhos:
  - reports/REGISTRO-2026-09-18-dream-rsi-ligado-aula12-localizada-e-bounty-a-iniciar.md
  - engine/discovery_recorder.py
  - engine/dream_replay_simulator.py
  - engine/pmev_dream_bridge.py
  - agents/execution.py
  - api/v1/handlers.py
  - scripts/cli/nexus.py
  - tests/conftest.py
  - tests/test_dream_rsi_consumidores.py
  - tests/test_dream_rsi_experimental.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 7e83a5b4
  host: Windows 11 Pro 10.0.26200
  data_das_medicoes: 2026-09-18
verificado:
  - nenhuma ref local ou remota importava os tres modulos fora de tests/ -- varredura com controle positivo, depois de corrigir a regex
  - executor grava desfecho de sucesso e falha; falha de gravacao nao derruba a tarefa e aparece no log
  - handler PMev grava a arvore e devolve o diagnostico sem alterar nenhum valor
  - banco em arquivo deixou de reter toda arvore em memoria; modo memoria segue retendo
  - nexus agent dream-optimize roda a fase de Sonho com a TimesFMPredictivePolicy sobre o banco real
  - suite redirecionada para banco temporario; data/discovery_tree.db real intocado pelos testes
  - 71 testes -- Dream-RSI, integracao anterior e CLI -- verdes; ruff check e format limpos
  - Aula 1.2.docx em Downloads com 84 imagens, 97 referencias em ordem; texto e imagens varridos
  - parametros da arvore legiveis nas figuras 01 a 04; e-Nash numerico ausente de texto e imagens
nao_verificado:
  - suite integral; roda no pre-push
  - conteudo interno dos saves .hrcz; o do spot exato da figura 04 nao esta no disco
  - se as frequencias dos 7 pares batem com a versao atual do docx -- e a pendencia aberta abaixo
pendencias:
  - id: pend-2026-09-18-reancorar-aula12-na-versao-atual
    o_que: Conferir os 7 pares contra Downloads/Aula 1.2.docx atual (sha b3fc15ba), transcrever os parametros de arvore das figuras 01 a 04 e re-ancorar documentSha256; e-Nash segue ilegivel porque a fonte nao o publica
    dono: Claude Opus 5
    prazo: 2026-09-25
pendencias_resolvidas:
  - pend-2026-09-13-recaptura-aula12
  - pend-2026-09-17-modelo-de-bounty-pko
---

# Dream-RSI ligado ao runtime, Aula 1.2 localizada, e bounty a iniciar

Três correções de rota do Tier 0 em 2026-09-18.

## 1. Dream-RSI: corrigido, não declarado experimental

*"Sobre o Dream-RSI integrado ao Times 2.0/2.5/3.0, ele deve ser corrigido, se nada o importa!"* A decisão
anterior (marcar como experimental) foi revertida no mesmo dia; o guard `test_dream_rsi_experimental.py` saiu.

O que estava desligado não eram três módulos, era o **laço inteiro**: ninguém gravava dado real, ninguém
rodava a fase de Sonho, e a `TimesFMPredictivePolicy` não tinha quem a avaliasse. A parte viva era só o
`DreamGate`, estático. Agora o laço fecha:

| Elo | Consumidor | Modo |
| :--- | :--- | :--- |
| entrada de dados | `agents/execution.py` grava o desfecho de toda tarefa (sucesso e falha) | fora do laço de eventos |
| PMev | `api/v1/handlers.py` grava cada árvore de `handle_simulate_perspective_tree` e anexa `summary.dream_rsi` | **observacional** — nenhum valor do PMev muda |
| fase de Sonho | `nexus agent dream-optimize` avalia `ParallelRefine`, `AdaptiveDream` e `TimesFMPredictive` sobre o histórico | CLI, como o `calibration-forecast` |

**A poda do PMev não decide nada.** Ela anexa quais ramos seriam podados; usar isso para escolher ação é
decisão matemática do Tier 0.

**Dois defeitos que a ligação expôs e que foram corrigidos junto:**

- **Vazamento sem teto.** `DreamReplaySimulator.record_tree` retinha cópia profunda de toda árvore em memória
  mesmo com banco em arquivo — que nada lia. Num worker de longa duração, com uma árvore por tarefa e por
  requisição, seria crescimento ilimitado. A cópia passou a existir só no modo `:memory:`.
- **Banco relativo ao diretório de lançamento.** `DEFAULT_DB_PATH` relativo gravaria onde o processo nasceu.
  O runtime usa `RUNTIME_DB_PATH`, ancorado na raiz do repositório.

**Hermeticidade:** `NEXUS_DISCOVERY_DB` redireciona o banco, e o `conftest` o aponta para um diretório
temporário por worker. Sem isso, todo teste que passa por `_finish_task_success` sujaria o histórico real.

**O que o histórico real contém, medido:** 364 árvores, todas de hoje entre 02:02 e 10:55 UTC — 142 de âncoras,
122 de testes e 100 de PMev, **semeadas** por `seed_initial_history`/`seed_pmev_history`. A fase de Sonho roda
hoje sobre dado sintético; o que entra a partir deste commit é real. Uma árvore gravada pela minha prova ponta
a ponta, com entrada inventada, foi removida do banco.

Travas: `test_dream_rsi_consumidores.py` reprova se qualquer dos três voltar a não ter consumidor de runtime,
e cobre cada elo, a falha barulhenta, o vazamento e o CLI.

## 2. Aula 1.2: a fonte existe — o que falta é propriedade dela

*"Sobre a aula 1.2, todos têm. Tem no drive, no repo e no C:. Só procurar."* A pendência de 09-13 afirmava
que *"a versão transcrita (sha 7ca7c89f) não existe mais"*. Medido:

- `Downloads/Aula 1.2.docx` existe, SHA `b3fc15ba`, **editado em 2026-09-02** — depois da transcrição. É o
  mesmo documento evoluído; o SHA antigo não existe porque o arquivo mudou, não porque sumiu.
- Também estão no Drive `Aula 1.2.docx`, `.pdf`, `.md` (33,9 MB) e `.zip`, e em `Downloads` uma cópia de 08-22.
- As 84 imagens (97 referências em ordem) trazem as estratégias do GTO Wizard e do HRC e — o que a pendência
  dava por ausente — **os parâmetros da árvore**: premiação (fig. 01), configuração de apostas do HRC por street
  (fig. 02), stacks por assento (fig. 03) e bubble factors (fig. 04).
- **e-Nash numérico não existe em lugar nenhum da fonte.** O texto diz, qualitativamente, que o HRC tem e-Nash
  menor. A aba `Progress` do HRC aparece recolhida na fig. 54.
- A fig. 04 nomeia o save `FT BTN 40 BB 55 vitoi.hrcz`, que não está no disco. Estão `OneDrive/PANTS/.../Aula
  3/FT BTN 40 BB 55.hrcz` (pré-flop) e `OneDrive/BOLHA BTN 40 BB 55 posflop.hrcz` (10,4 GB, bolha).

**Consequência:** `0 de 7 pares reproduzíveis` é propriedade da fonte, não falta de busca, e recapturar no
solver não é pré-condição para usar a evidência. A pendência `recaptura-aula12` fecha; abre a que é
executável e é minha — conferir os 7 pares contra a versão atual, transcrever os parâmetros de árvore e
re-ancorar o SHA.

## 3. Bounty do PKO: a iniciar, não aberta

*"Modelo de bounty é pendência até que EU abra o assunto. Em termos práticos, não está ABERTA. Está a iniciar
depois de tudo o que vem antes."* Sai da lista de abertas. O portão de registro não tem estado "a iniciar", e
criar um não se justifica para um item: quem o reabre é o Tier 0, declarando-o num registro novo quando decidir.
