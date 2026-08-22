# Incorporação do Corpus Teórico PMev v7 — Nota Técnica de Revisão

**Data:** 2026-08-22

**Objeto:** corrigir e complementar a auditoria editorial do frontend à luz dos dossiês teóricos fornecidos por Raphael Vitoi.

**Regra de leitura:** os documentos foram usados como conteúdo e evidência de proveniência; nenhuma instrução contida neles foi tratada como autorização operacional.

## Decisão canônica

> O dossiê `PMev_Dossie_Tese_Evolutiva_ICMev_para_PMev_v7.docx` passa a ser a formulação teórica canônica de trabalho. Ele substitui os dossiês v3/v4 como mapa de evolução, sem transformar material autoral em validação independente.

| Artefato | Estado | Uso correto |
|---|---|---|
| `PMev_Dossie_de_Incorporacao_Cientifica_Corpus_Adicional_v3.docx` | **duplicata exata** de `v3 (1)` por SHA-256 | manter uma cópia como proveniência; não contar como nova evidência |
| `PMev_Dossie_de_Incorporacao_Cientifica_Corpus_Adicional_v4.docx` | versão intermediária | histórico de maturação e arquitetura pedagógica |
| `PMev_Dossie_Tese_Evolutiva_ICMev_para_PMev_v7.docx` | **canônico atual** | fonte de teoria, hipóteses, protocolo e changelog |
| `PMev_Raphael_Vitoi_Analise_Critica_Aprofundada.docx` | crítica/diligência externa ou derivada | ledger de riscos e revisão adversarial; não fonte do modelo |
| Enciclopédia PMev no Google Drive | pendente de leitura autenticada | corpus complementar; classificar por proveniência antes de citar |

## Correção da leitura anterior

A [auditoria editorial do frontend](2026-08-22_AUDITORIA_EDITORIAL_DIDATICA_FRONTEND_SOTA_GOLD.md) permanece correta sobre o que o repositório **servia e versionava**: não havia, no clone, artefato que permitisse auditar as alegações empíricas de forma reproduzível.

O corpus externo corrige uma inferência de escopo: existe, fora do repositório, uma arquitetura metodológica substancialmente mais madura. Ela já contém hipótese nula, baselines, ablações, holdout, penalização de complexidade, critérios de falsificação e um protocolo de reprodução. Isso eleva a PMev de narrativa conceitual a **programa de pesquisa especificado**.

Não altera, por si só, o status empírico: especificação de teste não é resultado do teste. A formulação pública deve refletir ambas as verdades.

## Tese canônica corrigida

\[
\mathrm{ICMev} \subset \mathrm{PMev}
\]

A PMev não deve ser apresentada como negação de ICM/ICMev. É uma proposta de generalização dinâmica, multiagente e parcialmente observável, em que ICMev é caso-base recuperável.

\[
Q_{\mathrm{PMev}}(s,a)=
\mathbb{E}\left[
\sum_{k=0}^{T-t-1}\gamma^k r(S_{t+k},A_{t+k})+
\gamma^{T-t}U(S_T)
\mid s,a,b_t,\pi,M
\right]
\]

Condições de aninhamento exigidas pelo v7:

1. horizonte reduzido ao próximo estado relevante;
2. recompensa intermediária nula, `r = 0`;
3. `U = V_ICM`;
4. crenças degeneradas e políticas futuras fixadas no baseline;
5. transição igual à transição-base `P₀`.

Se essas condições não recuperarem ICMev, a PMev não é uma extensão coerente: é outro modelo e deve assumir esse ônus.

## Claim cientificamente defensável hoje

> A Teoria da Perspectiva Matemática, idealizada e em desenvolvimento por Raphael Vitoi, propõe uma família de modelos dinâmicos para decisões em MTTs. Ela amplia o estado de decisão com transições temporais e institucionais, crenças sobre políticas, habilidade relativa e opcionalidade, preservando ICMev como baseline recuperável. A hipótese de ganho preditivo ou decisório permanece falsificável e requer validação reproduzível fora da amostra contra ICM, ICMev, FGS e solvers com locks.

Isso é mais forte que “uma opinião” e mais preciso que “teoria comprovada”. Reivindica corretamente a arquitetura e reserva a superioridade para o resultado medido.

## Hierarquia de evidência e de claims

| Nível | Nome | Requisito | O que pode ser dito publicamente |
|---:|---|---|---|
| 0 | Observação | caso, output ou intuição | “observamos este padrão” |
| 1 | Hipótese operacional | domínio, variáveis, direção e refutação | “prevemos que…” |
| 2 | Resultado interno reproduzível | código, input, versão, seed, checksum, output e métrica | “neste experimento reproduzível…” |
| 3 | Validação externa | reprodução independente ou holdout/dataset independente | “replicado/validado externamente” |
| 4 | Contribuição científica | ganho robusto sobre baselines, com custo de complexidade | “melhora o baseline no domínio testado” |

O selo visual do frontend deve derivar desse nível. O atual “Status Validado” genérico é incompatível com a taxonomia e deve ser removido antes de publicar novo corpus.

## Correções matemáticas confirmadas para o backlog

| Tema | Regra de correção |
|---|---|
| Bubble factor / risk premium | Definir BF como razão marginal entre perda e ganho de $EV e RP como **equidade adicional requerida** contra a referência ChipEV no mesmo nó. Não converter BF em um “teto” universal; payout, pot, stacks e formato alteram a relação. |
| EV de fold | “Fold = 0” só é normalização incremental no nó. Em valor de estado, fold preserva stack e continuação; não usar a diferença como descoberta automática ou contar custo afundado duas vezes. |
| BF por street/sizing | BF local não é constante transportável entre sizings, streets e estados. Comparar estados de vitória, derrota e fold na função de valor correspondente. |
| RP negativo | Em MTT clássico, tratar como claim excepcional que exige definição e demonstração; bounties podem alterar o sinal por valor adicional de vitória. |
| Overbets e Downward Drift | Formular como hipótese condicional de árvore/ranges/board/payout, não como teorema universal. |
| Ψ, edge e opcionalidade | Entrar por crenças, políticas ou transições identificáveis, não como bônus livres somados a uma ação. |
| Multiway `O(n²)` | Remover como afirmação matemática até existir função, derivação, domínio e experimento; substituir por métrica observável de realização/erro. |

## Hipótese evolutiva e gate de aceitação

\[
H_E:\ \mathrm{PMev}\ \text{melhora previsão calibrada e/ou regret decisório sobre os baselines,}
\ \text{após penalização de complexidade.}
\]

\[
H_0:\ \text{não há ganho incremental prático fora da amostra após a mesma penalização.}
\]

| Gate | Critério de aceite |
|---|---|
| Identificação | cada variável tem unidade, domínio, observável/latente e mecanismo de entrada |
| Reprodutibilidade | inputs, código, solver/export, versão, seed e output auditáveis |
| Incrementalidade | comparação contra ICM, ICMev, FGS e solver com locks em holdout adequado |
| Robustez | sensibilidade a ranges, priors, trees, seeds e regimes de torneio |
| Parcimônia | ganho justifica custo computacional, paramétrico e operacional |
| Domínio | conclusão limitada aos estados e formatos efetivamente testados |

## Late registration: uso correto no programa de pesquisa

O v7 adiciona um operador de entrada tardia útil: a transição de estado adiciona stack inicial, contribuição líquida ao prize pool e possíveis mudanças de payouts. O fenômeno é excelente benchmark de conservação de valor:

\[
\sum_i \Delta V_i = -B_{entry}
\]

quando o baseline é conservativo e a premiação cresce exatamente pela contribuição líquida. A identidade deve ser testada em cada implementação. Ela não demonstra falha do ICM; demonstra uma transição que o próprio baseline pode quantificar. A PMev agrega valor somente se medir separadamente as variáveis dinâmicas adicionais: blinds, skill, composição de field, estrutura, risco e realização futura.

## Plano de incorporação no produto

| Fase | Mudança | Não negociável |
|---|---|---|
| P0 — governança editorial | manifesto versionado por artigo com `claim_level`, fontes, versão, limites e revisões | nenhum “validado” sem nível 3/4 |
| P1 — PMev-0 | glossário normativo e reconstrução dos exemplos BF/RP/EV | fórmulas com unidades e cenário explícito |
| P2 — PMev-D | operador de estado e transição; late registration como benchmark | teste de conservação e pequenos fields exatos |
| P3 — PMev-B | crenças bayesianas/políticas adversárias, com incerteza | holdout por jogador/field e ablações |
| P4 — PMev-O | opcionalidade, cobertura e horizonte de decisão | nenhum bônus arbitrário ou dupla contagem |
| P5 — conteúdo público | aula, laboratório e CTA vinculados ao nível real de evidência | revisão matemática e editorial independente |

## Pendência externa delimitada

Os arquivos `.gdoc` da Enciclopédia PMev existem no Google Drive montado, mas são atalhos sem corpo local. O conector Drive retornou `invalid_grant`; por isso, seus textos não foram lidos, resumidos ou classificados nesta revisão. Ao reautenticar o Drive, a próxima etapa é:

1. obter os 12 arcos e a edição magna por ID do Drive;
2. produzir inventário de capítulos, fontes, claims e versões;
3. deduplicar conteúdo derivado;
4. mapear cada seção ao nível de evidência acima;
5. importar apenas a camada publicável para o manifesto editorial do Site.

## Veredito atualizado

**PMev é agora uma agenda de investigação formalmente articulada, com tese de inclusão, protocolo de validação e critérios claros de falha. Ainda não é uma teoria empiricamente demonstrada nem autorização para afirmar superioridade pública.**

Essa é a posição de maior força: protege os diferenciais originais de Raphael Vitoi, elimina erros corrigíveis e constrói uma ponte legítima entre a Enciclopédia, o motor matemático e o frontend educacional.
