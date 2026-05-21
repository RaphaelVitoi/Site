---
name: Prompt de Continuidade V73
description: V73 — Absorção GTO Wizard (2 artigos), auditoria conteúdo 5 páginas ICM, 3 correções, ICMlaboratory fix, build limpo. Simulador íntegro Opção B.
type: project
---

## Estado da Sessão V73 (2026-04-04)

### O que foi feito

1. **Absorção de fontes GTO Wizard (2 artigos recentes)**
   - "MDF vs ICM: Rethinking Bluffing & Defense Strategies in MTTs" (2025)
   - "How ICM Impacts Postflop Strategy" (2025)
   - Análise completa de convergência com framework Vitoi
   - Confirmam: MDF quebra sob ICM, covering player mais agressivo, Downward Drift, supressão large bets
   - GTO Wizard conclui que postflop ICM é "área inexplorada" — o framework Vitoi é exatamente essa tentativa

2. **Discussão teórica profunda: Perspectiva/Esperança/Expectativa**
   - Raphael articulou com clareza por que CL é agressivo (protege Perspectiva, não maximiza ICM EV do pot)
   - Exemplo do river após 3 streets: RP técnico aumenta mas Esperança de melhorar Perspectiva pode dominar
   - Decisão correta: "ganhar esse pot muda o que na minha Perspectiva Matemática?"
   - Framework aplica simetricamente a qualquer RP (maior ou menor), adaptado ao referencial do jogador

3. **Crítica fundamentada ao FGS de solvers**
   - Solvers raciocinam perfeitamente sobre modelo incompleto — raciocínio perfeito sobre objeto errado
   - FGS limita-se a ~6 mãos, consome recursos proibitivos, campo abstraído
   - Framework Vitoi identifica o que está FORA do espaço de representação do solver
   - "Potatoes potatoes" — Raphael confirmou que é a mesma ideia, economizou palavras

4. **Auditoria de conteúdo das páginas ICM**
   - `aula-icm/page.tsx` — ARQUIVADA (não existe mais como página ativa)
   - `icm-masterclass/page.tsx` — métrica "~10% ROI" sem fonte → substituída por "Assimetria Fundamental"
   - `conceitos-icm/page.tsx` — ref bibliográfica O'Kearney: *PKO Poker Strategy* → *Endgame Poker Strategy: The ICM Book* (D&B Publishing, 2019)
   - `ICMlaboratory/page.tsx` — página órfã (import IcmLab inexistente) → redirect para /simulador
   - `icm-pos-flop/page.tsx` — auditada, limpa, sem alterações necessárias

5. **Verificação do simulador**
   - Build limpo (zero erros TS, zero warnings)
   - Motor Opção B funcional: `solveIcmDistortion` com 6 ações, 3 streets
   - NashPanel atualizado com IcmDistortionResult, inputs editáveis, CSS vars
   - ScenarioStage limpo (áudio já removido em sessão anterior)
   - RiskGauge sem isMuted (interface já limpa)
   - useAudioFeedback.ts já deletado

### Memória atualizada

- `project_teoria_icm_perspectiva_esperanca.md` — atualizado externamente (pelo usuário ou linter) com hierarquia completa v2, incluindo FGS, Table Draw, MDF em ICM, RP pós-flop

### Estado técnico

- **Build:** limpo
- **Commits pendentes:** nenhum commit feito nesta sessão (3 edições: icm-masterclass, conceitos-icm, ICMlaboratory)
- **Áudio:** completamente removido do simulador (confirmado)
- **CSS:** 100% CSS vars no simulador

### Páginas ICM ativas (mapa atualizado)

| Rota | Conteúdo | Estado |
|---|---|---|
| `/aulas/icm-masterclass` | Geometria do Risco — teoria densa | Auditada V73 |
| `/aulas/conceitos-icm` | Glossário Formal — E/P/E + RP/BF | Auditada V73 |
| `/aulas/icm-pos-flop` | Framework D6 + Aula 1.2 | Auditada V73 |
| `/aulas/leitura-icm` | Whitepaper ICM | Não auditada V73 |
| `/simulador` | Motor ICM interativo | Funcional V73 |
| `/ICMlaboratory` | Redirect → /simulador | Fix V73 |

### Próximos passos (ordem natural)

1. **leitura-icm** — única página ICM não auditada nesta sessão
2. **Formalização E/P/E dedicada** — `conceitos-icm` já cumpre o papel; Raphael avaliará se precisa de expansão
3. **Commit** das 3 edições desta sessão
4. **Migrar layouts legados** pendentes V72 (hermeneutica-blefe, paradoxo-valuation, motor-diluicao)
