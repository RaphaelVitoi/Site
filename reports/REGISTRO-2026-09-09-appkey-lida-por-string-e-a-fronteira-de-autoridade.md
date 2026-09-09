---
id: registro-2026-09-09-appkey-lida-por-string-e-a-fronteira-de-autoridade
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-08-aberturas"
criado_em: 2026-09-09T14:10:00-03:00
atualizado_em: 2026-09-09T14:10:00-03:00
classes: [interno, medido, correcao, backend, seguranca]
caminhos:
  - api/v1/handlers.py
  - api/v1/middleware.py
  - database/lab_manager.py
  - tests/test_appkey_contexto_da_app.py
  - tests/test_fronteira_produto_operador.py
  - tests/test_database_sota.py
supersede: null
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.6'
verificado:
  - >-
    APPKEY NAO E STRING, medido com aiohttp real: gravar sob a AppKey tipada e
    ler por string devolve None. Tres handlers liam o contexto por string
    literal -- handlers.py:307 (lab_manager), 421 (audit_engine) e 928 (manager)
    -- e recebiam None em TODA requisicao.
  - >-
    AS TRES CONSEQUENCIAS ERAM DISTINTAS. A rota de torneios respondia HTTP 500
    "LabManager nao inicializado" com ele inicializado. A rota de logs do
    frontend respondia 500 e recusava TODA a telemetria. E a rota de metricas
    fazia "if manager and ...", pulando em silencio: publicava zero tarefas
    pendentes para sempre. A terceira e a pior porque nao aparece.
  - >-
    B08 CONFIRMADO POR TRES MEDICOES INDEPENDENTES: Tournament e
    TournamentScenario estao ausentes do schema.prisma (que declara 6 models) E
    do banco vivo frontend/prisma/dev.db (que tem exatamente esses 6 mais
    PmevBenchmarkStudy, criada pelo proprio DAO, e sqlite_stat1). E git grep nao
    acha um unico componente do frontend chamando a rota de torneios.
  - >-
    B08 CORRIGIDO NA CAUSA: as tres leituras do LabManager levantam
    LabPersistenceUnavailableError em vez de devolver lista vazia, e o handler
    responde 503 com diagnostico. Persistencia ausente deixou de ser
    indistinguivel de "zero torneios".
  - >-
    B08, SEGUNDA METADE: o metodo de gravar benchmark preenchia por default uma
    origem de solver comercial e doze metricas com quatro casas decimais quando
    os campos faltavam. Passa a recusar com ValueError; CAMPOS_DE_PROCEDENCIA
    nomeia os doze. id e raw_data seguem opcionais -- identidade e anexo nao
    afirmam resultado.
  - >-
    B07 REPRODUZIDO: com um JWT HS256 valido de usuario comum (role
    authenticated), a rota de leitura de arquivos alcancava o handler com status
    200. O mesmo para listagem de arquivos, ingestao, fila, estado global,
    buckets e oraculo.
  - >-
    B07 CORRIGIDO POR FAIXA FAIL-CLOSED: ROTAS_DE_PRODUTO declara as 11 rotas que
    a identidade de produto alcanca; rota nao declarada nasce fechada. user_role
    e user_id, que tinham ZERO leitores no backend, passam a delimitar o alcance.
  - >-
    A SEPARACAO NAO QUEBRA CONSUMO REAL, medido antes de aplicar: nenhum
    componente do frontend fala com o backend diretamente -- as chamadas passam
    por rotas server-side do Next com credencial de servico. O unico caminho
    literal encontrado foi o do oraculo, em frontend/src/app/api/v1/rag/route.ts,
    que e server-side.
  - >-
    SUITE PYTHON: 1077 passed, 1 skipped, zero warnings, Homeostase Total,
    rodada pelo PowerShell. Eram 1060 na abertura desta continuacao.
  - >-
    TDD COM ISCA EM TODAS AS CORRECOES: cada teste foi visto FALHAR pelo motivo
    certo antes da correcao, com o item nomeado na mensagem. A contraprova de
    escopo do B07 e test_jwt_de_produto_alcanca_rota_de_produto -- provar que o
    indesejado saiu nao basta sem provar que o legitimo continua entrando.
nao_verificado:
  - >-
    NAO DECIDI se Tournament e TournamentScenario sao legado (remover o DAO e a
    rota) ou schema incompleto (declarar os models e migrar). As duas sao
    reducoes ou ampliacoes materiais na acepcao da secao 8.2, e a escada manda
    pedir autorizacao. A divergencia fica declarada e agora falha alto; escolher
    e do Tier 0.
  - >-
    NAO alterei o banco vivo. Nenhum prisma db push, migrate ou DDL foi
    executado sobre frontend/prisma/dev.db.
  - >-
    NAO auditei se o teste test_lab_manager_flow deveria continuar criando as
    proprias tabelas. Ele passa porque inventa o schema que testa -- ficava verde
    enquanto a rota de produto morria. Corrigi o teste vizinho, que fixava o
    defeito como contrato, mas nao este.
  - >-
    A faixa ROTAS_DE_PRODUTO e uma decisao de politica minha sob delegacao. Nao
    ha uso multiusuario em producao para confirma-la empiricamente; ela foi
    derivada do criterio "calculo puro sobre a entrada da requisicao e leitura
    inocua de saude".
  - >-
    NAO rodei a skill security-review sobre estas alteracoes.
  - >-
    NAO verifiquei se algum consumidor externo ao repositorio depende da resposta
    vazia da rota de torneios.
revisoes_de_ancora:
  - registro: registro-2026-09-01-fronteira-http-e-portao-independente-de-perfil
    caminhos:
      - api/v1/handlers.py
      - api/v1/middleware.py
    parecer: >-
      Aquele registro endureceu a fronteira HTTP contra rotas orfas, falha de
      bind engolida, vazamento em 500 e JWT permissivo. A presente alteracao
      reforca essa mesma fronteira em dois pontos: em handlers.py, corrige a
      leitura de contexto da aplicacao (AppKey tipada em vez de string literal)
      e faz a rota de torneios falhar alto com 503 quando a persistencia nao
      estiver disponivel; em middleware.py, implementa a autorizacao fail-closed
      por faixa de produto (ROTAS_DE_PRODUTO), inspecionando user_role e user_id
      do JWT para fechar o achado B07. Nenhuma protecao anterior foi relaxada.
  - registro: registro-2026-09-07-procedencia-do-timesfm-e-json-do-cli
    caminhos:
      - api/v1/handlers.py
    parecer: >-
      Aquele registro fixou a procedencia e os metadados do TimesFM emitidos
      pelo handler de forecast de calibracao. As correcoes atuais em handlers.py
      sao estritamente focadas na resolucao de AppKey tipada e na persistencia
      de torneios (B08), nao tocando na logica, contratos de saida ou procedencia
      do TimesFM, que seguem identicos ao que aquele registro estabeleceu.
  - registro: registro-2026-09-08-auditoria-de-tipagem-e-recorte-do-fingerprint
    caminhos:
      - api/v1/handlers.py
    parecer: >-
      Aquele registro ancorou handlers.py no contexto de auditoria de tipagem e
      supressoes de linter. As modificacoes atuais mantem conformidade estrita de
      tipagem ao substituir chaves string por AppKeys tipadas do aiohttp, sem
      introduzir warnings ou supressoes adicionais.
  - registro: validacao-2026-09-07-findings-do-astra-contra-o-codigo
    caminhos:
      - database/lab_manager.py
    parecer: >-
      Aquela validacao classificou o achado B08 como ABERTO ao constatar que
      Tournament nao constava no schema.prisma enquanto o DAO consultava a tabela.
      Este commit implementa o tratamento correto na camada de persistencia: o
      LabManager passa a levantar LabPersistenceUnavailableError em vez de engolir
      a falha e devolver lista vazia, e rejeita estudos sem os doze campos de
      procedencia mandatorios. O finding B08 e assim enderecado na causa, mantendo
      a validacao anterior integra como especificacao do problema.
referencias_nao_resolviveis: []
---

# A chave que não era a chave, e a porta sem fechadura

## O que o achado dizia, e o que estava embaixo

O `B08` do Astra descrevia um defeito real: o DAO consulta tabelas ausentes do
schema e converte `OperationalError` em lista vazia, então *"erro de schema pode
se tornar resposta de sucesso sem torneios"*.

Ele nunca chegou lá. Medindo antes de corrigir, a rota de torneios respondia
**HTTP 500** em toda requisição, e a mensagem era falsa: *"LabManager nao
inicializado"*, com o `LabManager` inicializado em `create_app`.

`create_app` grava sob a `AppKey` tipada. O handler lia pela string — e as duas
não são a mesma chave. Medido com aiohttp real, não deduzido: a leitura por
string devolve `None`.

## O mesmo defeito, três vezes, e a pior não aparece

| handler | efeito |
| :--- | :--- |
| `handle_get_tournaments` | 500 com mensagem que se desmente |
| `handle_frontend_logs` | 500 — **toda** telemetria do frontend recusada |
| `handle_prometheus_metrics` | `if manager and ...` — pula em silêncio |

A terceira é a que importa. A rota de métricas publicava zero tarefas pendentes
independentemente da fila. Um painel mostra zero, e zero é um estado legítimo —
não há como desconfiar do número.

É o padrão dos seis instrumentos outra vez: a métrica media *"o dicionário
vazio"* e era lida como *"nenhuma tarefa pendente"*. Por isso o teste dessa
métrica **enfileira uma tarefa real** antes de medir: o discriminante não pode
ser o valor.

## B08, alcançado enfim

Com a leitura corrigida a rota chega ao banco, e o achado original aparece. As
três medições convergem: as tabelas não existem no schema, não existem no banco,
e ninguém no frontend chama a rota.

Corrigi **a causa**, não a divergência: as leituras levantam
`LabPersistenceUnavailableError` e o handler responde `503`. Persistência ausente
deixou de ser indistinguível de laboratório vazio.

**Não decidi entre remover o DAO e declarar os models.** As duas mexem em
produto ou em banco, e a escada da §8.2 manda pedir autorização antes de redução
material. A divergência fica declarada — e agora ruidosa.

A segunda metade do `B08` era mais grave do que parecia: gravar um estudo sem os
campos produzia no banco um registro com origem de solver comercial e doze
métricas com quatro casas decimais. Um ledger que completa lacunas com defaults
deixa de ser evidência.

## B07 — a identidade que era extraída e jogada fora

O middleware gravava `user_id` e `user_role`. `git grep` achava **zero
leitores**. Um JWT de usuário comum do site alcançava a rota que lê o disco do
projeto — reproduzido com token HS256 assinado, status 200.

A faixa é **fail-closed**: `ROTAS_DE_PRODUTO` declara as onze rotas que a
identidade de produto alcança, e rota nova nasce fechada. O critério é estreito
— cálculo puro sobre a entrada da requisição e leitura inócua de saúde. Fila,
estado global, disco, ingestão e busca ficam fora, porque nenhuma delas é sobre
o usuário que pergunta.

Medi antes de aplicar que isso não quebra nada: o browser nunca fala com o
backend. Tudo passa por rotas server-side do Next, com credencial de serviço.
A separação fecha a porta **antes** de ela ser aberta, que é o que o achado
pedia.

## Método

Cada correção teve isca vista falhar pelo motivo certo, com o item nomeado na
mensagem. E o `B07` tem contraprova de escopo — provar que o indesejado saiu não
prova que a faixa não ficou larga demais.

Duas asserções minhas abortaram gravações no caminho, e as duas estavam certas
em abortar: uma contava ocorrências erradas, a outra casava com um comentário
que eu mesmo acabara de escrever citando os valores proibidos.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** fechar `B08` e `B07` do Astra na causa, e registrar o defeito de
contexto de aplicação que estava embaixo do `B08` e que nenhum achado descrevia.
