# HANDOFF LATEST — procedência de solve, e o que o Tier 0 ensinou no meio da construção

**Data:** 2026-09-03 · **Protocolo:** Chico SOTA v8.0 GOLD · **Estado:** commitado em `4d89a192`, **1 ahead de origin**.
**Sessão:** `claude-opus5-site-2026-09-03-procedencia` · **Assinatura individual:** Claude Opus 5 [Tier 1.B]

---

## A primeira coisa: a ordem da prioridade 1 foi invertida, com autorização

O prompt de continuação mandava **recapturar o HRC**. A medição inicial mostrou que
fazê-lo primeiro produziria dado sem destino: nem `EvidenceScenario` (TS) nem
`NormalizedGameTree` (Py) tinham onde guardar build ou e-Nash. A recaptura voltaria
com os campos na tela e o único destino seria prosa em comentário — exatamente o que
`evidenceContract.ts` existe para impedir.

O Tier 0 autorizou inverter, e confirmou que **o HRC exporta arquivo**. Isso muda a
natureza do alvo: export estruturado ataca a barreira real (transcrição de terceiro
contra medição própria), enquanto três campos a mais numa transcrição não atacariam.

---

## O que esta sessão entregou

**Procedência tipada nas duas camadas.** `SolverProvenance` como `Measured<T>` no TS e
modelo Pydantic no Python, com `build`, `eNash`, `eNashUnit`, `eNashLabel` e `engine`.

**O campo que era reconhecido e jogado fora.** `HRCProImporter.detect_format` reconhecia
`hrc_version` desde sempre — e a usava só para identificar o formato, **descartando o
valor**. O campo que o ledger exige era tocado e descartado no mesmo arquivo. Agora é
lido, do JSON e do cabeçalho de texto.

**A barreira virou número.** `assessReproducibility` e `countReproduciblePairs`
retornam **zero de sete** contra o mínimo de três do ledger, afirmado em teste.

> Não é teste a consertar. O número sobe quando o export chegar; quem o preencher sem
> o export terá inventado a evidência que o ledger exige.

---

## O que o Tier 0 ensinou, e que eu não teria acertado sozinho

| Correção | Consequência no código |
| :--- | :--- |
| Os rótulos que supus não existem — HRC usa `CI`, Pio usa `MES`, GTO Wizard usa `Nash Distance`/`dEV` | o extrator não acharia o campo real; rótulo nativo agora é guardado |
| A caixa-preta não é a teoria, são os **atalhos** de convergência | `build` virou âncora mecânica: atalho novo para em outro ponto com os mesmos inputs |
| Produto não é motor — a biblioteca do GTO Wizard **foi rodada no HRC** | campo `engine`, separado do produto |
| **Motor comum FORTALECE o par** | inverteu uma conclusão minha; ver abaixo |

### A inversão, que é o item mais importante daqui

Eu havia escrito que motor comum nos dois lados era risco. **O HRC calcula ChipEV além
de ICMev**, e a disputa em estudo é ChipEV × ICMev. Motor único deixa o regime como
única variável — isso é **controle experimental**. O confundidor é o contrário.

E como a biblioteca do GTO Wizard é HRC, **os sete pares existentes provavelmente já
têm motor comum**: o controle que eu disse faltar já estava lá, invisível porque a
procedência não tinha campo para expressá-lo. Falta conferir captura a captura, e o
discriminante está na tela — `CI` no painel indica biblioteca.

---

## Calibração — o portão está aberto E o padrão tem duas confirmações

Ledger `valid`, **9 registros**, **6 sessões distintas**, 0 faltantes, 0 com início
inconsistente. Média **8,50** · min 7,5 · máx 9,5 · `correcoes_aplicadas` 2.

| Sessão | Nota |
| :--- | ---: |
| `codex-site-2026-09-01-prioridade` | 7.5 |
| `claude-opus5-site-2026-09-02-integridade` | 8 (corrigida de `0.8`) |
| `claude-opus5-site-2026-09-02-pmev` | 9 |
| `gemini-flash-site-2026-09-02-mcp-curation` | 9.0 (corrigida de `9.5`) |
| `claude-opus5-site-2026-09-02-guarda` | 9.5 |
| `claude-opus5-site-2026-09-03-procedencia` | **8** |

**O feedback de 8:** *"Você não deveria me perguntar aquilo que é open source. Pelo
contexto, vc pode aferir que a fonte primária e muitas vezes mais fidedigna é
WebSearch avançado e inteligente."*

Agravante que registro contra mim: eu **considerei** pesquisar e decidi transferir a
ele, raciocinando que resolveria rápido abrindo o app. Quando finalmente busquei, a
fonte deu o que a pergunta não daria — `dEV` entrou no extrator, e a proibição de
comparar métricas entre solvers ganhou base documental em vez de cautela.

> **O padrão tem duas confirmações independentes, e isso é obrigação do auditor
> declarar.** Nota 8 de `...-pmev`: *executor único num repositório feito de 19
> agentes, delegar de fato*. Nota 8 desta sessão: *não usar WebSearch para o que é
> público*. Sessões diferentes, feedbacks independentes, **mesmo padrão operacional:
> subutilizar capacidade disponível e resolver pelo caminho mais estreito**.
>
> Com 6 sessões ≥ 3 e duas confirmações do mesmo padrão, as condições da §8.3 estão
> satisfeitas. **A calibração assistida pode ser proposta ao Tier 0** — e proposta é o
> limite: o portão estrutural nunca foi autorização.

---

## Ambiente — corrigindo o meu próprio prompt anterior

O handoff anterior dizia *"dev server Next.js em :3000 precisa estar no ar"*. **Isso é
insuficiente.** O dev server estava no ar nesta sessão e as fases 1 e 2 do portão
**não mediram assim mesmo**: `nenhuma porta CDP canonica respondeu`. O que elas exigem
é o **CDP**, não o dev server. As duas vagas de warning foram consumidas por isso.

---

## Pendências

| Item | Estado |
| :--- | :--- |
| Push de `4d89a192` | **1 ahead**, não empurrado |
| Recaptura do HRC | **prioridade 1**, agora com destino tipado pronto; preferir `ChipEV(HRC) × ICMev(HRC)`, mesmo build |
| Conferir captura a captura se o lado ChipEV é biblioteca ou AI | discriminante é o painel `CI`; não feito |
| Fases 1 e 2 do portão | **não mediram** — CDP ausente |
| `pyo3` 0.20.3 no `Cargo.lock` | única vulnerabilidade aberta sem aceite; fix 0.29.0, breaking |
| Arbitragem do nodelock | só Tier 0 |
| Portão mede working tree, não índice | achado da sessão anterior, **sem guarda** |
| Algoritmos no repo (CFR 45, Monte Carlo 31, DeepStack 3, Pluribus 3, Libratus 2) | **contados por grep**, integração não auditada |
| Duplicação `engine/llm_api.py` × `llm/anthropic.py` | aberta desde `HANDOFF-2026-08-27` |

---

## Regras que esta sessão fixou

- **Fato público é meu para buscar.** Reservar a pergunta ao Tier 0 para o que só ele
  sabe: o ambiente dele, a origem real dos dados, escopo, autorização.
- **Heredoc dentro de script Python tem escape duplo.** `[^\r\n]` virou quebra de linha
  real dentro da regex e o arquivo ficou quebrado. Escrever em arquivo literal com
  heredoc *quoted*, conferir os escapes, e só então inserir.
- **A suíte Python só vale pelo PowerShell.** Pelo Bash, 3 falsas falhas em
  `test_cwv_gate_truthfulness` — `subprocess.run` de PowerShell devolve `stdout=None`.
- **`pct` não é `pctOfPot`.** Ler `%` autoriza dizer que é percentual, e nada além.
