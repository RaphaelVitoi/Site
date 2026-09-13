---
id: registro-2026-09-13-ci-typecheck-e-fronteira-de-capacidades
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Codex GPT-5.6 Sol <noreply@openai.com>"
criado_em: 2026-09-13T09:52:00-03:00
atualizado_em: 2026-09-13T10:39:24-03:00
classes: [interno, medido, pmev, engines, ci, autenticacao, capacidades]
caminhos:
  - api/v1/middleware.py
  - docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md
  - frontend/src/lib/engineCapabilities.ts
  - pyproject.toml
  - tests/test_fronteira_produto_operador.py
  - uv.lock
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  head: 5329d1bb923ebc945214ef63965059f577e37248
  so: Windows
  python: '3.14.6'
  node: '24.x no CI; runtime local conforme lockfile'
verificado:
  - >-
    CI REMOTO: o run 34757696850 terminou em failure somente no job Frontend
    TypeScript & Next.js Build. As matrizes Python 3.12 e 3.13 passaram. A causa
    exata foram 28 ocorrencias TS4111 em engineCapabilities.ts: propriedades de
    Record<string, unknown> acessadas por ponto sob noPropertyAccessFromIndexSignature.
  - >-
    CORRECAO SEM RELAXAMENTO: todos os campos desconhecidos do manifesto passaram
    a ser lidos por indexacao explicita. npm run typecheck e o build Next de
    producao passaram localmente; nenhuma opcao do compilador foi removida ou
    enfraquecida.
  - >-
    INTEGRACAO HTTP: o gateway Pluribus possuia executor autenticado real, mas o
    JWT de produto era barrado antes do handler porque as rotas matematicas novas
    nao estavam em ROTAS_DE_PRODUTO. O defeito era de integracao, nao do calculo.
  - >-
    P2.1 CONCLUIDA: POLITICA_ROTAS_DE_PRODUTO declara path e metodo. Pluribus,
    DeepStack, ReBeL, Claudico, Chen/Ankenman e Janda admitem apenas POST; o
    manifesto de capacidades admite apenas GET. Metodo nao declarado falha fechado.
  - >-
    CONTRAPROVA DE SEGURANCA: arquivos, ingestao, fila, estado global, buckets e
    oraculo continuam recusando JWT de produto. Um teste deriva as rotas backend
    do manifesto e exige que todas tenham capacidade POST declarada na politica.
  - >-
    TDD: nove casos de engine/canonical foram observados falhando com HTTP 403
    antes da ampliacao. Depois da politica, 34 testes da fronteira e handlers
    passaram com zero erros, warnings ou itens nao executados.
  - >-
    REPRODUTIBILIDADE DO PORTAO: o cwv_gate.ps1 exige
    .venv/Scripts/python.exe -m pip_audit, mas pip-audit nao constava dos dois
    grupos dev declarados. uv sync --locked o removeu e quatro testes de
    truthfulness falharam pelo mesmo returncode. Depois de declarar
    pip-audit>=2.10.1 e regenerar o lock, a ferramenta respondeu 2.10.1 e os
    quatro casos passaram em 128,54 s, sem warnings ou itens nao executados.
  - >-
    ARBITRAGEM TIER 0: Raphael Vitoi vetou a repeticao integral no pre-push por
    lentidao e custo demasiado em tokens. Antes do commit, o mesmo conteudo ja
    havia concluido a suite com 1216 aprovados, um pulado e zero falhas em
    433,79 s. O pre-push repetido foi interrompido a 28%, sem falha observada;
    os portoes de cinco fases, CVE, SRI, higiene, ancoras e registros haviam
    terminado novamente com exit zero antes da interrupcao.
nao_verificado:
  - >-
    O reparo ainda nao foi publicado e portanto o CI remoto de substituicao nao
    foi executado. Build local nao e prova de CI remoto.
  - >-
    A suite integral posterior executou 1217 casos: 1214 passaram, um foi pulado
    por ausencia de arvore superseded e dois reprovaram por mudancas concorrentes
    fora deste lote. .vscode/settings.json recebeu uma credencial em texto claro,
    e .claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md foi removido enquanto continua
    declarado no manifesto. Nenhum marcador verde foi gravado e nenhum desses
    alvos foi incorporado ao stage.
  - >-
    P1.4 permanece parcial: existe WASM real para Monte Carlo de equidade, mas nao
    existe executor WASM semanticamente equivalente ao contrato Pluribus. Nenhum
    runtime foi renomeado ou simulado para preencher essa lacuna.
  - >-
    P2.2, auditoria visual responsiva, A11y e CWV do painel, permanece pendente.
revisoes_de_ancora:
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos: [api/v1/middleware.py]
    parecer: >-
      A validacao HS256, claims temporais, emissor, audiencia e origem confiavel
      permanece inalterada. A mudanca ocorre depois da identidade validada e
      estreita a autorizacao por metodo; nao reabre mensagens internas de erro,
      rotas orfas ou falhas de bind tratadas pelo registro anterior.
  - registro: registro-2026-09-13-contrato-de-capacidades-e-paridade-de-engines
    caminhos:
      - api/v1/middleware.py
      - docs/architecture/ENGINE_CAPABILITY_INTEGRATION_PLAN.md
      - frontend/src/lib/engineCapabilities.ts
      - tests/test_fronteira_produto_operador.py
    parecer: >-
      O contrato e os niveis das engines permanecem identicos. A indexacao explicita
      corrige apenas compatibilidade com o compilador estrito, enquanto a politica
      HTTP torna alcançavel o executor autenticado que o registro anterior ja
      declarava, sem promover WASM ausente a runtime ativo.
  - registro: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
    caminhos: [api/v1/middleware.py, tests/test_fronteira_produto_operador.py]
    parecer: >-
      A separacao produto-operador permanece fail-closed e ganha granularidade de
      metodo. Somente calculos puros sobre o corpo recebido entram na faixa; as
      rotas com autoridade sobre host, disco, fila ou estado continuam recusadas.
  - registro: plan-dependency-boundary-reconciliation-2026-09-01
    caminhos: [pyproject.toml, uv.lock]
    parecer: >-
      A fronteira runtime/dev permanece: pip-audit entra somente nos dois grupos
      dev e o lock ganha seu subgrafo. O comando exigido pelo plano passa a ser
      reproduzivel em ambiente limpo; requirements.txt e os pisos de runtime nao
      mudam.
  - registro: auditoria-2026-09-02-integridade-do-projeto-e-piso-de-transformers
    caminhos: [pyproject.toml, uv.lock]
    parecer: >-
      Os pisos de transformers e demais constraints permanecem byte a byte. O
      relock adiciona apenas pip-audit e dependencias de sua ferramenta de
      desenvolvimento; nenhuma versao da arvore de runtime medida pela auditoria
      foi rebaixada ou promovida.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: [pyproject.toml]
    parecer: >-
      O aceite condicionado de chromadb, os hooks, LFS e a malha agentica nao
      mudam. A lacuna historica de pip-audit ausente no venv deixa de depender de
      instalacao local acidental porque a ferramenta passa a integrar dev.
  - registro: handoff-2026-09-10-lint-lighthouse-e-aceite-cve
    caminhos: [pyproject.toml]
    parecer: >-
      Configuracao de lint, stubs, artefato Lighthouse e aceite de CVE permanecem
      intactos. A adicao e restrita ao grupo dev e restaura a auditoria Python que
      o proprio portao desse handoff executa.
  - registro: registro-2026-09-09-remediacao-dependabot-httpx2
    caminhos: [pyproject.toml, uv.lock]
    parecer: >-
      O piso e as versoes de httpx2/httpcore2 permanecem inalterados. A mudanca
      adiciona somente o auditor ao grupo dev e seu subgrafo ao lock, sem ampliar
      a superficie de transporte ou reabrir as advisories remediadas.
---

# CI estrito e fronteira de capacidades das engines

## Diagnóstico causal

O primeiro push da fundação de engines passou integralmente em Python 3.12 e
3.13, mas falhou antes do build frontend. O Linux não revelou uma diferença
semântica da engine; revelou que o caminho local anterior não havia executado o
mesmo `npm run typecheck` da workflow depois da última forma do arquivo.

O erro foi reproduzido localmente antes da correção. A solução foi obedecer ao
contrato de `Record<string, unknown>` com acesso por índice. Desligar
`noPropertyAccessFromIndexSignature` apagaria o detector que encontrou o defeito.

## Fronteira executável

Uma rota matemática de produto precisa satisfazer simultaneamente:

1. ser cálculo puro sobre a entrada autenticada;
2. não ler ou escrever disco, fila, ingestão ou estado global operacional;
3. constar explicitamente na política;
4. aceitar somente o método HTTP registrado no servidor;
5. continuar sujeita à validação de schema do próprio handler.

As nove rotas de adapters e jogos canônicos satisfazem essas condições. A
política continua explícita no middleware; o manifesto não concede autoridade
por si mesmo. O teste de correspondência detecta divergência entre ambos sem
transformar metadado de engine em configuração automática de segurança.

## Continuidade

Com P2.1 concluída, o caminho HTTP do gateway Pluribus deixa de ser apenas código
alcançável por credencial de operador e passa a ser uma capacidade real do
produto autenticado. P1.4 continua aberta exclusivamente na perna WASM
equivalente, que exige implementação e paridade próprias.
