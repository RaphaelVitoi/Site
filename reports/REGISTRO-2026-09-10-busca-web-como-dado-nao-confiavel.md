---
id: registro-2026-09-10-busca-web-como-dado-nao-confiavel
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: gemini@3.8-flash
criado_em: '2026-09-10T21:51:49-03:00'
atualizado_em: '2026-09-10T21:51:49-03:00'
classes: [interno, medido, seguranca]
verificado:
  - tsc --noEmit sobre o frontend, sem erro na rota de busca
  - validador oficial do ledger nos dois runtimes -- pwsh 7 aprova, 5.1 reprova
  - leitura integral da rota e do consumidor em page.tsx
nao_verificado:
  - a rota nao foi exercitada contra o Bing nesta sessao
  - causa exata da divergencia de ConvertTo-Json entre 5.1 e pwsh 7
  - artefato Lighthouse segue expirado; TBT sem certificacao
caminhos:
  - frontend/src/app/api/v1/search/route.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
revisoes_de_ancora:
  - registro: registro-2026-09-10-feedback-9-5-multimodal-sota
    caminhos:
      - frontend/src/app/api/v1/search/route.ts
    parecer: >-
      Revisado e corrigido em parte. O registro anterior descreve a rota de busca
      como entrega, sem tratar as duas fronteiras de confianca que ela abre.
      Permanece valido quanto ao escopo entregue; este registro acrescenta o que
      faltava e corrige uma atribuicao de causa errada feita por mim no commit
      21ef0373.
---

# Registro — a busca web entra no prompt como dado, nao como instrucao

## 1. Dois defeitos na mesma rota, corrigidos na origem

A rota `api/v1/search` acerta o essencial: exige sessao autenticada, o host de
destino e fixo (sem SSRF) e a consulta passa por `encodeURIComponent`. Faltavam
duas coisas, ambas na fronteira de confianca que a §3 da raiz cobre.

**Injecao indireta de prompt.** O bloco formatado era prefixado a pergunta do
usuario em `page.tsx:502` e encerrava com *"USE ESTES DADOS PARA EMBASAR SUA
RESPOSTA COM FATOS ATUAIS"*. Quem ranqueia no Bing para a consulta escreve texto
ali, a frente da pergunta, enquadrado como autoritativo. Corrigido: o bloco agora
e delimitado como CONTEUDO WEB NAO CONFIAVEL e seguido da instrucao explicita de
tratar o conteudo como dado, ignorar ordens que apareçam nele, citar a fonte e
declarar divergencia entre fontes.

**`href` sem validacao de esquema.** `page.tsx:831` usava o link extraido por
regex do HTML de terceiros direto como `href`. `rel="noopener noreferrer"`
protege contra tabnabbing, nao contra `javascript:`. Corrigido com allowlist de
esquema na rota — http e https absolutos, o resto descartado.

Corrigir na rota e nao na pagina e deliberado: protege qualquer consumidor
futuro, nao so esta tela.

## 2. Correcao de uma causa que eu atribui errado

O commit 21ef0373 afirma que `New-AgentCalibrationDailyEvidence.ps1` nunca emite
`criado_em` e chama isso de "defeito de raiz". **Esta errado.** Medido: o script
nao escreve frontmatter nenhum e nao gera o `.md` diario — ele le os dois
ledgers. Os diarios em `reports/agent-calibration/daily/*.md` sao autorais de
agente, e a omissao de `criado_em` em 2026-09-10 foi lapso de autoria, nao falha
de gerador. Nao ha gerador a corrigir; o controle que existe — o portao de ancora
— funcionou e barrou.

A historia nao foi reescrita porque o commit ja estava enviado. A correcao mora
aqui.

## 3. O "Hash mismatch at line 3" nao e corrupcao, e runtime

O validador oficial do ledger falha com `Hash mismatch at line 3` sob Windows
PowerShell 5.1 e **aprova** sob pwsh 7: `{"status":"valid","records":22}`. A
cadeia esta intacta; `ConvertTo-Json` produz texto diferente entre os dois
runtimes, e o hash acompanha.

Descartada a hipotese obvia: as linhas 2 e 3 tem **zero** bytes nao-ASCII, logo
nao e escape de acento. A causa exata do divergencia de serializacao nao foi
isolada e fica declarada como nao medida.

Consequencia pratica: a sinopse do gerador afirma "PowerShell 7+ is the default
runtime; 5.1 remains compatible". Para este validador, **a compatibilidade com
5.1 nao se sustenta**. Quem rodar o portao em 5.1 vai ver corrupcao onde nao ha.

## 4. Verificado e nao verificado

Rodou: `tsc --noEmit` sobre o frontend, sem erro na rota; validador do ledger nos
dois runtimes; leitura integral da rota e do consumidor em `page.tsx`.

Nao rodou: nenhum teste de ponta a ponta da busca — a rota nao foi exercitada
contra o Bing nesta sessao. O artefato Lighthouse segue expirado
(`LIGHTHOUSE_FINGERPRINT_MISMATCH`) e TBT sem certificacao.
