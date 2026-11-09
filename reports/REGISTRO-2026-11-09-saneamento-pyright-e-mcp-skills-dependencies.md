---
id: registro-2026-11-09-saneamento-pyright-e-mcp-skills-dependencies
tipo: registro
escopo: saneamento-pyright-test-pmev-e-dependencias-skills-mcp
autor: Raphael Vitoi / Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-09'
classes:
  - interno
  - medido
  - governanca
  - registro
  - pmev
  - tests
  - skills
  - mcp
verificado:
  - Estreitamento de tipo com assert isinstance(res, Iterable) em tests/test_pmev_engines_consumption.py eliminando os diagnostics Pyright reportGeneralTypeIssues (float e object nao iteraveis)
  - Execucao verde de 5/5 testes em tests/test_pmev_engines_consumption.py com zero erros e zero warnings
  - Instalacao e resolucao completa de dependencias em skills/gemini-cli-security/mcp-server com typecheck limpo
  - Instalacao e configuracao de tipos Node em skills/gemini-cli-jules/mcp-server com compilacao tsc limpa
  - Instalacao completa de dependencias e execucao de 158/158 testes unitarios com 100% de aprovacao em skills/exa-mcp-server
nao_verificado:
  - Integracao em runtime de producao remota de skills isoladas
config_medida:
  congelada_em: '2026-11-09'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-09'
  toolchain: pytest + uv + pyright + npm + tsc + record_gate.py
  python: 3.14.9
  so: Windows
caminhos:
  - reports/REGISTRO-2026-11-09-saneamento-pyright-e-mcp-skills-dependencies.md
  - tests/test_pmev_engines_consumption.py
revisoes_de_ancora:
  - registro: registro-2026-11-08-elevacao-polars-2-1-e-consumo-integral-engines-sota
    caminhos:
      - tests/test_pmev_engines_consumption.py
    parecer: 'Reconciliacao em 2026-11-09: tipagem estrita com Iterable para estreitar tipo de retorno no teste de calculo vetorizado de perspectiva, eliminando falso positivo de reportGeneralTypeIssues do Pyright.'
---

# Registro: Saneamento Pyright em Teste PMev e Dependencias de Skills MCP

## 1. Contexto & Diagnosticos Resolvidos

1. **Pyright (`tests/test_pmev_engines_consumption.py:145`):**
   - Diagnostic `reportGeneralTypeIssues`: `"float" não é iterável` / `"object" não é iterável`.
   - Causa raiz: `VitoiPerspectiveEngine.calculate_perspective_vectorized()` possui retorno anotado como `float | list[float] | object`. No teste, `assert res is not None` nao estreitava o tipo de `res` para um iteravel, levando o Pyright a apontar impossibilidade de iteracao em `[round(float(v), 4) for v in res]`.
   - Solucao: Introduzida assercao explcita `assert isinstance(res, Iterable)` com import de `collections.abc.Iterable`, garantindo estreitamento formal e eliminando 100% dos diagnostics.

2. **TypeScript / Module Resolution em Skills MCP:**
   - Skills MCP versionadas como submodulos (`skills/gemini-cli-security/mcp-server`, `skills/gemini-cli-jules/mcp-server`, `skills/exa-mcp-server`) possuiam `package.json` declarativo mas estavam sem seus respectivos `node_modules`.
   - Isso levava o analisador TypeScript a falhar em resolver `@modelcontextprotocol/sdk`, `exa-js`, `agnost`, `mcp-handler`, `@upstash/ratelimit` e `@upstash/redis`, alem de subir a busca de `zod` para o root (`Site/node_modules` com Zod v4), gerando conflitos de aridade na API `z.record()`.
   - Solucao: Instaladas as dependencias locais em cada submodulo, ajustada a tipagem Node em `gemini-cli-jules` e validados os suites com `tsc --noEmit` e `vitest` (158/158 testes verdes).
