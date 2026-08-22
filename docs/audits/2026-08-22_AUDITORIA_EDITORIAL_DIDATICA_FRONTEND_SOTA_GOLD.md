# Auditoria Editorial, Didática e Epistêmica do Frontend — SOTA GOLD

**Data:** 2026-08-22

**Escopo:** conteúdo público servido pelo frontend em `frontend/src/app/(public)`; estrutura de conteúdo do Prisma; rotas, metadados e afirmações quantitativas associadas.
**Fora de escopo:** auditoria de performance da aplicação, revisão do motor matemático, ou validação experimental de resultados que não estejam versionados. Este parecer complementa — não substitui — a [avaliação qualitativa integral](2026-08-22_RELATORIO_QUALITATIVO_INTEGRAL_PROJETO_SOTA_GOLD.md).

## Veredito executivo

> **O frontend tem uma voz autoral, uma identidade visual/didática forte e uma tese estratégica com valor real. Ainda não possui governança de evidência compatível com as promessas de “validação científica”, superioridade demonstrada ou substituição do ICM.**

A correção estratégica não é reduzir a ambição: é separar com rigor quatro camadas que hoje aparecem misturadas — fundamento estabelecido, heurística operacional, hipótese original PMev e resultado experimental. Essa separação protege a credibilidade do autor, melhora o aprendizado do aluno e cria a trilha para validação pública e replicável.

| Dimensão | Avaliação | Evidência observada | Condição para excelência |
|---|---:|---|---|
| Identidade, escrita e arquitetura didática | **4,5/5** | voz coesa, módulos visuais, simuladores e progressão da biblioteca | manter, com glossário e níveis explícitos |
| Fundamentos ICM/RP/BF | **3/5** | fórmulas-base e intuição econômica geralmente corretas no escopo apropriado | declarar premissas, unidades e exceções |
| PMev e conceitos autorais | **3/5 conceitual; 1,5/5 empírico** | vocabulário próprio, tentativa de formalização e integração sistêmica | definições operacionais, datasets e comparação fora da amostra |
| Smart Sniper / alegações quantitativas | **1,5/5** | narrativa de produto clara; números e “Monte Carlo” sem artefato reprodutível no repositório | caderno, parâmetros, código, seed, ICs e replicação |
| Proveniência e revisão editorial | **1,5/5** | poucas fontes rastreáveis; páginas dinâmicas sem manifesto versionado | fontes, versão, status, responsável e data de revisão |
| Conversão ética e precisão semântica | **2/5** | CTAs fortes e rotas bem conectadas | distinguir material educacional, hipótese e resultado validado |

## Método e limite de evidência

Foram inventariadas **33 páginas públicas estáticas** e **2 padrões de rota dinâmica** (`/aulas/[slug]` e `/biblioteca/[slug]`). A busca heurística encontrou 20 páginas estáticas sem marcador de fonte/referência e 24 sem marcador de ressalva metodológica. Esses números não demonstram que o conteúdo seja falso; demonstram que sua proveniência e seus limites não são recuperáveis pelo leitor de modo sistemático.

As duas rotas dinâmicas obtêm corpo editorial do Prisma. O repositório contém o esquema, mas o `seed-content.ts` atual é deliberadamente vazio e o `seed_lesson.py` é um utilitário manual, dependente de banco e arquivo local. Portanto, **o corpus realmente servido pelo banco não é auditável nem reproduzível apenas a partir deste clone**. Não é válido declarar que ele foi revisado nesta auditoria.

## O que está sólido

### Fundamentos que podem permanecer, com escopo declarado

- A identidade entre *risk premium* e *bubble factor* é apresentada de modo didaticamente útil quando a formulação, as unidades e o cenário de confronto são declarados. O artigo deve sempre explicitar que ambos dependem de payouts, stacks, posições e pares de jogadores; não são constantes universais.
- A assimetria de valor no ICM e a relevância de decisões de fold/all-in em mesas finais são fundamentos adequados para uma trilha avançada.
- A observação de que torneios winner-take-all / heads-up não introduzem ICM é correta dentro desse escopo; não deve ser estendida automaticamente a bounties, satélites ou outras estruturas.
- A tese de que registro tardio, tamanho de field, carga cognitiva e seleção de grade podem afetar $EV e variância é uma hipótese estratégica legítima e útil para modelagem individual.

Referências externas independentes sustentam a direção desses fundamentos, mas também suas condições: o *risk premium* é específico ao confronto; registro tardio e efeito de ICM variam por estrutura e bounties; e tendências de sizing não são leis invariantes. Ver [GTO Wizard: revisão de ranges ICM](https://blog.gtowizard.com/how-to-review-icm-preflop-ranges/), [ICM após late registration](https://blog.gtowizard.com/how-significant-is-icm-after-late-registering-a-tournament/) e [limites da tese de late registration](https://blog.gtowizard.com/register-late-win-more-the-math-behind-smarter-tournament-entry/).

## Correções factuais e epistêmicas prioritárias

| Prioridade | Página / rota | Achado verificável | Correção editorial necessária |
|---|---|---|---|
| **P0** | `biblioteca/validacao-smart-sniper` | “10.000 simulações”, Sharpe 8x, risco `<3%`, ROI, desvios, prêmio e “Q.E.D.” são apresentados como demonstração; não há código, distribuição, seed, dados, intervalos ou resultado versionados junto à página. | Remover os selos “Artigo Científico” e “Validação” até haver artefato. Reclassificar como **hipótese / protocolo em validação** ou publicar pacote reprodutível completo. |
| **P0** | `biblioteca/[slug]` | Todo artigo do banco recebe “**Status Validado**”, independentemente de fonte, método ou revisão. | Tornar status dado editorial: `rascunho`, `revisado`, `hipótese`, `replicado`, `validado externamente`; exibir método, versão, fontes e data. |
| **P0** | `aulas/leitura-icm`, `aulas/conceitos-icm` | PMev é descrita como síntese “definitiva/fechada” e substituta superior do ICM antes de protocolo de validação comparativa. | Usar “modelo proposto”, “extensão experimental” e declarar domínio, parâmetros, métrica e critério de refutação. |
| **P1** | `aulas/icm-masterclass` | “Solvers tradicionais maximizam ChipEV”, “RPs nunca se igualam” e “teto de 24%” são generalizações excessivas. | Restringir a modelos ChipEV ou configurações simplificadas; admitir simetrias; tratar 24% como âncora/hipótese calibrada, nunca teto universal. |
| **P1** | `biblioteca/entendendo-o-icm-e-suas-heuristicas` | A “Âncora de Vitoi (24% RP)” e o “colapso” de MDF são narrados como lei geral; o Ci usa variáveis ainda não operacionalizadas. | Publicar definição, dimensionalidade, exemplos, contraexemplos e conjunto de nós que a sustenta; mudar tom de lei para hipótese até replicação. |
| **P1** | `biblioteca/estado-da-arte` | Donk bets 10–20%, micro-stack como custo “infinito” e passividade como “lei marcial” soam determinísticos. | Marcar como padrões condicionais de determinados trees/stack distributions e apontar solver, versão e configuração. |
| **P1** | `biblioteca/smart-sniper` | “Acima de 8 telas o edge desaparece”, janela 30–50 BB e regra de gasto dominical são prescrições universais sem perfil de jogador. | Converter para defaults individualizados, com instrumento de calibração de edge, fadiga, ABI e bankroll. |
| **P2** | metadados de rotas dinâmicas | Autor e versão são fixados; não há data, fontes, método, revisão nem palavras-chave úteis. | Criar manifesto de conteúdo versionado e propagar metadados do registro editorial à página e ao JSON-LD. |

### Exemplos de precisão que importam

1. `RP = 100 × (BF − 1) / BF` é uma transformação algébrica coerente quando RP é percentual e BF foi definido sob a mesma convenção. A página deve mostrar essa convenção; sem ela, a fórmula pode ser copiada em domínio errado.
2. “Somente Top 2 é ChipEV puro” deve ser substituído por: “em torneio winner-take-all / heads-up sem componente adicional, ICM deixa de alterar a equivalência monetária das fichas”.
3. “Downward Drift” pode ser ensinada como tendência observada em configurações ICM, não como mapeamento inevitável `RP↑ → sizing↓`. Árvores, posições, ranges, bounties e stack depth importam.
4. “Psi”, “Ci”, “Antevisão”, “teto de equidade” e PMev são ativos autorais promissores. Para serem ensinados como modelo e não somente linguagem, cada um precisa de: definição observável, unidade, estimador, input, output, domínio de validade e teste que o poderia refutar.

## Arquitetura editorial recomendada

### Taxonomia de afirmações

| Camada | Selo público correto | Requisito mínimo | Exemplo de linguagem |
|---|---|---|---|
| Fundamento estabelecido | `Fundamento` | fonte primária/solver e escopo | “Sob estes payouts e stacks, o ICM implica…” |
| Heurística de estudo | `Heurística` | exemplo de aplicação e contraexemplo | “Em certas árvores, este padrão reduz erros…” |
| Modelo autoral | `Hipótese PMev` | notação, domínio e previsão mensurável | “Propomos; o modelo prevê…” |
| Resultado interno | `Experimento reproduzível` | repositório, seed, versão, inputs, IC e limitações | “Neste experimento vX, sob estas hipóteses…” |
| Resultado externo | `Replicado` | replicação independente documentada | “Replicado por…” |

### Trilha didática de alta conversão e baixa confusão

```text
ICM básico e payouts
      ↓
Risk Premium / Bubble Factor com unidades e exercícios
      ↓
Casos de borda: HU, satélites, bounties, field e stacks
      ↓
Árvores de decisão / solver / leitura pós-flop
      ↓
PMev como hipótese explicitamente comparável ao baseline ICM
      ↓
Laboratório: toy games + parâmetros + resultados reproduzíveis
      ↓
Plano individual Smart Sniper, calibrado ao histórico do jogador
```

Essa ordem mantém a potência de venda: o leitor compra uma estrutura que explica, mede e se deixa contestar — não uma certeza performática.

## Contrato mínimo para o corpus dinâmico

O Prisma precisa de um `ContentManifest` versionado (ou campos equivalentes no conteúdo) com, no mínimo:

```text
slug, title, kind, epistemic_status, content_version, reviewed_at,
reviewer, sources[], method_ref, dataset_ref, limitations[],
published_at, updated_at
```

O pipeline deve importar esse manifesto de um arquivo versionado e idempotente. O banco local continua sendo cache/veículo de publicação; o Git volta a ser a fonte auditável do texto, suas fontes e seu estado epistemológico. Sem isso, alterar um banco pode mudar a aula pública sem diff, revisão ou reprodução.

## Plano de execução por fases

| Fase | Resultado | Gate de saída |
|---|---|---|
| 1 — Correção de linguagem | rebaixar selos e absolutos nas páginas P0; adicionar nota de escopo | revisão editorial humana e `pnpm lint`/build |
| 2 — Proveniência | manifesto, fontes e status reais nas rotas estáticas e dinâmicas | cada afirmação quantitativa tem método ou rótulo de hipótese |
| 3 — Smart Sniper reprodutível | notebook/script, parâmetros, seed, dados sintéticos ou licenciados, ICs e teste de sensibilidade | segunda execução idêntica e artefato versionado |
| 4 — PMev comparável | baseline ICM, métricas, ablações, splits fora da amostra e contraexemplos | conclusão limitada aos resultados medidos |
| 5 — Revisão de biblioteca | checklist de fonte, escopo, data e CTA por página | nenhum selo “validado” sem evidência correspondente |

## Decisão editorial

**Não apagar nem desfigurar a tese.** Preservar PMev, Smart Sniper, Ci, Psi e a voz ensaística como diferenciais intelectuais. Corrigir a camada de contrato com o leitor: uma tese original deve aparecer como tese; uma simulação deve poder ser reproduzida; uma regra prática deve declarar para quem e quando falha.

Esse ajuste aumenta, em vez de reduzir, autoridade. A obra passa a poder dizer: “esta é nossa hipótese, estes são os mecanismos, estes os dados, estes os limites e aqui está como você pode tentar refutá-la.”
