# 🔍 ANÁLISE DE FUSÃO: .CLAUDE ↔ .CEREBRO

**Data:** 2026-09-01  
**Protocolo:** Chico SOTA v8.0 GOLD  
**Escopo:** Análise comparativa de duplicatas entre `.claude/` e `.cerebro/` para fusão curada

---

## 📊 MAPEAMENTO DE ESTRUTURAS

### Fonte de Verdade (Segundo Governança CLAUDE.md §3)

**Sistema Canônico:**
- **Manifesto:** `data/agents_manifest.json` → Fonte única de definição de agentes
- **Gerador:** `scripts/routines/sync_agents_reality.ps1` → Gera `.claude/agents/*.md`
- **Alvo:** `.claude/agents/` (minúsculo) → Perfis dos agentes (GERADOS AUTOMATICAMENTE)
- **Memória:** `.claude/agent-memory/` (minúsculo) → Memórias individuais

**Observação Crítica:** Governança declara que editar `.claude/agents/*.md` manualmente é perda garantida na próxima sincronia.

---

## 🔍 DUPLICATAS IDENTIFICADAS

### 1. Perfis de Agentes

| Local | Caso | Tamanho | Motor Base | Status |
|-------|------|---------|------------|--------|
| `.claude/agents/` | minúsculo | 19 arquivos | "roteado dinamicamente" | ✅ CANÔNICO (gerado) |
| `.claude/AGENTS/` | MAIÚSCULO | 19 arquivos | gemini-3.7-flash | ❌ DUPLICATA |
| `.cerebro/agents/` | minúsculo | 19 arquivos | gemini-3.7-flash | ❌ DUPLICATA |

**Análise Comparativa (Exemplo: architect.md):**

**Canônico (`.claude/agents/architect.md`):**
```markdown
**Motor Base:** roteado dinamicamente — ver `data/agents_manifest.json` (preferencia) e `llm/routing_policy.py` (modelo concreto)

## Skills Especializadas
- `sota-tactical-orchestrator-nanostack`
- `gcp-cloud-data-orchestration-master`
- `gcp-bigquery-lakehouse-master`
- `flutter-apply-architecture-best-practices`

## Scripts & Ferramentas Integradas
- `core/arbitrator.py`
- `core/sota_context_engine.py`
```

**Duplicata `.claude/AGENTS/architect.md`:**
```markdown
**Motor Base:** gemini-3.7-flash
[Sem seção de skills ou scripts]
```

**Duplicata `.cerebro/agents/architect.md`:**
```markdown
**Motor Base:** gemini-3.7-flash
[Sem seção de skills ou scripts]
```

**Conclusão:** `.claude/agents/` é mais rico (skills + scripts) e segue governança (motor dinâmico). As outras duas são cópias simplificadas/estáticas.

### 2. Memórias de Agentes

| Local | Caso | Tamanho | Status |
|-------|------|---------|--------|
| `.claude/agent-memory/` | minúsculo | 19 agentes + ChromaDB | ✅ CANÔNICO |
| `.claude/AGENTS-MEMORY/` | MAIÚSCULO | 19 agentes + ChromaDB | ❌ DUPLICATA |
| `.cerebro/agent-memory/` | minúsculo | 19 agentes + ChromaDB | ❌ DUPLICATA |

**Comparação de Tamanho (Exemplo: architect):**
- `.claude/agent-memory/architect/MEMORY.md`: 55 linhas
- `.claude/AGENTS-MEMORY/architect/MEMORY.md`: 55 linhas (idêntico)
- `.cerebro/agent-memory/architect/MEMORY.md`: 55 linhas (idêntico)

**Conclusão:** Conteúdo idêntico, mas triplicado. Apenas uma fonte deve ser canônica.

### 3. Outras Estruturas Duplicadas

| Estrutura | `.claude/` | `.cerebro/` | Relação |
|-----------|------------|-------------|---------|
| Archive | `.ARQUIVE/` | `archive/` | Idêntico (legado) |
| Architecture | `ARQUITETURA/` | `architecture/` | Idêntico |
| Governance | `GOVERNANÇA/` | `governance/` | Idêntico |
| Deploy | `DEPLOY/` | `ops-deploy/` | Idêntico |
| Philosophy | `ESSENCIA MORAL/` | `philosophy/` | Idêntico |
| Reports | `RELATORIOS/` | `reports/` | Idêntico |

---

## 🎯 ESTRATÉGIA DE FUSÃO

### Princípios da Governança

1. **Fonte Única de Verdade:** `data/agents_manifest.json` é a fonte de definição
2. **Geração Automática:** `.claude/agents/` é gerado por script, não editável manualmente
3. **Nomes de Pastas:** Usar minúsculas (convenção moderna, compatibilidade multi-OS)
4. **Centralização:** Sistema deve se alimentar de UMA fonte, não múltiplas

### Plano de Ação

#### Fase 1: Decisão de Fonte Canônica

**Questão:** Qual sistema deve ser a fonte única?

**Opção A:** `.claude/` (seguindo governança CLAUDE.md)
- ✅ Já documentado como canônico
- ✅ Script de sincronização existe
- ✅ Integração com sistema de routing de modelos
- ❌ Nomes de pastas mistos (maiúsculas/minúsculas)

**Opção B:** `.cerebro/` (ecossistema SOTA)
- ✅ Nomes de pastas consistentes (minúsculas)
- ✅ Documentação recentemente atualizada v8.0 GOLD
- ✅ Índices de memória integrados
- ❌ Não mencionado em governança CLAUDE.md
- ❌ Perfis estáticos (motor fixo em vez de dinâmico)

**Recomendação:** **Opção A** - `.claude/` como fonte canônica, mas:
1. Padronizar nomes de pastas para minúsculas
2. Remover duplicatas `.claude/AGENTS/` e `.claude/AGENTS-MEMORY/`
3. Avaliar se `.cerebro/` traz conteúdo único que não existe em `.claude/`

#### Fase 2: Curadoria de Conteúdo

**Passo 1:** Comparar cada arquivo duplicado para identificar conteúdo único
**Passo 2:** Mergear conteúdo único de `.cerebro/` para `.claude/` se aplicável
**Passo 3:** Atualizar referências de paths após fusão
**Passo 4:** Remover duplicatas consolidadas

#### Fase 3: Atualização de Referências

**Arquivos que precisam atualização:**
- `sync_agents_reality.ps1` - se mudar path canônico
- Scripts de RAG que apontam para `agent-memory/`
- Qualquer hardcode de paths nos arquivos de governança

---

## ⚠️ RISCOS E PRECAUÇÕES

### Risco 1: Quebra de Integração Existente
- **Mito:** "Nada consome essas pastas"
- **Verificação:** Grepear por paths antes de remover
- **Mitigação:** Backup prévio e verificação de consumidores

### Risco 2: Perda de Conteúdo Único
- **Risco:** `.cerebro/` pode ter documentação atualizada v8.0 que `.claude/` não tem
- **Mitigação:** Comparação arquivo a arquivo antes de fusão
- **Validação:** Audit logs recentes em `.cerebro/audit_logs/`

### Risco 3: Incompatibilidade com Runtime
- **Risco:** Sistema atual pode estar hardcoded para paths específicos
- **Mitigação:** Testar após fusão
- **Rollback:** Manter backup por período de quarentena

---

## 📋 PRÓXIMOS PASSOS SUGERIDOS

1. ✅ **Análise Completa Realizada** (este documento)
2. ⏭️ **Comparação Arquivo a Arquivo** - Identificar conteúdo único em cada duplicata
3. ⏭️ **Decisão de Fonte Canônica** - Confirmar com usuário qual sistema preferir
4. ⏭️ **Curadoria e Merges** - Transferir conteúdo único para fonte canônica
5. ⏭️ **Atualização de Referências** - Corrigir paths em scripts e documentação
6. ⏭️ **Remoção de Duplicatas** - Deletar arquivos consolidados
7. ⏭️ **Validação** - Testar sistema após fusão

---

**Status:** Análise preliminar completada  
**Próxima Ação:** Aguardar decisão do usuário sobre fonte canônica preferida  
**Estimativa de Esforço:** Fusão completa ~2-3 horas (dependendo de volume de conteúdo único)
