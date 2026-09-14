---
id: registro-2026-09-13-append-em-jsonl-e-suite-em-todos-os-nucleos
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T21:19:42-03:00'
atualizado_em: '2026-09-13T21:19:42-03:00'
classes: [interno, medido, portao, governanca]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  congelada_em: '2026-09-13'
caminhos:
  - .husky/pre-push
  - scripts/ops/record_gate.py
  - scripts/ops/suite_verde.py
  - tests/test_record_index.py
  - tests/test_suite_verde.py
verificado:
  - e67e91da do Gemini 3.8 Flash revisado com CI verde; nota 9.8 e texto do feedback sao do Tier 0, com proveniencia valida
  - as 4 PYSEC ignoradas em python audit batem com data/python_cve_acceptances.json
  - google-genai 2.23.0 no venv expoe Client, types.GenerateContentConfig e errors.APIError, os simbolos que o codigo importa
  - anexar 1 linha ao feedback-ledger custou 5 revisoes_de_ancora ao commit e67e91da
  - os 32 commits que tocaram o feedback-ledger foram todos so adicao e custaram 423 revisoes_de_ancora
  - G2 passa a avisar quando um .jsonl ancorado so ganhou bytes no fim, com o HEAD como prefixo do stage; reescrita continua bloqueando
  - a regra nao vale para codigo -- def repetido no fim de um .py substitui o primeiro, e o teste em git real cobre o caso
  - pytest com -n auto e o basetemp do pre-push -- 1231 aprovados, 1 pulado, 140 s; em serie eram cerca de 420 s
  - suite_verde usa -n auto quando o xdist existe; -n ou -p no:xdist de quem chama vence; sem xdist roda em serie
  - test_suite_verde.py e os 3 casos novos de test_record_index.py -- 21 aprovados; test_record_index.py inteiro, 49 aprovados antes do ruff format
  - ruff check sem achados; ruff format aplicado nos quatro arquivos Python
  - neste commit o portao acusou 1 bloqueio VIGENTE, a taxonomia, e 14 avisos
nao_verificado:
  - estabilidade do -n auto alem de duas rodadas; a segunda e a do pre-push que publica este registro
  - dependencia de ordem entre testes, que so o CI em serie revela
  - chamada real ao google-genai 2.x, porque as chaves estao revogadas
  - remocao das dependencias orfas apontadas pelo knip
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [scripts/ops/record_gate.py]
    parecer: A taxonomia descreve onde cada artefato mora. O G2 passa a distinguir append de reescrita em .jsonl; nenhum artefato muda de pasta e o formato do registro nao muda.
---

# Append em `.jsonl` sem revisão de âncora, e suíte em todos os núcleos

Dois custos que caíam sobre todo modelo a cada publicação.

| Custo | Antes | Depois |
| :--- | :--- | :--- |
| Anexar ao ledger de calibração | 1 revisão de âncora por registro vigente que o ancora | aviso |
| Suíte no pre-push, quando mede | ~420 s em série | ~140 s com `-n auto` |

O ledger é append-only por contrato. Uma linha nova não altera as anteriores, e
o que um registro atestou sobre elas continua valendo. A reescrita de uma linha
antiga continua bloqueando.

O CI segue em série e com cobertura. É lá que aparece dependência de ordem entre
testes, que a execução paralela local pode esconder.

## Achados menores no e67e91da, não corrigidos

- `python:audit` repete à mão a lista de CVEs aceitas. Se
  `data/python_cve_acceptances.json` mudar, os dois divergem.
- `memory/notepad_active.md` generaliza Pylint 10/10 e ESLint 0 para a base
  inteira. O registro do Gemini mede três arquivos Python e dois TypeScript.
