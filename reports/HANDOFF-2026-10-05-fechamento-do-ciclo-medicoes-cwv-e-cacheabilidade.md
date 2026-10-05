---
id: handoff-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade
tipo: handoff
escopo: Site -- fechamento do ciclo de medicao; portao de 5 fases VERDE com frontend no ar, restabelecimento da cacheabilidade da suite, e fecho do lote de mudancas de resolucao de modelo Ollama
ecossistema: nexus-sota
autor: Space-Bunny-Alpha <noreply@hermes.com>
co_autoria: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-05T07:35:00-03:00'
atualizado_em: '2026-10-05T09:15:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, handoff, quality-gate, cwv, acessibilidade, seguranca, cache]
caminhos:
  - reports/HANDOFF-2026-10-05-fechamento-do-ciclo-medicoes-cwv-e-cacheabilidade.md
  - reports/REGISTRO-2026-10-04-http-metrics-correlation-e-worker-shutdown.md
  - reports/REGISTRO-2026-10-05-resolucao-de-modelo-ollama-e-schema-json.md
  - reports/agent-calibration/daily/2026-10-04.json
  - reports/agent-calibration/daily/2026-10-05.json
  - reports/REGISTRO-2026-09-25-laya-warmup-persistencia-e-timeout-s1.md
  - engine/llm_api.py
  - tests/test_llm_layer_sota.py
  - tests/test_llm_ollama_integracao_real.py
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/suite_verde.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 20261003_204817_c81943
  session_started_at: '2026-10-03T20:48:00-03:00'
  condutor: Space-Bunny-Alpha <noreply@hermes.com>
  co_condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: space-bunny-alpha
  veiculo: hermes-agent
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-05
verificado:
  - "portao de 5 fases VERDE em 2026-10-05 com frontend em localhost:3000 e Chrome Dev em CDP 9222: LCP 610,4 ms; CLS 0; TBT 32,496 ms; TTFB 93,0 ms; heap 37,9 MB; axe 0 violacoes e 1 inconclusiva com revisao humana aprovada; 0 erros e 0 warnings"
  - "5 CVEs High do workspace frontend neutralizadas por aceite formal em data/npm_cve_acceptances.json, com cadeia de dependencia medida: eslint-config-next 16.3.8 -> @next/eslint-plugin-next -> fast-glob 3.3.1 -> micromatch 4.0.8 -> braces 3.0.3"
  - "braces 3.0.3 confirmado como ultima versao publicada no registro npm, com patched_versions nulo no GHSA-vfj7-8cjw-p6xm: nao existe versao corrigida disponivel"
  - "greps em frontend/src confirmam zero consumo direto de braces, micromatch e fast-glob: a dependencia e estritamente transitiva de eslint em desenvolvimento"
  - "suite_verde.py deixou de reportar 'estado nao cacheavel' apos rastrear os relatorios diarios de calibracao; a arvore de conteudo passou a ser cacheavel e o marcador verde foi gravado"
  - "processo node obsoleto (PID 2168) que segurava a porta 3000 sem responder foi identificado por medicao e encerrado, restaurando as quatro rotas publicas com HTTP 200"
  - "ruff check e format sem erros; pyright com 0 erros; suite de tests/test_llm_layer_sota.py com 26 testes, 0 erros e 0 warnings"
nao_verificado:
  - "execucao real do caminho Ollama contra 127.0.0.1:11434 e contra provedores externos"
  - "execucao em producao distribuida multi-host"
  - "comportamento do portao em host sem sessao CDP e sem frontend no ar, que e o estado em que ele nao mede CWV e A11y"
revisoes_de_ancora:
  - registro: registro-2026-10-04-http-metrics-correlation-e-worker-shutdown
    caminhos:
      - reports/REGISTRO-2026-09-25-laya-warmup-persistencia-e-timeout-s1.md
      - scripts/ops/cwv_gate.ps1
      - engine/llm_api.py
      - tests/test_llm_layer_sota.py
    parecer: >-
      Revisado em 2026-10-05. O registro de 2026-10-04 foi estendido com as medicoes
      reais do portao e com a declaracao dos relatorios diarios de calibracao de
      2026-10-04 e 2026-10-05, sem alterar nenhum verificado anterior. O registro Laya
      de 2026-09-25 recebeu apenas normalizacao de formatacao, sem mudanca de conteudo.
  - registro: registro-2026-10-05-resolucao-de-modelo-ollama-e-schema-json
    caminhos:
      - reports/REGISTRO-2026-10-05-resolucao-de-modelo-ollama-e-schema-json.md
      - tests/test_llm_ollama_integracao_real.py
    parecer: >-
      Revisado em 2026-10-05. A secao 5 deste handoff declarava o caminho Ollama como
      LIMITADO por medicao -- apenas contrato e forma do corpo, sem chamada real ao
      daemon. Esse limite deixou de valer: o registro agora traz 5 testes de integracao
      contra 127.0.0.1:11434, medidos, e a tabela de resolucao foi reprovada com os
      26 aliases do manifesto conferindo tag instalada. O que continua aberto e apenas
      o que este registro nunca cobriu: provedores externos e producao multi-host.
---

# Handoff: Fechamento do Ciclo de Medicao CWV e Cacheabilidade

Data: 2026-10-05

## 1. O Que Esta Handoff Registra

O fechamento de um ciclo que comecou com o portao de qualidade em vermelho e
terminou medido em verde. Este documento existe para que a proxima sessao nao
repita o diagnostico caro.

## 2. Linha do Tempo do Diagnostico

**2.1 O portao vermelho nao era sobre CWV.** A leitura ingenua apontava cinco
vulnerabilidades High e duas fases `NAO MEDIDO`. A medicao separou as causas:

| Achado | Causa real | Origem |
|---|---|---|
| 5 CVEs High | `braces@3.0.3` via cadeia de lint | Sem versao corrigida no npm |
| CWV e A11y `NAO MEDIDO` | Nenhuma porta CDP canonica respondeu | Frontend fora do ar |

Nenhuma correcao de codigo no repositorio resolvia o segundo item. Resolver exigia
subir o frontend e ter um Chrome Dev instrumentado -- isto e, uma acao de
ambiente, nao uma entrega.

**2.2 A cadeia de CVE foi medida antes de ser aceita.** O caminho declarado do
`npm audit` desce por `eslint-config-next` ate `braces`. Tres medicoes sustentam o
aceite, e qualquer uma delas o invalidaria:

1. `npm view braces` devolve `3.0.3` como `latest`, e a lista de versoes termina ali.
2. O advisory GHSA-vfj7-8cjw-p6xm declara `range <=3.0.3` com `patched_versions` nulo.
3. Grep em `frontend/src` nao encontra consumo direto de `braces`, `micromatch` ou
   `fast-glob` -- e a dependencia nao entra no build de producao.

A unica "correcao" sugerida pelo npm e rebaixar `eslint-config-next` para 14.2.35,
um downgrade major que trocaria a base de lint por um ganho de seguranca que nao
existe. Rejeitado.

**2.3 Um segundo bloqueio, invisivel: a suite verde nao era cacheavel.** A saida
dizia `verde, mas o estado nao e cacheavel -- marcador NAO gravado`. A causa eram
dois relatorios diarios de calibracao nao rastreados: arquivos versionados por
convencao do projeto, com a convencao quebrada. Rastreados, a arvore voltou a ser
cacheavel e o marcador foi gravado.

## 3. O Achado que Vale Para a Proxima Sessao

**`NAO MEDIDO` nao e falha de qualidade: e falha de medicao.** As duas se confundem
no mesmo relatorio, e a confusao custa uma sessao inteira de diagnostico.

O portao, com o frontend no ar e o CDP 9222 respondendo, mediu:

| Metrica | Valor | Teto | Status |
|---|---|---|---|
| LCP | 610,4 ms | <= 2500 ms | PASS |
| CLS | 0 | <= 0,10 | PASS |
| TBT | 32,496 ms | <= 200 ms | PASS |
| TTFB | 93,0 ms | <= 800 ms | PASS |
| Heap | 37,9 MB | <= 128 MB | PASS |
| axe violations | 0 | <= 0 | PASS |
| axe incomplete | 1 | <= 0 | REVIEW APPROVED |

Havia uma segunda armadilha operacional: um `node` obsoleto (PID 2168) segurava a
porta 3000 em `LISTENING` sem responder a uma unica requisicao. O sintoma e
indistinguivel do frontend desligado por inspecao de `netstat`. A distinguishing
observation e o `curl` com timeout: conexao estabelecida, zero bytes recebidos.

Procedimento antes de qualquer portao:

```bash
cd /c/Users/rapha/.gemini/Site/frontend && npm run dev
for r in / /aulas /biblioteca /quem-sou; do
  curl -s -o /dev/null -w "$r -> %{http_code}\n" "http://localhost:3000$r"
done
```

Quatro `200` e o portao mede. Qualquer `000` com a porta em LISTENING e processo
obsoleto: `taskkill /PID <pid> /F` e subir de novo.

## 4. Co-autoria

Este lote junta dois blocos de trabalho com origens distintas. A co-autoria e
declarada porque as duas identidades produziram o conteudo efetivamente commitado:

- **Space-Bunny-Alpha** (`hermes-agent`, Tier 1): medicao do portao, rastreamento
  dos relatorios diarios, extensao dos registros e fecho do ciclo.
- **Gemini 3.8 Flash** (`antigravity`, Tier 1): resolucao de modelo Ollama, schema
  JSON e fallback de contingencia em `engine/llm_api.py`, com os testes que o
  provam.

## 5. Limites

O caminho Ollama foi medido contra o daemon real em `127.0.0.1:11434`: inferencia
com schema, inferencia sem schema, traducao do erro do daemon e conferencia dos
26 aliases do manifesto contra as tags instaladas. Detalhe em
`REGISTRO-2026-10-05-resolucao-de-modelo-ollama-e-schema-json.md`, secao 3.1.

**O que continua sem medicao:** provedores externos (Nous Research e cloud) e
execucao em producao distribuida multi-host. Nenhum dos dois foi alterado por este
lote -- a revisao tocou apenas o caminho local.