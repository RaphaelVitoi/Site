---
id: auditoria-2026-08-31-integridade-e-integracao-antigravity
tipo: relatorio
escopo: Site e integracao local Antigravity
ecossistema: nexus-sota
autor: codex@gpt-5
criado_em: 2026-08-31T13:40-03:00
atualizado_em: 2026-09-01T00:19:42-03:00
commit_inicio_auditoria: d6b425c429e125c45471b40cd19af492b23ab7f4
commit_registro: d6b425c429e125c45471b40cd19af492b23ab7f4
classes: [interno, medido, comparativo, handoff]
caminhos:
  - reports/HANDOFF-2026-08-29-auditoria-integridade-repositorio.md
  - .agents/skills.json
  - .agents/skills/pmev-game-theory-engine/SKILL.md
  - .agents/skills/sota-quality-gate/SKILL.md
  - .agents/skills/sota-triad-mesh/SKILL.md
  - tests/test_governanca_skills.py
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/runtime_quality_probe.mjs
  - frontend/src/content/editorialRegistry.ts
  - frontend/src/tests/content/editorial-registry.test.ts
  - frontend/src/tests/content/editorial-theory-boundaries.test.ts
  - frontend/src/tests/simulator/risk-advantage-direction.test.ts
  - tests/test_quality_gate_contract.py
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/(public)/aulas/leitura-icm/page.tsx
  - frontend/src/app/(public)/biblioteca/heuristica-icm-pos-flop-aula/page.tsx
  - frontend/src/app/(public)/biblioteca/nos-de-calibragem/page.tsx
  - frontend/src/app/(public)/biblioteca/estruturas-de-torneio/page.tsx
  - frontend/src/components/simulator/PmevRangeViewer.tsx
  - frontend/src/components/simulator/ReferencialAula12.tsx
  - frontend/src/components/simulator/solver/scenarios.ts
  - frontend/src/components/simulator/solver/types.ts
  - frontend/src/components/simulator/solver/utils.ts
  - frontend/src/components/simulator/ui/BubbleFactorDiagnostic.tsx
  - frontend/src/components/simulator/ui/StreetCard.tsx
  - frontend/public/captions/raphaelvitoi.pt-BR.vtt
  - tests/test_accessible_landmarks.py
  - tests/test_cwv_gate_truthfulness.py
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [CLAUDE.md, scripts/ops/record_gate.py]
    parecer: A taxonomia foi reavaliada contra a governanca atual; permanece vigente e a alteracao de CLAUDE.md nao alterou sua classificacao canonica.
  - registro: auditoria-2026-08-31-protocolos-handoff-git-clippy-e-relatorios
    caminhos: [scripts/cli/nexus.py]
    parecer: O registro e evidencia datada; a ancora foi reavaliada no baseline atual sem transferir sua medicao historica para o novo hash.
  - registro: checkpoint-2026-06-14-infrastructure-hardening
    caminhos: [CLAUDE.md]
    parecer: O checkpoint permanece evidencia datada; a governanca atual foi reavaliada sem reclassificar seu resultado historico.
  - registro: frente-3-2026-08-29-guard-tri-camada
    caminhos: [scripts/cli/nexus.py]
    parecer: A ancora foi reavaliada no baseline atual; o parecer historico permanece delimitado pelo hash e pela janela original.
  - registro: handoff-2026-08-29-auditoria-integridade-repositorio
    caminhos: [scripts/ops/cwv_gate.ps1, scripts/ops/cwv_gate.py]
    parecer: O handoff continua evidencia de origem; os gates foram reavaliados no baseline atual sem transferir certificacao entre hashes.
  - registro: handoff-2026-08-29-diagnostico-de-memoria
    caminhos: [scripts/cli/nexus.py]
    parecer: O handoff permanece datado; a ancora foi reavaliada no baseline atual e nao teve seu diagnostico historico reescrito.
  - registro: handoff-2026-08-29-governanca-8tiers-vulnerabilidades-subagents
    caminhos: [CLAUDE.md, frontend/package.json, package.json]
    parecer: A governanca e os manifests foram reavaliados no baseline atual; o handoff preserva seus limites e evidencias temporais.
  - registro: handoff-2026-08-29-guard-corrigido-e-heranca
    caminhos: [scripts/cli/nexus.py]
    parecer: A ancora foi reavaliada no baseline atual; o registro original continua evidencia historica e nao foi substituido.
  - registro: handoff-2026-08-29-roteamento-memoria-e-guard
    caminhos: [scripts/cli/nexus.py]
    parecer: O roteamento foi reavaliado no baseline atual; este parecer nao converte a conclusao datada em certificacao do novo hash.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: [CLAUDE.md, package.json, tests/test_governanca_skills.py]
    parecer: A governanca, o manifesto e o teste foram reavaliados no baseline atual; as observacoes do handoff permanecem temporalmente delimitadas.
  - registro: handoff-2026-08-30-resolucao-coderabbit-linters-e-malha-sota
    caminhos: [.vscode/settings.json]
    parecer: A configuracao local foi reavaliada no baseline atual; o registro historico nao foi reescrito nem marcado como obsoleto.
  - registro: registro-2026-08-29-governanca-piramidal-sota
    caminhos: [CLAUDE.md]
    parecer: A governanca foi reavaliada no baseline atual; o registro permanece fonte historica de decisao e contexto.
  - registro: registro-2026-08-29-sota-triad-mesh-integracao
    caminhos: [.agents/skills/sota-triad-mesh/SKILL.md, scripts/cli/nexus.py]
    parecer: A skill e o integrador foram reavaliados no baseline atual; este ato preserva o registro de integracao sem transferir seu selo temporal.
  - registro: relatorio-2026-06-16-auditoria-e-harmonizacao-v8-gold
    caminhos: [CLAUDE.md]
    parecer: O relatorio permanece evidencia datada; a ancora atual foi reavaliada sem invalidar nem modernizar retroativamente sua medicao.
  - registro: relatorio-2026-08-29-analise-integral-ecossistema-sota-v8-gold
    caminhos: [CLAUDE.md, frontend/package.json, package.json]
    parecer: As ancoras foram reavaliadas no baseline atual; o relatorio continua historico e seus resultados nao sao transferidos ao novo hash.
  - registro: relatorio-2026-08-29-impacto-quantitativo-qualitativo-sota-v8-gold
    caminhos: [CLAUDE.md, frontend/package.json, package.json]
    parecer: As ancoras foram reavaliadas no baseline atual; as metricas historicas permanecem ligadas a sua propria janela de observacao.
  - registro: relatorio-handoff-20260830-teoria-dos-jogos-pmev-sota-v8-gold
    caminhos: [.vscode/settings.json]
    parecer: A configuracao foi reavaliada no baseline atual; o handoff teorico preserva seu papel historico e nao recebe certificacao retroativa.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos: [scripts/ops/record_gate.py]
    parecer: O gate foi reavaliado no baseline atual; o handoff preserva as pendencias historicas e nao recebe conclusoes retroativas.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos: [scripts/ops/record_gate.py]
    parecer: A ancora do gate foi reavaliada no baseline atual; o interludio continua evidencia historica de concorrencia e isolamento.
  - registro: plano-2b-painel-de-estado
    caminhos: [scripts/ops/record_gate.py]
    parecer: O mecanismo de registro foi reavaliado no baseline atual; o plano continua documento de planejamento, nao selo de execucao presente.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos: [scripts/ops/record_gate.py]
    parecer: O portao foi reavaliado no baseline atual; o registro conserva sua evidencia datada e seus limites de hash.
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  distancia_da_origem: 0 commits a frente, 0 atras
  arvore: modificada, sem arquivos em stage
  suite_python: 725 passed em 139.69 s, execucao isolada com basetemp exclusivo
  suite_frontend: 96 passed em 18 suites
  suite_python_apos_curadoria: 726 passed em 186.04 s, via portao oficial completo
  suite_frontend_apos_curadoria: 106 passed em 22 suites, via portao oficial completo
  suite_python_curadoria_rp: 726 passed em 171.05 s, via portao oficial completo
  suite_frontend_curadoria_rp: 111 passed em 23 suites, via portao oficial completo
  suite_python_pre_release: 729 passed em 160.14 s, via npm run sota:full
  suite_frontend_pre_release: 111 passed em 23 suites, via npm run sota:full
  skills_workspace: 3 de 3 selecionadas por ponte versionada
  quality_gate: CDP real e axe-core, zero violacoes confirmadas, veredito fragil por duas lacunas declaradas
  quality_gate_pre_release: LCP 812 ms, CLS 0, TTFB 339.2 ms, heap 106.8 MB; 0 CVEs, SRI verificado e 2 warnings causalmente descritos
verificado:
  - git diff --check retornou 0
  - git fsck --no-reflogs --full retornou 0
  - pyright retornou 0 erros, 0 warnings e 0 informacoes
  - ESLint, TypeScript, npm audit e frontend tests retornaram aprovados
  - pytest retornou 725 passed em 139.69 s numa unica execucao isolada e controlada
  - frontend Jest retornou 96 passed em 18 suites
  - o probe CDP real em 9223 e o axe-core retornaram 0 violacoes confirmadas; uma regra de contraste permaneceu em revisao humana
  - os tres manifests locais passaram no validador de skills
  - teste de governanca das skills retornou 10 passed
  - guard local do Antigravity reconheceu 3 de 3 skills selecionadas e executou nexus --help
  - portao completo posterior a curadoria de RP retornou Ruff, Pyright, ESLint e TypeScript aprovados; Jest 111 passed em 23 suites; Pytest 726 passed em 171.05 s
  - npm run sota:full pre-release retornou Ruff, Pyright, ESLint e TypeScript aprovados; Jest 111 passed em 23 suites; Pytest 729 passed em 160.14 s
  - npm run sota:audit pre-release conectou ao Chrome Dev por CDP 9223, mediu LCP 812 ms, CLS 0, TTFB 339.2 ms e heap 106.8 MB; 0 CVEs, SRI verificado e duas lacunas explicitamente descritas
nao_verificado:
  - o carregamento das skills pelo runtime grafico do Antigravity nao foi observado nesta sessao
  - CWV de navegacao real, INP, CLS, TBT e heap de browser nao foram medidos por instrumentacao de navegador
  - WCAG em DOM interativo, teclado, leitor de tela e fluxos autenticados nao foi executado
  - nenhuma chamada real a provedor de LLM foi feita
  - nenhum clone limpo com download LFS foi realizado
  - o scan verificado do plugin Claude Security nao rodou pois o workflow exigido nao esta exposto nesta sessao
supersede: null
---

# Auditoria comparativa — integridade do Site e integração Antigravity

## Veredicto

**A base está verde no portão de código, mas não está certificada para
publicação.** A origem permanece sincronizada, as suítes Python e frontend passam
integralmente e a camada de skills possui uma ponte versionada, restrita e
testada. A ressalva de publicação permanece porque a árvore de trabalho contém
alterações de múltiplas superfícies, as métricas de navegação real e a
acessibilidade completa não foram instrumentadas e fontes PMev ainda precisam de
evidência externa/reprodução antes de serem tratadas como conteúdo publicado.

As falhas de Ruff e de lint descritas na medição histórica foram corrigidas em
etapas posteriores deste mesmo relatório: o portão oficial mais recente está
aprovado. A qualificação `FRÁGIL` do CWV/A11y continua válida enquanto suas
lacunas de instrumentação não forem resolvidas; ela não é mascarada pelo verde da
suíte de código.

O baseline preservado é
[`HANDOFF-2026-08-29-auditoria-integridade-repositorio.md`](HANDOFF-2026-08-29-auditoria-integridade-repositorio.md).
Esta auditoria não reescreve seu registro; compara fatos medidos em janelas
distintas, sem transferir certificação entre hashes. A lista
`revisoes_de_ancora` no frontmatter reconcilia explicitamente cada âncora
histórica atingida com o baseline atual; não torna o documento anterior
obsoleto, nem converte sua medição datada em certificação deste release.

## Matriz comparativa

| Superfície | 2026-08-29 | 2026-08-31 | Leitura técnica |
| :-- | :-- | :-- | :-- |
| Âncora Git | `8979a20`, 53 commits locais adiante | `d6b425c4`, `master = origin/master` | **Melhorou.** A divergência remota foi eliminada. |
| Árvore de trabalho | Mudava durante a auditoria | 10 alterações não commitadas, zero em stage | **Mais observável, não liberada.** Há um corte estável de `HEAD`, mas não de release. |
| Integridade Git | `git fsck` 0 | `git fsck` 0; 231 objetos dangling | **Íntegra.** Objetos dangling preservam recuperação local; não são corrupção e não foram limpos. |
| Formatação de diff | 1.183 ocorrências em 11 arquivos | `git diff --check` 0 | **Melhorou.** Não infere que dívida histórica inexistente foi reescrita. |
| Gate integrado | Falhava em Ruff N818 | Falha em Ruff E741, `scripts/cli/nexus.py:2237` | **Ainda bloqueado.** A causa mudou; não há aprovação por substituição de erro. |
| Python | 609 passed, 22 skipped, 96,94 s | 720 passed, 0 skipped, 129,99 s | **Melhorou.** Há 111 testes adicionais e o bloqueio POSIX não reapareceu nesta execução; números de suites diferentes não provam aumento linear de cobertura. |
| Frontend | 95 passed, 18 suites | 95 passed, 18 suites | **Estável e verde.** ESLint e TypeScript também passaram. |
| Dependências JS | `npm audit`: 0 | `npm audit`: 0 | **Estável e verde.** |
| Dependências Python | 4 advisories em `chromadb 1.5.9` | mesmos 4 advisories; cache do `pip-audit` sem permissão de leitura | **Risco contido, não corrigido upstream.** O uso permanece `PersistentClient`; não migrar para servidor sem reavaliação. |
| Workflow CI | actionlint verde | 2 erros em `inputs.additional_context` de workflow sem input declarado | **Regressão.** Workflow não pode ser dado como lintado. |
| CWV/A11y | FRÁGIL, referências literais | gate declara 5 fases medidas e aprovado | **Regressão de verdade.** A implementação mede TTFB de rede e inspeções estáticas, mas estima/fixa os demais CWV. |
| Skills do projeto | nomes resolvidos por registro, sem ponte de descoberta Antigravity | 3/3 skills versionadas e selecionadas por `.agents/skills.json` | **Melhorou materialmente.** Uma única fonte, descoberta relativa e allowlist explícita. |
| Guard Antigravity | 0/0 apresentado como 100% | conta raízes separadas, marca raiz vazia como aviso e valida `nexus --help` | **Melhorou materialmente.** Configuração não é mais confundida com runtime. |

## Integração e curadoria das skills

### Fonte única e descoberta

`Site/.agents/skills.json` aponta para `.agents/skills` com allowlist de:

- `pmev-game-theory-engine`;
- `sota-quality-gate`;
- `sota-triad-mesh`.

O allowlist é necessário: havia duas skills instaladas localmente e ignoradas
pelo Git sob a mesma árvore. Elas não foram apagadas nem incorporadas sem
revisão. A ponte evita que artefatos de extensão se tornem capacidade versionada
do projeto por acidente.

### Refinamentos aplicados

| Skill | Correção |
| :-- | :-- |
| `pmev-game-theory-engine` | Separa formalismo e hipóteses autorais de validação externa; exige entradas, unidades, aproximações e limites explícitos. |
| `sota-quality-gate` | Remove contagem fixa de testes e proíbe interpretar referência estática como medição runtime. |
| `sota-triad-mesh` | Move metadados para schema válido, condiciona ferramentas à disponibilidade real e remove promessa de aplicar diff, commit ou push automático. |

Os três manifests passaram no `quick_validate.py`; o teste de governança passou
com 10 testes. O guard local do Antigravity compilou, executou e reconheceu
**3/3** manifests selecionados. Isso prova configuração e estrutura, não prova
que uma interface gráfica tenha carregado a skill nesta sessão.

## Achados abertos

1. **ALTO — falso-verde no gate de CWV/A11y.**
   Em `scripts/ops/cwv_gate.ps1`, o TTFB é temporizado por HTTP, porém LCP é
   derivado do TTFB, CLS/INP/TBT partem de literais e heap deriva do bundle. A
   análise de acessibilidade percorre artefatos `.next`; ela não substitui DOM,
   teclado, leitor de tela ou `axe` em navegador. O relatório gerado pelo gate
   não deve chamar isso de CWV medido ou WCAG aprovado até integrar
   instrumentação real, por exemplo Playwright/CDP com coleta explícita e axe.

2. **ALTO — gate integrado de qualidade reprovado.**
   `npm run sota:full` para no Ruff E741: nome de variável `l` em uma list
   comprehension de `scripts/cli/nexus.py:2237`. Não foi silenciado nem
   alterado nesta auditoria de integração.

3. **MÉDIO — workflow inválido no actionlint.**
   `skills/gemini-cli-security/.github/workflows/gemini-review.yml` referencia
   `inputs.additional_context` em duas etapas, mas o evento declarado não
   define esse input. Corrigir o contrato do workflow ou remover a referência;
   não desabilitar o linter.

4. **MÉDIO — ChromaDB sem patch disponível.**
   `pip-audit` continua encontrando `PYSEC-2026-311`, `CVE-2026-45830`,
   `CVE-2026-45831` e `CVE-2026-45833` em `chromadb 1.5.9`. A mitigação local
   observada é uso embarcado por `PersistentClient`, sem processo Chroma; não é
   uma correção da dependência.

5. **BAIXO — objetos Git dangling.**
   `git fsck` listou 43 commits, 53 trees e 135 blobs dangling. Eles são
   alcançáveis por recuperação local, não indicam corrupção. Qualquer `gc` ou
   poda seria ação destrutiva e depende de autorização específica.

6. **INFORMATIVO — configuração global vazia.**
   `~/.gemini/config/skills` existe e está vazia. O guard agora a exibe como
   aviso, sem concluir falsamente que zero skills é excelência. A integração do
   `Site` não depende de popular essa pasta nem copia manifests para ela.

## Verificações executadas

| Verificação | Resultado |
| :-- | :-- |
| `npm run sota:full` | **FAIL** — Ruff E741 antes das demais fases. |
| `npm run python:typecheck` | PASS — 0 erros, 0 warnings, 0 informações. |
| `npm run python:test` | PASS — 720 passed em 129,99 s. |
| `npm test` | PASS — 95 testes, 18 suítes. |
| `npm run lint` / `npm run typecheck` | PASS. |
| `npm run lint:workflows` | **FAIL** — 2 erros de schema no workflow Gemini. |
| `npm audit --audit-level=low` | PASS — 0 vulnerabilidades. |
| `pip-audit -r requirements.txt` | ATENÇÃO — 4 advisories ChromaDB; aviso de cache sem permissão. |
| `git diff --check` | PASS. |
| `git fsck --no-reflogs --full` | PASS — 0; objetos dangling preservados. |
| `cwv_gate.ps1` | Exit 0, mas **não certifica CWV/A11y reais** pelas fontes inspecionadas. |
| `quick_validate.py` nas 3 skills | PASS. |
| `pytest tests/test_governanca_skills.py -q` | PASS — 10 passed. |
| `antigravity_sota_guard.py --workspace Site` | PASS estrutural — 3/3 na ponte; runtime gráfico não observado. |

## Handoff seguro

1. Corrigir E741 e os dois erros de actionlint em mudanças pequenas, cada uma
   com teste/gate próprio.
2. Substituir o falso-verde de CWV/A11y por coleta real ou restaurar o estado
   `NÃO MEDIDO` até haver instrumentação verificável.
3. Reexecutar a bateria integral em um hash congelado; somente então avaliar
   commit e push.
4. Manter ChromaDB, LFS e objetos dangling como riscos/documentação visíveis;
   não podar, migrar nem reescrever histórico por conveniência.

Nenhum commit, push, rebase, limpeza, rotação remota de credencial, remoção de
extensão ou reescrita de histórico foi realizado nesta etapa.

## Adendo de remediação aprovada — 2026-08-31

As recomendações deste relatório foram autorizadas e aplicadas sem ampliar o
escopo de publicação:

| Achado | Estado após correção | Evidência |
| :-- | :-- | :-- |
| Ruff E741 | **Resolvido.** `l` foi renomeado para `line`; nenhum comportamento foi alterado. | `npm run python:lint` aprovou. |
| Schema Actionlint | **Resolvido.** As duas referências a `inputs.additional_context` foram removidas porque o workflow não declara essa entrada. | `npm run lint:workflows` aprovou. |
| Falso-verde CWV/A11y | **Resolvido como falha de verdade.** Literais, estimativas de bundle e varreduras de `.next` não certificam mais métricas runtime. | Teste sem CDP retorna `NAO MEDIDO`, `FRAGIL (AMARELO)` e nunca `APPROVED`. |
| Caminho Python legado | **Aposentado.** `cwv_gate.py` retorna erro explícito em vez de certificar valores sintéticos. | Regressão automatizada dedicada. |
| Medição real | **Implementada, ainda não concluída nesta máquina.** O helper conecta ao CDP canônico, usa uma aba temporária e axe-core; ausências permanecem nulas. | CDP 9223 respondeu; `localhost:3000` recusou conexão, portanto não houve dado de página a alegar. |

O helper não inicia navegador paralelo, não fecha o Chrome e não mede a partir de
constantes. Ele precisa de uma aplicação local acessível para coletar o DOM,
LCP/CLS/TTFB/heap e axe. INP e TBT continuam `NAO MEDIDO` quando não houver
interação ou long task observável — comportamento deliberado, não uma falha
silenciada.

**Portão atual:** estruturalmente mais seguro e verificável; permanece
**FRÁGIL**, não verde, enquanto não houver uma navegação local instrumentada.
O resultado da bateria integral após as correções foi **aprovado**:
`npm run sota:full` concluiu com Ruff, Pyright, ESLint e TypeScript verdes e
**723 testes aprovados em 153,04 s**. Essa bateria não mede o browser nem
substitui uma navegação local instrumentada.

## Adendo runtime — servidores locais levantados

Em seguida, os serviços canônicos foram levantados sem alterar a topologia de
rede: Next.js em `127.0.0.1:3000` e API aiohttp em `127.0.0.1:17042`.

| Superfície | Evidência | Estado |
| :-- | :-- | :-- |
| Frontend | `GET /` retornou `200` | Ativo |
| API | `GET /health` retornou `401` sem credencial | Ativa e fail-closed |
| Chrome Dev CDP | `Browser.getVersion` respondeu em `9223` | Ativo |
| Probe | A conexão Playwright/CDP estagnava após o WebSocket; CDP nativo foi usado com sucesso | Corrigido |

O probe runtime passou a usar CDP nativo e `axe-core` injetado apenas em uma
aba temporária, que é fechada ao fim. Não fecha o Chrome, não abre listener e
não acessa destino fora de loopback.

A primeira execução real **não foi bloqueada por indisponibilidade**: ela
produziu medição e achados observáveis. Amostra no servidor de desenvolvimento:
LCP `396 ms`, CLS `0`, TTFB `94,6 ms`, heap `100,0 MB`; INP permaneceu não
medido por não haver interação humana. O acumulado de long tasks foi `604 ms`;
ele requer classificação separada de TBT de laboratório antes de tornar-se um
limiar de release. O axe detectou três categorias a corrigir: contraste
insuficiente (21 nós), ordem de headings (2 nós), landmark duplicado (1 nó);
e apontou revisão manual para contraste e legenda de vídeo.

## Adendo de validação runtime e acessibilidade — 2026-08-31 16:17 BRT

O servidor local permaneceu acessível em `http://127.0.0.1:3000`; o probe foi
executado contra o Chrome Dev canônico em `127.0.0.1:9223`, sempre numa aba
temporária descartada ao término. Não houve navegador paralelo, alteração de
perfil, listener adicional, coleta fora de loopback ou interação com sessão do
administrador.

### Correções verificadas no DOM real

| Achado inicial | Correção aplicada | Resultado no `axe-core` real |
| :-- | :-- | :-- |
| Contraste insuficiente em 21 nós | Tokens de texto claro foram escurecidos onde o fundo é determinístico; opacidades herdadas que rebaixavam contraste foram removidas/ajustadas. | **0 violações confirmadas.** |
| Ordem de headings | Os títulos dos pilares foram promovidos de `h4` para `h3`, coerentes com a hierarquia da página. | **Resolvido.** |
| Landmarks `nav` indistinguíveis | Cada navegação recebeu um `aria-label` próprio por função. | **Resolvido.** |
| Vídeo sem alternativa de legenda | Foi incluído `track` WebVTT em português, descrevendo corretamente o vídeo com áudio desativado na página. | A revisão de legenda deixou de ser retornada. |

### Medição final — evidência observada, não estimada

```text
LCP                 436 ms
CLS                 0
TTFB                134,2 ms
Heap JS             89,6 MB
Event latency       336 ms observados; não equivale a INP humano controlado
Long tasks          729 ms observados; não equivale a TBT laboratorial
axe violations      0
axe incomplete      1 regra / 20 nós
```

A regra `color-contrast` remanescente em `incomplete` não é uma violação
confirmada. Ela não consegue calcular o fundo de elementos sobre SVG, imagens,
sobreposição e gradientes. Os 20 alvos ficam preservados no resultado do probe
para revisão visual humana; não foram removidos, silenciados ou convertidos em
aprovação automática.

### Portão e baterias no hash de trabalho atual

| Verificação | Resultado |
| :-- | :-- |
| `uv run --no-sync pytest tests/ --basetemp <diretório exclusivo>` | **PASS — 725 passed em 139,69 s.** |
| Jest frontend | **PASS — 96 testes, 18 suítes.** |
| ESLint e TypeScript | **PASS.** |
| `npm audit --audit-level=low` | **PASS — 0 vulnerabilidades.** |
| `git diff --check` | **PASS — 0.** |
| `cwv_gate.ps1 -TargetUrl http://127.0.0.1:3000` | **Exit 0, 0 erros, 2 avisos, FRÁGIL (AMARELO).** |

Uma tentativa anterior de executar duas suítes Python em paralelo produziu
`671 passed, 54 errors` por corrida no diretório global
`pytest-of-rapha`; ela foi descartada como evidência. A reexecução acima isolou
o `basetemp`, não exibiu esse erro e é o resultado válido deste adendo.

**Veredicto atualizado.** Não há falha confirmada no DOM da landing page nem
vulnerabilidade npm conhecida. O portão não declara release verde: falta uma
medição de INP com interação humana controlada, uma trace laboratorial para
TBT e a revisão visual dos fundos dinâmicos que o axe não consegue inferir.
Nenhum commit, push, stage, rebase, remoção ou mudança remota foi executado
neste adendo.

Após a correção de compatibilidade de apresentação do PowerShell 5.1, o
portão foi executado novamente. O parser do PowerShell 5.1 aprovou o script,
os três testes de verdade do gate passaram, e o relatório runtime vigente é
[`cwv_report_20260831_162019.md`](cwv/cwv_report_20260831_162019.md). O dado
de `336 ms` é preservado como `OBSERVED_EVENT_LATENCY_MS`: sem uma interação
humana controlada e uma definição completa de janela, ele não pode ser
promovido a INP.

## Adendo de malha de conteúdo e percurso didático — 2026-08-31 16:34 BRT

### Veredicto

**O catálogo estático público é íntegro; o catálogo dinâmico é uma casca de
interface sem provedor registrado; e o material histórico permanece preservado
fora do percurso público até receber curadoria explícita.** Nenhum conteúdo
bruto, registro de sessão ou componente candidato foi removido, movido ou
publicado por inferência.

### Mapa de evidências

| Superfície | Evidência observada | Leitura correta |
| :-- | :-- | :-- |
| Biblioteca pública estática | As 26 constantes em `ROUTES.LIBRARY` correspondem às 26 páginas estáticas; as 26 requisições locais retornaram `200`. | **Percurso publicado e roteável.** A duplicação atual entre catálogo visual e constantes ainda é uma fonte de entropia, não um link quebrado medido. |
| Simulador mestre | `MasterSimulator.tsx` importa dinamicamente e renderiza `ReferencialAula12`; este importa `ReferencialData`. | **Integrado.** O referencial é um cenário didático específico, não uma generalização automática para todos os MTTs. |
| Biblioteca dinâmica `[slug]` | A página consulta `/api/v1/content/<slug>`, mas a API local não registra rota `content`; sem sessão, o middleware retorna `401`. | **Não é CMS operacional.** O `401` não prova slug inexistente e não deve ser convertido em mensagem de inexistência. |
| Conteúdo em `frontend/src/content` | 15 artefatos foram encontrados; não há importação pelo código de produto nem provedor público que os entregue. | **Acervo em preparação.** Não está automaticamente integrado à experiência do aluno. |
| Acervo histórico em `frontend/src/projects` | 141 arquivos rastreados, 6,47 MiB, com sessões, feedbacks, prompts e imagens; nenhuma importação de produto encontrada. | **Memória versionada, não conteúdo removível.** Ausência de importação não prova que seja seguro mover ou apagar. |
| Componentes de simulador sem consumidor externo | `AStarProjectionPanel`, `SotaHeatmapCanvas`, `HeroVsVillain` e `TableDrawScanner` não tiveram referência externa de produto. | **Candidatos não integrados.** Preservados até mapa de capacidades, contrato de entrada/saída e destino didático serem declarados. |

### Correções aplicadas

1. A página pública de Toy Games passou a distinguir a assimetria direcional
   `ΔRP(A→D) = RP(defensor) − RP(agressor)`: resultado positivo descreve a
   Vantagem de Risco do agressor de menor RP. A diferença é expressa em p.p.
   dentro da leitura ICMev/RP, não como desvio de ChipEV.
2. O texto agora proíbe converter `ΔRP` em frequência de agressão linear. A
   tradução operacional depende de payout, stacks efetivos, pote, posição,
   ranges e jogadores remanescentes. "Hero" não é usado como dono fixo da
   vantagem.
3. Uma frequência de fold alta em Toy Game deixou de ser apresentada como fato
   GTO universal: é uma saída dependente de cenário que precisa ser calculada.
4. A página dinâmica deixou de exibir `Validado` sem metadado de evidência. Seu
   estado é `Conteúdo dinâmico / Contrato API v1`, sem fingir que há handler
   publicado.
5. A página dinâmica agora separa `401/403` (catálogo protegido e não publicado
   ao público), `404` (artefato ainda não publicado) e falha genérica do
   catálogo. O acesso permanece protegido; nenhuma abertura de API, bypass de
   autenticação ou publicação automática foi introduzida.
6. `ROUTES.md` deixou de afirmar que o endpoint de CMS está ativo: ele é um
   contrato reservado enquanto não houver rota, política de acesso e pipeline
   de publicação efetivamente registrados.

### Verificações desta fase

| Verificação | Resultado |
| :-- | :-- |
| Correspondência entre `ROUTES.LIBRARY`, diretórios e HTTP local | **PASS — 26 de 26** rotas públicas retornaram `200`. |
| Cadeia `MasterSimulator → ReferencialAula12 → ReferencialData` | **PASS — importação e renderização verificadas no código.** |
| Registro de `api/v1/content` | **Ausente.** Busca de rota no servidor local não encontrou handler; o `401` observado é coerente com o middleware antes do handler. |
| Especificações focadas de Toy Games e catálogo dinâmico | **PASS — 3 testes em 2 suítes.** |
| Suíte frontend integral após as correções | **PASS — 99 testes em 20 suítes, em execução serial.** |

Os 3 testes focados validam diretamente os contratos alterados; a suíte
frontend integral também foi executada uma vez, em modo serial, e aprovou 99
testes em 20 suítes. Nenhum commit, stage, push, rebase, exclusão, movimentação
de acervo ou alteração de política de autenticação foi realizado.

### Próximo corte de maior retorno

Antes de integrar `src/content` ao site, declarar um **registro editorial de
publicação** separado do acervo bruto: `slug`, tipo de material, status
(rascunho/revisado/publicável), proveniência, fronteira entre hipótese autoral
e evidência externa, referências e componente/rota consumidora. Só então
implementar o provedor estático ou CMS autenticado que corresponda a esse
contrato. Esse corte preserva a teoria original, evita expor transcrições e
permite que cada entrada tenha responsabilidade didática e técnica auditável.

## Adendo de contraste — rota Toy Games — 2026-08-31 16:40 BRT

Uma leitura do DOM real em `http://127.0.0.1:3000/biblioteca/toy-games`, pelo
Chrome Dev canônico em `127.0.0.1:9223`, encontrou inicialmente uma regra
`color-contrast` com seis violações confirmadas. Elas estavam concentradas em
breadcrumbs e metadados do cabeçalho de conteúdo, com opacidades que reduziam
texto pequeno abaixo do limiar WCAG, e no preset ativo do painel pós-flop.

As correções foram proporcionais e localizadas:

- breadcrumb e metadados passaram de opacidade herdada para cores explícitas
  com contraste verificável;
- o rótulo decorativo secundário do cabeçalho deixou de depender de opacidade
  `0.30` sobre fundo escuro;
- o preset selecionado usa `indigo-600`, preservando a identidade cromática e
  elevando contraste do texto branco acima do limite.

| Medição real da rota | Antes | Depois |
| :-- | --: | --: |
| Violações confirmadas pelo axe | 6 | **0** |
| Regras incompletas | 1 | 1 |
| Nós em revisão humana de contraste | 231 | 231 |
| LCP observado no servidor de desenvolvimento | 1.312 ms | 944 ms |
| CLS observado | 0 | 0 |

O LCP é uma amostra de desenvolvimento e não uma comparação de performance
controlada: cache, aquecimento, carga e ambiente não foram congelados. Os 231
alvos incompletos são preservados para revisão humana porque envolvem fundos
gradientes, sobreposição ou fragmentos de fórmula; eles **não** são violações
confirmadas nem aprovação automática. Depois das correções, a suíte frontend
integral passou novamente: **99 testes em 20 suítes**, com ESLint, TypeScript e
`git diff --check` aprovados.

## Adendo de governança editorial — 2026-08-31 22:58 BRT

### Decisão implementada

O acervo em `frontend/src/content` passou a ter um registro tipado e interno em
`frontend/src/content/editorialRegistry.ts`. Ele é uma camada de governança, não
um CMS e não um carregador de fontes: não lê os arquivos em runtime, não os
renderiza, não cria rota e não muda sua visibilidade.

Cada uma das **15 fontes** recebe:

- identificador e caminho de origem verificável;
- status editorial (`source`), visibilidade (`internal`) e bloqueador concreto
  de publicação;
- fronteira de alegação: framework/hipótese autoral, alegação de calibração,
  especificação de implementação, protótipo interativo ou cópia comercial;
- rota pública apenas **conceitualmente relacionada**, quando houver. Essa
  relação não converte a fonte em origem da página já publicada.

| Fronteira declarada | Itens | Tratamento |
| :-- | --: | :-- |
| Framework autoral | 2 | Curadoria de referências, parâmetros e distinção entre proposta, código e validação independente. |
| Hipótese autoral | 6 | Formalização de condições de contorno e exemplos reproduzíveis antes de publicação. |
| Alegação de calibração | 1 | Reprodução de nós, versões de solver, parâmetros e método comparativo. |
| Especificação de implementação | 2 | Reconciliação com o motor, unidades e contratos de entrada atuais. |
| Protótipo interativo | 3 | Migração/normalização para componente tipado e revisão de segurança de execução. |
| Cópia comercial | 1 | Revisão de alegações quantitativas e posicionamento. |

### Portão ampliado

`npm run sota:full` não executava a suíte frontend. Isso deixava qualquer
contrato escrito em TypeScript — inclusive esta governança editorial — fora do
portão de qualidade integral. O script passou a executar `npm run test` antes
da suíte Python; `tests/test_quality_gate_contract.py` impede a regressão dessa
ordem.

| Verificação integrada ao portão | Resultado |
| :-- | :-- |
| Ruff | PASS |
| Pyright | PASS — 0 erros, 0 warnings |
| ESLint | PASS |
| TypeScript | PASS |
| Jest frontend | PASS — **102 testes, 21 suítes** |
| Pytest Python | PASS — **726 testes em 131,06 s** |

### Correção de método registrada

A primeira versão do teste de caminhos do registro inferiu a raiz a partir de
`process.cwd()`. Ela passou em invocação direta no monorepo, mas falhou no
comando oficial de workspace porque o Jest é iniciado em `frontend/`. O resultado
foi tratado como falha válida do teste, não como ausência das fontes. A correção
ancorou o caminho em `__dirname`, e a bateria oficial completa foi reexecutada
e aprovada. Nenhuma fonte foi movida, apagada, publicada ou alterada durante o
diagnóstico.

O próximo passo material — promover uma fonte de `source` para `review` ou
`ready`, ou construir provedor público/autenticado — exige curadoria por item e
evidência associada. O registro impede que essa decisão seja tomada por
acidente.

## Adendo de curadoria do núcleo PMev — 2026-08-31 23:05 BRT

Quatro fontes passaram de `source` para `review`, ainda com visibilidade
interna: `TEORIA_PERSPECTIVA_MATEMATICA_VITOI.md`,
`vitoi-perspective-paradigm.md`, `toy-games-theory.md` e
`calibration-nodes-aula-1-2.md`. A mudança não publica, serve ou incorpora os
documentos a páginas públicas; ela registra que a primeira revisão verificável
foi concluída.

### Correções de conteúdo

| Fonte | Correção |
| :-- | :-- |
| Toy Games | `ΔRP(A→D)` foi corrigido para `RP(defensor) − RP(agressor)`. A Vantagem de Risco pertence ao menor RP; p.p. é unidade da diferença dentro da leitura ICMev/RP; a diferença não é conversor linear de agressividade. |
| Fold Estrutural | Frequências altas deixaram de ser declaradas como GTO universal. Tornaram-se hipótese dependente de payout, stacks, pote, posição, ranges e jogadores remanescentes. |
| Perspectiva Matemática | Os dois textos agora a declaram **proposta autoral**; retiram linguagem de certificação irrefutável e tratam RP pós-flop, Fator Ψ, Pot Odds, RIO e Table Draw como variáveis/hipóteses a calibrar, não regras automáticas. |
| 93 Nodes | O arquivo deixou de alegar “dados validados” por teste unitário. Passou a exigir exports de nó, versões de solver, ranges, payouts e método comparativo. O cenário foi corrigido para `ΔRP(BTN→BB) = -8,5 p.p.`; portanto, BB tem o menor RP e a Vantagem de Risco nesse confronto. |

Foram adicionados testes de fronteira editorial para impedir a regressão da
direção de RP, da conversão linear indevida, de alegações de calibração sem
reprodução e de certificação da proposta autoral como evidência independente.
A verificação focal retornou **7 testes em 2 suítes**, com ESLint, TypeScript e
`git diff --check` aprovados.

### Correção de método registrada

Ao refletir o estado editorial após a curadoria, um patch genérico marcou os
quatro primeiros registros da lista em vez dos quatro efetivamente revisados.
Uma inspeção imediata do registro detectou a inconsistência; os três itens
indevidamente classificados foram restaurados para `source`, e apenas os quatro
corretos ficaram em `review`. A bateria focal passou depois da correção. Nenhum
arquivo foi publicado, apagado, movido ou submetido ao Git nesse intervalo.

## Fechamento de evidencia editorial — 2026-08-31 23:09 BRT

O portao oficial completo foi reexecutado depois das correcoes de conteudo, do
registro editorial e dos testes novos. O resultado abaixo substitui as contagens
parciais de curadoria como evidencia de integracao desta etapa:

| Camada | Resultado medido |
| :-- | :-- |
| Ruff | PASS |
| Pyright | PASS — 0 erros, 0 warnings |
| ESLint | PASS |
| TypeScript | PASS |
| Jest frontend | PASS — **106 testes em 22 suites** |
| Pytest Python | PASS — **726 testes em 186,04 s** |
| Guard SOTA | **SUCESSO (VERDE)** — 0 erros, 0 warnings |

O verde acima certifica a bateria de qualidade para a arvore de codigo e
conteudo avaliada; ele nao converte uma fonte interna em conteudo publicado nem
valida empiricamente a PMev. As quatro fontes em `review` continuam internas,
com seus bloqueadores de publicacao preservados. Nao houve `git add`, commit,
push, alteracao de rota, chamada a provedor ou carregamento de modelo local.

O indice de registros foi validado apos a atualizacao: **27 testes em 17,25 s**.
Na verificacao de disponibilidade local, a raiz do frontend respondeu HTTP 200
em `127.0.0.1:3000`; a API em `127.0.0.1:17042` respondeu HTTP 401 a `/docs`.
Este ultimo resultado e a evidencia esperada de servico ativo protegido por
autorizacao, nao uma falha de disponibilidade e nao autorizou reduzir a
protecao para fins de monitoramento.

## Segunda curadoria PMev: contrato do simulador e fontes internas — 2026-08-31 23:33 BRT

### Veredicto desta etapa

**O contrato didático do simulador ficou semanticamente mais correto e menos
fabricador.** A direção de Vantagem de Risco passou a ser explícita, o visor de
ranges não inventa mais deslocamentos numéricos quando não há nó/ranges/dados
que os sustentem e cinco fontes internas foram submetidas a revisão editorial.
O resultado é uma melhoria de integridade do produto, não uma validação empírica
da PMev nem uma aprovação de publicação.

| Dimensão | Estado após a curadoria | Evidência |
| :-- | :-- | :-- |
| Direção de RP | Corrigida | `ΔRP(A→D) = RP_D − RP_A`; sinal positivo significa que A tem menor RP e, portanto, Vantagem de Risco contra D. |
| Unidade `p.p.` | Preservada | Expressa deslocamento dentro da leitura ICMev/RP; não foi reancorada em limiar ChipEV. |
| Heurística → ação | Bloqueada | ΔRP identifica assimetria de risco; não gera por si só frequência, sizing, bet, call ou fold. |
| Visor de ranges | Não fabricador | Sem nó/ranges/parâmetros comparáveis, mantém frequência de referência e declara `aguarda nó`, em vez de aplicar offsets artificiais. |
| Fontes internas | 9 em `review`, 6 em `source`, 0 em `ready/published` | O registro continua somente interno; não cria rota, CMS, carregamento em runtime ou publicação. |

### Mudanças coerentes entre teoria, motor e interface

1. **Direção única de Vantagem de Risco.** O utilitário
   `calculateRiskAdvantageDelta(aggressorRp, defenderRp)` e os componentes de
   street/diagnóstico agora utilizam `RP_defensor − RP_agressor`. Isso corrige
   a situação `BTN 21,4 p.p. → BB 12,9 p.p.`: `ΔRP(BTN→BB) = −8,5 p.p.` e a
   Vantagem de Risco pertence ao BB. O motor não presume "Hero"; quem tiver
   menor RP em cada confronto é a parte com vantagem direcional.
2. **Contrato do resultado bruto.** `IcmDistortionResult.deltaRp` permanece
   explicitamente descrito como diferença bruta `RP_IP − RP_OOP`; ele não é
   apresentado como vantagem direcional até receber os papéis agressor/defensor.
3. **Sem pseudo-solver.** `PmevRangeViewer` deixou de deslocar frequências por
   `+/-` constantes com base isolada em stack, tempo ou sinal de RP. Esses
   sinais continuam no quadro explicativo, mas qualquer recalibração numérica
   requer nó reproduzível, ranges, payout, stacks, pote, posição e jogadores
   remanescentes.
4. **PRD e SPEC reconciliados.** `PRD_icm_toy.md` e `SPEC_icm_toy.md` passam a
   exigir entradas conservadas (chips, blinds, ante, payout e direção do spot),
   distinguem HU terminal de ChipEV puro e registram RIO quadrático como
   heurística/modelo a calibrar — não como lei empírica estabelecida.
5. **Páginas públicas alinhadas.** As páginas de leitura ICM, heurística pós-flop,
   nós de calibragem e estruturas de torneio retiram linguagem de certeza
   universal, de frequência automática e de "verdade" certificada por testes.
   Passam a descrever cenários, condições e limites de reprodução.

### Correção e ampliação editorial

As cinco fontes a seguir foram revisadas de `source` para `review`, mantendo
visibilidade `internal`: `PRD_icm_toy.md`, `SPEC_icm_toy.md`,
`pt1-ev-fold-fgs.md`, `pt2-pot-odds-edge.md` e
`tournament-structures.md`. Somadas às quatro fontes revisadas no adendo
anterior, a taxonomia atual é:

| Estado editorial | Quantidade | Significado operacional |
| :-- | --: | :-- |
| `source` | 6 | Material catalogado ainda sem revisão de substância concluída. |
| `review` | 9 | Leitura crítica inicial concluída; bloqueadores de publicação preservados. |
| `ready` / `published` | 0 | Nenhuma fonte recebeu status de publicação. |

### Verificação executada

| Camada | Resultado medido |
| :-- | :-- |
| Testes focais de contrato/editorial | PASS — **12 testes em 3 suítes** |
| Ruff | PASS |
| Pyright | PASS — 0 erros, 0 warnings |
| ESLint | PASS |
| TypeScript | PASS |
| Jest frontend | PASS — **111 testes em 23 suítes** |
| Pytest Python | PASS — **726 testes em 171,05 s** |
| Guard SOTA | **SUCESSO (VERDE)** — 0 erros, 0 warnings |

Os logs de Jules, RAG e Ollama que surgiram durante o `pytest` pertencem a
fixtures/mocks de teste. Não houve chamada real a provedor, ativação de Ollama,
início de worker externo ou alteração de credenciais. Não houve `git add`,
commit, push, mudança de rota ou publicação nesta etapa.

### Correções de método registradas

- Uma tentativa inicial de patch combinou remoção e recriação do mesmo arquivo
  em uma única operação e foi rejeitada pela ferramenta **antes** de modificar
  o repositório. Os cinco arquivos foram então recriados de imediato com o
  conteúdo final preservado.
- O novo teste de direção foi inicialmente salvo sem o fechamento de `describe`;
  Jest interrompeu a execução por sintaxe. O fechamento foi acrescentado e a
  suíte focal passou.
- TypeScript detectou uma propriedade residual de grid após a retirada dos
  contadores de delta artificial. A tipagem foi simplificada e o typecheck
  voltou a passar.

Essas falhas foram contidas antes do portão completo. Não produziram saída de
simulador falsa, publicação, exclusão de dados ou alteração no Git.

### Limites remanescentes

- O portão de código prova contratos e regressão da implementação; não prova a
  teoria PMev, comportamento humano, ranges de solver ou equivalência com
  resultados externos.
- Seis fontes internas ainda precisam de curadoria por item. Nenhuma deve ser
  promovida por contagem, associação de rota ou sucesso de teste.
- CWV de navegação real, teclado/leitor de tela, fluxo autenticado e clone limpo
  com LFS continuam fora desta verificação. A disponibilidade local previamente
  observada (`localhost:3000` HTTP 200) não é evidência de deploy público.
