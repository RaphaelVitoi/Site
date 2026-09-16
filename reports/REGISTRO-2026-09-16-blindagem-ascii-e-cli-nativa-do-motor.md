---
id: registro-2026-09-16-blindagem-ascii-e-cli-nativa-do-motor
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-16T19:40:00-03:00'
atualizado_em: '2026-09-16T19:40:00-03:00'
classes: [interno, medido]
session_id: 5b136c4c-9182-4227-9bfc-d883a25c2a77
session_started_at: '2026-09-16T13:28:11-03:00'
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  rust: '1.97.1'
  wasm_pack: '0.15.0'
  congelada_em: '2026-09-16'
verificado:
  - nexus ops check-ascii reprovava com 31 modulos em 094cb419 e com os mesmos 31 em 933e672b -- divida anterior, nao regressao
  - 31 modulos levados a ASCII; AST identica fora das docstrings, exceto uma regex com escape que o re interpreta igual
  - middleware -- not math.isfinite(fval) igual a not (-inf < fval < inf) para NaN, +-inf, 0 e 1e308
  - tarefa Cargo Build passava --features debug_assertions, que e cfg do perfil dev e nao feature do crate
  - cli.rs fora de src/bin nunca foi descoberto pelo cargo; [[bin]] vitoi_engine_cli declarado
  - cli.rs chamava calculate_perspectiva_core, que nao existia mais; nucleo nativo extraido e a FFI passou a chama-lo
  - FFI antiga e nova comparadas bit a bit em 480 combinacoes de entrada -- 0 diferencas
  - CLI nativa e WASM concordam no caso MW3 (0.0114, 0.6946, 1.0119)
  - npm run wasm:build altera os .d.ts gerados so na ordem da linha de calculate_perspectiva_vitoi_wasm
  - suite Python integral verde na arvore 031509e2; cargo test 2 aprovados; tsc sem erro
nao_verificado:
  - doctests do crate -- toolchain 1.97.1 em perfil minimal, sem rustdoc
  - cargo clippy -- componente ausente no toolchain; o allow(clippy::too_many_arguments) nao foi exercido
  - depuracao LLDB-DAP pelo launch.json aberta no editor
revisoes_de_ancora:
  - registro: registro-2026-08-29-o-fallback-que-nao-carrega
    caminhos: [tests/test_routing_policy.py]
    parecer: A unica mudanca e a transliteracao do simbolo de secao na docstring do modulo para SS; nenhuma linha foi inserida ou removida, entao as linhas 442, 451 e 463 citadas pelo registro seguem corretas.
---

# Blindagem ASCII e CLI nativa do motor

Dois reparos pedidos por logs do Tier 0 na mesma sessão do prelúdio
`registro-2026-09-16-preludio-saneamento-pos-crise-de-quota`.

## Blindagem ASCII

O passo do Quality Gate que o `dashboard.ps1` chama reprovava com 31 módulos
Python. A comparação entre os dois commits mostrou a mesma lista antes e depois
da unificação do ruff: a regra de `docs/architecture/AGNOSTIC_SYSTEM.md` tinha
simplesmente deixado de ser cumprida.

A conversão preserva valor em runtime. Comentários e docstrings foram
transliterados; strings receberam escape `\uXXXX`. Onde a string é raw, o escape
foi posto dentro do padrão de regex, que o módulo `re` interpreta, ou fora da
parte raw por concatenação implícita.

## CLI nativa do motor

A tarefa padrão de build do editor falhava por três defeitos empilhados, e cada
um escondia o seguinte: uma *feature* inexistente, um binário não declarado e uma
função que o próprio binário chamava e que havia sido absorvida pela interface
WASM. Como `js_sys::Float64Array` só existe dentro do WebAssembly, o núcleo
voltou a ser Rust puro e a interface passou a copiar o resultado dele.

A equivalência não foi presumida: as duas versões compiladas foram comparadas
bit a bit em 480 entradas.
