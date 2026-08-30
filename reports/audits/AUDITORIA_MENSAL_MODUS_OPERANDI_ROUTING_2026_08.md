---
id: auditoria-mensal-modus-operandi-routing-2026_08
tipo: auditoria
escopo: Site
ecossistema: gemini-antigravity
autor: sota-routine-daemon@scripts/routines/audit_monthly_modus_operandi_and_routing.py
criado_em: 2026-08-30T13:02-03:00
atualizado_em: 2026-08-30T13:20-03:00
commit: ba052a19
classes: [interno, externo, medido]
fontes:
  - {fonte: llm/model_registry.py, consultado_em: 2026-08-30T13:02-03:00, versao_alvo: local}
  - {fonte: llm/routing_policy.py, consultado_em: 2026-08-30T13:02-03:00, versao_alvo: local}
  - {fonte: data/agents_manifest.json, consultado_em: 2026-08-30T13:02-03:00, versao_alvo: local}
ttl_dias: 90
config_medida:
  python: '3.14.6'
  modelos_auditados: 5
  rotas_declaradas: 8
  rotas_suspeitas: 0
  agentes_resolvidos: 19
verificado:
  - "resolucao de 5 de 5 modelos das camadas no MODEL_REGISTRY"
  - "cobertura de roteamento: 19 agentes e 15 subagentes"
  - "AGENT_MODEL_MAP resolvido com 19 agentes"
  - "ancoras de capacidade das 8 rotas contra TTL de 90 dias"
  - "presenca em disco de 3 de 3 manuais de governanca"
  - "gatilho de ROI condicional Pro vs Flash nos dois ramos de decisao"
nao_verificado:
  - "nenhuma chamada real a provedor de LLM foi feita: as chaves deste ambiente estao revogadas. Preco e capacidade vem do registro local, nao do fornecedor."
  - "llm/model_registry.py NAO foi reconferido contra a documentacao oficial dos fornecedores; esta rotina le o registro, nao a fonte primaria."
  - "a checagem dos manuais e por SUBSTRING ('CAMADA 1', 'MCP'): prova que o texto existe, nao que a arquitetura descrita esta correta ou vigente."
  - "as rotas suspeitas foram CONTADAS, nao revalidadas: reconsulta ao fornecedor e ato humano e continua pendente."
supersede: null
---
# RELATORIO DE AUDITORIA MENSAL: MODUS OPERANDI & ROUTING SOTA v8.0 GOLD

> **Data de Execucao:** 2026-08-30 13:02:52
> **Mes de Referencia:** 2026_08
> **Status Global:** **APROVADO**
> **Auditor Responsavel:** Chico / SOTA Routine Daemon

---

## 1. RESUMO EXECUTIVO

- **Total de Agentes Cobertos:** 19 agentes / 15 tiers de subagente
- **Mapa Concreto Ativo:** 19 agentes operando sem fallbacks orfaos
- **Validacao de Gatilho de ROI (Gemini 3.1 Pro vs. 3.7 Flash):** Aprovado e calibrado
- **Ancoras de Rota:** 8 de 8 dentro do TTL de 90 dias
- **Status dos Manuais de Modus Operandi:** 0 de 3 sincronizados com a Arquitetura de 4 Camadas

---

## 2. CONFORMIDADE DAS 4 CAMADAS FUNCIONAIS

| Modelo | Camada | Context Window | Max Output | Preco In/Out ($/1M) | Thinking | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `gemini-3.5-flash-lite` | camada_1_triagem | 1,048,576 | 65,536 | $0.15 / $0.60 | `low` | OK |
| `gemini-3.5-flash` | camada_1_triagem | 1,048,576 | 65,536 | $0.35 / $1.50 | `high` | OK |
| `gemini-3.6-flash` | camada_1_triagem | 1,048,576 | 65,536 | $0.50 / $2.50 | `high` | OK |
| `gemini-3.7-flash` | camada_2_agente_principal | 1,048,576 | 65,536 | $0.75 / $3.75 | `high` | OK |
| `gemini-3.1-pro` | camada_3_raciocinio_profundo | 2,000,000 | 65,536 | $2.00 / $10.00 | `high` | OK |

---

## 3. AUDITORIA DE MANUAIS E GOVERNANCA

| Arquivo | Presente | Tamanho | 4 Camadas | Barramento MCP |
| :--- | :--- | :--- | :--- | :--- |
| `MODUS_OPERANDI.md` | Sim | 40028 B | Sim | Sim |
| `Site/MODUS_OPERANDI.md` | Sim | 15171 B | Sim | Sim |
| `Site/docs/ARQUITETURA_PADRAO_OURO_SOTA_2026.md` | Sim | 8990 B | Sim | Sim |

---

## 4. ALERTAS E RECOMENDACOES PARA O PROXIMO MES

- **Zero inconformidades detectadas.** O ecossistema opera no Padrao-Ouro termodinamico.

### 4.1 Ancoras de capacidade das rotas (TTL 90 dias)

Nenhuma das 8 rotas venceu o TTL na data desta execucao (2026-08-30). As ancoras declaradas em `llm/routing_policy.py` seguem dentro do prazo.

> Ausencia de rota vencida NAO e prova de que a tabela esta atual: o TTL de 90 dias e palpite declarado sobre o intervalo entre releases de fronteira, nao medicao. Ver `TTL_ROTA_DIAS` em `llm/routing_policy.py`.

---
*Relatorio gerado automaticamente pela Rotina de Auditoria Mensal SOTA v8.0 GOLD sob governanca de Raphael Vitoi.*
