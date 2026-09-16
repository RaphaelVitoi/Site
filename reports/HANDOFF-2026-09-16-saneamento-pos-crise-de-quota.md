---
id: handoff-2026-09-16-saneamento-pos-crise-de-quota
tipo: handoff
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-16T21:10:00-03:00'
atualizado_em: '2026-09-16T21:10:00-03:00'
classes: [interno, medido, handoff]
session_id: 5b136c4c-9182-4227-9bfc-d883a25c2a77
session_started_at: '2026-09-16T13:28:11-03:00'
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  node: '24.16.0'
  rust: '1.97.1'
  congelada_em: '2026-09-16'
verificado:
  - nota do Tier 0 9.5 registrada literal no ledger (sequencia 74) e corrigida por append para o texto com acentos (sequencia 75)
  - commits da sessao apos o preludio -- 933e672b, f2cebf07, 20f0516c, todos publicados com suite integral verde no pre-push
  - sentinela de delecoes rodando desde o logon; 3 inicios registrados, inventario presente em todos, nenhuma delecao nova desde a restauracao das 14:08
  - comprimidos de frontend/public eram artefato morto -- o server.js standalone comprime sob demanda e nao serve .br/.gz; robots.txt.gz versionado estava defasado e o .wasm.br servia o motor anterior ao rebuild
  - brotli_compressor.mjs passou a medir por padrao (--gravar para escrever); Quality Gate deixa de sujar a arvore; 4 comprimidos saem do indice e public/**/*.br|gz vao para o .gitignore do frontend
  - rustdoc.exe ausente do toolchain 1.97.1 (so o .pdb restava); toolchain reinstalado -- doctests rodam, clippy sem erro, WASM gerado identico
  - Ollama segue em 127.0.0.1 e o languageserver do R carrega da biblioteca do usuario
nao_verificado:
  - depuracao LLDB-DAP -- a extensao esta instalada, mas nao ha lldb-dap.exe na maquina
  - por que o rustdoc.exe sumiu -- sem rastro no historico do Defender
  - causa da falha intermitente de test_cwv_gate_truthfulness sob pytest -n auto
pendencias:
  - id: pend-2026-09-16-cwv-truthfulness-sob-carga
    o_que: Medir por que os testes de tests/test_cwv_gate_truthfulness.py caem por tempo sob pytest -n auto (cada caso abre o cwv_gate e leva cerca de 35 s contra teto de 45 a 90 s) e isola-los sem afrouxar o teto
    dono: Claude Opus 5
    prazo: 2026-09-23
  - id: pend-2026-09-16-lldb-dap-ausente
    o_que: Decidir instalar o LLVM (fornece lldb-dap.exe) ou trocar o launch.json do motor para um depurador ja presente
    dono: Tier 0
    prazo: 2026-09-30
---

# Handoff — saneamento pós-crise de quota

Fecha a sessão aberta no prelúdio `registro-2026-09-16-preludio-saneamento-pos-crise-de-quota`,
com o mesmo `session_id`.

## A nota e o que ela diz

**9.5/10.** Comentário literal do Tier 0:

> Já te disse isso, prezo mt pela análise sistemica, e você é mt linear, então zoom out
> faz bem. Tbm gostaria de mais proatividade as vezes, não simplesmente descartar o que
> nao tem a ver contigo ou com o input. Mas ver possibilidades a mais.

"Já te disse" marca recorrência: é o mesmo padrão registrado em 2026-09-02 na memória
*sistema antes do artefato*. A sessão teve dois bons exemplos de zoom out — 771 avisos
de lint que eram duas configurações em conflito, e um benchmark falso que eram quatro —
mas nos dois foi o problema que forçou a subida. Quando não forçou, fiquei linear: o
teste do portão CWV tratado como intermitente e seguido adiante, e os quatro comprimidos
de `frontend/public` deixados fora do commit por "não terem sido modificados por mim".

Este handoff aplicou o comentário antes de ser escrito. Os comprimidos, olhados como
sistema, eram um gerador sujando a árvore a cada Quality Gate e produzindo arquivos que
nenhum servidor usa, um deles com o motor WASM anterior. E o `rustdoc` que eu tinha
anotado como "ausente, não verificado" estava faltando só o executável de um toolchain
íntegro no resto; reinstalado, os doctests voltaram.

## O que a sessão entregou

Depois do prelúdio:

- **Lint:** uma configuração só do ruff, 771 avisos zerados, preview do editor neutralizado.
- **Segurança:** injeção de argumento no bridge MCP; rotas `sota/*` sem sessão e com credencial
  literal; Ollama aberto na rede local; leitura de `file:` pelo `sota_web_browse`.
- **Modelo de ameaças:** reescrito a partir do código, com guards contra divergência.
- **Motor:** CLI nativa recuperada; multiway passou a avaliar mãos.
- **Benchmarks:** medidos em vez de declarados; sonda do router 52% mais rápida no p50.
- **Blindagem ASCII** restaurada nos 31 módulos.

Cada frente tem registro próprio com o que foi e o que não foi verificado.

## Pendências que seguem com o Tier 0

As do prelúdio continuam abertas e são exibidas pelo portão: revogar as duas credenciais
vazadas (prazo 2026-09-17, a mais urgente), remover a `.pytest_cache` travada, confiar o
workspace na extensão e decidir o branch local de submódulos. Acrescento a decisão sobre
o depurador LLDB.
