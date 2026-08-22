# Mapa Sistêmico do Site

## Princípio de composição

O repositório é organizado por fronteiras de responsabilidade. Dependências fluem das interfaces e orquestrações para contratos e núcleos de domínio; o núcleo matemático não depende de editor, plugin ou host de agente.

```text
governance/ ────────> política, aprovações e invariantes
docs/ ──────────────> especificações, decisões, auditorias e referências

frontend/ ─┐
api/ ──────┼────────> schemas/ + shared/ ────> core/ + math/ + engine/
cli/ ──────┘                                      │
                                                   ├── database/ + data/
                                                   ├── wasm-equity/
                                                   └── worker/ + monitoring/

scripts/ + tools/ ──> automação reprodutível; não são fonte de política
skills/ + core/vendor/ ──> dependências externas fixadas; nunca fonte de verdade
```

## Fronteiras e responsabilidades

| Camada | Diretórios | Responsabilidade | Não deve conter |
|---|---|---|---|
| Constituição | `governance/` | regras, autoridade, autonomia e ambiente | implementação de produto ou segredo |
| Produto | `frontend/`, `api/`, `cli/` | experiência, endpoints e entradas de usuário | cálculo canônico duplicado |
| Domínio | `core/`, `engine/`, `math/`, `schemas/` | PMev, ICM, contratos, invariantes e cálculo | estado específico de editor |
| Plataforma | `database/`, `data/`, `worker/`, `monitoring/` | persistência, jobs, observabilidade e dados | política constitucional |
| Performance | `wasm-equity/` | artefatos WASM reprodutíveis | dependências Node no bundle de browser |
| Operação | `scripts/`, `tools/` | gates, build, manutenção e diagnóstico | decisão de negócio não documentada |
| Evidência | `tests/`, `reports/`, `docs/audits/` | validação, resultados e handoff | configuração de segredo |
| Externa | `skills/`, `core/vendor/` | submódulos fixados e dependências revisáveis | patches locais não registrados |

## Regras de dependência

1. `frontend/` consome contratos; não recria fórmulas PMev/ICM nem acessa infraestrutura diretamente.
2. `api/` valida entrada e delega para domínio; não contém lógica matemática proprietária duplicada.
3. `engine/`, `core/` e `math/` permanecem independentes de host, IDE, MCP, plugin e UI.
4. `wasm-equity/` é a fonte única de geração WASM; runtimes Node e browser permanecem separados.
5. `skills/` e `core/vendor/` permanecem em fronteira de fornecedor: atualizações entram por revisão, pin e commit próprios.
6. Estado local, cache, memória de agente, telemetria e credenciais não são artefatos canônicos do produto.
