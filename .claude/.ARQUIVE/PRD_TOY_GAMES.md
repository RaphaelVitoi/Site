# PRD: Toy Games - A Dinamica Predador/Presa

> **Autor:** @planner | **Origem:** Ideacao @maverick | **Data:** 2026-03-13
> **Status:** Especificacao Tecnica

---

## 1. O Conceito

O objetivo e criar cenarios didaticos extremos ("Toy Games") que isolem a mecanica de **Risk Premium Assimetrico**. Queremos que o aluno sinta a impunidade de agredir quando o oponente esta paralisado pelo ICM.

**Definicao "Predator Mode":**
- **Hero (IP):** Risk Premium < 25% (Liberdade de agressao).
- **Villain (OOP):** Risk Premium > 40% (Paralisia/Death Zone).
- **Resultado:** O IP ganha uma "Licenca para Matar", podendo shovar com lucro quase 100% de duas cartas quaisquer (ATC).

---

## 2. Cenarios Propostos

### Cenario A: "O Franco-Atirador" (Blind War Extrema)
- **Contexto:** Mesa Final, 4-handed.
- **Setup:**
  - **Hero (SB):** 50bb (Chipleader). RP: 12%.
  - **Villain (BB):** 12bb (Short Stack). RP: 45%.
  - **Outros:** 8bb e 9bb (folding).
- **Licao:** O BB nao pode pagar com quase nada porque cair antes dos stacks de 8bb/9bb e catastrofico. O Hero deve shovar **100% do range**.

### Cenario B: "O Bully do Botao"
- **Contexto:** Bolha do ITM.
- **Setup:**
  - **Hero (BTN):** 80bb.
  - **Villain (SB):** 20bb.
  - **Villain (BB):** 18bb.
- **Mecanica Visual:** O medidor do Hero deve brilhar em **Verde (Predator)**, enquanto os medidores dos blinds brilham em **Vermelho (Death Zone)**.

---

## 3. Requisitos Tecnicos

### 3.1. Engine (NashSolver)
- Garantir que o solver aceite RPs extremos sem quebrar (ja implementado com `Math.max`).
- Validar se a heuristica de "overbluff" esta agressiva o suficiente nestes casos.

### 3.2. Interface (UI)
- **Gatilho Sonoro:** Implementar som de "Radar Lock" quando o cenario carregar em modo Predador.
- **Feedback Visual:** Icone de mira (`fa-crosshairs`) sobre o stack do oponente.

---

## 4. Riscos e Mitigacao

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Aluno achar que isso vale para Cash Game | Alto (Erro conceitual) | Adicionar warning "ICM ONLY" piscante. |
| Solver linear subestimar o shove ATC | Medio | Ajustar `agressionFactor` para 1.5x nestes cenarios. |

---
