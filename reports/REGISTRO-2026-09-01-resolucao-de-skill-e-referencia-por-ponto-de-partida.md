---
id: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: devin@cognition
criado_em: 2026-09-01T12:40-03:00
atualizado_em: 2026-09-01T12:40-03:00
classes: [interno, medido]
config_medida:
  raiz: C:/Users/Administrator/repos/Site2
  so: Windows
  python: '3.14.7'
  ruff: 0.16.3
  suite: 762 passed, 4 skipped, 0 failed
caminhos:
  - data/skills_registry.json
  - tests/test_governanca_skills.py
  - scripts/ops/record_gate.py
  - scripts/ops/record_index.py
  - tests/test_record_index.py
  - reports/HANDOFF-2026-08-31-automacao-mcp-figma-prisma.md
referencias_nao_resolviveis:
  - antigravity-backup/mcp_config.json
  - scripts/ops/Start-FigmaMcp.ps1
  - scripts/ops/Test-McpHealth.ps1
verificado:
  - tests/test_governanca_skills.py 9/9 e tests/test_record_index.py 29/29 aprovados
  - Suite completa em 762 aprovados, 4 pulados, zero falhas -- as duas falhas que existiam no master estao fechadas
  - As duas skills supabase resolvem como externas declaradas, com origem no plugin oficial e status nao-verificada
  - Diretorio de skill ignorado pelo versionamento deixa de contar como resolucao local, entao a guarda mede o mesmo em CI e na maquina do operador
  - Citacao relativa a artefato coberto pelo .gitignore deixa de ser lida como referencia morta
nao_verificado:
  - Carregamento efetivo das skills supabase na maquina do operador -- e declaracao, nao observacao (§8.2), e o registro diz isso no proprio status
  - Existencia dos scripts Start-FigmaMcp.ps1, Test-McpHealth.ps1 e antigravity-backup/mcp_config.json -- citados por um handoff e nunca versionados
revisoes_de_ancora:
  - registro: auditoria-2026-08-31-integridade-e-integracao-antigravity
    caminhos:
      - tests/test_governanca_skills.py
    parecer: >-
      A guarda passa a exigir que a skill local esteja VERSIONADA. O modelo de resolucao descrito pelo registro ancorado nao muda -- local ou externa declarada --, e nenhuma das tres skills canonicas que ele mede sai da conta.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos:
      - data/skills_registry.json
      - tests/test_governanca_skills.py
    parecer: >-
      Duas entradas novas em `externas` e a exigencia de versionamento na varredura local. O achado A1 daquele handoff continua valido e passa a valer tambem fora da maquina onde o plugin instalou as skills.
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer: >-
      A grafia a partir da raiz entra no teste de artefato derivado e `congelada_em` marca medicao encerrada. Nenhum criterio, campo obrigatorio ou fase do portao sai; a taxonomia continua descrevendo os mesmos arquivos.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      A mudanca acrescenta a grafia a partir da raiz ao teste de artefato derivado. Nenhum criterio, campo ou fase do portao muda; as pendencias descritas seguem enderecadas ao mesmo arquivo.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos:
      - scripts/ops/record_gate.py
    parecer: >-
      A mudanca acrescenta a grafia a partir da raiz ao teste de artefato derivado. Nao toca concorrencia, isolamento nem o modo de leitura do stage.
  - registro: plano-2b-painel-de-estado
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer: >-
      A grafia a partir da raiz entra no teste de artefato derivado e `congelada_em` marca medicao encerrada. O painel continua lendo os mesmos criterios, com os mesmos nomes, e config congelada aparece como nao conferivel -- nunca como conferida.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos:
      - scripts/ops/record_gate.py
      - scripts/ops/record_index.py
    parecer: >-
      A grafia a partir da raiz entra no teste de artefato derivado e `congelada_em` marca medicao encerrada. A leitura do indice pelo portao, que e o que aquele registro fixa, permanece identica.
---

# REGISTRO: resolucao de skill e de referencia deixam de depender do ponto de partida

## 1. O achado comum

As duas unicas falhas que o `master` carregava tinham a mesma forma: a verificacao dava
resultados diferentes conforme a maquina onde rodava. Passavam no perfil do operador e
reprovavam em CI e em clone novo -- que e exatamente onde a afirmacao precisa valer.

## 2. Skills declaradas que nao resolviam

`@implementor` declara `supabase` e `supabase-postgres-best-practices`. Nenhuma resolvia como
skill local nem como externa, e a razao estava no proprio repositorio: o plugin
`supabase@claude-plugins-official` instala as duas em `.agents/skills/`, e o
`.agents/skills/.gitignore` exclui esses diretorios. Na maquina onde o plugin rodou, a
varredura de diretorio as encontrava e a guarda passava; em qualquer clone, elas nao existem.

Duas correcoes, e as duas fecham a mesma porta:

- as duas entram em `data/skills_registry.json -> externas`, com `origem` apontando o plugin e
  o arquivo que as ignora, e `status: nao-verificada` -- que e ate onde a evidencia vai a
  partir daqui;
- `_skills_locais()` passa a contar apenas diretorio VERSIONADO. Presenca em disco de conteudo
  que o repositorio nao rastreia nao e resolucao dele. E o mesmo criterio que
  `scripts/ops/record_gate.py` ja aplicava em `_e_derivado`.

Sem a segunda mudanca, a primeira quebraria a maquina do operador pelo lado oposto: o nome
resolveria como local E como externa, e `test_skill_local_e_externa_nao_disputam_o_mesmo_nome`
reprovaria la.

## 3. Referencias mortas

Dois documentos prescritivos citavam caminhos que nao aterrissavam, por motivos distintos:

- `reports/AUDITORIA-2026-08-31-integridade-e-integracao-antigravity.md` aponta
  `cwv/cwv_report_20260831_162019.md`. A citacao e relativa ao diretorio do documento, ou
  seja, `reports/cwv/` -- que o `.gitignore` cobre. O portao so testava a grafia literal
  contra a raiz, entao lia como morta uma referencia a artefato gerado. `referencias_mortas()`
  passa a testar tambem a grafia reescrita a partir da raiz. Nenhum documento precisou ser
  editado: o defeito estava no medidor, nao no texto.
- `reports/HANDOFF-2026-08-31-automacao-mcp-figma-prisma.md` cita `Start-FigmaMcp.ps1`,
  `Test-McpHealth.ps1` e `antigravity-backup/mcp_config.json`, que nunca foram versionados.
  Aqui nao ha nada a consertar no medidor: o documento declara os tres em
  `referencias_nao_resolviveis`, que e o campo que o proprio portao criou para isso -- o autor
  sabe que aquele endereco nao resolve neste repositorio.

## 4. A metade que faltava do "remeca ou marque"

Declarar a referencia no handoff esbarrou num efeito colateral do proprio portao: ele confere
`config_medida` de todo registro em stage contra a maquina de agora. Um registro de 2026-08-31,
medido em outra arvore e em outra branch, so passaria se eu reescrevesse os numeros dele para
casarem com esta maquina -- ou seja, o portao empurrava para falsificar uma medicao passada
para poder corrigir uma citacao.

A mensagem do portao ja oferecia duas saidas, "remeca ou marque", e so a primeira existia.
`config_medida.congelada_em` implementa a segunda: com ela, a config descreve uma medicao
encerrada e sai como NAO CONFERIVEL -- nunca como conferida. `conferir_config_medida` continua
reprovando exatamente a mesma config divergente quando o marcador nao esta la, e o teste novo
mede as duas direcoes.

## 5. Medicao

Suite completa nesta branch: **762 aprovados, 4 pulados, zero falhas**. No `master`, a mesma
suite fecha com duas falhas. `ruff check .` limpo.

Fora de alcance nesta maquina, e sem mudanca desde o registro anterior: o job de frontend do
CI depende de binarios Git LFS que nao materializam enquanto o orcamento de LFS do repositorio
estiver esgotado, e `ruff format --check .` so fica limpo com a PR de formatacao integrada.
