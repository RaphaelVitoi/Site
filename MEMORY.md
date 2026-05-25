# MEMÓRIA AKASHICA — POKER RACIONAL (PARADIGMA VITOI)

Este arquivo serve como o registro persistente e central da memória do sistema, contendo o estado técnico do projeto, as diretrizes do paradigma Vitoi e as dependências críticas do ecossistema.

---

## 1. ESTADO ATUAL DO SISTEMA

### Backend (Gemma Core Server)

- **Servidor Ativo:** `gemma_server.py` executando localmente na porta `17043`.
- **Roteamento de Inferência:** Modelo híbrido assíncrono v5 (Ollama local / Gemini Cloud API como fallback).
- **Integração Frontend:** Heartbeat visual no header (`Header.tsx`) mapeando o status de conexão da Oracle (Gemma Server).

### Frontend & Simulador Quantum

- **Engine Core:** [perspectiva.ts](file:///C:/Users/Raphael/.gemini/Site/frontend/src/lib/perspectiva.ts) calcula a Perspectiva Matemática com suporte a:
  - Validação de dados via schemas do Zod.
  - Fator de Realização posicional ($R$).
  - Curva de Utilidade não-linear da Teoria do Prospecto (Kahneman & Tversky).
  - Teto dinâmico de equidade de indiferença (`threshEq`) fluindo organicamente.
  - Coeficiente de Insolvência estratégica ($C_i$).
  - **Correção da Ação de Fold:** Ação de fold corrigida em `_buildSimulatedStacks` para não deduzir `heroCost` do Hero, mantendo o stack no estado original de início da decisão (`stacks[heroIdx]`), em conformidade absoluta com o paradigma Vitoi.
- **Testes de Integridade:** [perspectiva.test.ts](file:///C:/Users/Raphael/.gemini/Site/frontend/src/tests/simulator/perspectiva.test.ts) valida as premissas analíticas com cobertura para os teoremas estruturais da Perspectiva (12/12 suítes de teste passando).

### Otimização e Infraestrutura SOTA (v6.2.1 GOLD)

- **Organização Geométrica:** Implementado o sistema de *Route Groups* no Next.js (`(auth)`, `(public)`, `(lab)`, `(user)`), reduzindo a profundidade cognitiva e melhorando a manutenibilidade do frontend.
- **Contrato Soberano de API:** Consolidada a API versionada `/api/v1` tanto no backend quanto no frontend, assegurando paridade fractal e prevenindo drifts de integração.
- **Potencialização de Ambiente:** .env.example unificado e harmonizado, garantindo onboarding instantâneo e configurações estritas de telemetria e IA.
- **Redução de Payload de Contexto:** ... (mantido)
---

## 2. MEMORIZAÇÃO DO PARADIGMA VITOI

A **Perspectiva Matemática** desloca a teoria clássica de torneios para um modelo dinâmico de fluxo estratégio-comportamental.

### I. Ontologia do Fold ($EV_{\text{fold}} \neq 0$)

- O fold tem custo: em ChipEV, $EV_{\text{fold}} = -\text{Antes}$ (geralmente $-0.125\text{bb}$). Ações são tomadas se seu EV for superior a esse abismo negativo, mesmo que o EV absoluto da jogada seja negativo.
- Em ICM, o fold é dinâmico:
  - **Positivo:** preservação passiva contra colisões para capturar payjumps de shorts em FT.
  - **Negativo (Pot Entrapment):** no pós-flop, a desistência de fichas já postas no pote tem custo de desvalorização utilitária exponencial.

### II. Hierarquia Cognitiva da Decisão

1. **$ICM_{\text{ev}}$ (Estático):** Snapshot imediato e isolado do valor do stack.
2. **Esperança Matemática (Estratégico-Lógico):** Ganhos e perdas ponderados pela nossa Edge, leitura de nêmesis e tendências populacionais.
3. **Expectativa Matemática (Probabilístico-Preditivo):** Projeção no FGS do impacto de posições futuras ($t-3$) e blinds.
4. **Perspectiva Matemática (Síntese Fechada):** Output absoluto que encapsula os termos anteriores e orienta a decisão final de sobrevivência de capital.

### III. Colisão Mutuamente Catastrófica ("O Erro de Ambos")

- Em ICM (não-soma zero), quando o oponente defende incorretamente (overcall wide), ele destrói sua própria equidade e **também a equidade do agressor (Hero)** pela fricção física da colisão. A equidade destruída é distribuída para os jogadores fora da mão (bystanders).
- É um erro de ambos: do Vilão por call incorreto, e do Hero por shove vulnerável à taxa de bobagem do oponente ($f_b$).

### IV. Amortização da Edge e Complexidade de Stack

- **10bb (Simplicidade Binária):** Árvore de decisões podada para Push/Fold. Nash comoditizado. O jogador fraco é protegido pela equidade do showdown e ausência de decisões pós-flop. Edge amortizada.
- **60bb+ (Complexidade Fractal):** Árvore com ramificações complexas pós-flop (cbets, check-raises, sizing, overbets). Edge do profissional ampliada exponencialmente pela abundância de oportunidade de erro ($O_e$) do amador.

### V. Reverse Implied Odds (RIO) vs. Pot Odds

- Pot Odds representam um incentivo linear básico, agindo frequentemente como um "Cavalo de Troia" para spec-calls perigosos.
- RIO representam o **Passivo Estrutural** de colisão pós-flop. Em potes Multiway (~33% no MDA global), o passivo das RIO cresce à taxa exponencial de $x^2$, forçando abstenção de ranges que seriam lucrativos sob visão linear de odds.

### VI. Hipótese de Fricção Limítrofe no River (Hipótese Vitoi H1)

- **Status:** **HIPÓTESE A SER EMPIRICAMENTE VALIDADA** (não deve ser tratada como dogma/dado clínico absoluto).
- **Teorema:** Sob apostas de pote polarizadas e sustentáveis ($B \le P$) em torneios standard (Top-Heavy), o Risk Premium máximo atinge $\approx 28\%$ ($BF \approx 1.388$), o que limita a equidade necessária de defesa do River a $\approx 41\%$. Qualquer valor acima disso é invalidado por proibir a auto-preservação de stack do próprio agressor.
- **Diretriz de Software:** O simulador não deve forçar limites (caps) rígidos à equidade de indiferença, permitindo o fluxo matemático orgânico para testar as bordas extremas desta hipótese.

---

## 3. MAPA DE ARQUIVOS DE REFERÊNCIA SOTA

- **Framework Teórico:** [perspectiva_matematica_framework_v2.md](file:///C:/Users/Raphael/.gemini/Site/docs/research/perspectiva_matematica_framework_v2.md)
- **Derivações Teóricas (D1-D6):** [validacao_matematica_hipoteses_v1.md](file:///C:/Users/Raphael/.gemini/Site/docs/research/validacao_matematica_hipoteses_v1.md)
- **Prova Clínica do River:** [prova_matematica_icm.md](file:///C:/Users/Raphael/.gemini/Site/docs/research/materials/prova_matematica_icm.md)
- **Texto Conceitual (Geometria do Risco):** [geometria_texto.md](file:///C:/Users/Raphael/.gemini/Site/docs/research/materials/geometria_texto.md)
- **Motor de Cálculo:** [perspectiva.ts](file:///C:/Users/Raphael/.gemini/Site/frontend/src/lib/perspectiva.ts)
- **Suite de Validação (Testes):** [perspectiva.test.ts](file:///C:/Users/Raphael/.gemini/Site/frontend/src/tests/simulator/perspectiva.test.ts)
