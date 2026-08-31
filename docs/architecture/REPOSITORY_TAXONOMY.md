---
id: taxonomia-canonica-de-documentacao-e-relatorios
tipo: especificacao
escopo: Site
ecossistema: gemini-antigravity
autor: claude@opus-5
criado_em: 2026-08-31T03:42:00-03:00
atualizado_em: 2026-08-31T03:42:00-03:00
commit: 3e82d1ab
classes: [interno, canonico]
caminhos:
  - CLAUDE.md
  - scripts/ops/record_index.py
  - scripts/ops/record_gate.py
  - reports/
  - docs/
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  data: 2026-08-31
  diretorios_canonicos: 4
  validacao_portao: record_gate
verificado:
  - taxonomia formalizada e alinhada ao record_index.py (docs e reports)
  - esquemas de frontmatter validados e compatíveis com pre-commit gate
nao_verificado:
  - nenhuma modificacao destrutiva em arquivos legados
supersede: null
---

# TAXONOMIA CANÔNICA DE DOCUMENTAÇÃO, RELATÓRIOS E MEMÓRIA

## 1. Estrutura Canônica de Diretórios

Para eliminar qualquer ambiguidade, duplicidade de fontes ou fragmentação de documentação, o repositório define **4 diretórios canônicos especializados**:

```text
.
├── reports/                  # Registros situados no tempo, auditorias, postulados e handoffs oficiais
├── docs/                     # Documentação canônica permanente, guias, specs e arquitetura viva
│   ├── architecture/         # Topologias, fluxos Mermaid e contratos de infraestrutura
│   ├── specs/                # Especificações funcionais e contratos de interface
│   ├── guides/               # Manuais operacionais, workflows e onboarding
│   └── math/                 # Formalismo de Teoria dos Jogos, PMev e Teoremas de Vitoi
├── .claude/agent-memory/     # Memória episódica e contextual viva dos 19 agentes
└── data/                     # Catálogos estruturados JSON e configurações de sistema
```

---

## 2. Divisão de Responsabilidades e Convenções de Nomenclatura

### 2.1. Diretório `reports/` (Registros e Auditorias Oficiais)

- **Natureza:** Documentos datados e situados no tempo. Registram o que foi medido, validado ou planejado em momentos específicos.
- **Padrões de Nomenclatura Obrigatórios:**
  - `AUDITORIA-YYYY-MM-DD-<slug>.md` — Auditorias técnicas e de segurança.
  - `VALIDACAO-YYYY-MM-DD-<slug>.md` — Relatórios empíricos de validação.
  - `POSTULADO-XXX-<slug>.md` — Postulados de teste e integridade.
  - `HANDOFF-YYYY-MM-DD-<slug>.md` — Passagens formais de bastão e sessões.
  - `PLANO-XXX-<slug>.md` — Planos arquiteturais e de curadoria estrutural.
- **Regra de Ouro:** **Obrigatório** conter frontmatter YAML com os 13 campos canônicos verificados por [`scripts/ops/record_gate.py`](file:///c:/Users/rapha/.gemini/Site/scripts/ops/record_gate.py).

### 2.2. Diretório `docs/` (Conhecimento Permanente e Arquitetura Viva)

- **Natureza:** Documentação viva e duradoura do repositório. Descreve como o sistema opera hoje.
- **Estrutura de Subdiretórios:**
  - `docs/architecture/`: Diagramas de blocos, microsserviços, topologia de clusters.
  - `docs/specs/`: Especificações de componentes e interfaces de usuário.
  - `docs/guides/`: Guias práticos, atalhos de CLI e comandos do Dashboard.
  - `docs/math/`: Demonstrações de convexidade, axiomas e equidades de poker.

### 2.3. Diretório `.claude/agent-memory/` (Memória Viva dos Agentes)

- **Natureza:** Armazenamento dinâmico consumido pelo motor RAG e pelo runtime de inferência.
- **Arquivos Canônicos:**
  - `.claude/agent-memory/<agente>/MEMORY.md` — Aprendizados curados de cada um dos 19 agentes.
  - `.claude/agent-memory/chico/HANDOFF_LATEST.md` — Handoff ativo imediato.

### 2.4. Diretório `data/` (Catálogos Estruturados e Metadados)

- **Natureza:** Arquivos JSON tipados para parametrização do ecossistema.
- **Arquivos Canônicos:** `system_config.json`, `routing_map.json`, `agents_manifest.json`, `SYSTEM_OPERATIONS_MANIFEST.json`.
