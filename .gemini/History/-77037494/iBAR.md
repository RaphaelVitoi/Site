# PRD: Toy Games - A Dinâmica Predador/Presa

> **Autor:** @planner | **Origem:** Ideação @maverick | **Data:** 2026-03-13
> **Status:** Especificação Técnica

---

## 1. O Conceito

O objetivo é criar cenários didáticos extremos ("Toy Games") que isolem a mecânica de **Risk Premium Assimétrico**. Queremos que o aluno sinta a impunidade de agredir quando o oponente está paralisado pelo ICM.

**Definição "Predator Mode":**
- **Hero (IP):** Risk Premium < 25% (Liberdade de agressão).
- **Villain (OOP):** Risk Premium > 40% (Paralisia/Death Zone).
- **Resultado:** O IP ganha uma "Licença para Matar", podendo shovar com lucro quase 100% de duas cartas quaisquer (ATC).

---

## 2. Cenários Propostos

### Cenário A: "O Franco-Atirador" (Blind War Extrema)
- **Contexto:** Mesa Final, 4-handed.
- **Setup:**
  - **Hero (SB):** 50bb (Chipleader). RP: 12%.
  - **Villain (BB):** 12bb (Short Stack). RP: 45%.
  - **Outros:** 8bb e 9bb (folding).
- **Lição:** O BB não pode pagar com quase nada porque cair antes dos stacks de 8bb/9bb é catastrófico. O Hero deve shovar **100% do range**.

### Cenário B: "O Bully do Botão"
- **Contexto:** Bolha do ITM.
- **Setup:**
  - **Hero (BTN):** 80bb.
  - **Villain (SB):** 20bb.
  - **Villain (BB):** 18bb.
- **Mecânica Visual:** O medidor do Hero deve brilhar em **Verde (Predator)**, enquanto os medidores dos blinds brilham em **Vermelho (Death Zone)**.

---

## 3. Requisitos Técnicos

### 3.1. Engine (NashSolver)
- Garantir que o solver aceite RPs extremos sem quebrar (já implementado com `Math.max`).
- Validar se a heurística de "overbluff" está agressiva o suficiente nestes casos.

### 3.2. Interface (UI)
- **Gatilho Sonoro:** Implementar som de "Radar Lock" quando o cenário carregar em modo Predador.
- **Feedback Visual:** Ícone de mira (`fa-crosshairs`) sobre o stack do oponente.

---

## 4. Riscos e Mitigação

| Risco | Impacto | Mitigação |
|-------|---------|-----------|
| Aluno achar que isso vale para Cash Game | Alto (Erro conceitual) | Adicionar warning "ICM ONLY" piscante. |
| Solver linear subestimar o shove ATC | Médio | Ajustar `agressionFactor` para 1.5x nestes cenários. |

---