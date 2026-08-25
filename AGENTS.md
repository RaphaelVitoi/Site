# Governança — projeto `Site`

**Escopo:** este arquivo vale para **`C:\Users\rapha\.gemini\Site`** e nada além.
Regras que valem para todos os projetos ficam em `..\AGENTS.md`, na raiz
multiprojeto.

**Última revisão:** 2026-08-21 · Protocolo Chico SOTA v8.0 GOLD

---

## 1. O portão obrigatório — `pre-commit`

Toda alteração passa por `scripts/ops/cwv_gate.ps1`, disparado pelo hook
`pre-commit`. Cinco fases:

| # | Fase | O que barra |
| :-- | :--- | :--- |
| 1 | Core Web Vitals | Regressão de LCP / CLS / INP / TTFB |
| 2 | Acessibilidade | Violação de padrão A11y |
| 3 | **CVE** | Qualquer vulnerabilidade em `npm audit` |
| 4 | **SRI** | Falha de integridade ou hash SHA-512 |
| 5 | **Higiene de repositório** | Caminho de perfil de ferramenta versionado · blob >5 MB fora do LFS · binário sem `filter=lfs` |

**Nunca use `--no-verify` nem `SKIP_CWV_GATE=1`.** Este portão já barrou três
CVEs altos invisíveis na branch de trabalho, e uma inconsistência de roteamento
LFS introduzida na própria sessão que criou a fase 5.

Se ele reprovar, "a regra está errada" é a hipótese **menos** provável.

---

## 2. Camada de dependências

```
npm audit --audit-level=low
.venv/Scripts/python.exe -m pip_audit -r requirements.txt
```

**`pip-audit` sem `-r` audita o venv INSTALADO, não a declaração.** Essa
distinção escondeu por uma sessão inteira um `requirements.txt` que não resolvia
e um lock fixando `pillow` vulnerável.

Para auditar o `uv.lock`, consultar `api.osv.dev` com os pares `nome==versão`
extraídos do lock — a OSV inclui advisories GHSA que o `pip-audit` não cobre por
padrão.

**Transitiva:** `[tool.uv] constraint-dependencies` (Python) ou `overrides`
(npm). Nunca `override-dependencies` — *constraint* respeita o teto do pai e
falha alto; *override* atropela e produz combinações que não funcionam.

---

## 3. Roteamento de modelo — fonte única por decisão

Auditado em 2026-08-21. **Não reintroduzir fontes paralelas.**

| Decisão | Fonte única | Consumido em |
| :--- | :--- | :--- |
| Preferência por agente | `data/agents_manifest.json` → `model_preference` | `engine/llm_api.py:528`, `llm/orchestrator.py:147` |
| Cadeias de fallback | `data/system_config.json` → `model_routing` | `core/config.py` |
| Modelo concreto por agente | `llm/routing_policy.py` → `core.config.AGENT_MODEL_MAP` | resolução em `_resolver_modelos` |
| Capacidade e preço de modelo de fronteira | `llm/model_registry.py` | `llm/adapters.py` |
| Modelos locais (Ollama) | `data/ollama_models.json` | `scripts/ops/Ensure-OllamaModels.ps1` |

`data/routing_map.json` é **fallback apenas** — sombreado por `system_config`.

**Documentação não repete valor versionado.** Os 19 `.Codex/agents/*.md` são
**gerados** por `scripts/routines/sync_agents_reality.ps1`; editá-los à mão é
perda garantida na próxima sincronia. Para mudar o que aparece ali, edite o
gerador ou o manifesto.

`tests/test_desambiguacao.py` falha se qualquer uma dessas regras for revertida.

---

## 4. Revisão do código

Quando a skill `security-review` estiver disponível, rodar sobre os arquivos
alterados antes de apresentar o trabalho como concluído. **Ela exige que o
diretório de trabalho seja este repositório** — não a raiz multiprojeto, nem a
pasta do usuário.

---

## 5. Obrigação de declaração

Dizer quais verificações rodaram e quais não. Verificação não executada não é
verificação aprovada. O portão de 5 fases roda em todo commit e imprime seu
veredito — declare esse veredito.
