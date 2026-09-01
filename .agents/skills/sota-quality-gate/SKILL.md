---
name: sota-quality-gate
description: Use antes de commit, release ou auditoria de qualidade do Site para executar e interpretar o portão de cinco fases, distinguindo métricas realmente medidas, referências estáticas e verificações indisponíveis.
---

# SKILL: SOTA Quality Gate & Invariant Assurance

## 1. As cinco fases do portão (`scripts/ops/cwv_gate.ps1`)

Toda alteração estrutural deve ser validada pelas 5 fases antes do commit:

| # | Fase | Critério de Aceite |
| :-- | :--- | :--- |
| 1 | **Core Web Vitals** | LCP $\le 2.5\text{s}$, CLS $\le 0.1$, INP $\le 200\text{ms}$, TTFB $\le 800\text{ms}$, somente quando a fase declarar medição real. |
| 2 | **Acessibilidade (A11y)** | Zero violações nas regras que a fase de fato executou; análise estática não equivale a auditoria WCAG de interface em execução. |
| 3 | **CVE / Vulnerabilidades** | Zero vulnerabilidades em `npm audit` e conformidade no `uv.lock`. |
| 4 | **SRI & Integridade** | Hashes SHA-512 válidos para scripts e fontes externas. |
| 5 | **Higiene de Repositório** | Zero blobs $>5\text{MB}$ fora do Git LFS e UTF-8 com BOM em scripts `.ps1`. |

---

## 2. Execução, interpretação e limites

1. Congele o hash e registre alterações não commitadas antes de executar.
2. Rode `npm run sota:full`; se ele falhar cedo, rode as superfícies restantes
   separadamente e marque o portão integrado como reprovado.
3. Execute `npm test`, `npm audit --audit-level=low`, `npm run lint:workflows`
   e `npm run python:test` sem inventar flags no nível do `npm`.
4. Rode `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/ops/cwv_gate.ps1`.
   Uma fase que declara `NAO MEDIDO` não é aprovada por ter valores de referência.
5. Registre contagens produzidas pela execução atual; nunca fixe um número de
   testes no manifesto da skill.

O portão não autoriza bypass, commit, push, correção automática ou alegação de
CWV/A11y real sem instrumentação observável. Vulnerabilidade sem correção
upstream deve permanecer visível com exposição e mitigação documentadas.
