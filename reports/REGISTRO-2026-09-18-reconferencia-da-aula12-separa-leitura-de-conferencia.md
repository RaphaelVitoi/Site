---
id: registro-2026-09-18-reconferencia-da-aula12-separa-leitura-de-conferencia
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-18T19:40:00-03:00'
atualizado_em: '2026-09-18T19:40:00-03:00'
classes: [interno, medido, governanca, simulador, pmev]
caminhos:
  - reports/REGISTRO-2026-09-18-reconferencia-da-aula12-separa-leitura-de-conferencia.md
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - frontend/src/components/simulator/solver/evidencia/aula12Pairs.ts
  - frontend/src/components/simulator/solver/__tests__/evidenceContract.test.ts
  - frontend/src/components/simulator/solver/__tests__/aula12Evidence.test.ts
  - frontend/src/tests/simulator/aula12PairsJson.test.ts
  - engine/pmev_aula12_evidence.py
  - scripts/ops/gerar_reconferencia_aula12.py
  - tests/test_reconferencia_aula12.py
  - data/aula12_pairs.json
  - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
config_medida:
  raiz: /home/user/Site
  branch: claude/project-thread-hb7p1y
  commit_base: 7dfdb32
  host: Linux 6.18.44-fc-v33 -- conteiner de agente, sem Windows PowerShell 5.1
  data_das_medicoes: 2026-09-18
verificado:
  - os 14 rotulos de no dos sete pares aparecem literalmente na extracao de texto da versao vigente
  - as 11 grandezas de contexto declaradas em texto seguem identicas -- pote, stacks, RPs, BTN RFI e as cinco frequencias de defesa do BB
  - text_sha256 de S08.txt bate com o declarado em sources.json quando lido com CRLF; com LF nao bate, e a diferenca e normalizacao de fim de linha
  - o docx vigente no Drive tem 31329198 bytes, os mesmos que sources.json declara para b3fc15ba
  - figura ChipEV = no + 6 e figura ICMev = no + 7 valem nos sete pares, sem excecao
  - duas divergencias de vizinhanca de rotulo, nenhuma de valor -- PAR_6 no 17 alem do 21, PAR_7 numero de no 13 duplicado
  - espelho JSON identico ao fixture TypeScript, conferido pelo transpilador em scripts/ops
  - 51 testes Python verdes em 4 arquivos, zero erros e zero warnings
  - 109 testes Jest verdes nas tres suites afetadas
  - os tres arquivos de teste TypeScript e os dois de producao passam no tsc --strict
nao_verificado:
  - as figuras -- nenhuma frequencia, combo ou sizing dos sete pares foi reconferida contra a fonte
  - a ordem real de insercao das figuras no docx vigente
  - os parametros de arvore das figuras 01 a 04 -- premiacao, sizings do HRC por street, stacks por assento, bubble factors
  - e-Nash, ausente por propriedade da fonte
  - portao de 5 fases do pre-commit -- cwv_gate.ps1 exige Windows PowerShell 5.1, CDP na 9222 e dev server na 3000
  - suite integral dos dois lados -- o conteiner nao tem node_modules do projeto nem o venv declarado
pendencias:
  - id: pend-2026-09-18-reler-as-catorze-capturas-da-aula12
    o_que: Reler as 14 capturas dos sete pares no docx vigente b3fc15ba e transcrever os parametros de arvore das figuras 01 a 04; so entao acrescentar 'figuras' a camadasAlcancadas e reancorar documentSha256
    dono: Tier 0
    prazo: 2026-10-18
  - id: pend-2026-09-18-ambiguidade-do-par6-mais-larga
    o_que: Arbitrar a atribuicao de image45.png entre os nos 15, 17 e 21, e do numero de no 13 duplicado que afeta o PAR_7 -- ambas as notas de ATRIBUICAO_AMBIGUA_NODELOCK estao subdimensionadas
    dono: Tier 0
    prazo: 2026-10-18
pendencias_resolvidas:
  - pend-2026-09-18-reancorar-aula12-na-versao-atual
---

# A reconferência da Aula 1.2 separa leitura de conferência

A pendência `pend-2026-09-18-reancorar-aula12-na-versao-atual` pedia três coisas:
conferir os sete pares contra o `Aula 1.2.docx` vigente, transcrever os
parâmetros de árvore das figuras 01 a 04 e re-ancorar o `documentSha256`. Duas
delas exigem ler as imagens, e as imagens não estavam ao alcance. A primeira foi
feita até onde o substrato permite, e o resíduo virou campo executável em vez de
prosa.

## 1. A âncora não foi trocada, e isso é o resultado

`AULA_1_2_SHA256` continua em `7ca7c89f`. O arquivo em disco é `b3fc15ba`,
editado em 2026-09-02/03 — depois da transcrição. O SHA antigo não resolve mais.

**Trocá-lo teria sido uma linha em cinco arquivos, e a suíte ficaria verde.** Não
foi feito porque o campo afirma *de qual documento estes números foram lidos*, e
os números vivem nas 84 capturas. Apontá-lo para uma versão cujas capturas
ninguém releu declara uma leitura que não aconteceu.

O caminho escolhido pelo Tier 0 foi separar as duas perguntas:

| Pergunta | Campo |
| :--- | :--- |
| De qual documento estes números foram lidos? | `EvidenceSource.documentSha256` |
| Alguém já os conferiu contra a versão vigente, e até onde chegou? | `EvidenceReconference` |

## 2. O substrato, e por que ele é honesto

O `.docx` não está neste ambiente. O que está é a **extração de texto fiel da
versão vigente**, versionada no próprio repositório:
`reports/curation/pmev-2026-09-09/text/S08.txt`, sob a entrada `S08` de
`sources.json`.

Ela é íntegra, e isso foi medido antes de ser usada: o `text_sha256` declarado
bate dígito a dígito quando o arquivo é lido com **CRLF**. Com LF dá outro hash —
`328ac6a5` contra `3c8ce512` —, e a diferença é normalização de fim de linha do
checkout, não corrupção. Um leitor apressado teria concluído que a extração
estava corrompida e descartado a única evidência disponível da versão vigente.

**O limite é duro e está declarado:** 1.489 palavras e `media: 0`. Texto alcança
rótulo, numeração e o contexto que o documento declara em palavras. Não alcança
um único valor transcrito.

## 3. O que a reconferência achou

| Resultado | Medição |
| :--- | :--- |
| Rótulos de nó | **14 de 14** literais, mesma redação e mesmo número |
| Grandezas de contexto em texto | **11 de 11** idênticas |
| Inserções de figura | 97 nas duas versões |
| Parágrafos | 311 na lida, 329 na vigente |
| Divergências | **2**, ambas de vizinhança de rótulo |
| Valores reconferidos | **zero** |

As duas divergências não são de dado, são de atribuição, e ambas alargam
ambiguidades que o fixture já registrava:

1. **PAR_6** — a nota nomeia só o nó 21 como legenda concorrente de
   `image45.png`. A versão vigente traz a mesma redação também no **nó 17**.
2. **PAR_7** — o número de nó `13` aparece **duas vezes**: na âncora ChipEV do par
   e de novo entre o nó 92 e as conclusões do ICMev, onde quase certamente é `93`
   com o dígito perdido.

Nenhuma das duas se resolve por leitura; as duas são arbitragem do autor da
fonte, e por isso abrem pendência em vez de virarem correção.

**Um achado a favor da transcrição, que não é conferência e está rotulado como
tal:** `figura ChipEV = nó + 6` e `figura ICMev = nó + 7` valem nos sete pares
sem exceção. Um índice errado quebraria o padrão. É coerência interna do fixture,
não conferência contra a fonte, e o registro diz isso nas duas pontas.

## 4. A regra virou executável nos dois lados

O defeito que isto impede é de uma classe que nenhuma outra verificação pega: o
dado continua internamente coerente enquanto mente sobre a própria origem.

| Estado da âncora | Alcançou figuras | Veredito |
| :--- | :--- | :--- |
| versão antiga | não | correto — é o estado honesto |
| versão antiga | sim, sem divergência | `RECONFERENCE_ANCHOR_STALE` (warning): reancorar é devido |
| versão nova | sim | correto — a releitura sustenta |
| versão nova | **não** | `RECONFERENCE_ANCHOR_UNSUPPORTED` (**error**) |

TypeScript: `EvidenceReconference`, `ReconferenceLayer` e `validateReconference`
em `evidenceContract.ts`. Python: `Reconference.ancora_sustentada`, e
`load_reconference` que **falha fechado** — espelho sem o bloco é erro, não
ausência benigna.

O consumidor real, como a §6.5 exige: `aula12Evidence.test.ts` valida a
reconferência contra os sete pares reais, `aula12PairsJson.test.ts` guarda o
espelho, e `tests/test_reconferencia_aula12.py` remede os 14 rótulos contra a
extração a cada corrida — o achado central deixa de ser afirmação de relatório e
passa a ser teste.

## 5. Um arquivo novo em `scripts/ops/`, declarado

`scripts/ops/gerar_reconferencia_aula12.py` transpila o literal
`RECONFERENCIA_AULA_1_2` do fixture para JSON, porque o espelho não se edita à
mão e os hosts de agente não rodam o gerador oficial — que, medido, **não existe
no repositório**, embora `aula12PairsJson.test.ts` o mencione.

Ele cobre um bloco só e não toca nos sete pares. **Não altera portão algum:** não
encosta em `cwv_gate.ps1`, `record_gate.py` nem `.husky/`. A §10.3 nomeia
`scripts/ops/` entre os lugares que um agente autônomo não altera, e este
registro declara a adição em vez de deixá-la passar como rotina — quem a
considerar indevida a remove, e o espelho volta a ser gerado de fora.

## 6. O que não rodou

Declarado pela §5, e a lista importa mais que a verde:

- **O portão de 5 fases não rodou.** `cwv_gate.ps1` exige Windows PowerShell 5.1,
  CDP na 9222 e dev server na 3000; nada disso existe neste contêiner. Esta
  branch entra na malha por merge local revisado, onde o `pre-commit` roda de
  fato.
- **A suíte integral não rodou** dos dois lados. O contêiner não tem o
  `node_modules` do projeto nem o venv declarado. O que rodou foram as suítes
  afetadas, em ambientes montados para isto: 51 testes Python (Python 3.12, venv
  avulso) e 109 testes Jest, todos verdes, mais `tsc --strict` limpo nos cinco
  arquivos TypeScript tocados.
- **Nenhum valor dos sete pares foi reconferido**, e a pendência que fica diz
  exatamente o que falta para que seja.
