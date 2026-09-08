---
id: registro-2026-09-07-promocao-do-duo-gemini-na-faixa-gratuita
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-pmev"
criado_em: 2026-09-07T22:20:00-03:00
atualizado_em: 2026-09-07T22:20:00-03:00
classes: [interno, medido, roteamento, governanca, decisao-do-tier-0]
caminhos:
  - llm/routing_policy.py
  - data/ESTADO_DE_ROTEAMENTO.json
  - reports/FRENTE-4-2026-08-28-autoridade-de-roteamento.md
  - tests/test_routing_policy.py
  - scripts/ops/invoke_lighthouse_production_audit.ps1
revisoes_de_ancora:
- registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
  caminhos: [llm/routing_policy.py, tests/test_routing_policy.py]
  parecer: >-
    Reconciliacao mais direta das treze, e por afinidade: aquele registro fixou
    que capacidade, procedencia e autorizacao sao TRES EIXOS, e retirou a familia
    Fable por FAIXA DE ACESSO, nao por capacidade. Esta promocao aplica a mesma
    distincao ao caso simetrico -- o gemini-3.8-flash sai de duas rotas por
    adequacao a faixa GRATUITA, e por isso NAO vai para MODELOS_RETIRADOS: ele
    continua no registro, verificado, autorizado e em uso como fallback. Retirar
    do registro um modelo que a malha ainda usa seria justamente a confusao de
    eixos que aquele registro proibiu.
- registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
  caminhos: [llm/routing_policy.py, tests/test_routing_policy.py]
  parecer: >-
    Aquela auditoria avaliou o TRABALHO de uma sessao conduzida pelo
    gemini-3.8-flash; ela nao estabelece o 3.8 como primario de faixa gratuita, e
    nada do que ela mediu depende disso. Vale notar sem ironia: a analise que
    motivou tirar o 3.8 da cota livre veio de outra sessao do proprio 3.8, e o
    modelo segue conduzindo trabalho nesta malha.
- registro: handoff-2026-08-29-auditoria-integridade-repositorio
  caminhos: [llm/routing_policy.py]
  parecer: >-
    A ancora ali e sobre ForaDaAutoridadeDaPolitica(LookupError) -- a recusa da
    politica em atribuir modelo a subagente. Essa excecao nao foi tocada, e
    test_a_politica_recusa_atribuir_modelo_a_subagente segue verde. A alteracao
    e de valor de dois campos primario, dentro da tabela de agentes.
- registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json, llm/routing_policy.py]
  parecer: >-
    A superficie de subagentes ficou intacta: a_politica_atribui_modelo continua
    false, os 15 tiers seguem em custo zero e a hierarquia de tiers nao mudou. O
    que mudou no ESTADO foi o campo modelos_distintos_no_caminho_quente, que e da
    superficie de AGENTES.
- registro: handoff-2026-08-29-roteamento-memoria-e-guard
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json]
  parecer: >-
    Roteamento, memoria e guard continuam como aquele handoff os deixou. A edicao
    no ESTADO e aditiva -- uma contagem corrigida de 5 para 6 e um bloco
    revisao_2026_09_07 -- e nao altera nenhuma das decisoes que ele registrou.
- registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
  caminhos: [llm/routing_policy.py, tests/test_routing_policy.py]
  parecer: >-
    A trava de LFS e a fase 5 do portao nao tem intersecao com esta mudanca, e o
    portao de 5 fases passou verde neste commit. Da malha agentica, os 19 agentes
    continuam 19 e todos seguem a politica; mudou o modelo de 6 deles, nas duas
    classes de faixa gratuita.
- registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json, llm/routing_policy.py]
  parecer: >-
    Nenhuma resolucao de CodeRabbit ou de linter e afetada: a alteracao troca
    valores de campo e acrescenta justificativa, sem mexer em estrutura, import
    ou assinatura. A suite fechou em 979 aprovados e zero warnings.
- registro: handoff-2026-08-30-status-malha-agentica-e-routing
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json, llm/routing_policy.py]
  parecer: >-
    Este e o registro cujo objeto de fato mudou -- ele descreve o STATUS do
    roteamento, e o status e outro a partir de hoje. Por isso a atualizacao nao
    ficou so aqui: ESTADO_DE_ROTEAMENTO.json traz o numero novo medido por
    execucao, e o registro da frente 4 recebeu nota de revisao datada. O handoff
    de 30/08 permanece correto para a data dele e nao se reescreve.
- registro: registro-2026-08-29-o-fallback-que-nao-carrega
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json, tests/test_routing_policy.py]
  parecer: >-
    Aquele registro trata da classe LOCAL -- gemma4:e4b a 9,6 GB e gemma4:12b a
    7,6 GB contra 7,2 GB de VRAM declarada. A classe LOCAL nao foi tocada, a
    pendencia continua aberta como ele a deixou, e
    test_nenhuma_rota_local_nova_estoura_a_vram_declarada segue verde. As rotas
    alteradas sao de faixa GRATUITA, que e rede e nao VRAM.
- registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    A invariante daquele registro -- o certificado tem de VIAJAR versionado, nao
    so existir na maquina de quem mediu -- continua intacta e voltou a operar:
    o artefato foi regravado e versionado no mesmo commit da sessao que o
    produziu. O conteudo mudou; a regra, nao.
- registro: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
  caminhos: [reports/cwv/latest_lighthouse_production.json]
  parecer: >-
    O que aquele registro conquistou esta preservado e foi remedido nesta sessao:
    tbtMs 0, lcpMs 396.163, cls 0, performanceScore 1 e fingerprint identico ao
    frontend atual, com o portao de 5 fases em zero warnings. Acrescento um fato
    que ele nao tinha: o auditor que produz esse certificado saia com exit 1 em
    TODA execucao, por lock na limpeza do perfil temporario -- corrigido no
    commit anterior e agora medido em exit 0.
- registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json, llm/routing_policy.py]
  parecer: >-
    A analise integral daquele dia continua valendo em estrutura: 19 agentes, as
    mesmas classes de tarefa, as mesmas quatro faixas e a mesma distribuicao por
    faixa (11 gratuita, 7 paga, 1 local), remedida por execucao hoje. O unico
    numero dela que se desloca e a contagem de modelos distintos no caminho
    quente, e ele esta atualizado no ESTADO.
- registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
  caminhos: [data/ESTADO_DE_ROTEAMENTO.json, llm/routing_policy.py]
  parecer: >-
    O impacto quantitativo daquele relatorio se apoia na contagem de agentes em
    custo marginal zero, e ela nao mudou: seguem 12 de 19, porque as rotas
    trocaram de MODELO sem trocar de FAIXA. Qualitativamente a mudanca melhora o
    quadro dele -- na cota livre o teto sobe de 50 RPD para 1.500 e 2.000 RPD por
    chave, embora eu nao tenha medido essas cotas, que vem do estudo citado.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
objetivo: >-
  Promover o duo Gemini 3.6 Flash e 3.5 Flash-Lite nas duas rotas de faixa
  gratuita, por decisao do Tier 0, e fechar a verificacao pendente do auditor
  Lighthouse.
classe_tarefa: promocao-de-rota-por-decisao-de-politica
criterio_de_aceite:
  - As duas rotas de Faixa.GRATUITA deixam de rotear para modelo inadequado a faixa.
  - O gemini-3.8-flash permanece no registro e onde a faixa e outra.
  - O detector da frente 4 acompanha a mudanca em vez de ser afrouxado.
  - O exit code do auditor Lighthouse corrigido fica medido, nao suposto.
verificado:
  - >-
    VERIFICACAO passou de gemini-3.8-flash para gemini-3.6-flash e OPERACIONAL
    para gemini-3.5-flash-lite, ambas em Faixa.GRATUITA, com fallback e
    escalonamento intactos. Confirmado por execucao de core.config.
  - >-
    AS DUAS CAMADAS EM SERIE DISCORDAVAM, e ninguem tinha medido:
    llm/routing._score_standard_preference pontua gemini-3.5 em -4 e gemini-3.6
    em -2, enquanto gemini-3.8-flash cai no generico 'flash' e pontua 3 -- pior
    que os tres. A heuristica de economia ja preferia o duo; era a tabela de
    ROTAS que mandava o 3.8. A promocao alinhou as camadas.
  - >-
    O caminho quente foi de 5 para 6 modelos distintos, medido por
    core.config.AGENT_MODEL_MAP. O detector da frente 4 guarda contra COLAPSO, e
    a mudanca anda no sentido oposto. ESTADO_DE_ROTEAMENTO.json e o registro da
    frente 4 foram atualizados no mesmo commit, como o proprio teste exige.
  - >-
    As faixas por agente nao mudaram, remedidas por execucao: 11 gratuita, 7
    api_paga, 1 local, 12 em custo marginal zero, e 19 agentes resolvidos.
  - >-
    gemini-3.5-flash-lite custa 0.15/0.60 por 1M contra 0.20/1.20 da
    gpt-5.6-luna. O primario da OPERACIONAL passou a ganhar NOS DOIS EIXOS, e a
    rota deixou de exemplificar a tensao faixa-contra-preco que documentava.
  - >-
    EXIT CODE 0 do invoke_lighthouse_production_audit.ps1 corrigido, MEDIDO nesta
    sessao apos liberar a porta 9230. O aviso de limpeza apareceu como projetado
    e nao derrubou o veredito. tbtMs 0, lcpMs 396.163, cls 0, performanceScore 1,
    e input_fingerprint_sha256 c44eb9946f4489879fb0392986e38e34fdd163fb9e97fabf94a5f464e48883cc
    identico ao fingerprint atual de frontend/.
  - >-
    O lock que causava o exit 1 e REPRODUTIVEL, nao acidental: ocorreu nas duas
    execucoes desta sessao, e havia perfil orfao de 2026-09-04 em TEMP. O auditor
    nunca saiu 0 antes desta correcao.
nao_verificado:
  - >-
    Nao medi latencia nem qualidade real do duo em producao. As cotas (1.500 e
    2.000 RPD, 1.000.000 TPM) vem do estudo da sessao do Gemini, nao de medicao
    minha, e gemini-3.7-flash segue NAO_VERIFICADO no registro quanto a preco.
  - >-
    avaliar_uso_condicional_pro continua devolvendo gemini-3.8-flash. Ela decide
    por PRECO UNITARIO contra o Sol, nao por faixa, e nao e uma rota. Fica fora
    do escopo desta promocao.
  - >-
    data/agents_manifest.json continua com primary_model gemini-3.8-flash em
    varios agentes. Isso NAO e divergencia: a secao 3 declara o manifesto como
    fonte da preferencia e a politica como fonte do modelo concreto, e
    test_conflitos_com_o_manifesto_estao_declarados segue verde.
  - >-
    O perfil temporario da ultima auditoria seguia travado ao fechar este
    registro. E residuo em TEMP, declarado pelo proprio aviso do script.
  - >-
    AS CADEIAS DE data/system_config.json NAO DISTINGUEM FAIXA, e nao as toquei.
    deep_thinking, coding e general_purpose comecam por gemini-3.8-flash; so
    fast_operations comeca pelo Lite. Pela secao 3 elas respondem outra pergunta
    -- ordem de fallback, nao modelo do agente --, entao encabecar com o modelo
    mais capaz e coerente ali. Mas se alguma dessas cadeias for exercida DENTRO
    da cota gratuita, o 3.8 volta a encabecar e o teto de 50 RPD reaparece por
    uma porta que esta promocao nao fecha. Nao medi se isso acontece hoje; quem
    for mexer em cadeia de fallback precisa saber disso antes.
---

# Registro: o duo Gemini promovido, e o auditor que nunca saía 0

**Sessão:** `claude-opus5-site-2026-09-07-pmev` · **Regime:** `assistida`
**Decisão:** Tier 0, nesta data.

---

## 1. A tabela mandava para onde a análise dizia que não se devia ir

A sessão do Gemini de 2026-09-07 concluiu — e o Tier 0 aprovou com nota 9,0 —
que o `gemini-3.8-flash` **não sustenta a faixa gratuita**: teto de 50 RPD e
4k–16k thinking tokens por chamada esgotam a cota em menos de uma hora de
trabalho agêntico.

A correção dela viveu em `llm/free_router.py`, um orquestrador que **nada no
runtime consome**. As duas rotas de `Faixa.GRATUITA` da tabela canônica
continuaram intactas, apontando para o modelo que a própria análise recusara.

É o mesmo padrão do Fable, corrigido dois commits antes: *a tabela roteava para
um modelo que a malha não usa, e nada acusava.*

## 2. A medição que ninguém tinha feito: as camadas já discordavam

O `ESTADO_DE_ROTEAMENTO.json` estabelece que `routing_policy` e `routing` operam
**em série** — a política escolhe o modelo, o reordenador ordena a lista de
tentativas.

Medido por execução nesta data:

| modelo | `_score_standard_preference` |
| :--- | ---: |
| `gemini-3.5-flash-lite` | **−4** |
| `gemini-3.6-flash` | **−2** |
| `gemini-3.7-flash` | −1 |
| `gemini-3.8-flash` | **3** |

Menor vence. **A heurística de economia já preferia o duo e já punha o 3.8
atrás dele** — porque o 3.8 não tem regra própria e cai no genérico `flash`.

As duas camadas em série discordavam, em silêncio. A promoção não abriu
divergência: fechou uma.

## 3. O que a promoção fez, e o que não fez

| Rota | Antes | Depois | Por quê |
| :--- | :--- | :--- | :--- |
| `VERIFICACAO` | `gemini-3.8-flash` | **`gemini-3.6-flash`** | auditoria e síntese, 1.500 RPD |
| `OPERACIONAL` | `gemini-3.8-flash` | **`gemini-3.5-flash-lite`** | triagem e parsing, 2.000 RPD, <300 ms |

**O 3.8 não foi retirado de nada.** Segue no `MODEL_REGISTRY`, `VERIFICADO`,
`autorizado`, e continua fallback de `architect` e `implementor`. A recusa é de
**faixa**, não de capacidade — os três eixos da §3 continuam separados, e é
exatamente a distinção que o caso Fable fixou.

## 4. Uma rota perdeu o argumento que a justificava

`test_operacional_usa_faixa_gratuita_e_nao_o_menor_preco` guardava a regressão de
rotear operacional para a `gpt-5.6-luna` por preço unitário. O argumento era: a
Luna custa menos e **ainda assim** perde para a faixa.

Com o Lite a **$0,15/$0,60** contra **$0,20/$1,20** da Luna, o primário passou a
ganhar **nos dois eixos**. A tensão sumiu daqui.

A regressão protegida continua a mesma — a Luna não volta a primária —, mas o
teste deixou de fixar a desigualdade de preço, que hoje é **falsa**. A regra
"cota livre vence preço unitário menor" é governança anterior a esta rota e não
depende dela; o que se perdeu foi o *exemplo*. Isso está declarado nos dois
lugares, em vez de virar prosa que não corresponde ao código.

## 5. O auditor Lighthouse nunca saiu 0

A verificação que ficara pendente no commit anterior está fechada: **exit code
0**, medido depois de liberar a porta 9230.

E o achado ficou maior do que parecia. O lock que derrubava o código de saída é
**reprodutível** — ocorreu nas duas execuções desta sessão —, e havia perfil
órfão de **2026-09-04** em `%TEMP%`. Ou seja: aquele script **nunca** saiu 0
desde que existe. Quem o automatizasse leria falha em toda execução e
descartaria um certificado válido.

O aviso apareceu como projetado, e o certificado saiu com `tbtMs 0`, `lcpMs
396,163`, `cls 0` e fingerprint idêntico ao `frontend/` atual.

---

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** executar a decisão do Tier 0 de promover o duo Gemini nas rotas de
faixa gratuita, alinhando a tabela canônica à heurística que já a contradizia, e
fechar por medição o exit code do auditor Lighthouse.
