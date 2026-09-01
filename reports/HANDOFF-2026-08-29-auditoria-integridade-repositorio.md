---
id: handoff-2026-08-29-auditoria-integridade-repositorio
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: codex@gpt-5
criado_em: 2026-08-29T05:10-03:00
atualizado_em: 2026-08-30T13:10-03:00
commit_inicio_auditoria: 1521afdb35ea1ac9c76180bd77fc76bd71980adc
commit_registro: 8979a20e06dcc85823dc63b7efae04ca13df9ba2
classes: [interno, medido, handoff]
caminhos:
  - llm/routing_policy.py
  - scripts/ops/cwv_gate.ps1
  - scripts/ops/cwv_gate.py
  - data/PADROES_DE_CREDENCIAL.json
  - frontend/public/0309.mp4
  - .gitattributes
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  origem: origin/master
  head_no_registro: 8979a20e06dcc85823dc63b7efae04ca13df9ba2
  distancia_da_origem: 53 commits a frente
  suite_python: 609 passed, 22 skipped, 96.94 s
  suite_frontend: 95 passed, 18 suites
  quality_gate: FRAGIL -- CWV e A11y nao medidos
verificado:
  - git fsck --no-reflogs --full retornou 0
  - Pyright, ESLint, TypeScript, actionlint e npm audit retornaram aprovados
  - npm test encerrou com 95 testes aprovados
  - uma unica execucao controlada de pytest encerrou com 609 aprovados e 22 skips
  - pip-audit encontrou quatro advisories apenas em chromadb 1.5.9
  - chromadb e usado como PersistentClient; nenhum processo Chroma foi observado
  - classificacao redigida descartou as ocorrencias sk-* investigadas como URL, fixture e nomes de icones
  - gate PowerShell recusou bypass e aprovou CVE, SRI, PowerShell 5.1 e higiene de stage
nao_verificado:
  - os quatro commits entre o inicio da auditoria e o commit_registro nao receberam uma nova bateria integral em hash congelado
  - Core Web Vitals e acessibilidade reais nao foram medidos; o gate declarou referencias literais
  - os 22 testes de commit-msg foram ignorados por ausencia de runner POSIX no PATH
  - nenhuma chamada real a provedor de LLM foi feita; credenciais ativas nao sao pressupostas
  - clone limpo com download LFS e migracao do video legado para LFS nao foram executados
supersede: null
revisoes_de_ancora:
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos: [scripts/ops/cwv_gate.ps1]
    parecer: A ancora do handoff foi reavaliada no baseline atual; suas metricas permanecem limitadas a data original.
---

# HANDOFF — auditoria de integridade, qualidade e publicacao

## Veredicto operacional

**Nao publicar neste estado.** A auditoria encontrou base funcional forte, mas
nao um corte de release: o gate `sota:full` falha no Ruff, a medicao de CWV/A11y
permanece fragil, o `pip-audit` aponta ChromaDB sem correcao upstream, e a arvore
continuou recebendo commits durante a verificacao.

O commit `1521afdb` foi a ancora inicial. Durante a janela entraram
`392957a5`, `548a8488`, `bc32e8c1` e `8979a20e`; o ultimo e apenas a ancora de
registro deste handoff. Nao inferir que a bateria executada no inicio certifica
automaticamente esses quatro commits.

## Matriz de evidencias

| Superficie | Estado | Evidencia | Limite |
| :-- | :-- | :-- | :-- |
| Integridade Git | PASS | `git fsck` retornou 0 | nao equivale a clone LFS limpo |
| Python | PASS | 609 passed, 22 skipped em 96.94 s | suite ocorreu sobre arvore que se moveu |
| Frontend | PASS | ESLint, TSC e 95 Jest tests | nao mede CWV nem a11y real |
| Dependencias JS | PASS | `npm audit --audit-level=low`: 0 | fotografia local da data |
| Dependencias Python | ATENCAO | 4 advisories em `chromadb 1.5.9` | sem versao mais nova disponivel |
| Gate integrado | FRAGIL | CVE/SRI/PS5.1/higiene em stage aprovados | fases 1 e 2 usam referencias literais |
| Gate completo | FAIL | N818 em `ForaDaAutoridadeDaPolitica` | cadeia para antes dos testes Python |
| Diff | FAIL | 1.183 ocorrencias em 11 arquivos | patches governados nao devem ser formatados cegamente |
| Publicacao | BLOQUEADA | 53 commits locais adiante e novos commits durante auditoria | falta hash estavel |

## Achados que permanecem abertos

1. **Ruff N818 — bloqueador deterministico.**
   `llm/routing_policy.py` declara `ForaDaAutoridadeDaPolitica(LookupError)`.
   Renomear para uma excecao terminada em `Error` e atualizar consumidores e
   testes; nao silenciar a regra.

2. **Observabilidade de qualidade — bloqueador de excelencia.**
   O `cwv_gate.ps1` conecta ao CDP, mas declara explicitamente que LCP, CLS,
   INP e os contadores de acessibilidade sao referencias, nao medicao. Integrar
   Lighthouse/Playwright e axe antes de chamar o gate de verde.

3. **ChromaDB 1.5.9 — risco contido, sem patch.**
   O uso atual de `PersistentClient` reduz a exposicao do advisory de servidor;
   nao migrar para `HttpClient` nem subir `chroma run` sem reavaliacao. Manter o
   risco visivel e reexecutar `pip-audit` quando houver release corrigida.

4. **LFS e higiene historica.**
   `frontend/public/0309.mp4` (18.13 MiB) esta como blob Git fora de LFS. Os
   dois relatórios HTML de seguranca sao ponteiros LFS validos, mas nao possuem
   regra por caminho no `.gitattributes`. A migracao do video exige decisao
   separada porque reescreve historico.

5. **Cobertura de segredos.**
   Nao foi encontrada credencial material: os positivos exploratorios `sk-*`
   eram falsos positivos redigidos. Ainda assim, a varredura integral deve
   cobrir `.jsonl` e HTML textuais, com fixtures que protejam contra os falsos
   positivos de URL e icones encontrados nesta auditoria.

6. **Hook POSIX.**
   Vinte e dois testes de `commit-msg` foram ignorados pois `sh`/`bash` nao
   estavam no PATH. Validar o contrato em CI Linux ou disponibilizar runner
   POSIX verificavel; nunca compensar com bypass.

7. **Legado morto.**
   `scripts/ops/cwv_gate.py` ainda contem um bypass por `SKIP_CWV_GATE=1`, mas
   nao possui consumidor. O gate PowerShell vivo recusa o bypass. Remover ou
   aposentar o legado em mudanca deliberada.

## Sequencia de retomada

1. Esperar ou finalizar o escritor concorrente e congelar um unico hash.
2. Classificar os dois artefatos nao rastreados (`.codex/config.toml` e
   `reports/agent-calibration/daily/`) sem removê-los automaticamente.
3. Corrigir N818 e decidir a politica semantica dos patches com whitespace.
4. Instrumentar CWV/A11y reais e ampliar a cobertura de segredos.
5. Reexecutar, no hash congelado: `git diff --check`, `npm run sota:full`,
   `npm test`, `npm run python:test`, `npm audit`, `pip-audit` e
   `scripts/ops/cwv_gate.ps1`.
6. So depois revisar LFS, hook POSIX e autorizar commit/push separadamente.

## Regra de standby

Nenhuma correcao, limpeza, commit, rebase, merge, push, reescrita de historico
ou alteracao de dependencia foi feita por esta auditoria. A proxima acao deve
partir de uma ordem explicita e de uma nova fotografia Git, pois a auditoria
registrou mutacao concorrente do repositorio durante a propria janela.
