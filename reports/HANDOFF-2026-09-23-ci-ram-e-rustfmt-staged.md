---
id: handoff-2026-09-23-ci-ram-e-rustfmt-staged
tipo: handoff
escopo: Site — teste hermetico de workers, Rustfmt e tipografia staged para delegacao
ecossistema: nexus-sota
autor: Codex GPT-6 Luna <noreply@openai.com>
criado_em: '2026-09-23T16:42:43-03:00'
atualizado_em: '2026-09-23T17:19:07-03:00'
classes: [interno, medido, handoff, ci]
caminhos:
  - tests/test_suite_verde.py
  - .vscode/tasks.json
  - frontend/src/app/globals.css
  - frontend/src/app/(public)/page.tsx
  - frontend/src/app/(public)/quem-sou/page.tsx
  - frontend/src/app/(lab)/simulador/page.tsx
  - frontend/src/app/(lab)/simulador/gto-cfr/page.tsx
  - frontend/src/components/simulator/GtoCfrContent.tsx
  - frontend/src/components/simulator/MasterSimulator.tsx
  - frontend/src/components/simulator/panels/CfrRegretPanel.tsx
  - frontend/src/components/simulator/panels/NashPanel.tsx
  - frontend/src/components/simulator/ui/ActionRow.tsx
  - frontend/src/components/simulator/ui/FreqInput.tsx
  - frontend/src/app/(public)/biblioteca/teoria-da-perspectiva/page.tsx
  - frontend/src/components/analytics/NexusOperationsPanel.tsx
  - frontend/src/components/ui/layout/SotaMarkdown.tsx
  - frontend/tests/visual/homepage.spec.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  commit_base: 6052e7666da0676044dbfd266ee041a8973efa10
  ci_run: 35910366679
  session_id: 01a0cd79-1e50-7aa3-9865-32e051504374
  condutor: Codex GPT-6 Luna <noreply@openai.com>
  modelo: gpt-6-luna
  veiculo: codex
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-23
verificado:
  - CI do commit 6052e766 aprovou build frontend e Ruff nas duas matrizes Python
  - CI Python 3.13 reprovou em um teste que esperava cinco workers com quatro CPUs no runner
  - rustfmt 1.9.0 stable presente no toolchain local e manifestos dos tres crates encontrados
  - tipografia conferida em 390 e 1440 px nas rotas /, /quem-sou, /simulador e /simulador/gto-cfr, sem rolagem horizontal
  - painel Nash do Mestre conferido em 390, 806 e 1440 px; alvo e margem nao se sobrepoem
  - Mermaid da rota /biblioteca/teoria-da-perspectiva renderiza SVG com seis camadas em 390 e 1280 px
  - ESLint dos TSX alterados sem erros; diff check sem erros
nao_verificado:
  - nova execucao da suite e CI apos fixar cpu_count no cenario do teste
  - funcionamento das tarefas Rustfmt na interface IDE; Tier 0 testara ao longo do dia
  - CI e inspeção visual integral das demais rotas após os ajustes tipograficos
pendencias:
  - id: pend-2026-09-23-ci-ram-delegado
    o_que: Validar a correcao hermetica no CI e publicar os arquivos staged segundo os gates do Site.
    dono: proximo condutor designado pelo Tier 0
    prazo: 2026-09-30
pendencias_resolvidas: []
revisoes_de_ancora: []
---

# Handoff — CI e Rustfmt

O ultimo commit publicado do Site e `6052e7666da0676044dbfd266ee041a8973efa10` em `origin/master`. O [CI 35910366679](https://github.com/RaphaelVitoi/Site/actions/runs/35910366679) aprovou o build frontend e Ruff nas matrizes 3.12 e 3.13. A matriz 3.13 reprovou depois de 1689 testes aprovados, 24 pulados e um warning: `test_suite_limita_workers_pela_memoria_quando_ha_xdist` esperava cinco workers, mas o runner tem quatro CPUs e a politica limita pelo menor teto entre RAM e CPU. A matriz 3.12 foi cancelada pelo fail-fast.

O cenario do teste passou a fixar oito CPUs com `monkeypatch`, junto com os 14 GiB ja simulados. A politica de producao nao mudou. Raphael determinou que o proximo condutor valide no CI; nenhuma suite nova nem push foram executados depois desta correcao.

`rustfmt` oficial ja estava instalado (`rustfmt 1.9.0-stable`). A tarefa `Rustfmt: All Crates (on demand)` em `.vscode/tasks.json` aciona sequencialmente `cargo fmt --all` nos tres manifestos Rust do Site, sem daemon e sem formatacao automatica. Raphael fara o teste de uso ao longo do dia. O arquivo de tarefas e a correcao do teste devem permanecer staged para o proximo commit. Um backup local da tarefa preparada esta em `C:/Users/rapha/.gemini/remediacao_backup_aplicado/rustfmt-stage-20260923/tasks.json`.

Antes do encerramento, Raphael pediu harmonizacao tipografica. O navegador revelou que o token `--font-body` nao resolvia no corpo: textos operacionais caiam na fonte do sistema. A variavel agora e declarada no `body`, com Inter para texto de interface, Montserrat em titulos, JetBrains Mono em dados e Playfair/Garamond no editorial. Rotulos, acoes e explicacoes das paginas iniciais e dos simuladores Mestre/GTO receberam tamanhos proporcionais ao contexto; valores dentro das matrizes continuam compactos. Em 390 e 1440 px, `/`, `/quem-sou`, `/simulador` e `/simulador/gto-cfr` nao apresentaram rolagem horizontal; `/biblioteca`, `/simulador/distorcoes` e `/aulas/icm-pos-flop` foram amostradas em 390 px.

Raphael apontou especificamente a sobreposicao de dados no painel Nash do Mestre. O cabeçalho foi simplificado, os cartoes de pressao e as duas colunas de acoes agora usam a mesma hierarquia, e cada linha separa frequencia inserida, alvo GTO e margem em posicoes legiveis. Em 390, 806 e 1440 px, o navegador confirmou que alvo e margem nao se sobrepoem e que nao ha rolagem horizontal. ESLint dos TSX alterados: zero erros; CSS nao pertence ao escopo dessa configuracao de ESLint. Nenhuma suite ou CI foi repetida. Os arquivos tipograficos acompanham o conjunto staged para o proximo condutor validar e publicar.

Na rota `/biblioteca/teoria-da-perspectiva`, o diagrama de seis camadas aparecia como texto literal porque os delimitadores de Markdown estavam escapados dentro de `String.raw`. A interpolacao do delimitador preserva o restante do conteudo e entrega um bloco `mermaid` valido ao renderizador existente. O navegador exibiu um SVG com seis nos em 390 e 1280 px; nao houve rolagem horizontal. Esta correcao tambem segue staged para o proximo condutor.
