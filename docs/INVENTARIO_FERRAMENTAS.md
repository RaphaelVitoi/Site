#  Inventario de Ferramentas Interativas (State of the Art)
> **Atencao Agentes:** Este mapa e a fonte de verdade para features de frontend/interatividade. Consulte ANTES de propor novas funcionalidades para evitar redundancia.

---

## 1. Ativas (Em Producao)

### 1.1 Simulador de Toy-Games (V1)
- **Localizacao:** `components/interactive/icm_toy_game_simulator.html`
- **Stack:** Vanilla HTML / Tailwind via CDN / Vanilla JS / ApexCharts
- **Proposito:** Prototipo didatico embutido na `aula-icm.html`. Ilustra o "Downward Drift" e "Teto de RP" usando 8 cenarios pre-fixados de Nash.
- **Status:** Concluido, altamente polido visualmente. Referencia de ouro para design UI/UX.

---

## 2. Em Planejamento / Construcao

### 2.1 Laboratorio de ICM Universal (V2)
- **Localizacao Planejada:** `frontend/src/app/tools/icm/`
- **Stack Planejada:** Next.js (App Router), React, TypeScript, Tailwind, Recharts.
- **Proposito:** Calculadora universal recursiva (calcula $EV para qualquer stack/premiacao).
- **Referencias:** Baseia-se no design e logica extraidos da V1.
- **Status:** PRD e SPEC gerados. Aguardando execucao pelo `@implementor`.
