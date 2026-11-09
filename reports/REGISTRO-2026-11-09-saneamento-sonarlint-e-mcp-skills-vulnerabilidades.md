---
id: registro-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades
tipo: registro
escopo: saneamento-sonarlint-antigravity-bridge-e-mcp-skills-security
autor: Raphael Vitoi / Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-11-09'
classes:
  - interno
  - medido
  - governanca
  - registro
  - sonarlint
  - skills
  - mcp
  - security
verificado:
  - Definicao de constante ANTIGRAVITY_BRIDGE_USER_AGENT eliminando duplicacao do literal Antigravity-Bridge/1.0 (SonarLint S1192) em Site/llm/antigravity_sdk_bridge.py e scripts/ops/antigravity_sdk_bridge.py
  - Simplificacao de tuplas de excecao redundantes para except OSError eliminando S5713 (SonarLint) em ambos os bridges
  - 28/28 testes automatizados de bridge e subagentes passando 100% verde (23 no Site e 5 na raiz)
  - Resolucao de deprecacao TS5107 e adicao de types node em skills/gemini-cli-jules/mcp-server com build tsc e vitest aprovados
  - Elevacao do vitest para versao 5.1.0 e saneamento de vulnerabilidades em skills/gemini-cli-security/mcp-server (reducao de 18 para 1)
  - Correcao de compatibilidade multiplataforma Windows no mockPath de skills/gemini-cli-security/mcp-server/src/poc.test.ts com 36/36 testes aprovados
  - Eliminacao de vulnerabilidades criticas no package-lock.json de skills/exa-mcp-server (reducao de 46 para 26 com zero criticas) e 158/158 testes aprovados
nao_verificado:
  - Runtime de execucao de PoCs em servidores Linux remotos
config_medida:
  congelada_em: '2026-11-09'
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data_das_medicoes: '2026-11-09'
  toolchain: pytest + uv + ruff + npm + tsc + vitest + record_gate.py
  python: 3.14.9
  so: Windows
referencias_nao_resolviveis:
  - scripts/ops/antigravity_sdk_bridge.py
caminhos:
  - llm/antigravity_sdk_bridge.py
  - reports/REGISTRO-2026-11-09-saneamento-sonarlint-e-mcp-skills-vulnerabilidades.md
  - skills/exa-mcp-server
  - skills/gemini-cli-jules
  - skills/gemini-cli-security
revisoes_de_ancora:
  - registro: registro-2026-11-09-automacao-modelos-locais-ollama-e-subagentes
    caminhos:
      - llm/antigravity_sdk_bridge.py
    parecer: 'Reconciliacao em 2026-11-09: definicao da constante ANTIGRAVITY_BRIDGE_USER_AGENT e unificacao de excecoes sob OSError atendendo SonarLint S1192 e S5713.'
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
    parecer: 'Reconciliacao em 2026-11-09: audit fix eliminando vulnerabilidades criticas com suite de 158 testes unitarios 100% verde.'
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - skills/gemini-cli-security
    parecer: 'Reconciliacao em 2026-11-09: elevacao do vitest para ^5.1.0, audit fix de seguranca e resolucao de separadores de caminho Windows em poc.test.ts com 36 testes verdes.'
  - registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
    caminhos:
      - skills/gemini-cli-security
    parecer: 'Reconciliacao em 2026-11-09: elevacao do vitest para ^5.1.0, audit fix de seguranca e resolucao de separadores de caminho Windows em poc.test.ts com 36 testes verdes.'
  - registro: registro-2026-09-12-a-autoria-dos-forks-corrigida-antes-do-primeiro-pr
    caminhos:
      - skills/gemini-cli-jules
    parecer: 'Reconciliacao em 2026-11-09: resolucao de deprecacao TS5107, tipagem estrita no teste e correcao de vulnerabilidades de dependencias.'
---

# Registro: Saneamento SonarLint e Vulnerabilidades de Seguranca em MCP Skills

## 1. Contexto & Diagnosticos SonarLint Resolvidos

1. **SonarLint `python:S1192` (`Site/llm/antigravity_sdk_bridge.py:124`):**
   - Problema: Literal de string `"Antigravity-Bridge/1.0"` duplicado em 3 pontos (`/api/tags`, `/api/ps`, `/api/generate`).
   - Solucao: Definida constante canônica fortemente tipada `ANTIGRAVITY_BRIDGE_USER_AGENT: Final[str] = "Antigravity-Bridge/1.0"`, aplicada nos 3 locais em `Site/llm/antigravity_sdk_bridge.py` e replicada em `scripts/ops/antigravity_sdk_bridge.py`.

2. **SonarLint `python:S5713` (`Site/llm/antigravity_sdk_bridge.py:137, 203`):**
   - Problema: Captura redundante de `(urllib.error.URLError, TimeoutError, OSError)`. No Python 3.3+, tanto `urllib.error.URLError` quanto `TimeoutError` herdam diretamente de `OSError`.
   - Solucao: Simplificado para `except OSError as e:`, eliminando redundancia de classes e mantendo semantica identica de captura.

## 2. Resolucao e Otimizacao das MCP Skills

1. **`Site/skills/gemini-cli-jules/mcp-server`:**
   - Erro `TS5107`: deprecacao de `moduleResolution=node10`. Atualizado `tsconfig.json` para `"moduleResolution": "bundler"` com `"types": ["node"]`.
   - Erro `TS2591`: missing type definitions. Import relativo em `skills/gemini-cli-jules/mcp-server/src/__tests__/jules.test.ts` corrigido para permanecer dentro de `rootDir`, com narrowing defensivo de `firstContent.type === 'text'`.
   - Dependencias: `npm audit fix` executado, reduzindo vulnerabilidades de 7 para 1 (apenas advisory sobre `zod` em colecoes desmedidas). Compilacao `tsc` e testes `vitest` aprovados com zero erros.

2. **`Site/skills/gemini-cli-security/mcp-server`:**
   - Vulnerabilidades: Elevado `vitest` de `^3.2.4` para `^5.1.0` e executado `npm audit fix`, eliminando vulnerabilidades criticas (`tinypool`) e moderadas (`@vitest/mocker`). Total de vulnerabilidades reduzido de 18 para 1.
   - Falhas no `skills/gemini-cli-security/mcp-server/src/poc.test.ts`: O `mockPath` continha implementacao ingênua restrita a caminhos POSIX (`startsWith('/')`), falhando no Windows com letras de unidade (`C:\`). Ajustado para utilizar resolucao multiplataforma nativa do Node (`path.resolve`, `path.sep`), aprovando todos os 7 arquivos de teste e 36 testes com 100% de sucesso.

3. **`Site/skills/exa-mcp-server`:**
   - Vulnerabilidades: Executado `npm audit fix`, eliminando vulnerabilidades criticas em `tar` e `proxy-addr`. Total reduzido de 46 para 26 (zero criticas).
   - Validacao: 158 testes unitarios e typecheck `tsc --noEmit -p tsconfig.test.json` 100% aprovados.
