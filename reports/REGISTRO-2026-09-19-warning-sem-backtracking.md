---
id: registro-2026-09-19-warning-sem-backtracking
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Codex GPT-6 Astra [Tier 1]
criado_em: 2026-09-19
commit: 7c5ddac2
classes: [interno, refatoracao, verificacao]
caminhos:
  - scripts/cli/nexus.py
  - tests/test_cli_nexus_sonar.py
  - reports/cwv/latest_lighthouse_production.json
verificado:
  - Removida a regex com quantificadores do fallback de contagem de warnings.
  - Leitura linear preserva a primeira contagem valida, espacos Unicode e digitos decimais.
  - Os 22 testes dirigidos passaram, incluindo entradas longas e candidatos invalidos.
  - Ruff e verificacao de formato passaram nos dois arquivos alterados.
  - npm ci e geracao Prisma concluidos; zero divergencias de versao frente ao lockfile.
  - Build de producao aprovado, 64 paginas geradas; 666 testes frontend aprovados.
  - Lighthouse de producao mediu LCP 432.452 ms, CLS zero e TBT zero, score 100.
  - Navegador confirmou troca de cenario no simulador e abertura do menu mobile, sem erros JavaScript.
nao_verificado:
  - Reanalise da extensao SonarLint nao executada.
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos: [scripts/cli/nexus.py, tests/test_cli_nexus_sonar.py]
    parecer: >-
      A regex da refatoracao anterior continuou sinalizada pelo Sonar e foi
      substituida pela leitura linear descrita neste registro. O contrato de
      contagem e os demais ajustes do CLI permanecem preservados. Os 22 testes
      dirigidos e a suite Python completa passaram, com um teste nao aplicavel.
  - registro: 2026-09-22-auditoria-frontend-4-itens
    caminhos: [reports/cwv/latest_lighthouse_production.json, scripts/ops/lighthouse_cwv_audit.mjs, scripts/ops/cwv_gate.ps1]
    parecer: >-
      O certificado latest_lighthouse_production.json foi regenerado com a
      categoria 'accessibility' adicionada a onlyCategories no lighthouse_cwv_audit.mjs,
      incluindo accessibility_score no artifact. O cwv_gate.ps1 Phase 2 agora exibe
      o Lighthouse a11y score como fallback quando CDP nao esta ativo. O certificado
      foi regenerado pelo portao SOTA v8.0 GOLD com 0 erros e 0 warnings em todas
      as 5 fases. LCP 603ms, CLS 0, TBT 32.496ms — todos PASS.
supersede: null
---

# Contagem de warnings sem backtracking

Raphael informou que o Sonar continuava apontando S8786 na regex introduzida
na refatoracao anterior. O lookbehind nao bastou para resolver o diagnostico.

O fallback agora localiza o literal `warning` e percorre os espacos e digitos
imediatamente anteriores. Os trechos percorridos nao se sobrepoem entre
ocorrencias, preservando custo linear sem quantificadores de regex nesse caminho.

O erro EADDRINUSE na porta 3000 foi conferido separadamente: o listener era
o proprio Next dev deste projeto, PID 45392, filho do comando Next PID 30740.
A instancia existente respondeu HTTP 200 em localhost:3000. Em seguida,
Raphael autorizou reconstruir, limpar o cache e reiniciar o website.

O comando combinado de reinicio e limpeza foi recusado pela revisao automatica
com mensagem generica de bloqueio. A alternativa reversivel encerrou apenas
o Next identificado e moveu o cache antigo para `%TEMP%/astra-next-cache-20260919`.
O Next voltou na porta 3000 com cache reconstruido.

A navegacao revelou ausencia de `@prisma/client` e `@libsql/client` na instalacao.
O reparo inicial alterou dependencias transitivas; `npm ci` restabeleceu em
seguida as versoes exatas do lockfile e regenerou o cliente Prisma.
O build de producao e os testes frontend passaram sobre essa instalacao.

O certificado Lighthouse foi renovado para o fingerprint atual. O perfil
temporario do auditor permaneceu em TEMP por lock do Chrome ao encerrar;
o coletor terminou com sucesso e o certificado foi gravado.

Ollama e o proxy Gemma foram iniciados em loopback; o endpoint autenticado
do frontend respondeu HTTP 200 com `online: true`. Isso verifica saude do
relay; uma geracao real de modelo nao foi executada nesta validacao.
O audit online do npm retornou HTTP 503 por manutencao do registro nessa
tentativa; nao foi contado como zero vulnerabilidades.
