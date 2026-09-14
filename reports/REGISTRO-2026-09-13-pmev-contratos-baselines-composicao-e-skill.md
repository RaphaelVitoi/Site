---
id: registro-2026-09-13-pmev-contratos-baselines-composicao-e-skill
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T22:43:42-03:00'
atualizado_em: '2026-09-13T22:43:42-03:00'
classes: [interno, medido, pmev, engines, skill, governanca]
session_id: 186abdd7-d9aa-481f-bbe0-143b0d27bcff
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  congelada_em: '2026-09-13'
caminhos:
  - engine/pmev_postflop_matrix.py
  - engine/pmev_scenario.py
  - engine/pmev_hypotheses.py
  - engine/pmev_aula12_evidence.py
  - engine/pmev_baselines.py
  - engine/pmev_composition.py
  - engine/pmev_operators.py
  - engine/pmev_pipeline.py
  - engine/sota_triad_mesh.py
  - data/aula12_pairs.json
  - data/pmev_hypotheses.json
  - data/pmev_additive_baseline_snapshot.json
  - data/engine_parity_scenarios.json
  - .agents/skills/poker-pmev-knowledge-engine/SKILL.md
verificado:
  - pmev_postflop_matrix trazia frequencias 0.482, 0.285, 0.141, 0.072 e 0.020, solver HRC-Pro-2.14-Build-97, seed, 50000 iteracoes e e-Nash 0.08 que nao existem em fonte alguma; 7 de 9 payouts divergiam do ledger
  - a matriz deriva o par 2 da Aula 1.2 do espelho do fixture curado; drift de sizing 2.74 para 1.35 bb na media ponderada e 2.8 para 1.13 bb no ramo dominante
  - Triad Mesh devolvia SUCCESS, convergencia 1.0 e verified=True sem executar nada; o status vem de recibos, e o CLI imprime NAO VERIFICADO sem eles
  - registro unico H1 a H12 em data/pmev_hypotheses.json gera a tabela da secao 3; 11 hipoteses sem evidencia, H8 transcrita e nao reproduzivel
  - ScenarioContract espelha evidenceContract.ts; os 7 pares da Aula 1.2 carregam do espelho JSON do fixture, 0 de 7 reproduziveis como no TypeScript
  - PMev-0 = ICMev so passava por ablacao; com f1 a f5 ligados, f3 desviava de 5.06 a 21.72 T$; com dirichlet_alpha 0 e aversao 1 a cadeia completa reduz ao ICM abaixo de 1e-9
  - baselines declarados -- ChipEV com implementacao independente, ICMev, FGS nao implementado, heuristica aditiva v7 congelada em snapshot versionado
  - rho(J_global) dependia da unidade das stacks, 3.32 em bb e 0.033 com x100, e e maior ou igual a 1 por construcao nas camadas que conservam o pool; o criterio passa a ser o raio de redistribuicao, 0.45 no default
  - o Jacobiano regularizado de f3 subestimava o erro padrao em cerca de 4% contra Monte Carlo; f5 propaga com a derivada real, diferenca de 0.7%
  - f4 sobre equidade incondicional contava a ruina duas vezes, 86.27 contra 106.23 T$ exatos; o pipeline recusa ruina positiva sem ramos materializados
  - o payout terminal por indice elevava o heroi de 127.01 para 160.11 T$ com ruina 0.3; passa a ser o do n-esimo lugar
  - a proveniencia fixa de e-Nash 0.001 e 1 iteracao saiu da cadeia deterministica
  - o corpus Python e TypeScript ganha icm_malmuth_harville com 5 casos e aula12_reproducibility com 7, tolerancia 1e-9, preservando o texto original do corpus
  - kernel ICM exato em TypeScript com p50 de 0.57 ms para 9 jogadores e 1.23 ms para 10; nenhum kernel movido a WASM
  - skill de conhecimento com manifesto igual aos extratores, exit codes 0 a 7, cache SHA-256, raizes de escrita e defusedxml no PPTX; build real com 21 documentos e 15 ancoras, rebuild com os 21 do cache
  - provas negativas com digito do espelho JSON, ICM do corpus e snapshot aditivo alterados reprovaram e foram restaurados com hash identico
  - secao 4.1 do documento de arquitetura corrigida com os valores medidos; markdownlint sem achados
  - testes dirigidos verdes -- 129 pytest de PMev e engines, 26 da skill e governanca, jest de paridade, espelho e evidencia; ruff e pyright sem achados
nao_verificado:
  - suite integral nesta arvore; roda no pre-push
  - CI remoto
  - chamada real ao Google Drive
  - reproducao de qualquer par da Aula 1.2; build e e-Nash seguem fora do recorte das capturas
  - item 9 do handoff, benchmark, bloqueado por dados insuficientes
  - o inventario de discos pessoais segue no historico publico desde c1905461, sem reescrita
---

# PMev — contratos, baselines e composição medidos, e a skill de conhecimento

Itens 1 a 8 da ordem vinculante do
`handoff-2026-09-13-integracao-paralela-pmev-engines`, em um commit, por decisão do
Tier 0. O item 9 depende de amostra que não existe.

## O que foi desmentido pela medição

| Alegação anterior | Medido |
| :--- | :--- |
| Harness pós-flop da Aula 1.2 com proveniência | frequências, build, seed e e-Nash sem fonte |
| Triad Mesh verificada | nenhum pilar executado |
| PMev-0 = ICMev comprovado | só com operadores desligados |
| ρ(J_global) ≤ 1 comprovado | critério dependente de unidade |
| Barreira absorvente sem dupla contagem | dupla contagem de ~20 T$ |

## Correção de atribuição

Os commits `24cb4532`, `46ff9da5`, `109ed26d` e `1a5dd0dd` aparecem assinados
`Codex GPT-5`. Os próprios registros declaram `gemini@3.8-flash` no primeiro e sessões
Antigravity nos outros três. Pelo Tier 0, a assinatura é resíduo de um bug já corrigido.
O histórico não é reescrito; esta linha fica como a atribuição correta.

## Privacidade

`update_multidrive_index.py` versionava o inventário dos discos pessoais num
repositório público. O script saiu da árvore; as 15 âncoras estão em
`.agents/skills/poker-pmev-knowledge-engine/local/anchors.json`, ignorado pelo git. O
conteúdo segue no histórico remoto desde `c1905461`, e reescrevê-lo é decisão do Tier 0.

## O que isto não autoriza

Nenhum par da Aula 1.2 é reproduzível, nenhuma hipótese tem evidência reproduzível e o
estado de calibração continua **dados insuficientes — nenhuma calibração planejada**.
