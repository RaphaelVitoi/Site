# Plano de Integração de IA SOTA: GTO, CFR, A* e Teoria dos Sistemas

## 1. Objetivo Global

Avançar o Paradigma VITOI para a fronteira da Inteligência Artificial no Poker. A proposta é criar um módulo Híbrido que integre a **Prospect Theory** (Psicologia e Aversão à Perda) com o **Equilíbrio de Nash e Pathfinding** (A* Geometric Sizing e Counterfactual Regret Minimization - CFR). O sistema vai tratar a mesa de poker não como um cálculo estático, mas como um Ecossistema Dinâmico (Teoria dos Sistemas) governado por inferências Bayesianas Recursivas e heurísticas de aprendizado (Random Forest).

## 2. Injeção da Matemática Avançada (Core Engine)

A infraestrutura central suportará:

- **A* Pathfinding & Geometric Bet Sizing**: Implementação do cálculo de rota geométrica ideal. A fórmula geométrica será usada para determinar o tamanho exato de aposta ($f$) que cresce o pote exponencialmente, culminando em um all-in no river sem overbets irrazoáveis, essencial contra ranges polarizados.
- **CFR (Counterfactual Regret Minimization)**: O núcleo dos solvers modernos. Em vez de calcular apenas o EV instantâneo (GTO puro e inalcançável), implementaremos um mock iterativo de *Regret Matching*. Ele avaliará o "Arrependimento" de não ter tomado uma ação diferente (Fold vs Call vs Raise), calibrando frequências para uma Estratégia Mista que converge para o Equilíbrio de Nash.
- **Atualização Bayesiana Recursiva**: Evolução matemática do Axioma Lipe Piv. A equação de Bayes atualizará o peso da equidade em tempo real (Prior Belief para Posterior Belief) a cada nó da árvore de decisão, simulando a filtragem do range do oponente e aprendizado contínuo.
- **Random Forest Profile**: Utilização heurística de Árvores de Decisão (Decision Trees) para agrupar oponentes em arquétipos multidimensionais. As ações de bet sizing, agressividade e polaridade atualizarão a raiz do classificador, influenciando a equação Bayesiana.

## 3. UI/UX: O Novo Módulo Laboratorial (Árvore de Decisão CFR/Bayesiana)

- **Nova Rota no SOTA Hub**: Criação de `/laboratorio-v2/gto-cfr` (Dashboard de Inteligência Artificial), integrando-se nativamente à *Física da Mesa* compartilhada pelo global state.
- **Visualizador A* (Geometric Projection)**: Gráficos dinâmicos que plotam o caminho ótimo do pote (Flop -> Turn -> River) contra a erosão de fold equity e a polarização de ranges.
- **Painel Bayesiano (Recursive Updater)**: Uma interface interativa exibindo o deslocamento da probabilidade de blefe (`Prior` vs `Posterior`) à medida que o oponente avança nas streets com tamanhos de aposta específicos.
- **Matriz de Arrependimento (CFR)**: Um heatmap ou velocímetro de Regret (R+) que dita as porcentagens exatas de uma Mixed Strategy (Ex: 45% Call, 55% Fold) baseado nos subgames iterativos.

## 4. Roteiro de Implementação Arquitetural

1. **Backend Teórico**: Codificar as funções matemáticas num novo arquivo dedicado à Teoria de Sistemas e Modelos Preditivos.
2. **Hub de Interface**: Atualizar o menu de navegação e layouts para abraçar a expansão da "Inteligência Artificial" ao lado do "Risk Premium/ICM".
3. **Front-End Component**: Desenvolver o simulador renderizando os gráficos de Regret e as projeções do A* Pathfinding.
4. **Conteúdo Epistêmico**: Criar um novo Whitepaper ou Landing Page Card na rota principal, atestando a vanguarda e a densidade metodológica (CFR + Bayes + Random Forest) do Paradigma VITOI.
