# Plano de Implementação da Auditoria SOTA (Frontend)

## 🎯 Objective

 Implementar as recomendações críticas da auditoria frontend (SOTA v4.2) baseadas nos princípios de Acessibilidade de Fricção          ││     Zero, Economia de Shannon (linting) e Antevisão Arquitetural (desacoplamento).

## 📂 Key Files & Context

`frontend/src/app/globals.css`           `frontend/src/components/ui/Button.tsx`        `frontend/.eslintrc.json`
`frontend/src/components/simulator/MasterSimulator.tsx` `frontend/src/components/simulator/SotaContext.tsx`

## 🛠️ Implementation Steps

│ 1. Injetar `focus-visible` em `globals.css` e no componente `Button.tsx`.                                            2. Remover supressão de entidades não escapadas do `.eslintrc.json`.                                           3. Extrair a interface e o Provider `SotaEcosystemContext` do `MasterSimulator.tsx` para `SotaContext.tsx`.
