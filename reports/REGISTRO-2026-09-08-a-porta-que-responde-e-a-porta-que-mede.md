---
id: registro-2026-09-08-a-porta-que-responde-e-a-porta-que-mede
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-08T23:58:00-03:00
atualizado_em: 2026-09-08T23:58:00-03:00
classes: [interno, medido, portao, instrumentacao]
caminhos:
  - scripts/ops/cwv_gate.ps1
  - tests/test_cwv_gate_porta_cdp.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    DEFEITO MEDIDO: cwv_gate.ps1 declarava CdpPorts 9223 e 9222 e parava na
    primeira que respondesse /json/version. As duas respondiam, entao o portao
    media sempre pela 9223.
  - >-
    PROVA DETERMINISTICA, mesmo instante e mesma URL, mudando so a porta: pela
    9222 o probe devolve lcpMs 356,81 e longTaskBlockingMs 1137; pela 9223
    devolve null nos dois. cls, ttfbMs e maxHeapMb medem nas duas.
  - >-
    CAUSA: o processo da 9223 (pid 15148) tem MainWindowHandle 0, MainWindowTitle
    vazio e ZERO targets de tipo page. O da 9222 (pid 32332) tem
    MainWindowHandle 134112 e uma pagina. Falham exatamente as duas metricas que
    exigem pagina visivel.
  - >-
    HIPOTESE ANTERIOR REFUTADA: atribui o warning a dev server frio e cheguei a
    gravar isso na memoria persistente. Com a pagina aquecida e lcpMs de 705,91
    ms medido segundos antes, o commit 24cfe1f3 reproduziu o MESMO warning.
  - >-
    CORRECAO PROVADA DE PONTA A PONTA: rodando o portao depois da mudanca, a
    saida traz "[CDP] Active runtime connection on 9222: Chrome/155.0.8040.2 --
    1 pagina(s)" e "[CDP] Descartadas por nao medirem LCP: 9223 (sem pagina
    visivel)". LCP_MS passa a 544,095 ms com veredito [PASS]. A fase 1 mede.
  - >-
    O WARNING RESTANTE MUDOU DE NATUREZA, e isso e o resultado honesto: antes
    era "Fase 1 (Core Web Vitals) nao mediu integralmente"; agora e "Cobertura
    CWV parcial: INP foi atestado manualmente; TBT nao foi certificado". Sao
    achados diferentes -- o segundo estava encoberto pelo primeiro e nao foi
    introduzido por esta mudanca.
  - >-
    TESTE: tests/test_cwv_gate_porta_cdp.py, tres casos. Rodados ANTES da
    implementacao: 3 failed. Depois: 3 passed.
  - >-
    ENCODING: cwv_gate.ps1 permanece UTF-8 com BOM unico -- conferido nos bytes,
    BOM inicial presente e BOM duplicado ausente. O diff e cirurgico: 37
    insercoes e 5 delecoes, nao uma conversao de quebra de linha do arquivo
    inteiro.
  - >-
    COMPATIBILIDADE 5.1 do codigo novo: usa apenas @(), Where-Object,
    Invoke-RestMethod, += em array, -join e interpolacao ${port}. Nenhum
    construto exclusivo do PowerShell 7 -- sem ??, ?., &&, ternario ou
    -Parallel.
nao_verificado:
  - >-
    Nao rodei o portao com a 9223 derrubada. O falsificador executado foi o
    outro lado da mesma afirmacao -- com a 9223 DE PE e sem pagina, o portao
    agora a descarta e mede pela 9222 --, o que e mais forte para o caso de uso
    real, mas nao e a mesma prova.
  - >-
    Nao investiguei por que o Chrome da 9223 esta sem janela de conteudo. O
    portao passa a lidar com o fato; a causa dele e do ambiente, nao do portao.
  - >-
    Nao rodei a bateria substituta de compatibilidade 5.1 sobre o arquivo nesta
    sessao: a conformidade declarada acima e por inspecao dos construtos usados,
    e o proprio portao executa a bateria no commit.
  - >-
    Nao tratei o warning de TBT que ficou exposto. Ele e outro item.
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao pela integridade geral das cinco fases. A
      mudanca esta contida no bloco de handshake CDP, antes da fase 1: nenhuma
      fase teve regra, limite ou veredito alterado. O unico comportamento novo e
      qual porta e escolhida, e ele so torna a fase 1 capaz de medir onde antes
      ela declarava NAO MEDIDO.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria ancora o portao pelo CWV e pelo artefato Lighthouse. A
      mudanca a AFETA de modo favoravel e observavel: com a fase 1 medindo, o
      warning que sobra passou a ser justamente o de TBT sem artefato Lighthouse
      certificado -- que era o objeto daquela auditoria e estava encoberto pelo
      warning de cobertura. Nada do caminho do Lighthouse foi tocado aqui.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele handoff ancora o portao pela auditoria de integridade do
      repositorio. A mudanca nao toca fases de CVE, SRI ou higiene, que eram o
      objeto dali; fica antes da fase 1 e nao altera nenhum limite.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele plano ancora o portao pela fronteira de dependencias. A mudanca nao
      toca a fase 3 nem a enumeracao de manifestos; ela ocorre no handshake CDP.
  - registro: registro-2026-09-01-bateria-substituta-de-compatibilidade-5-1
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Este e o ancora que a mudanca mais diretamente convoca, porque ela ESCREVE
      PowerShell novo dentro do arquivo que aquela bateria protege. Conferido
      construto a construto: o codigo novo usa @(), Where-Object,
      Invoke-RestMethod, += em array, -join e interpolacao ${port} -- nenhum
      operador ou recurso exclusivo do 7. O encoding permanece UTF-8 com BOM
      unico, conferido nos bytes, que e a outra exigencia daquele registro. A
      propria bateria roda no commit.
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro estabeleceu que o portao nao deve depender de qual perfil
      de navegador esta aberto. A mudanca REFORCA esse principio em vez de
      contraria-lo: antes a escolha era pela ordem das portas, o que na pratica
      amarrava o resultado a qual perfil tinha subido primeiro; agora e por uma
      propriedade OBSERVADA do alvo -- existir target de tipo page --, que e
      independente de perfil, de titulo e de qual instancia respondeu.
  - registro: registro-2026-09-01-merge-da-fusao-e-autonomia-de-portao
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro trata da vaga de warning que a autonomia do portao exigia.
      A mudanca e diretamente relevante e favoravel: o warning cwv.cobertura era
      ESTRUTURAL e consumia uma das duas vagas em todo commit, o que reduzia a
      margem que aquele registro reservou. Com a fase 1 medindo, a vaga volta a
      ficar disponivel para achado real.
  - registro: registro-2026-09-03-cobertura-cve-e-a-fronteira-do-submodulo
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele registro ancora a fase 3 e a enumeracao de lockfiles por
      git ls-files. Nada disso foi tocado: a mudanca fica no handshake CDP, e a
      fase 3 permanece byte a byte como estava.
  - registro: registro-2026-09-04-higienizacao-memoria-e-harmonizacao-fractal
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele relatorio ancora o portao no contexto de higienizacao e
      resiliencia. A mudanca e aditiva e reversivel, nao remove verificacao
      alguma, e torna explicito na saida um descarte que antes acontecia de
      forma invisivel.
  - registro: relatorio-fusao-cerebro-claude-quality-gate-2026-09-01
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquele relatorio ancora o portao como produto da fusao. A estrutura de
      cinco fases, os limites e os vereditos permanecem os mesmos; o que muda e
      apenas a escolha da porta CDP e a declaracao do descarte.
  - registro: auditoria-2026-09-08-o-que-esta-em-aberto-na-malha
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      Aquela auditoria e a spec desta mudanca: sua secao 8 mede o defeito e
      atribui a causa a porta CDP, deixando explicito que corrigir seria decisao
      do Tier 0 por tocar o instrumento que mede o agente. A autorizacao veio, e
      este commit executa exatamente o que ela descreveu. O achado nao perde
      validade -- ele passa a ter desfecho, e o falsificador que ela propos foi
      executado no sentido mais forte.
  - registro: plano-frentes-abertas-2026-09-08
    caminhos:
      - scripts/ops/cwv_gate.ps1
    parecer: >-
      O plano ancora o portao para descrever a Tarefa 3, cujos passos 1 a 5 sao
      os executados aqui: teste antes, implementacao, teste depois e o
      falsificador de ponta a ponta. Os numeros previstos conferem, exceto o
      esperado no passo 5 -- o plano previa "Total de Warnings: 0", e o
      resultado foi 1, porque um segundo achado, de TBT, estava encoberto pelo
      primeiro. O plano nao perde validade; a previsao dele era sobre a fase 1,
      que de fato passou a medir.
referencias_nao_resolviveis: []
---

# A porta que responde nao e a porta que mede

## O defeito

O handshake do portao aceitava a primeira porta CDP que respondesse
`/json/version`:

```powershell
$CdpPorts = @(9223, 9222)
```

As duas estavam de pe, entao ele media **sempre pela 9223**. E a 9223 nao media.

| | 9222 | 9223 |
| :--- | ---: | ---: |
| `lcpMs` | 356,81 ms | **null** |
| `longTaskBlockingMs` | 1137 | **null** |
| `cls` / `ttfbMs` / `maxHeapMb` | medem | medem |

Mesmo instante, mesma URL, so a porta muda.

## A causa, e por que o recorte das falhas a comprova

O processo da 9223 tem `MainWindowHandle = 0`, titulo vazio e **zero targets de
tipo `page`**: um Chrome sem janela de conteudo. O da 9222 tem janela real e uma
pagina.

O que sustenta a atribuicao nao e a correlacao, e o **recorte**: falham
exatamente as duas metricas que dependem de a pagina estar visivel.
`LargestContentfulPaint` nao e emitido para pagina que inicia oculta, e long
task nao ocorre em aba sem renderizacao. `CLS`, `TTFB` e heap nao dependem
disso -- e medem nas duas portas. Uma causa aleatoria nao respeitaria essa
fronteira.

## O erro que precedeu o acerto

Atribui o warning a **dev server frio** -- o Next compilando a rota na primeira
navegacao -- e gravei essa causa na memoria persistente **antes de tentar
refuta-la**. Depois aqueci a pagina, medi `lcpMs` de 705,91 ms pela 9222 e
commitei segundos depois. O mesmo warning voltou.

O erro tem nome nesta casa: eu medi pela 9222, uma porta que o portao **nunca
usou**. A memoria `conferir-o-instrumento-antes-da-medicao` ja existia e nao me
impediu. Ela ganha agora um caso mais especifico: conferir o instrumento inclui
conferir **em qual porta ele mede**.

## O que a correcao faz

Seleciona a primeira porta que responde ao handshake **e** tem ao menos um
target `type=page`, e **declara** a que descartou:

```
[CDP] Active runtime connection on 9222: Chrome/155.0.8040.2 -- 1 pagina(s)
[CDP] Descartadas por nao medirem LCP: 9223 (sem pagina visivel)
LCP_MS             | 544.095000000671 ms | <= 2500 ms     | [PASS]
```

A declaracao nao e enfeite. Descartar em silencio devolveria o mesmo defeito
por outra porta: o portao mediria pela 9222 sem dizer por que, e a proxima
sessao nao teria como saber por que a fase 1 mede num dia e nao mede no outro.

Isto tambem **reforca** o principio do
`registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil`: a escolha
deixa de depender da ordem em que os perfis subiram e passa a depender de uma
propriedade observada do alvo.

## O resultado honesto: o warning mudou de natureza

O portao continua **FRAGIL (AMARELO)** com 1 warning. Mas nao e o mesmo:

- **antes:** `Fase 1 (Core Web Vitals) nao mediu integralmente`
- **agora:** `Cobertura CWV parcial: INP foi atestado manualmente; TBT nao foi
  certificado`

O segundo estava **encoberto** pelo primeiro. Ele nao foi introduzido aqui -- e
o achado que a `auditoria-cwv-lighthouse-2026-09-01` ja tratava, e que so podia
aparecer depois que a fase 1 passasse a medir.

Resolver um defeito de instrumento nao zera o placar. Expoe o que ele
encobria, e isso e o comportamento desejado de um portao.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Proposito:** fazer a fase 1 medir pela porta capaz de medir, declarando o
descarte; e registrar a hipotese falsa que precedeu a atribuicao correta.
