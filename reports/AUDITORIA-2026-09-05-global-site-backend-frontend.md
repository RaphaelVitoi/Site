---
id: auditoria-2026-09-05-global-site-backend-frontend
tipo: auditoria
escopo: Site
ecossistema: codex
autor: Chat GPT-6 Astra <noreply@openai.com>
criado_em: '2026-09-05T15:19:43.191567-03:00'
commit: d6bace4df5f404e8fb4dd711df087cc7db0aedcf
classes:
  - interno
  - medido
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
verificado:
  - Auditoria global anterior as edicoes preservada como fotografia historica.
nao_verificado:
  - Resultados deste documento nao representam o estado posterior as correcoes.
supersede: null
---

> Registro oficial da auditoria anterior à implementação. As medições abaixo pertencem àquela fase; o relatório de implementação descreve as correções posteriores.

# Auditoria global do Site — backend, depois frontend

Data: 5 de setembro de 2026 · America/Sao_Paulo.
Escopo: `C:\Users\rapha\.gemini\Site`, branch `master`, HEAD `d6bace4df5f404e8fb4dd711df087cc7db0aedcf`, incluindo alterações locais existentes.
Autoria: Codex, agente desta sessão. Este é um relatório de auditoria, sem commit ou alteração de implementação.

**Conclusão:** o Site deve ser entendido como ambiente de pesquisa e produto em evolução. Há uma base substancial de implementação e testes, mas algumas fronteiras computacionais alteram a pergunta original ou atribuem à saída uma origem que não corresponde ao cálculo realizado. Essas falhas precisam ser distinguidas das hipóteses teóricas legitimamente abertas.

O usuário explicitou durante a auditoria que o produto não está pronto e que a teoria está especialmente em evolução. Essa instrução orienta todo o diagnóstico: ausência de validação final não é, por si só, defeito. Conservação de fichas, preservação de ranges, comunicação entre processos e atribuição de execução são contratos verificáveis mesmo em protótipos.

## 1. Reconstrução conceitual e sistêmica

| Subsistema | Finalidade observada | Contrato que precisa preservar |
|---|---|---|
| Pesquisa PMev | Elaborar modelos de decisão sob estrutura de torneio, risco, realização, posição e tempo | Hipótese, premissas, unidades e falsificador |
| Baselines ICM/equity | Produzir referências numéricas para comparação | Fichas, payouts, cartas, ranges e probabilidades |
| Simulador pedagógico | Permitir explorar cenários e interpretar resultados | Separação entre dado, experimento e recomendação |
| Orquestrador Nexus | Rotear tarefas, modelos, memória e execução | Identidade, autoridade, budget e ciclo de vida |
| Plataforma local | Persistência, arquivos, telemetria e integrações | Fronteiras de host e disponibilidade explícita |
| Curadoria/evidência | Conservar documentos, solves e experimentos | Procedência, versão, unidade e estado de leitura |

O backend HTTP principal é aiohttp (`api/v1/server.py`), embora parte da documentação o descreva como FastAPI. Há outras superfícies de inferência no repositório; a nomenclatura de uma delas não descreve todas.

O frontend contém domínio executável em `perspectiva.ts`, `icmMatrix.ts`, `icmEngine.ts`, `rpDeriver.ts`, solvers e workers. Logo, não é somente um consumidor visual da API Python. O Rust/WASM participa do cálculo cliente. A paridade precisa ser tratada como uma relação entre implementações, não pressuposta por nomes semelhantes.

Uma inspeção AST das áreas próprias de Python encontrou relações bidirecionais entre `core` e `llm`, `core` e `utils`, `database` e `monitoring`, além de referências de agentes/worker a `task_executor`. Isso não prova falha de importação: o projeto usa imports tardios e fachadas deliberadamente. Mostra, porém, que o mapa de dependências real é mais entrelaçado do que o diagrama estritamente unidirecional de `SYSTEM_MAP.md`.

**Critério de decisão:** corrigir primeiro o instrumento de observação e os contratos de entrada/saída; só depois comparar e calibrar hipóteses. Uma amostra grande de um range errado mede com precisão a pergunta errada.

## 2. Backend e núcleos computacionais

### B01 — P1: a representação de ranges perde informação antes do WASM

Fontes: [rangeParser.ts:332](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/workers/rangeParser.ts:332), [rangeParser.ts:368](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/workers/rangeParser.ts:368), [lib.rs:73](C:/Users/rapha/.gemini/Site/wasm-equity/lib.rs:73).

O índice é `h * 52 + l`, mas a serialização reserva 166 bytes, capacidade compatível com 1.326 posições compactas. Nesse índice esparso, a maior posição é 2.702, exigindo 338 bytes. Os dois formatos foram combinados sem transformação de índice. No Rust, índice fora da máscara retorna `true`, admitindo combos que a entrada não selecionou.

Reprodução com o parser real, o JS gerado e o binário WASM existente, 10.000 iterações, seed 123, board vazio e kappa 1:

| Entrada | Bytes não zero do hero | Bytes não zero do vilão | Equity retornada |
|---|---:|---:|---:|
| AA × KK | 0 | 0 | 51,255% |
| AA × AA | 0 | 0 | 51,255% |
| 22 × AA | 3 | 0 | 50,080% |

O teste prova a perda de identidade do range; não depende de uma previsão aproximada de equity para AA × KK. A igualdade exata sob a mesma seed decorre da igualdade das máscaras recebidas.

Impacto: Monte Carlo, intervals exibidos e decisões consumidoras podem se apoiar em uma distribuição diferente da fornecida. O defeito existe no caminho de produção, não apenas em um sketch Rust sem consumidor.

Direção de correção: especificar uma única ABI para os 1.326 combos e testar a ida e volta de todos eles entre TypeScript e Rust; tratar máscaras inválidas/combinações impossíveis explicitamente. A escolha entre índice triangular compacto e grade esparsa deve preceder a edição. Não basta aumentar iterações ou ajustar coeficientes.

### B02 — P1: transição de eliminação perde o prêmio garantido no ICM

Fontes: [icm_matrix.py:57](C:/Users/rapha/.gemini/Site/engine/icm_matrix.py:57), [icm_matrix.py:148](C:/Users/rapha/.gemini/Site/engine/icm_matrix.py:148), [icmMatrix.ts:147](C:/Users/rapha/.gemini/Site/frontend/src/lib/icmMatrix.ts:147).

Reprodução em Python e TypeScript: stacks `[50,50]`, payouts `[70,30]`.

| Grandeza | Implementação atual | Contrato do HU terminal |
|---|---:|---:|
| Equity inicial de cada jogador | 50 | 50 |
| Recebimento ao ganhar | 70 | 70 |
| Recebimento ao perder | 0 | 30 |
| Ganho relativo | 20 | 20 |
| Perda relativa | 50 | 20 |
| Bubble factor | 2,5 | 1 |
| Equity requerida, confronto simétrico sem dinheiro morto | 71,43% | 50% |

A chamada direta com `[100,0]` retorna `[70,0]`, somando 70 para um prize pool de 100. Como o cálculo de BF cria os stacks zerados internamente, a falha não pode ser descartada como uma entrada externa inválida.

Derivação independente: no heads-up, perder recebe 30 e ganhar recebe 70; o valor incremental do all-in é `p·20 − (1−p)·20`. O limiar é 0,5. Essa é uma checagem do baseline, não uma objeção à PMev.

Direção de correção: definir estado terminal e contabilização de payouts já adquiridos; cobrir HU, eliminações cobertas, empates/simultaneidade quando aplicáveis e conservação do prêmio. Preservar a equivalência das implementações, evitando replicar o mesmo erro.

### B03 — P1: estados contrafactuais não preservam a mesma massa de fichas

Fonte: [perspectiva.ts:242](C:/Users/rapha/.gemini/Site/frontend/src/lib/perspectiva.ts:242).

Embora esteja fisicamente no frontend, este é um problema de domínio. A função `_buildSimulatedStacks` constrói vitória, derrota e fold com diferentes somas.

Reprodução: stacks `[50,50]`, pot 10, heroCost 5, investidoAcumulado 2.

| Estado | Soma dos stacks |
|---|---:|
| Vitória | 105 |
| Derrota | 110 |
| Fold | 108 |

O contrato de input não declara uma convenção que explique massas terminais distintas para os mesmos participantes/mesmo pote. Dependendo de stacks serem anteriores ou posteriores às contribuições, a fórmula correta muda; em qualquer convenção consistente, a liquidação deve reconciliar o mesmo total de fichas. Não foi escolhida arbitrariamente uma correção durante a auditoria.

Impacto: deltas ICM, valuation, BF e utilidade podem capturar fichas criadas/desaparecidas pela modelagem da transição.

### B04 — P1: TimesFM é atribuído como executado, mas o cálculo é extrapolação NumPy

Fontes: [timesfm_engine.py:158](C:/Users/rapha/.gemini/Site/engine/timesfm_engine.py:158), [timesfm_engine.py:186](C:/Users/rapha/.gemini/Site/engine/timesfm_engine.py:186), [handlers.py:989](C:/Users/rapha/.gemini/Site/api/v1/handlers.py:989).

`_model` permanece `None`; a previsão calcula a diferença média recente e prolonga uma reta. As bandas usam `1,28·std(history)·sqrt(step)`. `forecast_multivariate` executa previsões univariadas independentes.

| Seleção | Modelo carregado? | Série de entrada | Previsão H=3 |
|---|---|---|---|
| timesfm-2.0-500m | Não | 1,2,3,4 | 5,6,7 |
| timesfm-2.5-200m | Não | 1,2,3,4 | 5,6,7 |

Mesmo assim, `model_used` devolve `google/timesfm-…-pytorch`. A atribuição chega à API e ao suporte quantitativo de calibração operacional. Os coeficientes e o scaffold podem permanecer como experimento; precisam ser identificados como extrapolação/fallback e não inferência dos pesos selecionados. Tampouco o loop independente demonstra modelagem conjunta de correlações.

Esta auditoria não avaliou licenças dos modelos nem instalou/carregou pesos. O achado é exclusivamente sobre execução e procedência no código atual.

### B05 — P1: API de árvore aceita probabilidade impossível e devolve sucesso

Fontes: [perspective_schemas.py:49](C:/Users/rapha/.gemini/Site/core/perspective_schemas.py:49), [handlers.py:794](C:/Users/rapha/.gemini/Site/api/v1/handlers.py:794).

Entrada: equity 0,6; pot 10; stack 20; street 2; `fold_equity=2`. Resultado observado: HTTP 200, `SUCCESS`, `best_action=RAISE`, `p_best_outcome=2.0`. Também foi aceita `valuation_stack=-1` pelo schema da árvore.

A API pontual tem limites que não foram propagados à árvore. O retorno tipado como dicionário não impõe a restrição probabilística na resposta. O contrato deve rejeitar explicitamente entradas impossíveis, incluindo não finitos e relações entre campos.

### B06 — P2: semânticas diferentes compartilham nomes de saída

Fontes: [handlers.py:731](C:/Users/rapha/.gemini/Site/api/v1/handlers.py:731), [vitoi_perspective_engine.py:57](C:/Users/rapha/.gemini/Site/engine/vitoi_perspective_engine.py:57), [rpDeriver.ts:62](C:/Users/rapha/.gemini/Site/frontend/src/lib/rpDeriver.ts:62).

- A API pontual escolhe RAISE por escore maior que 0,5, sem comparar EV por ação; a árvore compara ações com sizings e reações heurísticas próprias. O campo `optimal_action` não identifica esse regime.
- `DynamicFoldEngine.compute_static_icm` calcula fração linear do total de prêmios. Para stacks 50/30/20 e payouts 70/30, dá 50 para o hero, contra 45,178571 do motor Malmuth–Harville. A busca encontrou a classe em testes e no próprio módulo, sem consumidor de produto confirmado; alcance é menor que B02.
- O RP da matriz usa `100(BF−1)/(BF+1)`; `rpDeriver` usa `100(BF−1)/BF`, com investimento de referência de 35% do stack efetivo. Grandezas e cenários diferentes aparecem sob o mesmo rótulo RP.

O achado é a insuficiência de discriminação semântica, não a proibição de experimentar novas métricas. Definir unidades, cenário, método e versão permite coexistência controlada.

### B07 — P2 condicional: autenticação de produto e autoridade de operador se misturam

Fontes: [middleware.py:175](C:/Users/rapha/.gemini/Site/api/v1/middleware.py:175), [handlers.py:192](C:/Users/rapha/.gemini/Site/api/v1/handlers.py:192), [handlers.py:578](C:/Users/rapha/.gemini/Site/api/v1/handlers.py:578).

O middleware extrai `user_id` e `user_role`, mas os handlers examinados não os usam para separar recursos/autoridade. As rotas incluem estado global, fila, ingestão e leitura de arquivos do projeto. O modo sem credenciais restringe a loopback/origens confiáveis; o servidor observado no código também faz bind em loopback. Isso é uma proteção real e compatível com uma bancada de operador único.

Ao aceitar identidades de usuários de produto na mesma superfície, um token válido passa a conferir autoridade muito ampla. Não foi demonstrada exploração remota nem exposição pública do backend. Antes de habilitar uso multiusuário, separar explicitamente a identidade humana do produto da credencial de serviço e da autoridade de operar o host.

### B08 — P2: persistência de laboratório e esquema Prisma divergentes

Fontes: [lab_manager.py:23](C:/Users/rapha/.gemini/Site/database/lab_manager.py:23), [schema.prisma](C:/Users/rapha/.gemini/Site/frontend/prisma/schema.prisma).

O DAO consulta `Tournament` e `TournamentScenario`, ausentes no schema Prisma examinado, usa caminho fixo `frontend/prisma/dev.db` e converte `OperationalError` em lista vazia. O frontend aceita `DATABASE_URL`, de modo que os dois consumidores podem consultar bancos diferentes.

Consequência comprovada pelo fluxo: erro de schema/disponibilidade pode se tornar resposta de sucesso sem torneios. Não se afirmou que essas tabelas estão ausentes do banco vivo; ele não foi migrado ou alterado nesta auditoria.

O método de gravar benchmark ainda preenche métricas e uma origem HRC por defaults quando campos faltam. Isso exige revisão de procedência se vier a ser usado como ledger experimental; a auditoria não atribui esses defaults a medições reais.

### B09 — P2 de reprodutibilidade: instalação e documentação descrevem estados diferentes

Fontes: [pyproject.toml:11](C:/Users/rapha/.gemini/Site/pyproject.toml:11), [requirements.txt:16](C:/Users/rapha/.gemini/Site/requirements.txt:16), [Dockerfile.backend](C:/Users/rapha/.gemini/Site/.claude/DEPLOY/Dockerfile.backend).

- `readme=AGNOSTIC_SYSTEM.md` aponta para arquivo ausente na raiz.
- `pyproject.toml` declara dependências e pisos que não são iguais a `requirements.txt`, incluindo LanceDB/PyArrow e o piso de pydantic-settings.
- O Dockerfile copia `system_config.json` da raiz, que não existe, e não copia vários módulos requeridos pelo executor, como agentes/database/worker. Expõe 8000 enquanto o servidor principal usa 17042.
- README cita `.cerebro` e contagens antigas; a governança já migrou para `.claude`.

Classificação: dívida de reprodutibilidade do caminho de instalação/deploy, não falha da sessão de desenvolvimento local. Não houve docker build ou reinstalação limpa; o conflito de arquivos é estático e verificável.

## 3. Frontend, integrações e experiência

### F01 — P1: contrato de mensagens do hook e do worker é incompatível

Fontes: [useQuantumEngine.ts:169](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/hooks/useQuantumEngine.ts:169), [useQuantumEngine.ts:260](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/hooks/useQuantumEngine.ts:260), [insolvency.worker.ts:13](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/workers/insolvency.worker.ts:13).

| Direção | Hook | Worker |
|---|---|---|
| Requisição | type MATRIX/DISTORTION/MULTIWAY_MATRIX, id, campos planos | matrixData ou icmData, simulationId |
| Resposta | espera id, tipo da operação, matrix/nashResults/multiwayResult | envia SUCCESS/ERROR, simulationId, result |

Reprodução do handler do worker com dependências WASM substituídas apenas para isolar o protocolo: uma mensagem MATRIX com id 7 produz SUCCESS com result null, zero chamadas matemáticas e nenhum id reconhecido pelo hook. A comparação de id descarta a resposta. O stub foi corrigido para respeitar o interop ES module antes de registrar esse resultado; a primeira tentativa com stub incompatível não fundamenta o achado.

Efeito: o painel pode conservar resultados antigos/ausentes ou estado de cálculo sem receber a conclusão. Corrigir só as etiquetas ainda deixa payloads e tipos de resultados incompatíveis. Requer contrato compartilhado e testes reais de round-trip das três operações.

### F02 — P1: fallback total de Monte Carlo produz um resultado numérico aparente

Fonte: [monteCarloParallelPool.ts:286](C:/Users/rapha/.gemini/Site/frontend/src/lib/monteCarloParallelPool.ts:286).

Se workers e fallback WASM falham, o catch retorna equity 50%, quantidade solicitada de iterações, SE 0,005 e intervalo 49,02–50,98, com o mesmo modo SINGLE_THREAD_FALLBACK de um cálculo fallback bem-sucedido. O resultado não possui um discriminante de falha que permita ao consumidor distinguir simulação e valor de conveniência.

O branch foi verificado por leitura; não se atribui a ele o resultado de 49,66% observado no browser. B01 foi reproduzido separadamente com binário real.

Direção: manter o fallback computacional real; representar falha total como indisponibilidade, nunca como simulação executada. Essa preservação de capacidade é diferente de desligar o motor.

### F03 — P2: perfil baseline influencia a física como se tivesse a mesma origem do perfil medido

Fontes: [Rota preditiva](C:/Users/rapha/.gemini/Site/frontend/src/app/api/v1/predictive/route.ts), [MasterSimulator.tsx:176](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/MasterSimulator.tsx:176), [useQuantumEngine.ts:236](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/hooks/useQuantumEngine.ts:236).

O endpoint informa `source=baseline` ou `fallback-error` e fornece um perfil com Desvio de Nash 0,45. O simulador consome `profile`, mas não propaga sua origem ao cálculo de `humanNoiseFactor`; o modo preditivo inicia ligado. Quando há credencial no backend, a tentativa de ler `/predictive-profile` também não encaminha a credencial, favorecendo fallback.

A lacuna é a perda de procedência no consumidor. Um baseline de demonstração é legítimo; precisa permanecer distinguível de observação do usuário e sua ativação precisa ser perceptível.

### F04 — P2: recomputação combinatória síncrona no componente de matriz

Fontes: [BubbleFactorMatrix.tsx:60](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/BubbleFactorMatrix.tsx:60), [icmMatrix.ts:147](C:/Users/rapha/.gemini/Site/frontend/src/lib/icmMatrix.ts:147).

Medição exploratória do código TypeScript transpilado e executado no contexto Node, mesmos presets do produto:

| Jogadores | Tempo de uma matriz |
|---:|---:|
| 3 | 0,747 ms |
| 6 | 16,800 ms |
| 9 | 7.287,430 ms |

Uma execução anterior em contexto VM isolado mediu 112.181 ms; ela foi substituída na análise de prioridade por esta medição, porque o overhead da VM não representa o contexto normal. Nenhum número é INP ou tempo medido de travamento do browser.

O vínculo com UX é estático: o componente chama essa função dentro de useMemo síncrono; a troca de preset pode ainda computá-la no callback quando existe consumidor. Memoização não elimina custo quando stacks/payouts mudam. Medir e mover o cálculo para a arquitetura de workers existente ou unificar com o motor de programação dinâmica deve preceder qualquer memoização ampla da UI.

### F05 — P2: controles da calculadora ficam recortados no viewport móvel

Fonte: [EquityCalculator.tsx:293](C:/Users/rapha/.gemini/Site/frontend/src/components/simulator/panels/EquityCalculator.tsx:293).

Inspeção visual real em 390×844: campos de stack na linha de jogador e parte dos campos de premiação ultrapassam a área útil, ficando recortados. O nome flexível convive com botão, campo numérico e gaps sem uma redução/layout apropriado para essa largura. Isso dificulta a tarefa essencial de editar os dados, apesar de o layout exterior adaptar-se.

Também foi observado Atlas “8 cenários” com 12 cartões. É inconsistência de metadado de baixa prioridade, não defeito matemático.

Não foi executado axe completo, teste extensivo de teclado ou matriz multibrowser. Não há certificação de acessibilidade.

### F06 — P2: existem relays e rotas de produto com políticas diferentes

Fontes: [Relay de heatmap](C:/Users/rapha/.gemini/Site/frontend/src/app/api/sota/pmev-heatmap/route.ts), [Relay de TimesFM](C:/Users/rapha/.gemini/Site/frontend/src/app/api/sota/timesfm-forecast/route.ts), [api-contract.ts](C:/Users/rapha/.gemini/Site/frontend/src/lib/api-contract.ts).

Heatmap/TimesFM usam BACKEND_API_URL e um fallback de token literal, enquanto a camada central usa NEXUS_API_BASE. Encaminham credencial de serviço sem verificar sessão e sem timeout explícito. RAG/Gemma têm verificação de sessão. Um relay público pode ser intencional para demonstração; essa intenção não foi documentada no contrato, e a autoridade do serviço precisa ser delimitada.

O dashboard de arquivos chama `/api/proxy`; a rota não aparece no build e retornou 404 no smoke HTTP. Não foi tentado autenticar uma conta real para navegar nesse dashboard.

### F07 — P2: duplicação de motores e fallback mudam o estimando

Fontes: [icmEngine.ts:51](C:/Users/rapha/.gemini/Site/frontend/src/lib/icmEngine.ts:51), [perspectiva.ts:103](C:/Users/rapha/.gemini/Site/frontend/src/lib/perspectiva.ts:103), [rpDeriver.ts:62](C:/Users/rapha/.gemini/Site/frontend/src/lib/rpDeriver.ts:62).

Para N maior que 10, `calculateMapaICM` usa Monte Carlo, enquanto o wrapper chamado calculateMalmuthHarville troca para ChipEV e só avisa no console. Não é a mesma aproximação do mesmo modelo. Esse limite deve aparecer no resultado consumido pela interface.

A chave de cache de `calculateMapaICM` quantiza proporções em 20.000 unidades. Reprodução: após `[50,50]`, a consulta `[50.001,49.999]` com prêmios 70/30 reutiliza `[50,50]`, embora a solução do HU seja `[50.0004,49.9996]`. O erro medido é pequeno; classificar como aproximação não declarada de baixa prioridade, sem propor remover cache indiscriminadamente.

### F08 — evolução esperada: esboços de solver e curadoria não devem ser confundidos

O Rust multiway aloca `wins`, amostra colisões, mas deixa a avaliação de showdown comentada; a produção de equities ainda não está implementada nesse caminho. Trata-se de capacidade em construção, a ser apresentada como tal. Consertar F01 não conclui esse motor automaticamente.

Há bons contratos já existentes: `Measured<T>` distingue lido e ilegível; a procedência de solver preserva unidade e build; os experimentos controlados congelam os braços; testes editoriais separam proposta autoral de validação. Esses componentes são bases reutilizáveis para a distinção entre hipótese e execução.

Em contraste, o painel de frequências apresenta `±spread` calculado heuristicamente, e o tutorial diz que todo o motor é alimentado pelos dados empíricos da Aula 1.2. O intervalo precisa ser interpretado como faixa heurística enquanto não houver cobertura estatística demonstrada. A auditoria não recomenda retirar os experimentos: recomenda preservar seu estatuto ao mostrá-los.

## 4. Segurança de dependências e alcance

| Verificação | Resultado atual | Limite |
|---|---|---|
| npm audit | 0 vulnerabilidades reportadas; 1.305 dependências contabilizadas | Não cobre falhas próprias de contrato/lógica |
| pip-audit -r requirements.txt | 4 vulnerabilidades em chromadb 1.5.9, sem versões de correção listadas | Audita a resolução dessa declaração; não equivale ao uv.lock |
| OSV querybatch sobre uv.lock | 209 pacotes de registry consultados, de 210 entradas totais; apenas chromadb retornou IDs | 5 IDs incluem PYSEC e GHSA sobrepostos, não 5 falhas independentes |
| Uso Chroma em código | PersistentClient em memory_rag e ingest_rag | Não foi iniciado nem explorado um servidor Chroma |

IDs distintos reportados pelo pip-audit: PYSEC-2026-311/CVE-2026-45829, CVE-2026-45830, CVE-2026-45831 e CVE-2026-45833. O mecanismo descrito nas advisories é de servidor. O uso embarcado encontrado sustenta alcance reduzido; não se conclui comprometimento ou necessidade de remover a capacidade local. Houve warning de leitura do cache do pip-audit; a consulta foi concluída.

## 5. O que os testes demonstram — e o que não demonstram

| Bateria | Resultado |
|---|---|
| Backend: primeira amostra de domínio/API/queue/LLM | 102 passed; incluídos na suíte completa abaixo |
| Backend completo | 929 passed, 1 skipped; 227,87 s; guard sem erros/warnings |
| Motivo do skip | Nenhuma árvore marcada como superada para testar sua exclusão; o predicado tem outro teste |
| Ruff nas áreas de implementação auditadas | Passou |
| Pyright | 161 arquivos; 0 erros, 0 warnings |
| Frontend Jest | 27 suítes, 215 testes; 26,733 s |
| TypeScript de aplicação | Passou |
| TypeScript de workers, checagem separada sem emissão | Passou |
| ESLint, executado no workspace frontend | Passou |
| next build | Compilou; tipos passaram; 55/55 unidades de geração estática concluídas |
| git diff --check | Passou no estado local existente |
| Smoke HTTP | Simulador/biblioteca 200; dashboard levou ao login; proxy de arquivos 404 |
| Browser | Navegador interno Codex, instância production local 127.0.0.1:3105; simulador, calculadora e laboratório CFR; desktop e 390×844 |
| Probes independentes | ABI de ranges/WASM real, HU ICM Python/TS, massas contrafactuais, árvore com probabilidade inválida, TimesFM, protocolo de worker, cache e custo de matriz |

Os 102 testes iniciais não são somados de novo aos 929. Total de testes aprovados das duas suítes principais: 1.144.

As primeiras invocações de npm/ESLint/Next por caminhos de workspace inadequados não fundamentaram veredictos. Os comandos foram corrigidos para os executáveis efetivos e diretórios apropriados; a tabela registra apenas os resultados finais executados. Nenhum erro de ferramenta foi tratado como bug do produto.

**Não executado:** pre-commit de cinco fases, medição formal de CWV/INP, axe completo, E2E autenticado, publicação, docker build, clone limpo com instalação integral, reconstrução/ comparação de hashes WASM, inferência real de provedores ou TimesFM, exploração remota, leitura de dados pessoais e alterações de credenciais. O binário WASM existente foi executado; não foi certificado como rebuild bit a bit do Rust atual.

## 6. Ordem de intervenção resultante da auditoria

| Ordem | Trabalho delimitado | Evidência para considerar concluído |
|---:|---|---|
| 1 | ABI de ranges e protocolo dos workers | 1.326 combos preservados; round-trip de cada operação; erros distinguíveis de resultados |
| 2 | Estados terminais ICM e convenção de stacks/pote | Conservação de fichas e payouts; HU terminal; paridade entre implementações |
| 3 | Entradas/saídas matemáticas | Nenhuma probabilidade fora de [0,1]; não finitos/estados impossíveis rejeitados |
| 4 | Procedência e disponibilidade | Método efetivo/versão/unidades/status acompanham TimesFM, Monte Carlo e perfis baseline |
| 5 | Comparação de modelos experimentais | Corpus comum de cenários, identificador de hipótese, ablações e parâmetros versionados |
| 6 | Custo e usabilidade | Matriz fora do caminho síncrono de render quando necessário; campos utilizáveis em mobile |
| 7 | Plataforma e reprodutibilidade | DAO/schema/URLs alinhados; rota de arquivos existente ou estado indisponível claro; instalação reproduzível |

Esta ordenação preserva o espaço de pesquisa e evita calibrar a teoria para compensar um defeito do instrumento. Foram descartadas neste trabalho: edição antecipada, reescrita ampla, memoização em massa, troca automática de hipótese, remoção de ferramentas, alteração de segurança global, migração de banco, commit e push.

## 7. Registro de execução e preservação

A auditoria ocorreu serialmente, sem subagentes. Não houve edição manual de código, configuração, teoria ou testes do repositório. A lista final de caminhos modificados/não rastreados corresponde à lista inicial observada; ela já continha trabalho anterior. Isso não é uma certificação criptográfica de todos os bytes do working tree, que não foi congelado.

Testes/build produziram os artefatos normais de execução. A instância Next iniciada para a inspeção usou apenas 127.0.0.1:3105, foi encerrada, e a ausência do listener foi verificada. O viewport foi restaurado e a aba temporária fechada. Nenhum backend operacional adicional foi iniciado. Este relatório foi salvo fora do repositório, no diretório de artefatos da tarefa.
