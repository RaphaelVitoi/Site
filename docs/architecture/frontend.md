# Arquitetura Frontend

Este documento descreve a arquitetura geral do frontend da aplicacao.

## Visao Geral

O frontend e construido com Next.js e React, utilizando Tailwind CSS para estilizacao.

## Calculadora ICM Universal (V2)

A Calculadora ICM Universal (V2) segue uma arquitetura modular para garantir separacao de preocupacoes e manutenibilidade:

- **Logica Core (`frontend/src/lib/icm.ts`)**: Contem a implementacao pura do algoritmo Independent Chip Model. Esta funcao e agnostica a UI, recebendo apenas arrays de stacks e premios e retornando os equities calculados. Sua independencia facilita testes unitarios e futuras integracoes.
- **Componentes de UI (`frontend/src/components/icm/`)**:
  - `PlayerInput.tsx`: Componente para entrada da pilha de fichas de um jogador.
  - `PrizeInput.tsx`: Componente para entrada do valor de um premio.
  - `ResultsDisplay.tsx`: Exibe os resultados do ICM em formato de lista e utiliza a biblioteca Recharts para renderizar um grafico de pizza, visualizando a distribuicao de equities.
  - `ICMCalculator.tsx`: O componente orquestrador. Ele gerencia o estado dos jogadores e premios, lida com a adicao/remocao de inputs, valida os dados e invoca a funcao `calculateICM`. Tambem e responsavel por exibir mensagens de erro e renderizar os subcomponentes de input e resultados.
- **Estilizacao**: Utiliza Tailwind CSS com um tema "Cyber/Dark" consistente com a identidade visual do projeto, inspirado em `icm_toy_game_simulator.html`.
