---
id: registro-2026-09-24-correcao-markup-rich-e-wrappers-cli
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-09-24T11:08:00-03:00'
classes: [interno, medido, governanca, ascii, quality-gate, cli, bugfix]
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: ee1d6652-38d0-4803-9048-cf30bc0588a0
  session_started_at: '2026-09-24T07:18:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-09-24
caminhos:
  - scripts/cli/nexus.py
verificado:
  - "rich-markup-escape: corrigido _read_stream_and_log com markup=False evitando MarkupError em saida de testes com [/api/...]"
  - "exception-safety: escape(name) e escape(str(e)) aplicados em _execute_step, _executar_categoria_scripts e _executar_bloco_operacoes"
  - "blindagem-ascii: scripts/cli/nexus.py 100% compativel com Pure ASCII verificado via nexus ops check-ascii"
  - "quality-gate-completo: 10 fases do Quality Gate executadas e aprovadas com 0 erros e 0 warnings (1723 testes pytest verdes)"
  - "wrappers-cli: nexus.cmd e dashboard.cmd harmonizados com pushd %~dp0 e testados com sucesso a partir da raiz de usuario"
nao_verificado:
  - "inferencia em GPU fisica NVIDIA (ambiente local opera em modo CPU override)"
revisoes_de_ancora:
  - registro: registro-2026-09-19-refatoracao-sonar-python-e-icm
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado. Corrigida renderizacao do console Rich em _read_stream_and_log para desabilitar
      interpretacao de tags de markup (markup=False, style="dim") na saida crua de subprocessos,
      e adicionado escape seguro de strings em _execute_step, _executar_categoria_scripts e
      _executar_bloco_operacoes, eliminando o MarkupError ao processar tags de testes como [/api/...].
  - registro: registro-2026-09-19-warning-sem-backtracking
    caminhos:
      - scripts/cli/nexus.py
    parecer: >-
      Revisado. Mantido o parsing estrito de contagem de warnings sem backtracking.
      A adicao de escape e markup=False na saida do stream preserva intacta a extracao
      de warnings_declarados a partir da saida pura do subprocesso.
---

# REGISTRO DE CORRECAO DE MARKUP NO RICH CONSOLE E HARMONIZACAO DO QUALITY GATE

## 1. Contexto e Diagnostico
Durante a execucao do Quality Gate via Atalho [4] (`nexus ops quality-gate`), a fase de testes Python (`Python tests (Pytest + SOTA Guard)`) falhou na etapa 38% com a excecao:
```text
rich.errors.MarkupError: closing tag '[/api/files/view-GET]' at position 95 doesn't match any open tag
```
O erro ocorreu porque o teste parametrizado `test_jwt_de_produto_nao_alcanca_rota_de_operador[/api/files/view-GET]` emite o parametro entre colchetes iniciado por barra (`[/...`), o qual foi interpretado pelo motor de markup do Rich como uma tag de fechamento de estilo sem tag de abertura correspondente.

Adicionalmente, na clausula `except Exception as e:` de `_execute_step`, a interpolacao direta da string de excecao contendo os colchetes disparou uma segunda ocorrencia de `MarkupError`.

## 2. Acoes Implementadas
1. **Blindagem de Streams no Rich Console:**
   - Em `_read_stream_and_log`, a saida crua do subprocesso (`clean_decoded`) passou a ser ecoada com `console.print(clean_decoded, style="dim", highlight=False, markup=False)`. Com `markup=False`, o Rich trata o texto estritamente como literal, prevenindo qualquer tentativa de interpretacao de colchetes como formatacao.
2. **Escapamento Seguro de Excecoes e Stderr:**
   - Importada a funcao `escape` de `rich.markup`.
   - Aplicado `escape(name)` e `escape(str(e))` no tratador de erro fatal de `_execute_step`.
   - Aplicado `escape(res.stderr[:200])` nos runners de scripts e blocos de operacoes (`_executar_categoria_scripts` e `_executar_bloco_operacoes`).
3. **Validacao Rigorosa:**
   - Execucao completa das 10 fases do Quality Gate (`nexus ops quality-gate`), passando 100% verde (incluindo os 1723 testes Python e CWV Gate 5-Fases).
   - Validacao de Pure ASCII confirmada em 100% dos modulos.
