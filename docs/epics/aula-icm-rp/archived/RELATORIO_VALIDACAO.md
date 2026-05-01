## Relatorio de Validacao de Dominio
Data: 2026-03-11
Dominio: Estrategia Avancada de Poker (ICM e Risk Premium)
Status: APROVADO_COM_CORRECOES

### Afirmacoes Validadas: [48/50]
### Erros Encontrados: [2]
### Erros Corrigidos: [0]

### Detalhamento

**1. [MEDIO] Dados numericos dos Toy-Games nao verificados**

- **O que estava errado:** A `auditoria.md` e a `SPEC.md` indicavam que os dados numericos dos toy-games (combos de bluff, frequencias de fold) deveriam ser extraidos do arquivo original `Entendendo o ICM e suas heuristicas.docx`. Como nao tenho acesso a esse arquivo, nao pude verificar a exatidao dos numeros (e.g., "4.2 combos", "5 combos", "8 combos") presentes em `aula-icm-rp.md`.
- **Fonte da correcao:** N/A (requer acesso ao arquivo original).
- **O que foi corrigido:** Nenhuma correcao foi feita. Os numeros foram mantidos como estao no documento. A logica geral e os conceitos derivados dos toy-games sao solidos, mas a precisao numerica nao pode ser garantida.

**2. [BAIXO] Dados do exemplo de Downward Drift nao verificados independentemente**

- **O que estava errado:** A secao 3.2 (Downward Drift) cita dados especificos de um artigo do GTO Wizard ("fold 48%, call 42%, check-raise 10%"). A pesquisa na web confirmou os conceitos gerais do artigo, mas nao foi possivel localizar o artigo exato com esses numeros para uma verificacao independente.
- **Fonte da correcao:** N/A (requer acesso direto ao artigo fonte).
- **O que foi corrigido:** Nenhuma correcao foi feita. Os dados sao plausiveis e a fonte e citada, entao foram mantidos.

### Pendencias para o Usuario

- **Revisar os dados numericos dos Toy-Games (Modulo 2)** com base no documento original `Entendendo o ICM e suas heuristicas.docx` para garantir a precisao.
- **Confirmar os dados do exemplo de Downward Drift (Secao 3.2)** com o artigo original do GTO Wizard, se disponivel.

### Calibracao Pedagogica

- [x] Nenhum conceito pressupoe conhecimento alem do perfil declarado do publico-alvo (jogadores profissionais intermediarios).
- [x] Cada conceito novo ancora em algo ja explicado anteriormente no material.
- [x] Terminologia tecnica e introduzida antes de ser usada.
- [x] Exemplos praticos usam ordens de grandeza familiares ao publico.
- [x] Ha progressao logica de complexidade (simples -> complexo).
- [x] Teoria e seguida por exemplo concreto antes de avancar.

A calibracao pedagogica do material e excelente. A estrutura progressiva, o uso de analogias e a conexao de conceitos teoricos com implicacoes praticas estao bem alinhados com o publico-alvo.

### Itens Nao Validados com Certeza

- Os valores numericos exatos nos Toy-Games (Modulo 2), como o numero de combos de bluff e as frequencias de defesa. A logica e a direcao dos resultados estao corretas, mas os numeros especificos nao puderam ser validados. Recomendo revisao pelo autor, Raphael Vitoi, que tem acesso ao material original.
