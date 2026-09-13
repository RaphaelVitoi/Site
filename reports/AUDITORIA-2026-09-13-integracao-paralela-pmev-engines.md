---
id: auditoria-2026-09-13-integracao-paralela-pmev-engines
tipo: auditoria
escopo: Site
ecossistema: nexus-sota
autoria_teorica_e_direcao: Raphael Vitoi
auditoria_paralela: Hermes
auditoria_de_integracao: Sol (Codex)
autor: 'Raphael Vitoi, com auditorias Hermes e Sol (Codex)'
criado_em: '2026-09-13T12:00:00-03:00'
classes: [interno, medido, comparativo, pmev, engines, handoff]
caminhos:
  - docs/research/pmev/ARQUITETURA_ESTRATEGICA_ARCABOUCO_PMEV.md
  - reports/REGISTRO-2026-09-13-curadoria-drive-poker-e-pmev.md
  - reports/AUDITORIA-2026-09-13-integracao-paralela-pmev-engines.md
  - docs/research/materials/icmteoriaadicionalpt1.txt
  - docs/research/materials/icmteoriaadicionalpt2.txt
  - docs/research/pmev/ENTENDENDO_ICM_HEURISTICAS_LEDGER.md
  - docs/research/pmev/AULA_1_2_EVIDENCE_LEDGER.md
  - .agents/skills/poker-pmev-knowledge-engine
baseline:
  branch: master
  python_venv: 3.14.6
  python_version_file: '3.14'
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  python_venv: 3.14.6
verificado:
  - Estado Git e ausencia de arquivos staged no corte da auditoria.
  - Versao do Python em .venv e declaracao de .python-version.
  - Estrutura local de core/autopoiesis_engine.py, engine/llm_api.py e engine/sota_triad_mesh.py.
  - Contratos das skills PMev e estado dos artefatos paralelos na IDE.
  - Markdownlint direcionado aos quatro documentos integrados com exit code 0.
nao_verificado:
  - Google Drive API, enumeracao multi-disco e arquivos privados declarados pelo registro de origem.
  - Execucao HRC, GTO Wizard, CFR, Exa, Stitch ou Jules.
  - Suite integral, pre-commit, commit e push por decisao explicita do Tier 0.
  - Bateria tests/test_record_index.py inconclusiva por duas invocacoes concorrentes e lock de pytest-current no Windows; nao classificada como regressao.
git:
  commit: null
  push: null
  decisao_tier_0: deixar alteracoes na IDE sem commit e sem push
---

# Auditoria integrada — curadoria PMev, composição teórica e engines

## Resolução

As duas auditorias foram integradas com uma decisão central: **adotar a
composição como arquitetura testável, sem aceitar garantias, percentuais ou
provas que o material ainda não mede**.

O trabalho técnico, a arquitetura teórica, os moldes e a direção de integração
são de Raphael Vitoi. A auditoria Hermes forneceu a hipótese composicional e a
leitura panorâmica; a auditoria Sol confrontou essas proposições com o checkout,
os contratos PMev e as fronteiras de evidência. Limpeza de lint e decisões de
design assistidas por Raphael permanecem atribuídas a ele; esta auditoria não
reescreve autoria pela identidade do executor.

## Matriz de convergência

| Frente | Sol | Hermes | Síntese incorporada |
| :--- | :--- | :--- | :--- |
| Corpus PMev | Rico, mas não elegível automaticamente para calibração | Fundação de seis camadas | Corpus alimenta hipóteses e cenários; absorvido díptico autoral (Entendendo o ICM + Aula 1.2) e manuscritos de EV Fold/RIO. |
| Arquitetura matemática | Gateway, unidades, `Measured<T>`, redução e ablação | Cadeia composicional | Pipeline de operadores observáveis com redução `PMev-0 = ICMev`. |
| Ruína | Estado terminal com utilidade explícita | Circuit breaker multiplicativo | Esperança total; zeragem só sob contrato de domínio provado. |
| Engine | Integrar Python/TS/WASM por contrato comum | DAG cognitivo | Orquestração separada dos kernels; paridade numérica obrigatória. |
| Métricas | Derivar de benchmark elegível | Targets percentuais aproximados | Targets Hermes não são baseline; medir OOS, calibração, regret, caudas e latência. |
| Evidência pós-flop | 7 pares locais, 0/7 plenamente reproduzíveis | 97 nós tratados como matriz | 97 pertencem ao corpus; promoção unitária por `EvidencePair`. |
| Runtime agentivo | Configuração não prova ativação | Triad descrita como operacional | Estados verificáveis e recibos; proibir sucesso sintético. |

## Achados técnicos confirmados

1. O ambiente local canônico é Python 3.14.6; a descrição Python 3.12 da
   auditoria paralela está desatualizada para este checkout.
2. `core/autopoiesis_engine.py` contém ações mutantes reais: sincronização de
   agentes, remoção de temporários e checkpoint WAL. Isso confirma capacidade
   implementada, não execução contínua nem resultado operacional atual.
3. `engine/llm_api.py` contém circuit breaker, backoff exponencial e rotação do
   ponto inicial de uso das chaves. Nenhuma chave foi lida, impressa ou copiada
   durante esta auditoria.
4. `engine/sota_triad_mesh.py` constrói especificações e um plano, mas
   `execute_triad_dag()` retorna sucesso, convergência `1.0` e `verified=True`
   sem despachar Exa, Stitch e Jules. É capacidade de planejamento apresentada
   como verificação e deve falhar fechado até receber recibos reais.
5. As autoridades de roteamento estão separadas por decisão, conforme
   `CLAUDE.md`: `data/system_config.json`, `llm/routing_policy.py` e
   `llm/model_registry.py`; `data/routing_map.json` é somente fallback.
6. A contagem Hermes de 50 memoizações não foi reproduzida. A busca atual mede
   241 referências de tokens em 54 arquivos TS/TSX; nenhuma dessas contagens
   substitui profiling por componente.

## Dívidas do lote paralelo incorporadas ao plano

| Prioridade | Dívida | Critério de fechamento |
| :--- | :--- | :--- |
| P0 | Sucesso sintético da Triad Mesh | Nenhum `SUCCESS`, `verified` ou taxa de convergência sem recibo e validação de cada fase. |
| P0 | Confusão entre 97 figuras/nós e evidência reproduzível | Inventário e fixture usam unidades diferentes e cada par declara build, e-Nash, unidade e fonte. |
| P1 | Skill de conhecimento promete formatos/cache além do implementado | Manifesto coincide com adaptadores reais; falhas retornam exit code não zero; cache é content-addressed de fato. |
| P1 | Escrita de saída arbitrária e extração silenciosa | Raízes permitidas, normalização de caminho, política de privacidade e erro explícito. |
| P1 | Hipóteses H1–H12 duplicadas em prosa | Registro estruturado único consumido por documentação e gateway experimental. |
| P2 | Memoização sem evidência de profiling | Medição antes/depois somente nos componentes modificados. |

## Plano padrão-ouro de continuidade

1. **Fechar contratos antes de coeficientes.** Criar o registro estruturado de
   hipóteses, `ScenarioContract`, enumeração de unidades e envelope de
   proveniência.
2. **Fixar os baselines.** Preservar ChipEV, ICMev e FGS como implementações
   independentes; provar a identidade de redução da PMev-0.
3. **Materializar estados terminais.** Eliminação, payout assegurado, rebuy e
   horizonte recebem semântica explícita; proibir dupla contagem de ruína.
4. **Compor uma camada por vez.** Cada operador entra atrás do gateway com teste
   de redução, ablação e propagação de incerteza.
5. **Promover evidência por unidade.** Converter corpus em cenários; converter
   cenário em `EvidencePair` apenas com solver/build/e-Nash/unidade.
6. **Unificar runtimes.** Python é referência semântica; TypeScript espelha o
   schema; WASM recebe somente kernels perfilados. Comparar tolerância numérica
   no mesmo fixture.
7. **Medir antes de nomear target.** Relatar loss OOS, Brier/log-loss, regret,
   erro de paridade, p50/p95/p99 e memória. Só então propor faixas de aceite.
8. **Expor limites na interface.** Mostrar versão, baseline, unidade, fonte,
   incerteza e estado `UNREADABLE/UNVERIFIED`; nunca rotular a engine como
   “oráculo”.

## Verificações e limites desta integração

- Verificado por leitura local: estado Git, versão do Python, contratos de
  governança, implementação dos três módulos agentivos citados e estrutura dos
  artefatos PMev.
- Não executado: Google Drive API, enumeração multi-disco, HRC/GTO Wizard,
  solvers CFR, Triad externa, suíte integral, pre-commit, commit e push.
- Verificação aprovada: `markdownlint` direcionado aos quatro documentos, exit
  code 0.
- Verificação inconclusiva: `tests/test_record_index.py`; duas invocações
  concorrentes disputaram `pytest-current` e a segunda terminou com
  `PermissionError [WinError 5]`. O resultado não certifica nem reprova o
  conteúdo.
- Motivo de não publicação: decisão explícita do Tier 0 para deixar o lote na
  IDE.
- Estado de calibração: **dados insuficientes — nenhuma calibração planejada**.

## Continuidade imediata

O próximo ciclo deve começar por P0, sem expandir escopo: corrigir o contrato de
status da Triad Mesh e criar o registro estruturado de hipóteses/cenários. A
skill de conhecimento é endurecida em seguida, antes de qualquer ingestão de
arquivos privados ou solves pesados. Nenhuma integração numérica deve preceder
esses contratos.

O protocolo operacional de retomada está materializado em
`reports/HANDOFF-2026-09-13-integracao-paralela-pmev-engines.md`.
