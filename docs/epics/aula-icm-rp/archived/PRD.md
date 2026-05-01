# PRD: Aula Completa sobre ICM e Risk Premium em Final Tables

**Autor:** @planner | **Data:** 2026-03-08 | **Status:** rascunho

---

## 1. Problema

O conteudo educacional sobre ICM disponivel no mercado (cursos, livros, artigos) concentra-se quase exclusivamente em decisoes pre-flop e all-in. ICM pos-flop -- como o Risk Premium transforma sizings, ranges, decisoes de bluff, defesa e check-back ao longo das streets -- e uma area negligenciada onde o edge real existe para jogadores profissionais intermediarios.

Raphael Vitoi identificou esse gap desde 2013 e desenvolveu material original com conceitos proprios (Toy-Games progressivos, Teto do RP, RP de ida vs volta, mesa como organismo) que nao tem equivalente no mercado. Esse material precisa ser transformado em uma aula completa, didatica e autonoma, preenchendo os gaps identificados na pesquisa (Downward Drift, dados quantitativos, heuristicas de aplicacao em tempo real, payout structures, FGS, KO/Bounty).

**Por que isso importa:** jogadores AVG 109-530 estao perdendo mais de 10% do buy-in em spots ICM de bubble/FT (escalando para 30% em 3-bet pots) por jogarem ChipEV onde deveriam jogar ICM. Esse custo e invisivel para quem nao sabe medir.

---

## 2. Resultado Esperado

Um documento `.md` em portugues (pt-BR) que funciona como aula autonoma: um jogador profissional intermediario le do inicio ao fim e sai com dominio pratico de ICM e Risk Premium aplicados a decisoes pos-flop em Final Tables.

"Pronto" significa que o leitor consegue:

1. Calcular e intuir o Risk Premium de qualquer configuracao de stacks antes de agir
2. Explicar por que "fichas perdidas valem mais que fichas ganhas" e o que isso muda concretamente no pos-flop
3. Reconhecer os 10 erros mais comuns que cometia e ter correcoes concretas para cada um
4. Usar o conceito de Teto do RP para entender por que overbluffar o CL e suicidio ICM
5. Aplicar o Downward Drift (sizing drift pos-flop sob ICM) de forma consciente
6. Usar GTO Wizard ou DeepSolver para comparar spots em ChipEV vs ICM e treinar sozinho
7. Aplicar um checklist de decisao ICM pos-flop em tempo real, sem solver

---

## 3. Historias de Usuario

- Como jogador profissional intermediario (AVG 109-530), eu quero entender como ICM opera no pos-flop para que eu pare de perder EV em spots que nao reconheco como ICM-sensiveis.

- Como jogador que ja usa GTO Wizard, eu quero um framework para comparar ChipEV vs ICM side-by-side para que eu consiga estudar ICM pos-flop sozinho.

- Como jogador que sabe o basico de ICM (push/fold, bubble factor), eu quero entender por que o chip leader folda mais quando e coberto, mesmo tendo RP baixo, para que eu internalize a logica ao inves de decorar tabelas.

- Como jogador que luta em Final Tables, eu quero um checklist aplicavel em tempo real para que eu tome decisoes ICM-aware sem precisar do solver durante o jogo.

- Como jogador que comete erros de sizing em FTs, eu quero entender o Downward Drift para que eu ajuste meus sizings e ranges de forma consciente.

- Como estudante de poker avancado, eu quero entender as conexoes entre ICM, Prospect Theory e Teoria de Sistemas para que eu tenha um modelo mental mais robusto do que esta acontecendo na mesa.

---

## 4. Requisitos

### 4.1 Requisitos Funcionais (conteudo)

| ID   | Requisito | Prioridade | Notas |
|------|-----------|------------|-------|
| R-01 | Modulo 1 cobre fundamentos: ICM desde a mao 1, definicao de RP, calculo, intuicao, RP vs Bubble Factor, visualizacao com calculadora | Deve | Baseline para tudo que segue |
| R-02 | Modulo 2 reproduz integralmente os 8 toy-games do material original com analise completa | Deve | Nucleo da aula. Board 22223, AA/QQ/JJ vs KK, pot 100, aposta 100 |
| R-03 | Conceitos proprios (Teto do RP, RP de ida vs volta, Pacto Silencioso, mesa como organismo, Antevisao) presentes com nomenclatura original | Deve | Nao renomear, nao diluir |
| R-04 | Modulo 3 cobre ICM pos-flop: Downward Drift, SPR e distribuicao de RP por street, covering advantage, premium hands check-back | Deve | Secao central, nao apendice |
| R-05 | Custo quantificado de jogar ChipEV em spots ICM (>10% buy-in, >30% em 3-bet pots) presente e contextualizado | Deve | Dado do GTO Wizard |
| R-06 | Exercicio guiado de comparacao ChipEV vs ICM no GTO Wizard/DeepSolver | Deve | Leitor sai sabendo treinar sozinho |
| R-07 | Modulo 4 cobre variaveis contextuais: payout structures (flat vs top-heavy com dado de 5.7%), FGS vs ICM, KO/Bounty, CL dynamics | Deve | Gaps identificados na pesquisa |
| R-08 | Lista de 10 erros comuns do publico-alvo com correcao concreta para cada um | Deve | Baseado na secao 3.3 do pesquisa.md |
| R-09 | Checklist de decisao ICM pos-flop aplicavel em tempo real (sem solver) | Deve | Heuristica pratica central |
| R-10 | Conexoes interdisciplinares: Prospect Theory, Teoria de Sistemas, Teoria dos Jogos | Deveria | Quando iluminam o conceito, nao como ornamento |
| R-11 | Critica fundamentada ao uso mecanico de solvers | Deve | Posicao diferenciadora do autor |
| R-12 | Framework de estudo solo com solvers para treinar ICM pos-flop | Deveria | Autonomia do leitor pos-aula |
| R-13 | Progressao didatica clara: fundamentos -> toy-games -> ICM pos-flop real -> variaveis contextuais -> aplicacao | Deve | Sequencia pedagogica nao-negociavel |

### 4.2 Requisitos Nao-Funcionais (forma)

| ID   | Requisito | Prioridade | Notas |
|------|-----------|------------|-------|
| NF-01 | Documento .md estruturado, portugues (pt-BR) | Deve | Formato de entrega |
| NF-02 | Voz do autor: Raphael Vitoi. Direta, densa, sem condescendencia, sem validacao emocional vazia | Deve | Tom definido no prompt.md |
| NF-03 | Matematica presente e correta, servindo a intuicao (mecanismo > formula) | Deve | Leitor entende o "por que", nao decora |
| NF-04 | Sem explicacao de basico de poker. Publico ja sabe o que e EV, equity, solver, posicao | Deve | Nao tratar como iniciante |
| NF-05 | Exemplos pedagogicamente solidos e verificaveis. Nada inventado sem fundamento | Deve | Integridade tecnica |
| NF-06 | Sem em-dash (--) no documento final | Deve | Convencao global do usuario |
| NF-07 | Comentarios e textos em portugues | Deve | Convencao global |

---

## 5. Fora do Escopo

- **ICM pre-flop push/fold**: nao e o foco. Mencionado apenas como contraste para demonstrar que o edge migrou para o pos-flop.
- **Explicacao de conceitos basicos de poker**: EV, equity, pot odds, posicoes, mecanica de betting. O publico ja domina isso.
- **Tutorial completo de GTO Wizard ou DeepSolver**: apenas o necessario para que o leitor saiba comparar ChipEV vs ICM e configurar treinos.
- **ICM em Sit & Go**: contexto diferente. A aula foca em MTT Final Tables.
- **Producao de video, slides ou formato audiovisual**: o entregavel e exclusivamente documento .md.
- **Analise de hands reais especificas de torneios**: a aula usa toy-games como laboratorio didatico. Hands reais podem ser mencionadas como exemplo, mas nao sao o nucleo.
- **Debate filosofico sobre se solvers "resolvem" poker**: a critica aos solvers e pragmatica e fundamentada, nao ideologica.

---

## 6. Riscos

| Risco | Severidade | Mitigacao |
|-------|-----------|-----------|
| Reproduzir dados dos toy-games incorretamente (combos, frequencias, RP) | Alta | SPEC deve especificar dados exatos de cada toy-game. @implementor deve verificar contra o material original. @verifier deve validar matematica |
| Diluir a voz do autor com tom generico de "curso de poker" | Alta | SPEC prescreve tom por secao. Criterios de verificacao incluem checagem de voz |
| Conexoes interdisciplinares ficarem decorativas ou forcadas | Media | SPEC especifica exatamente onde cada conexao entra e qual conceito ela ilumina. Se nao ilumina, nao entra |
| Downward Drift e dados quantitativos mal atribuidos ou descontextualizados | Media | Fontes nomeadas explicitamente na SPEC. Dados com referencia a fonte original (GTO Wizard blog) |
| Aula ficar longa demais e perder coesao | Media | SPEC define escopo de cada secao. Modulos 1 e 4 sao os mais compactos; Modulos 2 e 3 sao o nucleo e podem ser mais extensos |
| Checklist de mesa ficar generico ou inaplicavel em tempo real | Media | SPEC prescreve formato e conteudo minimo do checklist. Deve ser testavel mentalmente em <10 segundos por item |
| Conceitos proprios de Raphael nao ficarem com destaque suficiente | Media | SPEC marca cada conceito proprio como "nomenclatura original" e prescreve formatacao diferenciada (negrito + definicao na primeira aparicao) |

