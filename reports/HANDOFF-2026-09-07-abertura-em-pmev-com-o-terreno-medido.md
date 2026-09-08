---
id: handoff-2026-09-07-abertura-em-pmev-com-o-terreno-medido
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-pmev"
criado_em: 2026-09-07T22:45:00-03:00
atualizado_em: 2026-09-07T22:45:00-03:00
classes: [interno, medido, handoff, pmev, icm]
caminhos:
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - frontend/src/lib/perspectiva.ts
  - frontend/src/lib/icmMatrix.ts
  - frontend/src/lib/rpDeriver.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Abrir a proxima sessao direto no contraste ICMev x ChipEV com o terreno ja
  medido, em vez de gastar a abertura redescobrindo o que esta sessao mediu.
classe_tarefa: handoff-de-abertura-dirigida
criterio_de_aceite:
  - O portao de reprodutibilidade fica entendido como portao, com o campo exato que o abre.
  - As duas contaminacoes do contraste chegam com coordenada e leitura, nao so com codigo.
  - A proxima sessao nao repete preludio nem revalida agente externo.
verificado:
  - >-
    countReproduciblePairs(AULA_1_2_PAIRS) = 0 de 7, medido por execucao via tsx
    nesta data. E o valor ESPERADO: evidenceContract.ts:993 declara literalmente
    "ESTA FUNCAO RETORNA false PARA OS SETE PARES ATUAIS, E ISSO E O ESPERADO".
  - >-
    A LACUNA E UMA SO, E E SISTEMATICA. Os 14 lados (7 pares x 2 regimes) faltam
    exatamente o mesmo campo: `provenance`, ausente (undefined) em todos. Nao sao
    sete problemas distintos -- e uma unica coisa que o export do HRC precisa
    trazer. Quando `provenance` existir, camposDeProcedenciaFaltando ainda exige
    `build`, `eNash` e `eNashUnit` (a unidade so quando ha e-Nash lido).
  - >-
    B03 reproduzido: _buildSimulatedStacks em frontend/src/lib/perspectiva.ts:242
    produz massas 105/110/108 para o mesmo pote. A convencao CORRETA ja existe no
    repositorio, em engine/pmev_pipeline.py:84-91, escrita nesta data: stacks_win
    soma s_eff em i e subtrai em j, preservando a massa.
  - >-
    B06/F07 tem QUATRO implementacoes, nao duas, e o par TS/Python e consistente
    em cada formula. (bf-1)/(bf+1) vive em icmMatrix.ts:230 e
    engine/icm_matrix.py:124. (bf-1)/bf vive em rpDeriver.ts:58 e
    engine/vitoi_perspective_engine.py:199. Isso reenquadra o finding: nao e
    descuido de copia, sao DUAS GRANDEZAS sob o mesmo rotulo RP.
  - >-
    Estado do repositorio ao fechar: master em 04f9e189, sincronizado, working
    tree limpo. Portao de 5 fases 0 erros e 0 warnings, ancoras e registros
    aprovados, suite 979 aprovados / 1 pulado / zero warnings, tsc --noEmit
    exit 0.
nao_verificado:
  - >-
    NAO abri nenhum dos sete pares para ver o que a captura de terceiro traz de
    fato. Medi o que FALTA, nao o que existe -- quem for montar o export do HRC
    precisa dessa outra metade.
  - >-
    NAO decidi qual das duas formulas de RP e a correta, nem se ambas devem
    coexistir com nomes distintos. E decisao de dominio do Tier 0.
  - >-
    NAO medi o impacto numerico do B03 sobre o contraste. Sei que a massa nao se
    conserva; nao sei de quanto o delta de ICM se desloca por causa disso.
  - >-
    Os outros sete findings abertos do Astra (B05, B07, B08, B09, F03, F05, F06)
    seguem intocados.
---

# Handoff: abrir em PMev, com o terreno já medido

**Sessão:** `claude-opus5-site-2026-09-07-pmev` · **Regime:** `assistida`
**Publicado em:** `master`, `04f9e189`

---

## 1. O que esta sessão fechou

| Frente | Resultado |
| :--- | :--- |
| Prelúdio do ecossistema | 5 commits do Gemini medidos por leitura de código, não de resumo |
| `B04` — procedência do TimesFM | **fechado** (`2f0b034b`), com dois defeitos vizinhos junto |
| Suíte | estava vermelha no `master`; **restaurada** a 979 / 1 pulado / zero warnings |
| Promoção do duo Gemini | executada por decisão do Tier 0 (`04f9e189`) |
| Auditor Lighthouse | **exit 0** medido; ele nunca havia saído 0 |

**Não refaça nada disso.** Jules, Astra, Dependabot, Devin, Codex e o trabalho
do Gemini estão verificados e registrados.

---

## 2. O portão de reprodutibilidade: é portão, e abre com UMA coisa

`countReproduciblePairs(AULA_1_2_PAIRS)` = **0 de 7**, medido hoje.

O próprio código já resolve a dúvida, em `evidenceContract.ts:993`:

> *"ESTA FUNÇÃO RETORNA `false` PARA OS SETE PARES ATUAIS, E ISSO É O ESPERADO.
> Ela não é um teste que se conserta: é o portão que se abre quando o export do
> HRC trouxer o que a captura não trazia."*

**Não o conserte para destravar.** E a medição nova acrescenta o que faltava
saber: **a lacuna é uma só.** Os 14 lados — 7 pares × 2 regimes — falham pelo
mesmo motivo, `provenance` ausente. Não são sete problemas; é um.

Quando `provenance` existir, o contrato ainda cobra `build`, `eNash` e
`eNashUnit` (a unidade só quando há e-Nash lido — sem número, unidade não
descreve nada).

A distinção que o arquivo faz, e que precisa sobreviver à próxima sessão:
**consistência é ausência de contradição interna; reprodutibilidade é outra
pessoa rodar o mesmo solve e obter o mesmo número.** Os sete pares são
consistentes. Isso não os torna reproduzíveis, e contar validade no lugar de
reprodutibilidade abriria a calibração cedo demais.

---

## 3. As duas contaminações do contraste, com coordenada

### `B03` — a massa de fichas, e a convenção certa já está no repo

`_buildSimulatedStacks` em [perspectiva.ts:242](frontend/src/lib/perspectiva.ts#L242)
produz **105 / 110 / 108** para o mesmo pote. Deltas ICM, BF e utilidade capturam
fichas criadas pela modelagem da transição, e **qualquer contraste que passe por
ali herda o desvio**.

**A novidade útil:** a convenção correta passou a existir no repositório nesta
data, em [engine/pmev_pipeline.py:84-91](engine/pmev_pipeline.py#L84) — o Python
do Gemini soma `s_eff` em `i` e subtrai em `j`, e a soma fica constante. Não é
mais uma decisão em aberto sobre o vazio: há uma implementação de referência a
copiar ou a recusar explicitamente.

### `B06` / `F07` — não são duas fórmulas descuidadas, são duas grandezas

Medido hoje, e isto **reenquadra o finding**:

| Fórmula | TypeScript | Python |
| :--- | :--- | :--- |
| `(bf − 1) / (bf + 1)` | `icmMatrix.ts:230` | `engine/icm_matrix.py:124` |
| `(bf − 1) / bf` | `rpDeriver.ts:58` | `engine/vitoi_perspective_engine.py:199` |

**Cada fórmula é consistente entre os dois runtimes.** Isso não é erro de cópia
entre linguagens — são **duas grandezas distintas sob o mesmo rótulo `RP`**,
cada uma implementada com cuidado no seu par.

A consequência muda o trabalho: não se trata de escolher qual está "certa" e
apagar a outra. Trata-se de decidir se as duas medem coisas diferentes que
merecem **nomes diferentes**, ou se uma delas é legado. É decisão de domínio.

Some-se `F07`: `calculateMapaICM` troca de estimando acima de N=10 avisando
apenas no `console.warn` ([icmEngine.ts:57](frontend/src/lib/icmEngine.ts#L57)).
**Comparar grandezas sob o mesmo rótulo é precisamente o erro que um contraste
não pode cometer** — e aqui há dois caminhos para cometê-lo.

---

## 4. Prompt de continuação

> **Sem prelúdio.** O ecossistema foi verificado e fechado em 2026-09-07: Jules,
> Astra, Dependabot, Devin, Codex e os cinco commits do Gemini. O `B04` está
> fechado, a suíte foi restaurada ao verde, o duo Gemini foi promovido nas rotas
> de faixa gratuita por decisão do Tier 0, e o auditor Lighthouse foi medido em
> exit 0. Leia `handoff-2026-09-07-abertura-em-pmev-com-o-terreno-medido` e
> **não refaça nada dele**.
>
> **Abra direto no PMev: o contraste ICMev × ChipEV.**
>
> Três coisas já medidas, que você não precisa redescobrir:
>
> 1. `countReproduciblePairs(AULA_1_2_PAIRS) = 0 de 7` é **portão, não defeito** —
>    o próprio `evidenceContract.ts:993` o declara esperado. E a lacuna é **uma
>    só**: `provenance` ausente nos 14 lados. Não o conserte para destravar.
> 2. `B03` — `_buildSimulatedStacks` (`perspectiva.ts:242`) dá 105/110/108. A
>    convenção que preserva massa **já existe** em `engine/pmev_pipeline.py:84-91`.
> 3. `B06`/`F07` — o `RP` tem duas fórmulas, e cada uma é **consistente** no seu
>    par TS/Python. São duas grandezas sob um rótulo, não um bug de cópia.
>
> **Decida explicitamente** se neutraliza, declara como limite, ou corrige `B03` e
> `B06`/`F07` antes de comparar — e diga qual escolheu. Comparar grandezas sob o
> mesmo rótulo é o erro que um contraste não pode cometer.
>
> **Método:** meça antes de afirmar. Toda frase cujo núcleo seja uma negativa
> exige rodar antes o comando que a refutaria, e isso vale também para a **busca**
> que precede a frase — inclusive a busca que RETORNA resultados, que engana mais
> que a vazia porque não incomoda. A pergunta é sobre a forma que o alvo teria,
> nunca sobre o resultado que voltou.
>
> **Portões:** o `pre-commit` roda as 5 fases; nunca `--no-verify` nem
> `SKIP_CWV_GATE=1`. Suba dev server na `:3000` e CDP na `:9222` antes de
> commitar, ou as fases 1 e 2 medem no vazio. Tocar `frontend/` invalida o
> certificado do TBT por fingerprint — é o comportamento correto; recertifique com
> `scripts/ops/invoke_lighthouse_production_audit.ps1` (a porta 9230 precisa estar
> livre). Declare o veredito impresso.
>
> **Assinatura:** agente não commita com e-mail humano. `Claude Opus 5
> [Tier 1.B]` com `noreply@anthropic.com`, e o corpo declara Assinatura e
> Propósito.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** entregar à próxima sessão o terreno do PMev já medido — o campo
exato que abre o portão de reprodutibilidade e o reenquadramento das duas
contaminações do contraste — para que a abertura seja trabalho, e não
redescoberta.
