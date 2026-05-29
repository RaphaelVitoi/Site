---
name: Prompt de Continuidade V19
description: Estado completo sessão 20260322. Motor ICM funcional, auditoria aula-icm concluída. Próximo: página formal E/P/E.
type: project
---

# V19 — 2026-03-22

## Simulador: FUNCIONAL E LIMPO
- Motor Opção B (6 ações, equação côncava) implementado e testado (20/20)
- K.ip_check removido (era morto — ip_check é resíduo)
- Áudio completamente removido (useAudioFeedback.ts deletado, ScenarioStage e RiskGauge limpos)
- NashPanel.tsx usa CSS vars — propaga mudanças de paleta automaticamente
- Build limpo. Jest configurado (jest.config.ts + ts-jest).
- EPERM OneDrive resolvido: distDir separado por lifecycle (dev→.next, build→.next-build)

## Página aula-icm: AUDITADA E CORRIGIDA
Artefatos Gemini corrigidos:
- "Angular Drift" → "Downward Drift"
- "RP ≥ 2× BF" → "ΔRP — Vantagem de Risco (IP − OOP)"
- "folds abaixo dos 38%" → removido (sem base, direção errada)
- "O Freio Bayesiano" → "Compressão do Risco"
- "Laboratórios toy games calibrados GTO Wizard 2026" → "Âncora empírica: 93 nodes HRC vs GTO Wizard"
- Textos incoerentes no timeline corrigidos
- Pillars: framework original atribuído corretamente
- Rodapé de referências adicionado

## PRÓXIMA ETAPA: Página Formal dos Conceitos
Rota sugerida: /conceitos-icm ou /framework-icm

Estrutura acordada:
1. RP vs Bubble Factor (BF = 100/(100-RP); por que RP é preferido)
2. Expectativa Matemática
3. Perspectiva Matemática + exemplo CL
4. Esperança Matemática + equação
5. Separação ICM EV puro
6. Atribuições: Downward Drift → O'Kearney & Carter; E/P/E + RP + motor → Raphael Vitoi

Teoria completa em: memory/project_teoria_icm_perspectiva_esperanca.md
