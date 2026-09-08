---
id: handoff-2026-09-08-executar-o-contraste-sem-preparar-terreno
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-pmev"
criado_em: 2026-09-08T13:45:00-03:00
atualizado_em: 2026-09-08T13:45:00-03:00
classes: [interno, medido, handoff, pmev, icm]
caminhos:
  - frontend/src/lib/rpDeriver.ts
  - frontend/src/lib/perspectiva.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Fazer a proxima sessao EXECUTAR o contraste ICMev x ChipEV, e nao preparar
  terreno pela terceira vez. As duas contaminacoes que o justificavam estao
  fechadas; nao ha mais o que limpar antes de comparar.
classe_tarefa: handoff-de-execucao-dirigida
criterio_de_aceite:
  - A proxima sessao produz o contraste, nao um relatorio sobre as condicoes dele.
  - Nenhuma das correcoes ja feitas e refeita ou reauditada.
  - O orcamento de periferia fica declarado antes, nao justificado depois.
verificado:
  - >-
    B03 FECHADO NOS DOIS SITIOS. perspectiva.ts:242 (funcao buildSimulatedStacks,
    agora exportada) e rpDeriver.ts:266, que carregava copia manual e sobreviveu a
    primeira correcao. Contrato de massa fixado em
    frontend/src/tests/simulator/massaDeFichas.test.ts: os tres ramos terminais
    valem soma(stacks) + potSize.
  - >-
    RP_CEILING_THRESHOLD MEDIDO E MANTIDO EM 24. deriveRps monta contrafactuais em
    soma zero e nunca foi contaminado; o RP fica entre 1.31 e 23.01 nos cenarios
    medidos, encostando no teto sem toca-lo. Nao ha o que recalibrar.
  - >-
    B06/F07 DECLARADO E QUANTIFICADO nos quatro sitios. A grandeza A (BF-1)/(BF+1)
    reproduz o RP exato no all-in even money; a B (BF-1)/BF nao e exata em
    convencao alguma e erra ate -11.11 pontos percentuais em BF=5. A escolha entre
    nomea-las separadamente ou aposentar uma e do Tier 0 e SEGUE ABERTA.
  - >-
    Estado ao fechar: master em 312ddba3 mais o commit deste handoff, sincronizado,
    working tree limpo. Portao de 5 fases 0 erros; Python 982/1 pulado/zero
    warnings; frontend 33 suites/241/zero warnings; tsc exit 0; Lighthouse exit 0,
    TBT 0 ms, score 1.0. Ledger valido, 20 registros, nota 9.5 na sequencia 19.
nao_verificado:
  - >-
    O CONTRASTE ICMev x ChipEV NAO FOI EXECUTADO, por duas sessoes consecutivas.
    E o item central deste handoff.
  - >-
    oopRp e estruturalmente 0 em derivePostFlopRps, antes e depois da correcao. E
    consistente com a semantica de pote destacado, mas torna deltaRp degenerado.
    Medido, nao corrigido -- e mudanca de modelagem.
  - >-
    Os sete findings do Astra seguem abertos: B05, B07, B08, B09, F03, F05, F06.
  - >-
    countReproduciblePairs(AULA_1_2_PAIRS) segue 0 de 7 por `provenance` ausente
    nos 14 lados. E o valor ESPERADO e nao se conserta para destravar.
---

# Handoff: executar o contraste, sem preparar terreno de novo

**Publicado em:** `master` · **Nota da sessão anterior:** `9.5`

---

## 1. Por que este handoff é diferente do anterior

O handoff de 07/09 mandava *"abrir direto no contraste"* e trazia três medições
prontas. A sessão de 08/09 **não abriu o contraste**: corrigiu as contaminações
que o justificavam, e fechou.

Duas sessões seguidas prepararam terreno. **Preparar terreno duas vezes é uma
forma de não entregar** — foi o que a nota `9.5` apontou.

Este handoff não traz medições novas de terreno. Traz a constatação de que **não
sobrou terreno para preparar.**

---

## 2. O que está fechado — não reabrir

| Item | Estado |
| :--- | :--- |
| `B03`, sítio 1 — `perspectiva.ts:242` | fechado, contrato em teste |
| `B03`, sítio 2 — `rpDeriver.ts:266` | fechado, era cópia manual sobrevivente |
| Teorema D5 | restaurado com pressão estrutural real |
| `RP_CEILING_THRESHOLD` | medido, mantido em `24` |
| `B06`/`F07` | declarado nos 4 sítios, com erro quantificado |

**Não reauditar nada disso.** Se surgir dúvida, ler
`AUDITORIA-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco` e o
`REGISTRO-2026-09-08-massa-de-fichas-e-as-duas-grandezas-de-rp`, incluindo a
emenda §6 daquele registro.

---

## 3. A única decisão que precede o contraste

`B06`/`F07` — o `RP` tem duas grandezas, e **comparar grandezas sob o mesmo
rótulo é o erro que um contraste não pode cometer**.

A álgebra já está medida: a grandeza **A** `(BF−1)/(BF+1)` é o RP exato no all-in
even money; a **B** `(BF−1)/BF` não é exata em convenção alguma. Mas a escolha é
de domínio do Tier 0 e **segue aberta**.

**Não espere a decisão para começar.** Declare no contraste qual grandeza está
usando, em qual sítio, e siga. Um contraste que declara sua unidade é válido; um
que a omite não é.

---

## 4. Prompt de continuação

> **Sem prelúdio, e sem preparar terreno.** As duas contaminações do contraste
> estão fechadas: o `B03` foi corrigido nos **dois** sítios (`perspectiva.ts:242`
> e a cópia manual sobrevivente em `rpDeriver.ts:266`), o `RP_CEILING_THRESHOLD`
> foi medido e mantido em `24`, e o `B06`/`F07` está declarado e quantificado nos
> quatro sítios. Leia
> `handoff-2026-09-08-executar-o-contraste-sem-preparar-terreno` e **não refaça
> nem reaudite nada dele**.
>
> **Execute o contraste ICMev × ChipEV.** Duas sessões consecutivas prepararam
> terreno e nenhuma comparou; esta compara. O entregável é o contraste, não um
> relatório sobre as condições dele.
>
> **Antes de escrever a primeira linha, declare seu orçamento:** quanto do esforço
> vai ao contraste e quanto à periferia. A sessão anterior levou `9.5` com a razão
> *"gasto exagerado de tempo e tokens em questões periféricas"* — 2 de 5 commits
> ficaram no foco. Periferia obrigatória (âncoras, registros, portões) é para ser
> **cumprida, não elaborada**: parecer específico e curto vence parecer longo, e a
> §1.2 só proíbe o **genérico**, nunca o breve.
>
> **A única decisão que precede:** o `RP` tem duas grandezas e a escolha entre
> elas é do Tier 0, **ainda em aberto**. Não espere por ela — **declare no
> contraste qual grandeza você usa e em qual sítio**, e siga. Comparar grandezas
> sob o mesmo rótulo é o erro que um contraste não pode cometer; declarar a
> unidade resolve isso sem decidir o que não lhe cabe.
>
> **Método:** meça antes de afirmar, e note que nesta casa a medição já refutou
> hipótese própria duas vezes seguidas — o teto de risco e a fonte única. Ao
> corrigir uma função, `grep` por um **fragmento do corpo**, nunca só pelo nome:
> o nome acha quem chama, o fragmento acha quem copiou. Se uma correção derrubar
> um teste, **meça o cenário do teste antes de julgá-lo frágil** — pode estar
> provando a coisa errada desde sempre.
>
> **Portões:** o `pre-commit` roda as 5 fases; nunca `--no-verify` nem
> `SKIP_CWV_GATE=1`. Suba dev server na `:3000` e CDP na `:9222` **antes** de
> commitar, ou as fases 1 e 2 medem no vazio — e **não encerre o dev server antes
> do último commit**. Tocar `frontend/` invalida o certificado do TBT por
> fingerprint; recertifique com
> `scripts/ops/invoke_lighthouse_production_audit.ps1` (porta 9230 livre).
> Declare o veredito impresso.
>
> **Assinatura:** agente não commita com e-mail humano. `Claude Opus 5
> [Tier 1.B]` com `noreply@anthropic.com`, e o corpo declara Assinatura e
> Propósito. Trabalho de outra linhagem, se houver, sai sob a autoria dela.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** entregar à próxima sessão a constatação de que não há mais terreno
a preparar, e o orçamento explícito que impede a periferia de comer o foco pela
terceira vez.
