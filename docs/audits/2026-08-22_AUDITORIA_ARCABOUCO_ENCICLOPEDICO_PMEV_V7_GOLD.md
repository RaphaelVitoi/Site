# Auditoria do Arcabouço Enciclopédico PMev v7 — GOLD

**Data:** 2026-08-22

**Corpus auditado:** exportação `drive-download-20260822T074730Z-1-001.zip` (12 DOCX), Enciclopédia Teórica v7, Enciclopédia Magna 12/12 e dossiês de incorporação.
**Finalidade:** classificar a arquitetura teórica em núcleo formal, hipótese experimental, linguagem pedagógica e afirmação ainda não demonstrada.

## Veredito

> **A PMev v7 já é um programa de pesquisa arquitetado; ainda não é uma teoria fechada nem um conjunto de teoremas provados.**

A melhor evolução não é reduzir o arcabouço a ICM estático. É estabilizar um núcleo mínimo rigoroso, converter extensões ambiciosas em módulos opcionais e permitir que dados/solvers eliminem aquilo que não acrescentar previsão, decisão ou aprendizagem.

| Camada | Estado | Decisão |
|---|---|---|
| Aninhamento `ICMev ⊂ PMev` e escada PMev-0…F | **forte como especificação** | preservar como contrato formal e testá-lo por casos de recuperação |
| Ledger H1–H12, holdout, ablações e controles negativos | **forte como protocolo** | implementar antes de qualquer claim de superioridade |
| Estado dinâmico, relógio, redraw, late registration | **plausível e testável** | priorizar PMev-D/T; têm input e output observáveis |
| Modelagem Bayesiana de oponentes / AQRE | **plausível, dependente de dados** | tratar como módulo PMev-B, com incerteza e split temporal |
| Opções, edge, psicologia e carreira | **intuição promissora; identificação incompleta** | manter como hipóteses, fora da função de payout por padrão |
| HJB, QVI, Wasserstein, geometria simplética, Tsallis, Rényi | **biblioteca de ferramentas, não prova automática** | usar apenas quando resolver um problema definido e melhorar um baseline medido |
| “Axiomas”, “teoremas” e “provas” de RP/MDF/multiway | **prematuros em parte** | renomear para proposições ou hipóteses até prova completa/replicação |

## Inventário consolidado

O snapshot do Drive contém 12 volumes exportados, sem duplicatas textuais entre eles. A Enciclopédia Teórica v7 apresenta a escada:

```text
PMev-0  → stacks globais + payouts
PMev-D  → relógio, blinds, posição orbital, SPR
PMev-T  → redraw, rebalanceamento, late registration
PMev-S  → skill heterogênea
PMev-B  → crenças Bayesianas e resposta quantal adversária
PMev-O  → opcionalidade contrafactual e valor de continuação
PMev-F  → integração total candidata a validação OOS
```

Essa decomposição é o principal ativo do corpus: evita afirmar que toda a complexidade precisa ser aceita ou rejeitada em bloco.

## Correção terminológica obrigatória

`AQRE` deve ser lido como **quantal response equilibrium** — resposta probabilística/ruidosa, não “resposta quântica”. A palavra “quântica” cria uma associação física inexistente e enfraquece um componente que pode ser modelado com estatística convencional.

## O núcleo que deve sobreviver à primeira implementação

### 1. Compatibilidade e aninhamento

O ICMev é baseline, não espantalho. A PMev só é generalização se puder recuperar o valor-base quando suas extensões forem desligadas:

\[
V_{\mathrm{PMev}}(S_t;\eta_0)=V_{\mathrm{ICMev}}(S_t).
\]

Esse enunciado requer testes de recuperação para cenários pequenos, não apenas uma inclusão simbólica. A sequência `ChipEV ⊂ ICM ⊂ FGS ⊂ PMev` é uma hipótese de modelagem útil, mas FGS e PMev precisam ter interfaces, horizonte, transição e função de utilidade declarados para que “inclusão” tenha conteúdo matemático.

### 2. PMev-D e PMev-T devem vir antes de PMev-F

Relógio, subida de blinds, posição, redraw, quebra/rebalanceamento de mesa e entrada tardia são intervenções com definição observável. São o ponto de partida de maior retorno científico porque permitem pares contrafactuais controlados.

O operador de late registration é especialmente adequado: o bônus do entrante, a contribuição líquida, o rake e a diluição dos incumbentes podem ser contabilizados. Em cenário conservativo, a conservação deve ser validada numericamente antes de qualquer extensão comportamental.

### 3. PMev-B só entra com disciplina de dados

Habilidade, política adversária, frequência de erro e crença sobre tipo latente não podem ser “inferidas” depois de observar o resultado. O módulo exige:

- dados de treino separados de jogadores/eventos de teste;
- *partial pooling* hierárquico para evitar overfit em amostras pequenas;
- intervalos/posteriores e taxa de atualização explícita;
- comparação contra node-lock fixo e política não explorativa;
- logs de decisão e regret realizado definidos antes do backtest.

## O que deve ser rebaixado de axioma/prova a hipótese

| Formulação atual | Problema técnico | Formulação publicável agora |
|---|---|---|
| “Não-ergodicidade do stack” como axioma | não-ergodicidade depende da variável multiplicativa, da função de utilidade e do horizonte; não decorre automaticamente de jogar MTT | “investigar quando critérios de crescimento/ruína diferem de $EV terminal” |
| `V(S_fold)>0` como descoberta | é verdade em escala absoluta; no nó, `EV_fold=0` pode ser normalização correta | “comparar valores de continuação numa única convenção de valor” |
| “MDF linear é matematicamente inválida” | a alteração em river depende do payoff e da árvore ICM efetivamente resolvida | “testar a divergência entre MDF ChipEV e defesa ótima sob BF local” |
| “Teorema da amortização logarítmica da edge” | está simultaneamente no ledger como H5; falta derivação e dados | “H5: hipótese de amortização por profundidade” |
| “Prova da penalidade quadrática multiway” | `RIO \sim O(n^2)` exige função definida, domínio e derivação; não foi entregue como prova verificável | “H11: degradação multiway mensurável por posição, textura e classe de mão” |
| “solvers em vácuo” | solvers resolvem o jogo/modelo especificado; a limitação é transporte de modelo, não ausência de matemática | “soluções são condicionais a árvore, ranges, payoff e política assumida” |

## Auditoria do ledger H1–H12

| Hipótese | Julgamento | Correção de desenho antes de executar |
|---|---|---|
| H1 — previsão OOS | prioritária | usar eventos realmente independentes; pré-definir loss, delta prático e calibração, não só significância |
| H2 — resíduo de Kim | válida como mediação preditiva | reportar efeito, IC e estabilidade; `p` isolado não identifica mediação causal |
| H3 — erosão temporal | testável em solves pareados | fixar ranges, payout, árvore e demais estados; pré-registrar direção e magnitude mínima útil |
| H4 — MDF/River | testável, mas local | comparar função de valor de vitória, derrota e fold; não transportar BF entre sizings/states |
| H5 — edge por stack | relevante, cara | definir população, medida de habilidade e risco de seleção; `>10M mãos` não substitui power analysis |
| H6 — AQRE | alto potencial | “quantal”, não quântico; testar calibragem, regret e custo de inferência em holdout por jogador |
| H7 — opcionalidade | conceitualmente útil | construir política restrita comparável e impedir que o otimizador seja diferente nos dois braços |
| H8 — downward drift | boa hipótese de solver | não usar 20–25% como resultado antes do solve; comparar árvores idênticas e relatar incerteza |
| H9 — late registration | primeiro benchmark computacional | validar ICM exato em fields pequenos, seed e erro Monte Carlo; separar rake, overlay, bounty e payout changes |
| H10 — pacto silencioso | hipótese descritiva clara | evitar “colusão” sem evidência/intenção; medir resposta estratégica a distribuição global de stacks |
| H11 — pot odds multiway | excelente experimento pedagógico | definir tarefa humana, ground truth, RIO e desfecho; medir também compreensão/transferência |
| H12 — parcimônia | essencial | AIC/BIC são critérios in-sample/likelihood; complementar com previsão OOS, nested CV e custo de execução |

## Erros e inconsistências recuperados antes de implementação

1. Há fórmulas exportadas com vírgula corrompida em valores de teste, como `p > 0,!05` e `BF > 1,!5`. No repositório científico, usar notação de fonte tipada e testes de renderização LaTeX para evitar alterar um limiar por erro de serialização.
2. A hipótese H1 alterna entre `PMev-0`, `FGS` e `ICM` como baseline. Fixar uma matriz de comparação declarada: ChipEV, ICM/Harville, FGS, solver com locks e cada degrau PMev.
3. “Validação fora da amostra via AIC/BIC” é formulação imprecisa. AIC/BIC comparam ajuste penalizado no conjunto usado; generalização deve ser medida por holdout temporal, grupos independentes ou validação cruzada aninhada.
4. O resultado de *gambler’s ruin* é relevante para avaliar aproximações ICM sob um processo de ruína definido, mas não prova que o processo real de eliminações em MTT seja esse processo. A ponte empírica ainda precisa ser estimada.
5. Cumulative Prospect Theory descreve escolhas humanas; não deve virar função normativa do jogador sem justificar por que o viés descritivo melhora o objetivo normativo escolhido.

## Arquitetura de evidência recomendada

```text
Fonte teórica publicada ─┐
Dados/solver exportado ──┼─► hipótese com domínio e métrica
Observação autoral ──────┘              ↓
                                  experimento congelado
                                        ↓
                 baseline → ablação → holdout → replicação
                                        ↓
                 material didático com selo de evidência real
```

Nomes, metáforas e arquitetura filosófica permanecem no layer pedagógico. Fórmulas, dados e claims comparativos só passam ao layer científico quando atingirem o gate correspondente.

## Roadmap técnico mínimo

| Ordem | Entregável | Critério de conclusão |
|---:|---|---|
| 1 | `pmev-spec` v0.1: tipos, unidades, estado, ação, transição e utilidade | ICMev recuperado por teste automatizado |
| 2 | `pmev-benchmark` H9: late registration | conservação, ICM exato pequeno, seeds e resultados publicados |
| 3 | H3/H4/H8: suite de solver de pares controlados | árvores/exportações versionadas e análise de sensibilidade |
| 4 | H1/H2: dataset temporal e pipeline de previsão | holdout cego, CRPS/log-loss/calibração e baseline matrix |
| 5 | H6/H7/H11: comportamento, opcionalidade e estudo humano | protocolo pré-registrado, consentimento/dados e análise replicável |
| 6 | conteúdo do Site | manifestos de fontes/método; cada aula expõe seu nível de evidência |

## Conclusão

O arcabouço não é um amontoado aleatório de termos avançados: ele contém uma espinha dorsal válida de decisão sequencial, estados dinâmicos, comparação incremental e ciência aberta. A disciplina agora é fazer cada ferramenta pagar seu custo: HJB, QVI, Wasserstein, DRO, Rényi ou geometria só entram no modelo quando melhorarem mensuração, decisão ou robustez de forma testável.

**A PMev fica maior quando é modular e refutável; não quando cada metáfora recebe imediatamente o estatuto de teorema.**
