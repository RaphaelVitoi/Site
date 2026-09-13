---
id: registro-2026-09-13-portoes-enxutos-e-horizontais
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T14:54:58-03:00'
atualizado_em: '2026-09-13T14:54:58-03:00'
classes: [interno, medido, portao, governanca, desempenho]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  git: 2.55.0.windows.5
  congelada_em: '2026-09-13'
caminhos:
  - scripts/ops/record_gate.py
  - .husky/commit-msg
  - .husky/pre-push
verificado:
  - record_gate com stage vazio -- 22,3 s antes e 1,5 s depois, mesma lista de 5 pendencias
  - cProfile do record_gate -- 20,6 s de 23,7 s em 368 subprocessos git show, um por arquivo do corpus
  - textos_do_indice le o corpus num unico git cat-file --batch e cai para a arvore so no que falta ao indice
  - cwv_gate cronometrado por fase -- CVE 20,0 s de 25,9 s; SRI 0,3 s; higiene do stage 0,6 s
  - o cwv_gate rodava tres vezes sobre o mesmo conteudo -- pre-commit, pre-push e CI
  - o pre-push deixou de repetir npm run sota:audit; pre-commit e CI seguem executando o portao
  - commit-msg com as mesmas regras e cada rejeicao em ate 3 linhas terminando no comando de correcao
  - testes de hook, suite_verde, leitura do indice, merge e indice de registros -- 103 aprovados
  - Tier 0 mediu o ciclo commit e push em cerca de 15 min com o Claude, variando com volume, ancoras e complexidade
  - Tier 0 mediu erros por ciclo -- Claude Opus 5 3 a 4, GPT Sol e Astra 2 a 3, Gemini cerca de 7
nao_verificado:
  - o efeito da mudanca nos erros por ciclo de cada familia de modelo
  - o custo do cwv_gate fora desta maquina
pendencias:
  - id: pend-2026-09-13-cache-da-fase-cve
    o_que: Cachear a fase 3 do cwv_gate pelo conteudo dos lockfiles, preservando o veredito e os testes de veracidade -- 20 s por commit
    dono: Claude Opus 5
    prazo: 2026-09-20
  - id: pend-2026-09-13-custo-da-revisao-de-ancora
    o_que: Decidir como reduzir o custo do G2 -- esta otimizacao de 30 linhas exigiu revisar 13 registros historicos a mao
    dono: Tier 0
    prazo: 2026-09-20
revisoes_de_ancora:
  - registro: taxonomia-canonica-de-documentacao-e-relatorios
    caminhos: [scripts/ops/record_gate.py]
    parecer: Nenhum artefato muda de pasta.
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos: [.husky/pre-push, scripts/ops/record_gate.py]
    parecer: O pre-push continua rodando a suite por suite_verde.py, que e o que aquela auditoria prescreveu. Sai so a repeticao do sota audit, que segue no pre-commit e no CI.
  - registro: handoff-2026-08-29-quatro-pendencias-e-o-que-elas-eram
    caminhos: [scripts/ops/record_gate.py]
    parecer: Leitura do corpus em lote, com as mesmas regras e a mesma saida.
  - registro: handoff-2026-08-30-auditoria-malha-agentica-e-trava-de-lfs
    caminhos: [.husky/commit-msg, .husky/pre-push]
    parecer: A trava de LFS continua como primeira etapa do pre-push. O commit-msg mantem o padrao e o limite de 100 caracteres.
  - registro: interludio-2026-08-28-concorrencia-e-isolamento
    caminhos: [scripts/ops/record_gate.py]
    parecer: Nenhuma regra de concorrencia passa pelo trecho alterado; muda so o numero de processos git.
  - registro: plano-2b-painel-de-estado
    caminhos: [scripts/ops/record_gate.py]
    parecer: As verificacoes do painel sao as mesmas; a leitura ficou mais rapida.
  - registro: registro-2026-08-29-o-portao-le-o-indice
    caminhos: [scripts/ops/record_gate.py]
    parecer: A leitura continua sendo do indice, com queda para a arvore apenas fora dele. tests/test_portao_le_o_indice.py aprovado.
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos: [scripts/ops/record_gate.py]
    parecer: Ancoras e merge intocados. tests/test_record_gate_merge.py aprovado.
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos: [scripts/ops/record_gate.py]
    parecer: Resolucao de referencia intocada.
  - registro: registro-2026-09-08-alternancia-de-extensoes-no-portao-de-registro
    caminhos: [scripts/ops/record_gate.py]
    parecer: RE_CAMINHO_CITADO intocado.
  - registro: registro-2026-09-12-a-identidade-do-antigravity-e-o-catalogo-que-faltava
    caminhos: [.husky/commit-msg]
    parecer: Mesma checagem de identidade e de catalogo; so a mensagem encurtou.
  - registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
    caminhos: [.husky/commit-msg]
    parecer: A ausencia de Assinatura continua bloqueando.
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos: [.husky/commit-msg, scripts/ops/record_gate.py]
    parecer: Regras identicas, e as pendencias continuam impressas com stage vazio.
---

# Portões enxutos e horizontais

Pedido do Tier 0 em 2026-09-13: modelos gastavam tempo em pre-commit, commit,
pre-push e push redundantes, e erravam por mensagens escritas no idioma interno
de um só modelo.

## O que mudou

| Portão | Antes | Depois |
| :--- | ---: | ---: |
| `record_gate`, stage vazio | 22,3 s | 1,5 s |
| `sota:audit` no pre-push | 26-42 s | removido; segue no pre-commit e no CI |
| rejeição do `commit-msg` | até 15 linhas | até 3 linhas, com o comando de correção |

## Próximo corte

A fase de CVE do `cwv_gate` custa 20 s por commit e só muda quando um lockfile
muda. O custo do G2 também ficou medido: esta otimização exigiu revisar 13
registros históricos que apenas citavam o arquivo.
