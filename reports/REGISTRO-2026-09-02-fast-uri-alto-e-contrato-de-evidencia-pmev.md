---
id: registro-2026-09-02-fast-uri-alto-e-contrato-de-evidencia-pmev
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T13:45:00-03:00
atualizado_em: 2026-09-02T13:45:00-03:00
classes: [interno, medido, seguranca, pmev]
caminhos:
  - package-lock.json
  - frontend/src/components/simulator/solver/evidenceContract.ts
  - frontend/src/components/simulator/solver/__fixtures__/aula12Pairs.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
revisoes_de_ancora:
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - package-lock.json
    parecer: >-
      Revisado e mantido valido. Aquele relatorio mediu o portao de qualidade da
      fusao em 2026-09-01, quando `npm audit` acusava zero vulnerabilidades --
      medicao correta para a data. A alteracao de agora e de UMA linha logica no
      lockfile, subindo `fast-uri` de 3.1.5 para 3.1.7 em resposta a advisories
      publicados DEPOIS daquela medicao. Nao contradiz nem invalida o que aquele
      registro afirmou; apenas o sucede no tempo. Nenhum numero dele precisa ser
      reescrito.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - package-lock.json
    parecer: >-
      Revisado e mantido valido. Aquela auditoria trata de Core Web Vitals e do
      artefato Lighthouse; o lockfile entra nela como ancora de ambiente, nao
      como objeto de analise. A subida de `fast-uri` e transitiva de quinto
      nivel sob @prisma/client, nao toca dependencia de runtime do frontend e
      nao altera fingerprint de bundle. As conclusoes de CWV daquele registro
      seguem de pe.
verificado:
  - npm audit passou de 1 vulnerabilidade alta para 0
  - o diff do lockfile e de 3 linhas, num unico pacote
  - suite frontend com 160 testes aprovados, typecheck e lint limpos
  - portao de registro aprovado com os arquivos deste commit em stage
nao_verificado:
  - se outros advisories serao publicados para a mesma cadeia
  - alvos exatos do TARGET_MISMATCH de color-contrast, que aguardam arbitragem Tier 0
supersede: null
---

# `fast-uri` alto, e o contrato de evidência PMev

## O CVE que apareceu entre duas corridas do mesmo portão

Em 2026-09-02, o portão de 5 fases rodou três vezes neste repositório:

| Hora | `TOTAL_VULNERABILITY` | Veredito |
| --- | ---: | --- |
| 09:35 (commit `e88f0fff`) | 0 | FRAGIL, 1 warning |
| 09:35 (push) | 0 | FRAGIL, 1 warning |
| 13:38 | **1** | **FALHOU**, 2 erros |

Nenhuma dependência foi tocada nesse intervalo. `npm audit` consulta o registry
online, e os advisories de `fast-uri` foram publicados entre as duas medições.

```
fast-uri 3.0.0-3.1.5 - HIGH - 4 advisories
  GHSA-5jgf-p345-68v8  host confusion (IDN canonicalization)
  GHSA-f65p-4m7j-42xc  SSRF (normalizacao IPv6 malformada)
  GHSA-fph4-wmhf-6fwf  SSRF (percent-decoding repetido de hostname)
  GHSA-jqff-g426-hqxp  host confusion (scheme percent-encoded)
```

Cadeia completa, transitiva de quinto nível:

```
@prisma/client@7.9.1 -> prisma -> @prisma/dev -> @prisma/streams-local
  -> ajv@8.20.0 -> fast-uri@3.1.5
```

## A correção, e por que não precisou de `overrides`

`npm audit fix` resolveu subindo `fast-uri` de **3.1.5 para 3.1.7**. A árvore
aceitou a subida sem conflito com o teto do pai, então **não** foi necessário
declarar `overrides` — o que é preferível: a governança admite `overrides` para
transitivas, mas só quando a resolução natural falha.

**Contagem citada contra contagem medida.** O `npm` imprimiu
`changed 5 packages`; o diff do lockfile mostra **3 linhas alteradas, num único
pacote** (`node_modules/fast-uri`: `version`, `resolved`, `integrity`). A
mensagem do npm conta operações de disco, não entradas do lockfile. Vale a
medição.

Resultado: `npm audit` em **0 vulnerabilidades**, em todos os níveis.

## O segundo motivo da reprovação, que NÃO foi corrigido

A mesma corrida das 13:38 trouxe:

> `AXE_INCOMPLETE: 1` — `Baseline: TARGET_MISMATCH` — os alvos inconclusivos
> diferem da revisão humana aprovada; **a aprovação expirou**

A arbitragem `a11y-color-contrast-downward-drift-20260901` deixou de cobrir os
alvos atuais e voltou a contar como warning. Isso **não bloqueia sozinho** — com
o CVE resolvido o portão fica em 0 erros e 2 warnings, que é `FRAGIL` e passa —,
mas reocupa a última vaga e devolve o portão à condição de **teto sem margem**
que o handoff de 2026-09-02 descrevia.

Fica registrado como pendência de arbitragem Tier 0, e **não** foi contornado
nem silenciado.

## O trabalho que este commit publica

Etapa A do handoff PMev: contrato de evidência e os três primeiros pares
verificáveis da Aula 1.2, transcritos por dupla leitura cega. O detalhamento
metodológico está nos próprios arquivos; aqui ficam só os pontos que um
registro precisa preservar.

- **Ilegível não é zero.** Todo campo numérico é uma união discriminada, e uma
  invariante que dependa de campo ilegível é reportada como *não verificável*,
  nunca como violada nem como aprovada.
- **Divergência entre ChipEV e ICMev é restrição do solver, não erro.** Por
  decisão do Tier 0, `ACTION_SET_INCOMPARABLE` é `warning`. Os dois modelos são
  essencialmente distintos e não têm por que oferecer as mesmas ações; tratar a
  diferença como falha codificaria uma expectativa de simetria que o domínio não
  sustenta.
- **A stack efetiva é 40bb nos dois regimes** antes do open. Uma modelagem
  intermediária registrou efetivas distintas por regime e construiu sobre isso
  uma explicação causal para a divergência de sizing do par 3. As duas foram
  descartadas; a causa está declarada como **não determinada**.
- **O HRC expõe combos, stacks e e-Nash** — o que falta é o recorte das capturas
  coladas no documento. A redação anterior ("a ferramenta não expõe") tornava o
  dado inalcançável; a correta o torna pendente de recaptura.

Nada disso autoriza calibração. O ledger exige pares independentes **e
reproduzíveis**, e a reprodutibilidade não foi obtida.
