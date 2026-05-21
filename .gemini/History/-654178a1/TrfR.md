# 🛠️ Inventário de Ferramentas Interativas (State of the Art)

> **Atenção Agentes:** Este mapa é a fonte de verdade para features de frontend/interatividade. Consulte ANTES de propor novas funcionalidades para evitar redundância.

---

## 1. Ativas (Em Produção)

### 1.1 Simulador de Toy-Games (V1)

- **Localização:** `components/interactive/icm_toy_game_simulator.html`
- **Stack:** Vanilla HTML / Tailwind via CDN / Vanilla JS / ApexCharts
- **Propósito:** Protótipo didático embutido na `aula-icm.html`. Ilustra o "Downward Drift" e "Teto de RP" usando 8 cenários pré-fixados de Nash.
- **Status:** Concluído, altamente polido visualmente. Referência de ouro para design UI/UX.

---

## 2. Em Planejamento / Construção

### 2.1 Laboratório de ICM Universal (V2)

- **Localização Planejada:** `frontend/src/app/tools/icm/`
- **Stack Planejada:** Next.js (App Router), React, TypeScript, Tailwind, Recharts.
- **Propósito:** Calculadora universal recursiva (calcula $EV para qualquer stack/premiação).
- **Referências:** Baseia-se no design e lógica extraídos da V1.
- **Status:** PRD e SPEC gerados. Aguardando execução pelo `@implementor`.
