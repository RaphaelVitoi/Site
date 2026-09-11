---
id: handoff-2026-09-10-raiz-versionada-e-o-portao-que-media-outra-pagina
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-10T21:57:22-03:00'
atualizado_em: '2026-09-10T23:24:00-03:00'
classes: [interno, medido, handoff]
verificado:
  - portao de ancora e portao de registro aprovados em todos os commits da sessao
  - portao de qualidade com 0 erros apos levantar o servidor e abrir a aba correta
  - tsc --noEmit sobre o frontend, sem erro na rota de busca
  - cadeia do ledger validada em pwsh 7 -- status valid, 22 registros
  - Lighthouse de producao revinculado ao fingerprint -- TBT 0 ms, LCP 443 ms, CLS 0, score 1
  - TTFB medido nos dois builds -- 1078 ms em dev contra 3 ms em producao
  - clone do repositorio da raiz comparado byte a byte com a arvore de trabalho
nao_verificado:
  - nenhum script da raiz foi executado; obsolescencia dos 15 sem consumidor nao determinada
  - a rota de busca nao foi exercitada contra o Bing
  - causa exata da divergencia de ConvertTo-Json entre PowerShell 5.1 e pwsh 7
caminhos:
  - frontend/src/app/api/v1/search/route.ts
  - reports/agent-calibration/feedback-ledger.jsonl
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: agent-calibration-daily-2026-09-02
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: auditoria-2026-09-01-retrospectiva-prioridade-sessao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: auditoria-2026-09-02-curadoria-mcp-e-processos-residuais
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: auditoria-2026-09-02-retrospectiva-e-observacao-de-calibracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: auditoria-2026-09-08-massa-de-fichas-fonte-nao-unica-e-desvio-de-foco
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-01-prioridade-pmev-continuacao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-02-curadoria-mcp-quarentena-e-roteamento-lazy
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-03-guarda-de-governanca-camada-anthropic-e-cobertura-cve
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-03-procedencia-de-solve-e-portao-de-reprodutibilidade
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-04-pmev-credenciais-e-submodulos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-04-refinamento-sota-radar-telemetria-e-mcps-google
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-05-fechamento-do-ciclo-e-regua-do-jules
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-07-integracao-astra-e-calibracao-de-procedimento
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-07-orquestrador-free-tier-e-calibracao-9-0
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: handoff-2026-09-08-contraste-fechado-e-o-gatilho-do-lighthouse
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e mantido valido. O artefato foi reemitido pela corrida de
      producao desta sessao e revinculado ao fingerprint atual do frontend --
      TBT 0 ms, LCP 443 ms, CLS 0, score 1. Reemissao e a renovacao que o
      vinculo estrito pressupoe: substitui o instante medido, nao contradiz a
      certificacao anterior.
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e mantido valido. O artefato foi reemitido pela corrida de
      producao desta sessao e revinculado ao fingerprint atual do frontend --
      TBT 0 ms, LCP 443 ms, CLS 0, score 1. Reemissao e a renovacao que o
      vinculo estrito pressupoe: substitui o instante medido, nao contradiz a
      certificacao anterior.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: registro-2026-09-03-nota-10-e-outlier-de-aceleracao
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e mantido valido. O artefato foi reemitido pela corrida de
      producao desta sessao e revinculado ao fingerprint atual do frontend --
      TBT 0 ms, LCP 443 ms, CLS 0, score 1. Reemissao e a renovacao que o
      vinculo estrito pressupoe: substitui o instante medido, nao contradiz a
      certificacao anterior.
  - registro: registro-2026-09-04-nota-9-5-e-analise-paralela-de-nos
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: registro-2026-09-05-saneamento-nexus-ollama-e-auto-diagnostico
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. A alteracao no ledger e a entrada 22,
      acrescimo append-only: nenhuma linha anterior foi reescrita, a cadeia
      SHA-256 foi revalidada em pwsh 7 com status valid e 22 registros, e o
      portao de suficiencia conta sessoes distintas, nao linhas. Nada do que
      aquele registro afirma sobre o ledger muda.
  - registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e RENOVADO. A certificacao volta a TBT 0 ms, agora vinculada ao
      fingerprint de 2026-09-10. O artefato que aquele registro certificou
      expirou quando o frontend mudou; esta revinculacao e exatamente a
      renovacao que ele pressupoe, nao uma contradicao.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e mantido valido. O recorte do fingerprint continua correto --
      foi ele que detectou a expiracao deste ciclo. Esta sessao exerceu o
      mecanismo que aquele registro definiu, sem altera-lo.
  - registro: registro-2026-09-08-contraste-icmev-chipev-executado
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e mantido valido. O artefato foi reemitido pela corrida de
      producao desta sessao e revinculado ao fingerprint atual do frontend --
      TBT 0 ms, LCP 443 ms, CLS 0, score 1. Reemissao e a renovacao que o
      vinculo estrito pressupoe: substitui o instante medido, nao contradiz a
      certificacao anterior.
  - registro: registro-2026-09-08-o-padrao-de-desvio-de-foco
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e REFORCADO pela evidencia nova. O feedback da entrada 22 --
      focando em periferia e nao em eficiencia -- e instancia do padrao que
      aquele registro nomeia, nao contraexemplo. Ocorrencia adicional, com o
      exemplo concreto identificado no corpo deste handoff.
  - registro: registro-2026-09-09-o-arquivo-gerado-que-expirava-o-certificado
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Revisado e CONFIRMADO de novo. Aquele registro descreve o ciclo em que o
      certificado expira porque o frontend muda; esta sessao o reexecutou do
      inicio ao fim, incluindo a reemissao. O mecanismo diagnosticado ali
      segue correto.
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos:
      - reports/agent-calibration/feedback-ledger.jsonl
    parecer: >-
      Revisado e mantido valido. Aquele registro ancora a entrada 21 do
      ledger; esta sessao apenas acrescentou a 22, append-only, sem tocar na
      21. Cadeia revalidada depois do acrescimo.
---

# Handoff — a raiz ganhou versionamento, e o portao media outra pagina

## 1. Raiz multiprojeto: de zero historico a repositorio privado

`~/.gemini` nunca tinha sido versionada. Agora e `RaphaelVitoi/raiz-multiprojeto`,
**privado** — divergencia deliberada do `Site`, que e publico: dos 68 arquivos
iniciais, 26 citam o caminho pessoal e 28 nomeiam MCPs e plugins instalados.
Inventario de ambiente e material de reconhecimento, e **ausencia de segredo nao
e ausencia de exposicao**.

Seis commits: governanca e relatorios, os 19 scripts soltos versionados **onde
estao**, `.gitattributes` declarando finais de linha, e duas correcoes de
governanca que a propria medicao impos.

**O erro de metodo que vale levar.** Decidi nao mover os lancadores usando `rg`,
que por padrao pula tudo que o `.gitignore` exclui — inclusive `extensions/`, que
eu proprio acabara de mandar ignorar. A varredura completa achou um sexto
consumidor em `Start-SOTA-Ecosystem.ps1:33`, dentro de `extensions/`. **Ignorar
para versionar e ignorar para procurar sao decisoes diferentes**, e a ferramenta
funde as duas. Regra registrada na secao 4 da raiz.

## 2. O commit do Gemini: autoria, portoes e um falso positivo

O commit `e964c977` estava local, nao enviado, e saiu assinado como `Codex GPT-5`
porque a identidade do git ficou da sessao anterior. Tres fontes dizem o
contrario: frontmatter `autor: gemini@3.8-flash`, ledger `conductor_model:
gemini-3.8-flash`, e o conteudo. Reemitido como `21ef0373`, autor
`Gemini 3.8 Flash`, committer `Claude Opus 5`. **Assinatura e configuracao, nao
autoria** — e eu li a assinatura antes de ler a evidencia.

Tres hooks o rejeitavam, e nenhum foi contornado: `criado_em` ausente no diario;
titulo com 104 caracteres contra teto de 100, o que indica que o commit original
foi criado contornando os hooks; e o portao de qualidade.

**O portao de qualidade era falso positivo, e o diagnostico importa mais que a
correcao.** Ele acusou 3 violacoes de axe: `landmark-one-main`, `meta-viewport`,
`region`. Nada escutava em `localhost:3000` e nenhuma das 10 abas do Chrome era
do app — o portao auditou outra pagina e rotulou o resultado como
`localhost:3000`. O que delata e a fisica: LCP de **84 ms** e heap de **1,03 MB**
sao impossiveis num app Next.js real. Com o servidor no ar e a aba certa: LCP
363 ms, heap 46 MB, **AXE_VIOLATIONS 0**.

Um portao que nao confirma *o que* auditou reprova codigo inocente e aprova
codigo defeituoso com a mesma confianca. **Isto e defeito aberto.**

## 3. Dois timestamps espelhados

O diario `reports/agent-calibration/daily/2026-09-10.md` **omitia** `criado_em`; o registro multimodal o
tinha com **fuso errado** — `2026-09-11T00:24:00-03:00` era o instante UTC com o
sufixo colado sem converter, tres horas no futuro. O portao pega a omissao e nao
pega a etiqueta mentirosa, porque a sintaxe esta perfeita. Os dois corrigidos.

## 4. Seguranca da rota de busca

Duas fronteiras de confianca fechadas em `29ef243e`: o bloco de resultados deixou
de instruir o modelo a tratar HTML de terceiros como autoritativo, e o link passa
por allowlist de esquema antes de virar `href`. Detalhe em
`REGISTRO-2026-09-10-busca-web-como-dado-nao-confiavel.md`.

## 5. O que ficou aberto, e o que foi fechado depois

A tabela abaixo foi escrita antes das tres ultimas rodadas da sessao e **estava
obsoleta em quatro das cinco linhas**. Corrigida com o estado final:

| Item | Estado final |
| :--- | :--- |
| Portao auditava pagina nao confirmada | **FECHADO** em `73005a67`. `Page.navigate` nao falha com o destino fora do ar: o Chrome entrega a propria pagina de erro, e era ela que o portao auditava. Tres checagens aditivas: `errorText`, `#main-frame-error`, origem de `location.href` |
| Portao comparava build de dev com limiar de producao | **FECHADO** em `73005a67`, por observabilidade e nao por reducao. O teto de 800 ms continua normativo de producao; o `Desc` do indicador passou a declarar isso e a citar 1078 ms em dev contra 3 ms em producao |
| Validador do ledger em PowerShell 5.1 | **FECHADO** em `73005a67`. Ele recusa o 5.1 com mensagem que diz o que fazer, em vez de reprovar cadeia integra. A causa da divergencia de `ConvertTo-Json` fica declarada como **nao medida** |
| Duplicatas em `~/.claude` | **FECHADO** em `90c7900` e `c6b0570` da raiz. 19 scripts soltos removidos com backup; a arvore `Site/` de 8,98 GB removida depois de provado merito zero -- 8 dos 9 nao rastreados byte-identicos ao versionado, e as 34 modificacoes superadas |
| 15 scripts da raiz sem consumidor | **CONTINUA ABERTO.** Ausencia de invocacao medida; obsolescencia **nao** determinada. E o unico item desta tabela que sobrevive |

**Os tres primeiros exigiram autorizacao explicita do Tier 0**, porque a secao
10.3 proibe o agente alterar o instrumento que o mede. Concedida em 2026-09-10; as
tres correcoes foram mantidas aditivas de proposito, para reverterem por `git
revert` sem efeito colateral.

## 6. Feedback da sessao

Nota **9.5**, literal no ledger (sequencia 22): *"mais uma vez focando em
periferia e nao em eficiencia por vezes"*.

Procede, e tem exemplo concreto nesta sessao: investiguei a divergencia de
`ConvertTo-Json` entre runtimes do PowerShell ate isolar que a cadeia esta
intacta. Diagnostico correto, **fora do caminho critico** — o padrao e gastar
chamadas provando o que nao bloqueia a entrega.

## 7. Fechado nesta sessao, depois do handoff inicial

O `LIGHTHOUSE_FINGERPRINT_MISMATCH` **foi resolvido**: com o build de producao no
ar, `invoke_lighthouse_production_audit.ps1` revinculou o artefato ao fingerprint
atual do frontend -- TBT 0 ms, LCP 443 ms, CLS 0, performanceScore 1. O warning
de cobertura parcial que acompanhava a sessao desde a manha deixou de existir, e
o TBT passou a ter certificacao em vez de atestado humano.

Ele so foi resolvivel porque outro achado o precedeu: o portao reprovou o commit
deste handoff por `TTFB_MS: 1112 ms`, medido contra servidor de **desenvolvimento**.
Aquecer a pagina nao mudou nada -- 1078 ms estaveis -- o que descartou
compilacao fria e apontou o modo dev. Subir producao derrubou o TTFB para 3 ms e,
de quebra, criou a condicao que o Lighthouse exigia. Um defeito abriu a porta do
outro.
