---
name: google-jules-cloud
description: Runbook, governanca e ponte de execucao para o Google Jules Cloud (jules.google.com). Use ao despachar tarefas assincronas em VMs descartaveis na nuvem (otimizacoes noturnas Bolt, refatoracoes em massa, geracao de testes), inspecionar sessoes e atividades, aprovar planos via MCP e sincronizar telemetria em JULES_REPORT.md sob o plano Jules in Pro.
---

# SKILL: Google Jules Cloud — Orquestração Assíncrona & Engenharia em Nuvem

> **Plataforma Oficial:** [jules.google.com](https://jules.google.com/)  
> **API REST v1alpha:** `https://jules.googleapis.com/v1alpha`  
> **Módulo Canônico:** [`engine/jules_bridge.py`](file:///c:/Users/rapha/.gemini/Site/engine/jules_bridge.py)  
> **Relatório Dinâmico:** [`JULES_REPORT.md`](file:///c:/Users/rapha/.gemini/Site/JULES_REPORT.md)  
> **Sincronizador Oficial:** [`scripts/ops/sync_jules_report.py`](file:///c:/Users/rapha/.gemini/Site/scripts/ops/sync_jules_report.py)  
> **Governança:** Protocolo Master Chico SOTA v8.0 GOLD (Seção X — Jules Cloud MCP Bridge)

---

## 1. Alinhamento de Produção — a escolha é na UI, não pelo portão MCP

> **O MODELO NÃO É CONFIGURÁVEL POR REQUISIÇÃO, E ESTA SKILL NÃO O ROTEIA.**
>
> **Mesmo padrão do Stitch** (Tier 0, 2026-09-04): o seletor de modelo existe e é
> do operador, mas vive nas **preferências da interface**
> ([jules.google.com/settings/general](https://jules.google.com/settings/general)) —
> não no portão de entrada.
>
> Medido em 2026-09-04 nos dois lados da fronteira. A `createSession` da API
> v1alpha aceita `prompt`, `title`, `sourceContext`, `requirePlanApproval` e
> `automationMode`; as ferramentas do MCP `google-jules` aceitam `source`,
> `prompt`, `branch` e `auto_approve_plan`. Nenhuma das duas expõe seleção de
> modelo.
>
> A versão anterior desta seção trazia uma matriz de roteamento e um exemplo
> passando `model=...` para `JulesSessionRequest`. Aquele exemplo lançaria
> `TypeError`: a dataclass é `frozen/slots` e nunca teve o campo. Instrução de
> automação que não alcança mecanismo é promessa ao operador, e foi retirada por
> ordem do Tier 0.
>
> Para trocar o modelo do Jules, use as preferências da própria plataforma.

### Configuração da Conta & Cotas
- **Assinatura:** `Jules in Pro` (Workflows intensivos contínuos)
- **Teto Operacional:** Até **100 sessões concorrentes por dia** para o repositório `RaphaelVitoi/Site`.
- **Credenciais:** Chave `JULES_API_KEY` persistida em `HKCU:\Environment:JULES_API_KEY` (Pure ASCII, zero plaintext no Git).

---

## 2. Topologia Operacional Autopoiética (Ciclo Diário Não-Concorrente)

O ecossistema opera sob estrita **não-concorrência** e **isolamento térmico**:

```mermaid
flowchart TD
    subgraph Nuvem["☁️ Google Cloud VM (Jules Assíncrono)"]
        Cron["⏰ Cron Noturno (03:20 UTC)\nPersona 'Bolt ⚡'"]
        Task["🎯 Tarefas Sob Demanda"]
        Clone["📦 git clone --recursive\n(Ambiente Hermético /app)"]
        Exec["⚙️ Execução de Otimizações & Testes"]
        Diff["📄 Emissão de Diff / Pull Request"]
        Cron --> Clone --> Exec --> Diff
        Task --> Clone
    end

    subgraph Rastreamento["📊 Sincronização & Telemetria"]
        Sync["🔄 scripts/ops/sync_jules_report.py --write"]
        Report["📑 JULES_REPORT.md Atualizado"]
        Diff -.->|Telemetria REST API| Sync --> Report
    end

    subgraph Validacao["🛡️ Homologação Local (Antigravity 2.0)"]
        Bridge["⚡ engine/jules_bridge.py (JulesClient)"]
        Gate["🧪 record_gate.py & cwv_gate.ps1 (Fase 1 a 5)"]
        Apply["✅ Merge Seguro no Workspace Local"]
        Report --> Bridge --> Gate --> Apply
    end

    classDef cloud fill:#1a2332,stroke:#3b82f6,stroke-width:2px,color:#fff;
    classDef sync fill:#1a2332,stroke:#a855f7,stroke-width:2px,color:#fff;
    classDef local fill:#111927,stroke:#10b981,stroke-width:2px,color:#fff;
    class Cron,Task,Clone,Exec,Diff cloud;
    class Sync,Report sync;
    class Bridge,Gate,Apply local;
```

---

## 3. Playbook de Invocação Rápida via Python Bridge

```python
from engine.jules_bridge import JulesClient, JulesSessionRequest

client = JulesClient()

# 1. Disparar otimizacao rapida de performance:
status = client.create_session(
    JulesSessionRequest(
        source="sources/github/RaphaelVitoi/Site",
        prompt="Bolt ⚡: Identificar e otimizar funcoes de ordenacao no frontend/src/lib/telemetry-client.ts",
        branch="master",
        auto_approve_plan=True,
    )
)
print(f"Sessao criada: {status.session_id} | Status: {status.state}")

# 2. Consultar status da sessao:
current_status = client.get_session_status(status.session_id)
print(f"Status atual: {current_status.state}")

# 3. Baixar e inspecionar o patch/diff gerado:
if current_status.state == "COMPLETED":
    diff = client.get_diff(status.session_id)
    print(f"Arquivos alterados: {diff.files_changed}")
    print(diff.diff_content)
```

---

## 4. Retorno de Investimento Diário (ROI Quantitativo & Qualitativo)

1. **Zero Sobrecarga de CPU/RAM Local:** Todas as 100 sessões possíveis rodam em contêineres Google Cloud de alta performance sem interferir no runtime do Next.js local (porta 3000) ou CDP (porta 9222).
2. **Manutenção Preventiva Autopoiética:** O cron `Bolt ⚡` atua como um sistema imunológico contínuo que poda dependências zumbis, refatora imports e previne regressões durante a noite.
3. **Auditoria em Malha Fechada:** `JULES_REPORT.md` oferece visibilidade total para auditoria imediata ao início de cada dia de trabalho.
