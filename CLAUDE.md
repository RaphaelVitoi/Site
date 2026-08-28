# Governança — projeto `Site`

**Escopo:** este arquivo vale para **`C:\Users\rapha\.gemini\Site`** e nada além.
Regras que valem para todos os projetos ficam em `..\CLAUDE.md`, na raiz
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

**Documentação não repete valor versionado.** Os 19 `.claude/agents/*.md` são
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

---

## 6. Diretrizes de manutenção contínua

Incorporadas de `AGENTS.md` em 2026-08-28, onde tinham sido escritas em
2026-08-26. Aquele arquivo era um fork deste e virou ponteiro — ver §7.

1. **Invariância de testes, tolerância zero.** A suíte fica inteiramente verde.
   Toda funcionalidade nova traz seus mocks herméticos.
   **A contagem não mora aqui.** A redação original dizia "395/395"; quando isto
   foi incorporado a suíte tinha 447, e o número em prosa já estava errado havia
   dias sem que nada acusasse. Contagem é medição, e medição vive no portão que
   a executa — este documento declara a *regra*, não o *valor*.
2. **Sanitização de warnings.** O pre-commit e o CI rejeitam build que introduza
   warning novo no pytest. O `conftest.py` deriva a contagem do hook
   `pytest_warning_recorded`; é a fonte, e é honesta.
3. **Controle de roteamento.** O limiar do `ComplexityAnalyzer` (Edge × Cloud) é
   calibrado periodicamente para manter o tráfego local entre 60% e 70%.
4. **Imutabilidade de encoding.** Todo `.ps1` criado ou modificado preserva
   UTF-8 **com** BOM (`utf-8-sig`), exigência do PowerShell 5.1. BOM **único**:
   dois BOMs quebram o parse nas duas versões do PowerShell.

---

## 7. `AGENTS.md` é ponteiro, não cópia

A convenção `agents.md` é lida por outros agentes (Codex, Cursor), então o
arquivo continua existindo — mas **como ponteiro para este documento**, nunca
como segunda cópia.

Motivo medido: entre 2026-08-24 e 2026-08-26 o `AGENTS.md` existiu como fork
deste arquivo e divergiu em três pontos. Dois eram referências mortas nascidas
de um search-replace `claude`→`Codex`: apontava para `..\AGENTS.md`, que não
existe, e afirmava que os 19 documentos de agente ficam em `.Codex/agents/`,
quando `sync_agents_reality.ps1:54` os escreve em `.claude/agents/`. O terceiro
era a §6 acima — conteúdo real, preservado aqui.

**Dois dias de coexistência produziram duas mentiras.** Não reabrir a cópia.
`tests/test_governanca_agents.py` reprova se o `AGENTS.md` voltar a crescer.
