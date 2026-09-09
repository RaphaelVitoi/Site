---
id: registro-2026-09-09-retomada-astra-escopo-ft-e-worker
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Chat GPT-6 Astra <noreply@openai.com>"
criado_em: 2026-09-09T12:52:25-03:00
atualizado_em: 2026-09-09T12:52:25-03:00
classes: [interno, medido, simulador, contrato, plano]
caminhos:
  - frontend/src/components/simulator/hooks/useQuantumEngine.ts
  - frontend/src/components/simulator/workers/insolvencyResponse.ts
  - frontend/src/tests/simulator/insolvencyResponse.test.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
verificado:
  - >-
    Retomada desde 73ae4832453b01db10a20b99d90b37eda4ed4b8d ate
    3a7a25b710e4e51f54aee6e7ae87072e89d5c2ba: 69 commits e 325 arquivos
    alterados. Checkout inicialmente limpo; ls-remote confirmou o mesmo HEAD
    em origin/master. Inspecao global do historico e revisao focal dos contratos,
    nao leitura integral de cada um dos 325 arquivos.
  - >-
    O commit 95283253 removeu a guarda de e.data no useQuantumEngine.
    A fronteira agora recebe unknown, valida envelope e payload por operacao,
    correlaciona id por canal e rejeita mensagens invalidas antes do estado React.
  - >-
    Frontend completo: 35 suites, 281 testes aprovados, zero warnings.
    Os 17 novos casos incluem mensagens vazias, antigas, futuras, payloads
    incompletos ou nao finitos e respostas dos tres ramos reais do processador.
  - >-
    Backend focal: 46 testes aprovados, zero warnings, cobrindo moldes ICM,
    limites da arvore, AppKey e separacao entre identidade de produto e operador.
  - >-
    TypeScript do app, compilacao TypeScript dos workers, ESLint dos tres
    arquivos TypeScript alterados e git diff --check aprovados.
nao_verificado:
  - >-
    Nao reexecutei a suite Python integral, build Next de producao, browser,
    CWV, pre-commit, CI remoto, auditoria de dependencias nem deploy nesta retomada.
    As certificacoes anteriores permanecem medicoes historicas dos respectivos commits.
  - >-
    A validacao de respostas nao certifica fidelidade teorica, probabilidades
    calibradas ou completude do solver multiway. Mensagem invalida e descartada;
    nao e convertida em sucesso nem encerra artificialmente um pedido pendente.
  - >-
    Nao implementei selecao de mesa a partir de input de torneio, nem promovi
    fontes teoricas, alterei formulas de RP ou ampliei o solver para mais jogadores.
referencias_nao_resolviveis: []
---

# Retomada do Astra: mesa analisada, contexto do torneio e fronteira do worker

## Decisao de escopo do Raphael

O produto segue em evolucao teorica e algoritmica. Outputs sao moldes funcionais,
coerentes e sofisticados; sua execucao nao constitui prova da teoria.

Nesta retomada, Raphael delimitou primeiro toy games em FTs e esclareceu:

> Inputs podem ser feitos de todo o torneio, mas a análise em si será restrita a 9p PokerStars e 8p GGPoker (ou mesas quebradas)

| Camada | Contrato de trabalho |
| :--- | :--- |
| Input | Pode conter o torneio inteiro; preservar dados e procedencia recebidos. |
| Mesa analisada | PokerStars ate 9 assentos; GGPoker ate 8; mesas com menos jogadores permitidas. |
| Participantes na mao | Subconjunto da mesa; nao confundir com tamanho da mesa ou numero de stacks do torneio. |
| Contexto externo | Premios e demais stacks podem contextualizar a mesa; nao desaparecem por ela ser pequena. |
| Motor | Declarar qual universo de stacks e metodo produziu cada resultado. |

Consequencia: limitar globalmente um array de entrada a nove stacks seria uma
implementacao errada desta decisao. Tampouco se deve escolher os primeiros nove
registros e chamar o resultado de mesa. Nenhuma dessas limitacoes foi aplicada.

## O que mudou desde a refatoracao

Foram comparados historico, lista de arquivos, governanca atual e handoffs, depois
contratos do backend e seus consumidores no frontend. Nao houve nova auditoria
linha a linha de todo o repositorio.

| Frente | Estado observado nesta retomada | Consequencia para o plano |
| :--- | :--- | :--- |
| Massa de fichas, B03 | Contrafactuais centralizados em buildSimulatedStacks; testes atuais aprovados. | Aproveitar a convencao existente e o corpus de contraste. |
| TimesFM, B04 | Codigo distingue analytic-linear-extrapolation de modelo pretendido. | Nao reabrir como se o rotulo ainda fosse incondicional; pesos reais nao certificados aqui. |
| Arvore, B05 | Seis limites propagados; bateria focal aprovada. | Correcao preservada. |
| Identidade e autoridade, B07 | Middleware separa rotas de produto e operador; testes de alcance aprovados. | O antigo grep por user_role em handlers nao basta para manter o finding aberto. |
| Persistencia, B08 | DAO distingue indisponibilidade de lista vazia, e exige campos de procedencia no benchmark. Tournament continua referenciado sem modelo Prisma correspondente. | Tratamento do erro melhorou; alinhamento do armazenamento continua pendente. |
| Instalacao, B09 | README ainda aponta AGNOSTIC_SYSTEM.md e .cerebro; Dockerfile ainda copia system_config.json da raiz. | Manter fila de reprodutibilidade, fora do conserto do worker. |
| Contraste ICMev x ChipEV | Corpus atual passou na suite completa; registro incorpora a mesa completa e os incentivos dos jogadores fora da mao. | Preservar essa leitura sistemica na separacao entre input e mesa. |
| Perfil preditivo, F03 | API devolve source=baseline e Desvio de Nash=0.45; MasterSimulator passa apenas profile ao hook, que consome esse valor como humanNoiseFactor. | Procedencia precisa acompanhar o molde ate o resultado; nao zerar o molde por ausencia de medicao. |
| Motores ICM, F07 | Acima de dez stacks, calculateMapaICM usa Monte Carlo, enquanto icmEngine troca para proporcao de fichas; worker transporta so tres numeros por jogador. | Fora da expansao de solver atual. A selecao explicita da mesa vem antes; nao confundir contexto do torneio com jogadores analisados. |
| Multiway, F08 | Continua capacidade em construcao, com outputKind=scaffold. | Preservar funcionalidade sem chamar scaffold de solver completo. |
| CI, CWV e dependencias | Historico registra reparos posteriores e remediacao de httpx2. | Nao repetir o estado FRAGIL ou oito alertas do fechamento antigo como estado atual. Sem nova certificacao remota nesta retomada. |

F05 (mobile) e F06 (relays) nao receberam nova verificacao completa nesta rodada.

## Correcao executada

A revisao de analise estatica em 95283253 manteve o roteamento por switch, mas
retirou a guarda contra e.data ausente. O tipo MessageEvent em TypeScript nao
valida uma mensagem em runtime. A mesma classe de falha relatada originalmente
no DownwardDrift voltou a ser possivel no consumidor do QuantumEngine.

O novo leitor readCurrentInsolvencyResponse e consumido pelo onmessage real do
hook. Ele verifica tipo, id, outputKind e formato especifico de MATRIX,
DISTORTION e MULTIWAY_MATRIX. Matriz precisa de cinco numeros finitos; distorcao
precisa das tres streets com seus campos; tensor precisa ser Float64Array finito.
Erros estruturados preservam tipo e id para os estados pendentes existentes.

A correlacao continua independente por operacao e acontece antes da leitura do
payload. O tensor valido conserva a mesma referencia. Os testes usam saidas do
processador existente, com kernels hermeticos, alem de contraprovas malformadas.
Nao se trata de um teste de inferencia WASM real nem de um E2E de navegador.

Capacidade preservada: tres canais do hook e os cinco pedidos do produtor.
Risco concreto: excecao em mensagem vazia e publicacao de payload invalido.
Alternativa minima: apenas recolocar a guarda nula; escolhida a validacao do
contrato porque cobre tambem mensagens estruturalmente incompletas.
Reversibilidade: alteracao local em um consumidor e um modulo novo.
Autorizacao: pedido de retomar, adaptar o plano e prosseguir; nenhuma publicacao
nova foi inferida a partir do push ja concluido em 05/09.

## Plano adaptado

1. **Fronteira do worker — executado.** Conter a regressao sem mudar equacoes,
   cenarios ou resultados validos.
2. **Input do torneio e selecao da mesa — proxima entrega central.** Rastrear o
   importador efetivamente consumido e representar contexto do torneio, sala,
   mesa, assentos e participantes da mao separadamente. Preservar input bruto e
   identificadores. Aplicar 9p/8p somente a mesa escolhida. Se a origem nao trouxer
   a mesa ou a sala, exigir selecao explicita na bancada, sem inferir pela ordem
   dos stacks. O parser da EquityCalculator hoje usa slice(0, 9); isso nao e um
   seletor de mesa nem um importador de torneio e precisa ser tratado nessa entrega.
3. **Procedencia do perfil — entrega seguinte.** Transportar source e natureza
   heuristica junto com o fator utilizado; manter baseline funcional e rotulado.
4. **Unidades e grandezas — com o contexto delimitado.** Nomear as duas grandezas
   atuais de RP, seus consumidores e convencoes; preservar a decisao de dominio
   sobre formulas. Verificar massa e premios em mesas reduzidas e eliminacoes.
5. **Persistencia e relays — conforme consumo.** Corrigir o caminho que alimenta
   essa bancada, preservando a separacao entre indisponibilidade e conjunto vazio.

Nao abrir agora expansao de solver para mesas maiores, nova calibracao teorica,
curadoria automatica do disco, credenciais, registro Windows ou investigacao de
autoria/publicacao ja delegada. O contexto completo do torneio permanece permitido.

## Verificacao e limites de publicacao

| Verificacao atual | Resultado |
| :--- | :--- |
| Jest completo | 35 suites, 281 testes, zero warnings |
| Python focal | 46 testes, zero warnings |
| TypeScript app e workers | Aprovado |
| ESLint dos arquivos alterados | Aprovado |
| Whitespace do diff | Aprovado |
| Build Next, browser e cinco fases do pre-commit | Nao executados |
| Commit, push e CI do novo diff | Nao executados; alteracao local |

Duas tentativas iniciais de invocar Jest falharam antes de executar testes:
encaminhamento de argumentos pelo npm do ambiente e caminho nao hoisted do Jest.
A execucao correta usou o binario instalado no node_modules da raiz via Node,
com a configuracao do frontend. Nenhuma dependencia foi reinstalada.

**Assinatura:** Chat GPT-6 Astra <noreply@openai.com>.
**Proposito:** retomar a evolucao dos moldes de FT a partir do codigo atual,
conter uma regressao demonstrada e fixar a separacao entre input e mesa analisada.
