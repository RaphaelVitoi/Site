---
name: Prompt de Continuidade V25
description: Estado da sessao 20260322 - fichas visuais, EP fix, pay jumps, legenda estruturas. PENDENTE: readability global ReferencialAula12
type: project
---

# Continuidade — Sessão 20260322 V25

## Ultimo commit: 49a9032
- ReferencialAula12: legenda top-heavy / flat / híbrida ao lado dos pay jumps
- Commit anterior 66a1833: fichas visuais (SB 0.5bb | BB 1bb | ANTE 1.125bb | BTN 2bb), EP fix (H:180→200), pay jumps proporcionais ao TOTAL_PRIZES

## Estado atual
- Todos os commits da sessão feitos e limpos
- Visual browser NÃO confirmado (localhost:3000)

## PENDENTE CRITICO — Próxima sessão

### ReferencialAula12: readability e layout global
**Problema**: a parte de referências (ReferencialAula12) está pequena e com problemas de readability. O usuário quer:
- Analisar a página inteira
- Entender como economizar espaço e maximizar uso de forma harmoniosa e elegante
- Evitar problemas de readability que existem agora
- A legenda top-heavy/flat/híbrida foi adicionada mas o layout como um todo precisa de revisão

**Arquivo**: `frontend/src/components/simulator/ReferencialAula12.tsx`
- Componente renderizado dentro de `<details>` (colapsável) na página `/tools/simulador`
- Contém: Board + RP | Table Draw + Prize Structure | Ranges (BTN/BB 13x13) | BF+RP matrix

**Abordagem sugerida**:
1. Ler o arquivo completo (é grande, usar offset/limit)
2. Identificar onde espaço é desperdiçado vs onde texto é pequeno demais
3. Unificar escalas tipográficas — atualmente mistura 0.48rem a 0.68rem sem hierarquia clara
4. Considerar reorganizar seções em grid 2-col onde fizer sentido
5. Aumentar tamanhos de fonte para legibilidade sem aumentar footprint total

## Outros pendentes de sessões anteriores
- Validação visual browser localhost:3000/tools/simulador
- PKO Value feature (aprovada em memória, não iniciada)
