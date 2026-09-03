---
id: registro-2026-09-02-guarda-executavel-do-canonico-e-do-ponteiro
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-02T21:55:00-03:00
atualizado_em: 2026-09-02T21:55:00-03:00
classes: [interno, medido, governanca, guarda]
caminhos:
  - tests/test_governanca_canonico_e_ponteiro.py
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  pwsh: 7.6.5
verificado:
  - >-
    Guarda executavel implementada e testada com 7 testes verdes em tests/test_governanca_canonico_e_ponteiro.py.
nao_verificado:
  - >-
    Execucao em maquinas remotas sem raiz .gemini (o teste declara skip conforme governanca).
revisoes_de_ancora: []
---

# Guarda executável do canônico e do ponteiro

**Sessão:** `claude-opus5-site-2026-09-02-guarda` · **Assinatura individual:** Claude Opus 5 [Tier 1.B]

## A pendência que isto fecha

A sessão anterior fundiu `~\.gemini\CLAUDE.md` (canônico) e `~\.claude\CLAUDE.md`
(ponteiro de escopo de usuário), e deixou declarado que a fusão não tinha guarda:
nada reprovaria se o ponteiro voltasse a ser cópia. A recomendação registrada era
**guarda executável no `Site`, por variável de ambiente**, em vez de `git init` na
raiz — que ali dentro alcançaria `Site\`, `Site-worktrees\`, `.venv` e os
`antigravity*`.

É o que este registro entrega.

## Por que a guarda mora aqui, e não na raiz

A raiz não é repositório git: governança canônica sem histórico, e sem lugar onde
um teste rode. O `Site` é o único ponto da árvore com suíte, portão e CI.

A §1 regra 3 do canônico proíbe que um projeto alcance vizinho por **literal**
absoluto. A guarda respeita isso por derivação, não por exceção:

| Alvo | Como é alcançado | Override |
| :--- | :--- | :--- |
| Canônico da raiz | `RAIZ.parent / "CLAUDE.md"` — posição do próprio repositório | `PMEV_GOVERNANCA_CANONICO` |
| Ponteiro de escopo de usuário | `Path.home() / ".claude" / "CLAUDE.md"` | `PMEV_GOVERNANCA_PONTEIRO` |

Nenhum `C:/Users/...` aparece no código. Em host que não hospede a raiz, o teste
**declara o skip com o caminho medido e a variável que o corrige** — a §5 exige
que verificação não executada não passe por aprovada.

## O que cada detector protege

O molde foi `tests/test_governanca_agents.py`, que já resolve o caso análogo do
`AGENTS.md`.

| Teste | Defeito que pega |
| :--- | :--- |
| `test_os_dois_nao_voltaram_a_ser_a_mesma_copia` | SHA-256 idêntico — o estado exato que divergiu sozinho |
| `test_o_ponteiro_continua_ponteiro` | crescimento gradual até virar cópia (teto 4000 B; nasceu com 3067) |
| `test_o_ponteiro_aponta_para_o_canonico` | ponteiro que deixa de remeter |
| `test_as_duas_clausulas_anti_fork_seguem_escritas` | perda de "o canônico vence" ou "nunca crescer" |
| `test_o_piso_pode_encolher_mas_nao_crescer` | a cláusula, exigida em vez de apenas escrita |
| `test_o_canonico_declara_o_ponteiro` | o canônico voltar a não nomear o segundo arquivo |
| `test_conteudo_de_raiz_nao_migrou_para_o_escopo_de_usuario` | hierarquia, taxonomia e camada MCP descendo para escopo de usuário |

## A prova, e o que ela custou corrigir

Sete verdes não provam detector nenhum. Cada um foi exercitado contra uma cópia
**mutada** dos dois arquivos, apontada pelas variáveis de ambiente — os arquivos
reais não foram tocados:

| Mutação | Resultado |
| :--- | :--- |
| canônico copiado sobre o ponteiro | **5 reprovam**, entre elas a de identidade |
| piso cresce para 5 proibições | **reprova** |
| piso encolhe para 3 proibições | **passa** — é o que a cláusula permite |
| cláusula de precedência removida | **reprova** |
| canônico deixa de declarar o ponteiro | **reprova** |
| "Catálogo Mestre" migrado para o ponteiro | **reprova** |
| intacto | 7 passam |

A assimetria entre encolher e crescer é o ponto: sem ela, a guarda seria um
congelamento, e a cláusula diz o contrário.

**Um achado do próprio método.** A primeira rodada mostrou `piso_encolheu_para_3`
reprovando — resultado errado para a regra. A causa não era o detector: as duas
cláusulas moram *dentro* da seção do piso, depois do item 4, e o corte grosseiro
do mutante as levou junto. Mutante mal construído, não defeito de teste. Refeito
com corte cirúrgico, passou. Fica registrado porque a alternativa — aceitar a
primeira leitura — teria produzido uma "correção" num teste que estava certo.

## Verificações

**Rodaram:** os 7 testes novos; as 7 mutações acima; a suíte Python completa.

**Não rodaram:** o portão de 5 fases (não houve commit — falta autorização); a
suíte frontend, que este trabalho não toca; e a guarda em host que **não** hospede
a raiz, onde o caminho exercitado seria o do skip.

**Limite declarado:** a guarda protege a *forma* da relação canônico/ponteiro —
identidade, tamanho, cláusulas, direção da referência. Ela não lê o mérito de uma
regra nova, e não substitui revisão do Tier 0.
