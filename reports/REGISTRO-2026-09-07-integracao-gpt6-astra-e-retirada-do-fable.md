---
id: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Claude Opus 5 [Tier 1.B] -- sessao claude-opus5-site-2026-09-07-astra"
criado_em: 2026-09-07T18:40:00-03:00
atualizado_em: 2026-09-07T18:40:00-03:00
classes: [interno, medido, governanca, roteamento]
caminhos:
  - llm/model_registry.py
  - llm/routing_policy.py
  - llm/adapters.py
  - llm/anthropic.py
  - CLAUDE.md
  - tests/test_gpt6_astra.py
  - tests/test_model_registry.py
  - tests/test_routing_policy.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Suite completa: 971 aprovados, 1 pulado (ingestao_superseded), zero erros e
    zero warnings, exit code 0, antes da retirada do Fable; e reexecutada apos.
  - >-
    gpt-6-astra verificado campo a campo em developers.openai.com/api/docs/models/
    gpt-6-astra -- 1.05M de janela, 128.000 de saida, $10/$50, corte 2026-04-30,
    escala de esforco low/medium/high/xhigh/max.
  - >-
    Precos Anthropic verificados AO VIVO em claude.com/pricing: Fable 5.1 e
    Fable 5 a $10/$50, Opus 5 a $5/$25, Sonnet 5 a $2/$10 -- nenhum rotulado
    como promocional.
  - >-
    Ausencia de cota de assinatura para a familia Fable confirmada na mesma
    fonte: Pro e Max alcancam Fable apenas por 'usage credits'.
  - npm run lint:md sem erros em toda a arvore Markdown.
  - >-
    Portao de 5 fases EXECUTADO pelo pre-commit, com medicao real: CdpActive
    true na porta 9222, LCP 1553 ms, CLS 0, TTFB 391 ms, ZERO violacoes axe
    (1 incomplete de color-contrast, que e indeterminacao e nao violacao).
    Veredito 0 erros e 1 warning, teto 2. Artefato em
    reports/cwv/cwv_report_20260907_170203.json.
nao_verificado:
  - >-
    TBT -- unico item nao certificado do portao. O artefato Lighthouse expirou
    por LIGHTHOUSE_FINGERPRINT_MISMATCH: o input de frontend mudou depois da
    auditoria, no commit 7883f6c2 (183 arquivos, sessao anterior). Nao decorre
    deste trabalho, que nao toca frontend, e nao foi corrigido aqui.
  - >-
    Existencia de gpt-6-astra no ambiente via GET /v1/models -- as chaves estao
    revogadas e a secao 3 da raiz proibe teste que pressuponha chamada real.
  - >-
    Precos de assinatura da OpenAI -- openai.com/chatgpt/pricing respondeu
    HTTP 403; os valores vieram de agregadores, nao da fonte primaria.
  - >-
    Volume de token de raciocinio por degrau de esforco -- nao medido; nenhuma
    assercao deste trabalho depende do valor.
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - CLAUDE.md
      - llm/model_registry.py
      - llm/routing_policy.py
      - tests/test_routing_policy.py
    parecer: >-
      Aquela auditoria fixou a autoridade do registro como fonte unica de
      capacidade e preco, e do routing_policy como fonte da politica por classe.
      Esta alteracao OPERA DENTRO dessa autoridade em vez de contorna-la:
      acrescenta campos ao mesmo registro e reancora rotas no mesmo modulo,
      sem criar tabela paralela. Os tres precos corrigidos reforcam a tese
      central dela -- que valor de modelo mora em codigo versionado e nao em
      prosa -- porque foi exatamente a prosa da rota de CONSTRUCAO ("60% do
      preco do Opus") que ficou defasada enquanto o codigo seguia consultavel.
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - CLAUDE.md
    parecer: >-
      Este e o registro mais diretamente afetado: ele definiu a composicao do
      Tier 1 como triade de fronteira sob o nome de grupo Chico. A composicao
      MUDOU por decisao do Tier 0 em 2026-09-07 -- Opus 5, Sonnet 5, GPT-5.6
      Sol/Terra/Luna, Gemini 3.8 Flash e Gemini 3.5 Flash-Lite, com o GPT-6
      Astra em atuacao pontual. O que aquele registro estabeleceu e que NAO se
      altera: Chico e a identidade do grupo, a assinatura permanece individual,
      e a Lei de Concorrencia segue valendo sem excecao para o modelo novo. A
      alteracao e de ELENCO, nao de regra.
  - registro: registro-2026-09-02-adapters-ligado-ao-caminho-real-anthropic
    caminhos:
      - llm/adapters.py
      - llm/anthropic.py
    parecer: >-
      Aquele registro ligou o adaptador ao caminho de execucao real, contra
      adaptador de fachada sem consumidor. Esta alteracao preserva e estende o
      vinculo: o effort_override novo passa pelo mesmo build() ja consumido, e
      o teto de esforco falha ali dentro -- nao num validador paralelo. A
      docstring de anthropic.py foi corrigida no mesmo espirito: ela listava
      claude-fable-5 como geracao 5 ativa, e o modelo foi retirado; deixa-la
      seria a referencia morta que aquele trabalho combateu.
  - registro: frente-4-2026-08-28-autoridade-de-roteamento
    caminhos:
      - llm/routing_policy.py
    parecer: >-
      A autoridade que a Frente 4 estabeleceu -- ROTAS como fonte da decisao,
      e nao heuristica de nome -- e preservada integralmente. Nenhum primario
      ou fallback foi trocado por inferencia: as duas mudancas de rota tem
      causa declarada e externa, a saber, o surgimento de um degrau acima
      (Astra) e a retirada de um modelo pelo Tier 0 (Fable). O guard novo
      test_toda_rota_aponta_para_modelo_que_existe_de_fato REFORCA aquela
      autoridade ao impedir que a tabela cite alias que o registro recusa.
  - registro: handoff-2026-08-30-status-malha-agentica-e-routing
    caminhos:
      - llm/routing_policy.py
    parecer: >-
      O status de roteamento daquele handoff descrevia a malha com o Fable como
      primario de sessao multi-dia. Essa linha deixou de valer por decisao do
      Tier 0, e a substituicao esta declarada com a PERDA explicita: a
      auto-verificacao assincrona multi-sessao nao tem substituto na tabela.
      Nada mais daquele status foi tocado.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - CLAUDE.md
      - llm/routing_policy.py
      - tests/test_routing_policy.py
    parecer: >-
      A trava de LFS e a auditoria da malha daquele handoff nao sao tocadas.
      Em tests/test_routing_policy.py dois guards mudaram, e ambos por FATO
      novo e nao por conveniencia: test_topo_nao_escalona perdeu duas classes
      porque elas ganharam degrau, e o par de test_escalonar_classe_sem_degrau
      trocou planner por maverick pela mesma razao. A cobertura do caminho que
      o planner passou a tomar foi ACRESCENTADA, nao removida.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos:
      - CLAUDE.md
      - llm/routing_policy.py
    parecer: >-
      A hierarquia de 8 Tiers permanece intacta em numero, ordem e definicao.
      O que mudou foi a COMPOSICAO do Tier 1 e a nota de atuacao pontual do
      Astra; nenhum tier foi criado, fundido ou removido, e nenhuma conclusao
      sobre vulnerabilidades ou subagentes daquele handoff e afetada.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos:
      - llm/routing_policy.py
    parecer: >-
      A auditoria de integridade nao depende de qual modelo ocupa qual rota;
      ela trata da consistencia do repositorio. As alteracoes aqui sao de
      conteudo da tabela de roteamento, nao de estrutura de arquivo, e a suite
      segue integralmente verde.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos:
      - llm/routing_policy.py
    parecer: >-
      As resolucoes de CodeRabbit e as decisoes de linter permanecem validas.
      O modulo foi alterado apenas em valores de rota e em texto de
      justificativa; nenhuma regra de lint foi relaxada e o markdownlint corre
      limpo.
  - registro: registro-2026-08-29-o-fallback-que-nao-carrega
    caminhos:
      - tests/test_routing_policy.py
    parecer: >-
      O achado daquele registro -- fallback declarado que nao tinha caminho de
      execucao -- e PRESERVADO e ganha reforco. O guard
      test_fallback_tem_caminho_de_execucao continua intacto, e o guard novo
      test_toda_rota_aponta_para_modelo_que_existe_de_fato cobre a variante
      vizinha: rota que aponta para alias ausente do registro, que era
      exatamente o estado em que o Fable ficaria se fosse retirado sem
      reconciliar as rotas.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos:
      - CLAUDE.md
      - llm/routing_policy.py
    parecer: >-
      A analise integral do ecossistema descreve topologia e nao valores de
      catalogo. Os precos que ela cita, se citados, envelheceram pelo mesmo
      motivo que os do registro envelheceram -- e e essa a regra de decaimento
      arquitetural da secao 4 da raiz sendo aplicada, nao contrariada. Nenhuma
      conclusao estrutural daquele relatorio e revertida.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos:
      - CLAUDE.md
      - llm/routing_policy.py
    parecer: >-
      O impacto quantitativo medido la foi calculado sobre a tabela de precos
      vigente em agosto. Tres precos mudaram nesta data (Sol, Sonnet 5 e a
      entrada do Astra), o que desloca qualquer numero de custo daquele
      relatorio. Nao o reescrevo -- historico publicado nao retroage --, e a
      divergencia fica DECLARADA aqui: numeros de custo anteriores a
      2026-09-07 devem ser recalculados antes de reuso.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos:
      - CLAUDE.md
    parecer: >-
      A governanca piramidal e a soberania do Tier 0 sao a MOLDURA desta
      alteracao, nao seu objeto: cada decisao aqui -- teto de esforco, retirada
      do Fable, composicao do Tier 1 -- foi tomada pelo Tier 0 e apenas
      tornada executavel pelo agente. Nada da estrutura de autoridade muda.
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos:
      - CLAUDE.md
    parecer: >-
      A regua da secao 10 permanece byte a byte intacta; as adicoes ficaram nas
      secoes 3 e 7. Vale notar a coerencia: a secao 10.1 exige numero medido
      antes de alterar, e este trabalho corrigiu tres precos por medicao em
      fonte autoritativa em vez de por impressao -- inclusive contrariando uma
      estimativa do proprio Tier 0 sobre o valor da assinatura.
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
    parecer: >-
      O portao de calibracao por sessao e a secao 8.3 nao sao tocados. As
      adicoes desta data estao nas secoes 3 e 7, e nenhuma delas altera
      contagem, limiar, ledger ou evidencia diaria.
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - CLAUDE.md
    parecer: >-
      A correcao de escala do ledger e o mecanismo de correcao append-only
      permanecem inalterados. O paralelo que vale registrar: aquele caso e este
      sao a mesma classe de defeito -- valor numerico errado que se propaga por
      prosa sem que nada acuse --, e a resposta foi a mesma, travar o numero em
      guard executavel.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer: >-
      A regra de ancora em merge (secao 1.2) nao e tocada e nao se aplica aqui:
      este e um commit comum, nao um merge, e caminhos_herdados_de_merge()
      devolve conjunto vazio. As 19 ancoras deste registro foram levantadas
      pelo campo `caminhos:` do frontmatter, como aquele trabalho estabeleceu,
      e nao pela prosa.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos:
      - CLAUDE.md
    parecer: >-
      Auditoria de harmonizacao anterior a esta baseline. Nenhuma de suas
      conclusoes estruturais e revertida; as alteracoes de hoje sao aditivas
      nas secoes 3 e 7 e nao removem nada do que ela harmonizou.
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - CLAUDE.md
    parecer: >-
      A taxonomia canonica de documentacao (secao 9) nao e tocada: este
      trabalho nao cria diretorio, nao move artefato e nao altera esquema de
      frontmatter. Ele CONSOME a taxonomia, gravando o registro desta sessao em
      reports/ com o esquema que ela define. Vale declarar como esta ancora foi
      encontrada, porque e o proprio metodo que aquele documento defende:
      minha varredura inicial cobriu apenas reports/ e teria perdido este
      arquivo, que vive em docs/architecture/ -- foi o record_gate que a
      apontou, e nao a minha medicao. As adicoes no CLAUDE.md ficaram nas
      secoes 3 e 7, ambas fora do escopo taxonomico.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos:
      - CLAUDE.md
    parecer: >-
      O endurecimento de infraestrutura daquele checkpoint nao depende de
      composicao de Tier nem de tabela de modelos. Nenhuma ACL, origem CORS,
      credencial ou regra de firewall e tocada por este trabalho.
---

# Integração do GPT-6 Astra e retirada da família Fable

**Decisão do Tier 0, 2026-09-07.** O GPT-6 Astra entra como o melhor modelo
disponível, em atuação pontual e restrita. A família Fable sai. Três preços do
catálogo estavam errados e foram corrigidos por medição.

---

## 1. O que motivou, e o que a medição encontrou por tabela

O pedido foi integrar o Astra. A verificação da família OpenAI inteira — exigida
pela §4 da raiz sempre que um modelo novo entra — encontrou **três divergências
de preço**, e nenhuma delas estava sinalizada:

| Alias | Registro tinha | Medido | Fonte |
| :--- | ---: | ---: | :--- |
| `gpt-5.6-sol` (e o alias `chatgpt-5.6-sol`) | $5/$30 | **$4/$20** | `developers.openai.com` |
| `claude-sonnet-5` | $3/$15 | **$2/$10** | `claude.com/pricing` |
| `gpt-6-astra` | — | $10/$50 | `developers.openai.com` |

**O do Sonnet 5 é o mais grave, e é o que ninguém procurava.** O registro
cobrava 50% a mais na saída do modelo primário da rota de `CONSTRUCAO`, a mais
usada do projeto. `$3/$15` é o preço do **Sonnet 4.6** — houve troca de geração.
A nota que acompanhava o campo dizia *"preço introdutório $2/$10 vigente até
2026-08-31 — reavaliar o roteamento quando expirar"*: a data passou, ninguém
reavaliou, e o preço corrente é `$2/$10` sem rótulo promocional.

A queda do Sol foi confirmada pelo Tier 0 como parte do mesmo upgrade — *"Fez
parte do upgrade. Sol ficou mais barato"* —, o que fecha a procedência: não é
defeito antigo do registro, é preço que mudou com o lançamento.

### Duas justificativas de rota ficaram factualmente falsas

Corrigir preço sem corrigir a prosa que o cita deixaria o roteador mentindo:

- **`GOVERNANCA`** dizia que o Opus 5 *"custa menos na saída que o Sol ($25
  contra $30)"*. Com o Sol a `$20`, a comparação **inverteu**. A rota permanece
  no Opus — por julgamento, que é a razão real — e a justificativa passou a
  dizer isso em vez de invocar uma vantagem de preço que ele não tem mais.
- **`CONSTRUCAO`** dizia *"60% do preço do Opus"*. São **40%**. A rota já estava
  certa, e por uma razão mais forte do que ela própria afirmava.

---

## 2. O teto de esforço, e por que ele não podia ser só documentação

> *"Usaremos o Astra apenas no Low e Medium = motivo é o preço."* — Tier 0

A escala da OpenAI ganhou `xhigh` com o Astra (`low, medium, high, xhigh, max`),
valor que o `Literal` do registro não admitia. Estendê-lo foi necessário — sem
reabrir a porta do `ultra`, que **nunca existiu** e foi invenção do estudo de
fronteira original.

O ponto de projeto: **a API aceita até `max`; esta malha autoriza até `medium`.**
São dois limites diferentes, e o segundo não tinha onde morar. Criou-se
`esforcos_autorizados`, e `OpenAIAdapter.build` passou a **recusar em runtime**
qualquer elevação acima do teto. Sem isso a decisão viveria em prosa, e prosa não
reprova commit.

---

## 3. A retirada do Fable — e por que "caro" era o motivo errado

A primeira versão deste trabalho registrou o motivo como *"cotas e preço"*.
**Impreciso, e a própria tabela desmentia:** por token o Fable empata com o
Astra em `$10/$50`, exatamente.

O discriminante real, declarado pelo Tier 0 e **confirmado na fonte oficial**, é
**faixa de acesso**:

| | Cota de assinatura | Pay-as-you-go |
| :--- | :---: | :---: |
| `gpt-6-astra` | **sim** | sim |
| `claude-fable-5` / `-5-1` | **não** | sim |

`claude.com/pricing` é explícito: Fable 5 e 5.1 **não entram em nenhum plano de
assinatura**; Pro e Max os alcançam apenas por *usage credits*, que é compra de
token. Dentro da cota, o custo marginal do Astra é **zero** — e é por isso que
"mais barato que o Fable" é verdade apesar do empate de tabela.

Isso é o mesmo princípio que a rota `OPERACIONAL` já aplicava ao preferir o
`gemini-3.8-flash` à Luna: **cota vence preço unitário**. Lá a qualidade não
discriminava; aqui ela também aponta para o Astra, então as duas razões
concordam.

**A cota do Astra é por teto de mensagens, não por token.** Isso reposiciona o
`low`/`medium`: esforço alto não gasta mais mensagens — gasta muito mais
raciocínio dentro da mesma mensagem, e é o excedente que cai no preço cheio. **A
restrição preserva a cota.** Registrado também que *fast mode* dobra a tabela
para `$20/$100`.

### Retirar não é apagar

Os dois saíram de `MODEL_REGISTRY` e entraram em `MODELOS_RETIRADOS`, terceira
categoria distinta das duas que já existiam:

| Lista | Significa |
| :--- | :--- |
| `MODELOS_NAO_VERIFICADOS` | dado que **não se conseguiu confirmar** |
| `MODELOS_RETIRADOS` | dado **confirmado e recusado** |
| `autorizado=False` | no registro, sem permissão de rota |

Fundir a segunda com a primeira faria o registro **mentir sobre a procedência
para expressar uma decisão de logística**. E `get()` devolve erro que explica a
retirada: um `KeyError` seco mandaria o próximo a reintroduzi-los.

### O defeito que a retirada expôs

Até esta data a rota `SESSAO_MULTI_DIA` tinha `claude-fable-5` como
**primário** — a tabela roteava para um modelo que a malha não usa, e **nada
acusava**. O Opus 5 subiu do fallback, com a **perda declarada**: a
auto-verificação assíncrona multi-sessão do Fable não tem substituto na tabela.
O guard `test_nenhuma_rota_aponta_para_modelo_retirado_ou_nao_autorizado`
impede a reincidência.

---

## 4. Onde o Astra entrou, e onde não entrou

**Entrou** como `escalona_para` de `RACIOCINIO_PROFUNDO` e `SESSAO_MULTI_DIA`.
A primeira dizia *"Sem degrau acima"* — deixou de ser verdade em 2026-09-03.

**Não entrou** como primário de rota alguma, nem em `agents_manifest.json`.
Atuação pontual em alta complexidade é escalonamento; promovê-lo a preferência
de agente é mudança de política de custo, e essa não se faz por inferência.

Dois guards existentes precisaram mudar, ambos por **fato novo**:
`test_topo_nao_escalona` perdeu duas classes porque elas ganharam degrau, e o par
de `test_escalonar_classe_sem_degrau` trocou `planner` por `maverick`. A
cobertura do caminho que o `planner` passou a tomar foi **acrescentada** — movida,
não removida.

---

## 5. Geração 4.6 — disponível, fora do Tier 1

O Tier 0 confirmou que `claude-opus-4-6` e `claude-sonnet-4-6` podem ser usados,
**mas que o Tier 1 é Opus 5 e Sonnet 5**. Foram catalogados como fallback e linha
de delegação econômica; **nenhuma rota os usa**, e promovê-los é decisão de
política.

Duas armadilhas medidas ficam registradas:

1. **O Sonnet 5 (`$2/$10`) é mais barato que o Sonnet 4.6 (`$3/$15`).** Preferir
   a 4.6 exige razão que não seja preço.
2. **A geração 4.6 aceita amostragem legada**, ao contrário da 5, que devolve
   400. `reject_legacy_sampling=False` neles não é descuido — marcar `True`
   faria o adaptador recusar parâmetro válido.

---

## 6. Delegação a `Gemini 3.5 Flash-Lite`

Por instrução do Tier 0, **a refinação de detalhes de valor fica delegada**. O
que está concreto foi integrado; o que é de ordem menor vai para a fila:

| # | Item | Estado hoje | O que falta |
| :-- | :--- | :--- | :--- |
| 1 | Preços de assinatura da OpenAI | de agregadores | `openai.com/chatgpt/pricing` devolveu **HTTP 403**; confirmar na fonte primária |
| 2 | `cota_por_assinatura` dos demais modelos | default `False` = **não levantado** | levantar faixa de Opus 5, Sonnet 5, GPT-5.6, Gemini; o default não é evidência |
| 3 | Teto de mensagens do Astra | qualitativo | número exato do cap semanal/mensal por plano |
| 4 | Custo de raciocínio por degrau | não medido | medir tokens de raciocínio em `low` vs `medium` para calibrar o ROI |
| 5 | `Gemini 3.5 Flash-Lite` em rota | no registro, sem rota | avaliar ROI para `OPERACIONAL` / fast operations |

**Nenhum item acima bloqueia o que foi entregue.** Todos são precisão de valor,
não correção de fato — e nenhuma asserção deste trabalho depende deles.

### Uma redundância que esta sessão criou, e que fica declarada

O campo `autorizado=False` foi introduzido para o Fable e ficou **sem nenhum
modelo** vinte minutos depois, quando o Tier 0 mandou retirá-lo — o caso migrou
para `MODELOS_RETIRADOS`. Ele tem guard e é consumido por `get()`, mas **hoje a
lista está vazia**.

Fica como barreira para o caso distinto que cobre: modelo que se quer **no
catálogo** (comparação de custo, referência) e **fora de rota**. Não foi
removido porque suprimir capacidade é redução material, e a §8.2 exige
autorização para isso. Registrado aqui para que ninguém confunda **mecanismo
presente** com **proteção exercitada** — se em uma revisão futura ele continuar
vazio, é candidato legítimo a remoção pela §6.5.

---

## 7. Verificações — o que rodou e o que não

**Rodou:** suíte completa (**971 aprovados, 1 pulado, zero warnings**), doc
oficial da OpenAI campo a campo para o Astra e a família 5.6, `claude.com/pricing`
ao vivo para os quatro modelos Anthropic, skill `claude-api` para os model IDs,
`npm run lint:md` limpo, e o portão de 5 fases com **0 erros e 1 warning**
(teto 2).

**Três achados vieram de instrumento, e não de mim** — vale registrar porque os
três são a mesma classe de defeito, escopo ou instante de medição que não
corresponde à afirmação:

| Achado | Quem pegou | O que eu havia suposto |
| :--- | :--- | :--- |
| Import faltante de `ESFORCOS_OPENAI_VALIDOS` | LSP | que o `adapters.py` já o importava |
| Âncora em `docs/architecture/REPOSITORY_TAXONOMY.md` | `record_gate` | varri só `reports/`; concluí 19 âncoras |
| Portão de 5 fases rodou e mediu | leitura do JSON do próprio portão | que não havia rodado |

O segundo tem um agravante instrutivo: minha primeira varredura por `grep` no
texto dos registros devolveu **60** âncoras. O portão diz explicitamente que
*"âncora é o campo `caminhos:`, nunca a prosa"* — medindo pelo critério certo
são **19**. Instrumento errado infla três vezes.

**O portão de 5 fases rodou, e mediu.** Esta linha corrige uma afirmação errada
que este mesmo registro carregou até ser revisado: dizia que o portão não havia
rodado "porque nenhum dos dois foi levantado". **Eu não levantei o dev server
nem o CDP — e isso não é a mesma coisa que eles não estarem no ar.** Estavam:
`node` na 3000 desde 15:35 e `chrome` na 9222 desde 16:10, ambos anteriores a
esta sessão. O portão conectou (`CdpActive: true`) e mediu LCP 1553 ms, CLS 0,
TTFB 391 ms e **zero violações axe**.

O discriminante que expôs o erro foi a incoerência entre dois fatos que
deveriam concordar: o warning falava de *artefato Lighthouse expirado*, não de
*CDP ausente* — e um portão sem CDP não teria como reclamar de fingerprint.

**Não rodou:** nenhuma chamada real a provedor — as chaves estão revogadas e a
§3 da raiz proíbe teste que a pressuponha, então o `gpt-6-astra` está verificado
**documentalmente**, não por `GET /v1/models` no ambiente. E o TBT segue sem
certificação, pelo motivo declarado no frontmatter.

**Assinatura:** `Claude Opus 5 [Tier 1.B]`
**Propósito:** integrar o GPT-6 Astra com teto de esforço executável, retirar a
família Fable por faixa de acesso, e corrigir três preços de catálogo medidos em
fonte autoritativa.
