---
id: registro-2026-09-16-benchmarks-medidos-e-nao-declarados
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-16T19:40:00-03:00'
atualizado_em: '2026-09-16T19:40:00-03:00'
classes: [interno, medido]
session_id: 5b136c4c-9182-4227-9bfc-d883a25c2a77
session_started_at: '2026-09-16T13:28:11-03:00'
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  node: '24.16.0'
  congelada_em: '2026-09-16'
verificado:
  - benchmark WASM multiway lia buffer nunca preenchido; disjuntor disparou nas 10 rodadas e publicava 528 milhoes it/s de atalho
  - o kernel calculate_multiway_equity_zerocopy nao avalia maos (wins sempre zero); o worker ja rotula a saida como scaffold e a UI nao a exibe
  - benchmark WASM declarava Zero-Leak pelo heap do JavaScript e ESTAVEL / NOMINAL como texto fixo
  - ranges do Monte Carlo sao os primeiros combos por indice, nao top por forca de mao como os comentarios diziam
  - suite imprimia ~5.2 GB VRAM como telemetria fixa, declarava aceleracao Vulkan pela presenca de DLL e terminava sempre em sucesso
  - filtro da suite procurava Total de Operacoes e Memoria sem acento; parte do relatorio WASM nunca aparecia
  - benchmark_results.json do router tinha 10 registros sem rotulo, com o .env em SIMULATE_INFERENCE=true e chaves de nuvem revogadas
  - plot_benchmark gerava dados sinteticos em silencio sem dataset e carimbava 100 por cento de sucesso depois de filtrar as falhas
  - testes do router em tools/ fora do testpaths; nunca rodavam na suite; reexportados por tests/test_hybrid_router_coleta.py sem mover o arquivo que dois registros publicados citam
  - sonda do llama.cpp custava cerca de 520 ms por requisicao com o local fora do ar; cache de 5 s levou p50 simulado de 971,66 para 467,29 ms e vazao de 8,81 para 12,19 req/s
  - pagina publica icm-contra-a-mesa-real sem defeito medido; 9 testes jest passam
  - 5 guards novos em tests/test_benchmarks_medidos.py e 2 testes do cache da sonda
  - decisao delegada pelo Tier 0 -- hybrid_router declarado descontinuado em tools.yaml e no README, bind padrao em loopback; codigo mantido porque registros publicados citam seus caminhos
  - decisao delegada pelo Tier 0 -- multiway implementado com avaliacao real (multiway_equity_core); AsAh x 7d2c a 1 ponto de 87,6 por cento, ranges identicos a 1 ponto de 1/N, board com royal empata 50/50; worker deixou de rotular a saida como scaffold
  - clippy instalado no toolchain; 4 erros deny-by-default preexistentes silenciados com motivo (2 pisos calibrados em 2.718, 2 FFI de ponteiro)
nao_verificado:
  - latencia de inferencia real do router -- sem chave de nuvem e sem llama.cpp em 8080
  - latencia de inferencia local pelo Ollama -- exige --inferencia MODELO e carrega o modelo
  - aceleracao efetiva do backend Vulkan do llama.cpp em uso
---

# Benchmarks medidos, e não declarados

Quatro coisas se chamavam benchmark. Três publicavam números que nenhuma medição
sustentava; a quarta, a página pública do ICM contra a mesa real, estava correta.

## O que cada uma dizia e o que fazia

**Motor WASM.** O caso multiway alocava o buffer de ranges e não o preenchia. O
kernel via massa zero, o disjuntor abortava na hora e o script dividia 500 mil
iterações pelo tempo do aborto. Com o buffer preenchido o disjuntor para de
disparar, e aparece o segundo achado: o kernel não avalia mão nenhuma. Ele amostra
combos, rejeita colisões e devolve vitórias zeradas. O protocolo do worker já
chamava essa saída de `scaffold` e a interface não a mostra; só o benchmark a
vendia como equidade.

**Suíte unificada.** Misturava medição com texto fixo. A linha de VRAM era
constante, a "aceleração Vulkan ativa" era existência de arquivo, e o veredito
final não dependia de nada. A seção de inferência listava modelos e não media
latência.

**Hybrid router.** O JSON versionado não distingue simulação de medição, e o
gráfico também não. O `plot_benchmark.py` inventava dados quando faltava arquivo e
imprimia 100% de sucesso depois de descartar as falhas.

## O que mudou

Aquecimento antes de medir, várias amostras e mediana com mínimo e máximo. Veredito
derivado de checagens. Escopo declarado no próprio resultado: `scaffold`,
`simulado`, `inventário`. A suíte consome o JSON do benchmark WASM em vez de filtrar
texto. O runner do router grava o modo a partir das respostas, e o gráfico sai com
marca d'água quando os dados não são medição real.

## As decisões delegadas

O Tier 0 delegou os destinos que este registro deixava em aberto. O multiway ganhou a
avaliação que faltava: cada iteração válida completa o board, avalia as sete cartas de
cada jogador com o mesmo `evaluate_7cards` do heads-up e divide o pote entre os
empatados. O núcleo é Rust puro e testado nativamente contra três verdades conhecidas.
O hybrid router ficou declarado descontinuado em vez de apagado: dois registros
publicados citam seus caminhos, e apagar o artefato sem o registro já custou caro
nesta casa.

## A otimização que a medição honesta revelou

Rodando o router em modo simulado, a latência padrão ficou em 972 ms quando a
simulação dorme 450. A diferença era a sonda do llama.cpp: conectar ao porto
recusado custa até 0,5 s no Windows, e ela rodava em toda requisição roteada ao
local. Com o resultado da sonda válido por 5 segundos e invalidado quando a geração
local falha, o p50 caiu de 971,66 para 467,29 ms e a vazão subiu de 8,81 para
12,19 req/s na mesma carga (60 requisições, concorrência 10). Os números são de
orquestração; a inferência continua simulada.
