---
id: registro-2026-09-10-o-portao-que-media-a-tela-de-erro-do-chrome
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-10T22:24:09-03:00'
atualizado_em: '2026-09-10T22:24:09-03:00'
classes: [interno, medido, portao]
verificado:
  - sonda falha com net::ERR_CONNECTION_REFUSED e exit 1 com o frontend fora do ar
  - validador do ledger recusa PowerShell 5.1 e aprova em pwsh 7 com 23 registros
  - BOM unico e CRLF preservados nos dois .ps1 alterados
  - AST do pwsh parseia os dois .ps1 sem erro; node --check aprova a sonda
nao_verificado:
  - causa exata da divergencia de ConvertTo-Json entre 5.1 e pwsh 7
  - comportamento da sonda diante de interstitial que nao seja erro de rede
caminhos:
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/runtime_quality_probe.mjs
  - scripts/ops/Test-AgentCalibrationLedger.ps1
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/runtime_quality_probe.mjs
    parecer: >-
      Revisado e mantido valido. A alteracao na sonda e aditiva: tres
      checagens que confirmam que o documento medido e o alvo. Nenhuma metrica
      ou regra de axe foi tocada.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: handoff-2026-09-09-ci-verde-e-as-seis-causas
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: handoff-2026-09-09-verde-nos-dois-portoes
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido, com ressalva declarada. A bateria substituta
      segue correta para os .ps1 em stage. A ressalva e de outro alcance: a
      promessa generica de compatibilidade com o 5.1 nao vale para Test-
      AgentCalibrationLedger.ps1, cuja serializacao divergente produz veredito
      falso, agora barrado por guarda de runtime.
  - registro: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - scripts/ops/Test-AgentCalibrationLedger.ps1
    parecer: >-
      Revisado e PROTEGIDO. A guarda impede o cenario pior: um operador ver
      Hash mismatch sob PowerShell 5.1, concluir corrupcao de evidencia
      append-only e agir sobre um ledger sadio. O validador recusa o runtime
      errado em vez de emitir veredito falso.
  - registro: registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: registro-2026-09-04-higienizacao-memoria-e-harmonizacao-fractal
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: registro-2026-09-08-a-fase-3-passa-a-ver-python
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: registro-2026-09-08-a-porta-que-responde-e-a-porta-que-mede
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e REFORCADO. Aquele registro separou a porta que responde da
      porta que mede; este faz a separacao equivalente no documento: navegar
      com sucesso nao prova que o documento medido e o alvo, porque
      Page.navigate nao falha quando o destino esta fora do ar.
  - registro: registro-2026-09-09-o-axe-mede-extensao-de-navegador
    caminhos:
      - scripts/ops/runtime_quality_probe.mjs
    parecer: >-
      Revisado e EXTENDIDO, mesma familia de defeito uma camada acima. Aquele
      registro impediu o axe de medir shadow DOM de extensao; este impede a
      sonda de medir um documento que nao e o app, a pagina de erro do Chrome.
      Nos dois casos o veredito dependia de algo alheio ao codigo versionado.
      A exclusao por nome de extensao segue intacta.
  - registro: registro-2026-09-09-o-portao-local-passa-a-checar-o-que-o-ci-checa
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e mantido valido. A unica alteracao em cwv_gate.ps1 e o texto
      de Desc do indicador TTFB_MS, que passa a declarar que o teto e
      normativo de producao. Nenhuma regra, limiar, fase ou enforcement mudou.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Revisado e REFORCADO, e e o registro mais proximo destas correcoes. Ele
      fixou que o veredito do portao nao pode depender do perfil do navegador.
      A sonda agora tambem nao aceita depender de QUAL documento o navegador
      entregou: confirma que o medido e o alvo antes de emitir veredito. Mesmo
      principio, outra superficie.
---

# Registro — o portao media a tela de erro do Chrome

## 1. O mecanismo, que nao era o que eu supunha

A sonda `runtime_quality_probe.mjs` **navega** a pagina para o alvo; ela nao
escolhe uma aba qualquer. Eu havia suposto escolha errada de aba, e estava errado.

O defeito real: `Page.navigate` **nao falha** quando o destino esta fora do ar. O
Chrome entrega a **propria pagina de erro**, e ela e uma pagina como outra
qualquer — sem `<main>`, sem landmarks, com `meta-viewport` proprio.

Medido em 2026-09-10, com nada escutando em `localhost:3000`, o portao reportou
exatamente tres violacoes de axe — `landmark-one-main`, `meta-viewport`,
`region` — mais LCP de 84 ms e heap de 1,03 MB. Esses numeros nao eram absurdos:
sao o custo real de renderizar uma tela de erro. **Reprovou um commit inocente**,
e pelo mesmo mecanismo aprovaria codigo defeituoso, porque a tela de erro nao
contem o codigo que deveria ser medido.

O defeito nunca foi escolher a pagina errada. Era **aceitar qualquer pagina como
resposta**.

## 2. As tres checagens, todas aditivas

1. `errorText` de `Page.navigate` — sinal autoritativo de falha de rede, hoje
   descartado.
2. Presenca de `#main-frame-error` — pega o interstitial que o Chrome renderiza
   mesmo quando a navegacao "sucede".
3. Origem de `document.location.href` contra a origem do alvo declarado.

Nenhuma metrica, regra de axe ou calculo existente foi tocado. As checagens so
podem tornar o portao mais rigoroso: convertem medicao silenciosa de outro
documento em falha declarada.

**Prova:** com o servidor fora do ar, a sonda agora devolve
`net::ERR_CONNECTION_REFUSED` com explicacao e exit 1. O portao passa a declarar
*fase 1 nao mediu integralmente* — o caminho que ele sempre teve para cobertura
perdida — em vez de emitir veredito sobre a pagina errada.

## 3. O TTFB que reprovava sem se explicar

O portao reprovou um commit por `TTFB_MS: 1112 ms` contra teto de 800. Aquecer a
pagina nao mudou nada: 1078 ms estaveis, o que descartou compilacao fria e
apontou o **modo dev**, que renderiza por requisicao. Em producao: **3 ms**.

Nao reduzi o teto nem criei excecao — reprovar contra limiar de producao e o
comportamento correto. O que faltava era a falha se explicar, e agora o `Desc` do
indicador declara que o teto e normativo de producao e cita a medicao dos dois
builds. Observabilidade, nao reducao material.

## 4. O validador que via corrupcao onde nao havia

`Test-AgentCalibrationLedger.ps1` reprovava com `Hash mismatch at line 3` sob
Windows PowerShell 5.1 e **aprovava** sob pwsh 7 sobre o mesmo arquivo. A cadeia
esta integra; `ConvertTo-Json` serializa diferente entre os runtimes e o hash
acompanha. Descartada a hipotese obvia: as linhas 2 e 3 tem **zero** bytes
nao-ASCII.

Guarda adicionada: o validador **recusa** rodar no 5.1, com mensagem que diz o
que fazer. Recusar e melhor que reprovar — um operador que ve "Hash mismatch"
conclui corrupcao de evidencia append-only e pode agir sobre um ledger sadio.

A causa exata da divergencia **nao foi isolada** e fica declarada como nao
medida. Corrigi-la mudaria os hashes e invalidaria o ledger inteiro, o que seria
pior que a limitacao de runtime.

## 5. Autorizacao

A secao 10.3 deste projeto proibe o agente alterar o instrumento que o mede. O
Tier 0 autorizou explicitamente estas tres alteracoes em 2026-09-10, e pela
secao 3.1 da raiz isso as torna **validas** — registradas como decisao legitima,
nao como excecao tolerada. A escolha de manter as tres aditivas e de nao mexer em
limiar algum e minha, e e o que as torna reversiveis por `git revert` sem efeito
colateral.
