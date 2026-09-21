# Aceite de Risco — chromadb 1.5.9 (5 advisories sem correção)

**Data:** 2026-09-20
**Analista:** Solar-Pro4 [Tier 2]
**Record-Id:** registro-2026-09-20-chromadb-aceite-risco

---

## Advisories Identificadas (pip-audit -r requirements.txt)

| ID | CVE | Descrição | Fix disponível? |
|----|-----|-----------|-----------------|
| PYSEC-2026-311 | CVE-2026-45829, GHSA-f4j7-r4q5-qw2c | Injecção de código **pré-autenticação** no servidor HTTP `/api/v2/tenants/{tenant}/databases/{db}/collections` com `trust_remote_code=true` | NÃO |
| PYSEC-2026-3814 | CVE-2026-45833, GHSA-36p7-vc44-83pf | Injecção de código **autenticada** no servidor HTTP `/api/v2/tenants/default_tenant/databases/default_database/collections/{collection_id}` com `UPDATE_COLLECTION` | NÃO |
| PYSEC-2026-3813 | CVE-2026-45830, GHSA-2wm9-hf6c-p5cr | Falta de validação de autorização: qualquer usuário autenticado pode ler/escrever/atualizar/apagar dados de **qualquer tenant** | NÃO |
| PYSEC-2026-3815 | CVE-2026-45831, GHSA-xph7-9rjv-w5fr | SimpleRBACAuthorizationProvider não checa qual tenant/db/collection o permission se aplica — ação cross-tenant | NÃO |

**Total:** 4 advisories únicos (o pip-audit repassa PYSEC-2026-311 duas vezes, totalizando 5 linhas no relatório). Versão analisada: **chromadb 1.5.9** — versão mais recente do PyPI (2026-05-05).

---

## Análise de Explorabilidade no Contexto do Projeto

### O projeto NÃO expõe o servidor chromadb

Todos os 4 advisories atingem exclusivamente o **servidor HTTP do chromadb** (`chroma run` ou `HttpClient` com API REST). O projeto usa exclusivamente:

```python
chromadb.PersistentClient(path=db_path)  # Armazenamento local em disco
```

**Verificações realizadas (2026-09-20):**
- [x] Nenhum `chromadb.HttpClient` no codebase
- [x] Nenhum `chroma run` no codebase
- [x] Nenhuma porta em escuta do chromadb
- [x] O `PersistentClient` opera puramente em arquivos locais (SQLite/JSON)

### Impacto: NULO para este projeto

| Advisory | Explorável com PersistentClient? |
|----------|----------------------------------|
| PYSEC-2026-311 (pre-auth code injection via HTTP) | **NÃO** — não há servidor HTTP |
| PYSEC-2026-3814 (auth code injection via HTTP) | **NÃO** — não há servidor HTTP |
| PYSEC-2026-3813 (cross-tenant authorization) | **NÃO** — não há múltiplos tenants nem servidor |
| PYSEC-2026-3815 (SimpleRBAC cross-tenant) | **NÃO** — não há servidor HTTP nem RBAC |

**Conclusão:** As 4 advisories são **inalcanáveis** no contexto deste projeto. O `pip-audit` as reporta porque o pacote está instalado, mas são false positives funcionais.

---

## Decisão de Aceite

**Aceite o risco** com as seguintes condições:

1. **Nunca migrar para `chromadb.HttpClient` ou subir `chroma run`** sem antes confirmar que as advisories foram corrigidas pelo upstream. Essa migração tornaria as 4 vulnerabilidades alcançáveis de uma vez.

2. **Manter o chromadb como dependência** porque:
   - O `MemoryRAG` usa `chromadb.PersistentClient` como backend primário (banco de memória dos agentes)
   - O `ingest_drive_pdfs` usa `langchain_community.vectorstores.Chroma` para ingestão de PDFs
   - O `LanceDB` está disponível como alternativa mas requer refatoração para substituir totalmente o chromadb

3. **Monitorar o upstream** para quando uma versão corrigida for lançada. Quando disponível, atualizar imediatamente.

4. **Alternativa futuro:** Quando o upstream lançar correção, avaliar migração total para `LanceDB` como backend único, eliminando a dependência do chromadb.

---

## Ação Tomada

- [x] `pyproject.toml`: Atualizado o bloco de segurança com todos os 4 advisories listados nominalmente, com CVE IDs
- [x] `pyproject.toml`: Revisado o texto "QUATRO" → "CINCO" (contagem de linhas no pip-audit), "AS QUATRO" → "AS CINCO", data 2026-08-30 → 2026-09-20
- [x] `pyproject.toml`: Adicionado comentário na linha do `lancedb` sobre a relação de mitigação
- [x] Este arquivo: Criação do registro formal de aceite de risco

**Status:** ACEITO — risco inalcanável, documentado, condicionado a não expor servidor HTTP.
