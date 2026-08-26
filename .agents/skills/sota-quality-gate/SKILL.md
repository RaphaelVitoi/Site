---
name: sota-quality-gate
description: Protocolo de validação de qualidade SOTA de 5 fases (CWV, A11y, CVE, SRI e Higiene de Repositório). Use ao realizar commits, auditorias pré-deploy, validação de invariantes de testes (395/395), sanitização de warnings e auditoria de vulnerabilidades em dependências.
---

# SKILL: SOTA Quality Gate & Invariant Assurance

## 1. As 5 Fases Obrigatórias do Portão (`cwv_gate.ps1`)

Toda alteração estrutural deve ser validada pelas 5 fases antes do commit:

| # | Fase | Critério de Aceite |
| :-- | :--- | :--- |
| 1 | **Core Web Vitals** | LCP $\le 2.5\text{s}$, CLS $\le 0.1$, INP $\le 200\text{ms}$, TTFB $\le 800\text{ms}$. |
| 2 | **Acessibilidade (A11y)** | Zero violações de WCAG 2.1 AA no HTML real do frontend. |
| 3 | **CVE / Vulnerabilidades** | Zero vulnerabilidades em `npm audit` e conformidade no `uv.lock`. |
| 4 | **SRI & Integridade** | Hashes SHA-512 válidos para scripts e fontes externas. |
| 5 | **Higiene de Repositório** | Zero blobs $>5\text{MB}$ fora do Git LFS e UTF-8 com BOM em scripts `.ps1`. |

---

## 2. Invariância de Testes & Sanitização

* **Teto de Falhas:** Zero absoluto ($395/395$ passing).
* **Warnings:** Tolerância zero para novos warnings no Pytest e ESLint (`--max-warnings=0`).
* **Execução Rápida:** Executar com `uv run pytest tests/` ou `powershell scripts/ops/cwv_gate.ps1`.
