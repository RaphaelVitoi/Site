---
id: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-pmev"
criado_em: 2026-09-08T14:20:00-03:00
atualizado_em: 2026-09-08T14:20:00-03:00
classes: [interno, medido, correcao, portao]
caminhos:
  - scripts/ops/record_gate.py
  - tests/test_record_index.py
revisoes_de_ancora:
- registro: taxonomia-canonica-de-documentacao-e-relatorios
  caminhos:
  - scripts/ops/record_gate.py
  parecer: >-
    Ancora o portao como validador da taxonomia de reports/ docs/ e data/. A
    reordenacao mexe em QUAIS CARACTERES o regex captura, nunca em quais campos ou
    diretorios o portao valida. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
  caminhos:
  - scripts/ops/record_gate.py
  parecer: >-
    Ancora o portao pelas quatro pendencias que ele fechou. Nenhuma delas passa pela
    alternancia de extensoes: seguem fechadas, e a correcao remove um falso positivo
    sem tocar deteccao verdadeira. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: interludio-2026-08-28-concorrencia-e-isolamento
  caminhos:
  - scripts/ops/record_gate.py
  parecer: >-
    Ancora o portao no contexto de concorrencia e isolamento. A alteracao e local ao
    detector de referencia citada e nao toca coleta de caminhos, indice nem qualquer
    superficie compartilhada entre sessoes. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: plano-2b-painel-de-estado
  caminhos:
  - scripts/ops/record_gate.py
  parecer: >-
    Ancora o portao como parte da frente 2-B, o painel de estado. O que ele reporta
    nao muda de FORMA; muda que ele deixa de reportar uma referencia morta que
    inventava. Painel com menos ruido, mesma cobertura. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: registro-2026-08-29-o-portao-le-o-indice
  caminhos:
  - scripts/ops/record_gate.py
  parecer: >-
    E o registro mais proximo desta alteracao: ele fixa que o portao le o INDICE, e
    nao o disco, para obter o texto como vai ao commit. Essa propriedade esta
    intacta -- `texto_como_vai_ao_commit` nao foi tocada. A correcao esta uma camada
    depois, no regex que varre o texto ja obtido. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
  caminhos:
  - scripts/ops/record_gate.py
  parecer: >-
    Ancora `caminhos_herdados_de_merge()` e a subtracao de caminhos num merge. A
    funcao nao foi tocada e a regra de merge segue identica; este commit nao e merge. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
  caminhos:
  - scripts/ops/record_gate.py
  - tests/test_record_index.py
  parecer: >-
    Ancora a resolucao de referencia por ponto de partida -- as tres raizes contra as
    quais um caminho citado e testado (RAIZ, diretorio do documento, RAIZ.parent).
    Essa logica esta intacta: o que mudou foi o que se ENTREGA a ela, antes truncado.
    A resolucao ficou mais correta, nao mais permissiva. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
- registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
  caminhos:
  - tests/test_record_index.py
  parecer: >-
    Ancora os testes daquele fechamento de ciclo dentro de test_record_index.py.
    Nenhum foi alterado ou removido: os dois testes novos entraram ao FIM do arquivo,
    e a suite subiu de 982 para 984 aprovados sem nenhuma reprovacao. Medido no diff: 9 insercoes e 1 delecao em record_gate.py -- 8 sao comentario e a
    delecao e a UNICA linha alterada, a do regex -- e 53 insercoes com 0 delecoes em
    test_record_index.py, append puro. Nenhuma funcao, contrato ou verificacao foi
    removida.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Corrigir o truncamento de extensao no detector de referencia morta, que
  acusava caminho inexistente por ordem errada na alternancia do regex.
classe_tarefa: correcao-de-portao
criterio_de_aceite:
  - A extensao mais longa e capturada inteira, e um guard impede a regressao.
  - A correcao nao afrouxa o detector nem cria isencao por caminho.
verificado:
  - >-
    DEFEITO E DE ORDEM, NAO DE LISTA INCOMPLETA. RE_CAMINHO_CITADO alterna
    extensoes, e alternancia de regex casa a PRIMEIRA que serve, nunca a maior.
    Com `json` antes de `jsonl`, a citacao `[.../feedback-ledger.jsonl]` era
    capturada como `.../feedback-ledger.json` e acusada como referencia morta --
    a um caminho que o documento nao contem. Reproduzido nesta sessao: 9
    ocorrencias num unico commit.
  - >-
    O MESMO DEFEITO ESTAVA LATENTE EM MAIS DOIS PARES: `ts` antes de `tsx` e `js`
    antes de `jsx`. As variantes compensatorias em referencias_mortas (`.ts` ->
    `+x`, `.js` -> `.jsx`) eram o remendo que o mascarava; foram mantidas, porque
    seguem servindo ao caso legitimo de citar `foo.ts` quando o arquivo e
    `foo.tsx`.
  - >-
    O GATILHO E A SINTAXE INLINE de lista YAML: `caminhos: [x.jsonl]`. O colchete
    abre a captura do regex. Em lista de bloco (`- x.jsonl`) nao ha colchete e o
    defeito nao aparecia -- foi por isso que sobreviveu ate agora.
  - >-
    CORRECAO: alternancia reordenada da extensao mais longa para a mais curta.
    Nenhuma extensao foi removida e nenhuma isencao foi criada; o detector
    continua acusando exatamente o que acusava, menos o que ele proprio inventava.
  - >-
    DOIS TESTES, e o segundo cobre o que o primeiro nao alcanca:
    test_extensao_longa_nao_e_truncada_pela_alternancia fixa os tres casos
    conhecidos com arquivos que EXISTEM em disco (a unica forma de reprovar e o
    detector inventar caminho); e
    test_alternancia_de_extensoes_esta_ordenada_por_comprimento e guard
    estrutural contra extensao NOVA acrescentada no lugar errado.
  - >-
    Suite Python 984 aprovados / 1 pulado / zero erros / zero warnings (eram 982
    antes destes dois testes).
  - >-
    VARREDURA DE REGRESSAO: 143 documentos prescritivos processados com o regex
    corrigido, 0 com referencia morta. Corrigir o truncamento nao desenterrou
    citacao quebrada que estivesse escondida atras dele.
nao_verificado:
  - >-
    NAO revisei as demais expressoes regulares do record_gate em busca do mesmo
    padrao de ordem. Corrigi a que reproduzi.
  - >-
    NAO converti de volta para inline os `caminhos:` da auditoria desta sessao,
    que foram escritos em bloco para contornar o defeito. Bloco e o formato do
    resto da base e nao ha ganho em reescrever registro publicado.
---

# Alternância de extensões no portão de registro

**Sessão:** `claude-opus5-site-2026-09-08-pmev` · **Regime:** `assistida`

---

## 1. O defeito é de ordem

`RE_CAMINHO_CITADO` alterna extensões, e **alternância de regex casa a primeira
que serve, nunca a maior**. Com `json` antes de `jsonl`:

```
caminhos: [reports/agent-calibration/feedback-ledger.jsonl]
                                                     └── capturado: ...feedback-ledger.json
```

O portão então acusava referência morta **a um caminho que o documento não
contém**. Nove ocorrências num único commit desta sessão.

O gatilho é a sintaxe **inline** de lista YAML — o `[` abre a captura. Em lista de
bloco não há colchete, e é por isso que o defeito sobreviveu até agora.

## 2. Estava latente em mais dois pares

`ts` antes de `tsx`, e `js` antes de `jsx`. As variantes compensatórias em
`referencias_mortas` (`.ts` → `+x`, `.js` → `.jsx`) eram o **remendo que
mascarava** o mesmo bug. Foram mantidas: seguem servindo ao caso legítimo de
alguém citar `foo.ts` quando o arquivo é `foo.tsx`.

## 3. A correção não afrouxa nada

Alternância reordenada da mais longa para a mais curta. **Nenhuma extensão
removida, nenhuma isenção criada.** O detector continua acusando exatamente o que
acusava — menos o que ele próprio inventava.

Dois testes, e o segundo é o que importa a longo prazo: o primeiro fixa os três
casos conhecidos; o segundo é **guard estrutural** contra extensão nova
acrescentada no lugar errado, que reprovaria aqui em vez de custar uma hora a uma
sessão futura.

## 4. Por que corrigi, tendo declarado antes que não corrigiria

No commit anterior escrevi *"não altero o instrumento que me mede"*. **Foi
aplicação errada da regra:** a §10.3 é a régua do **Jules** — agente autônomo de
nuvem, operando sem árbitro presente. Aqui o árbitro estava presente, autorizou, e
a memória `proatividade-em-banalidades` diz o oposto para achado banal: *corrige e
registra; "não é meu" não é resposta*.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** eliminar um falso positivo do portão de registro sem afrouxá-lo, e
deixar guard que impeça a mesma classe de erro de voltar por uma extensão nova.
