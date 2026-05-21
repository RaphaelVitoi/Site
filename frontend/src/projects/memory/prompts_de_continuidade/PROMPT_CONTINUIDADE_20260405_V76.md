---
name: Prompt de Continuidade V76
description: V76 — Absorção 2 artigos GTO Wizard (MDF vs ICM + ICM Postflop). Framework E/P/E expandido com CL e river. Crítica FGS registrada. Atribuições profissionais verificadas. Backlog reescrita Geometria de Risco com fonte original identificada. Build limpo.
type: project
---

## Estado da Sessão V76

### Executado nesta sessão

1. **Absorção de 2 artigos GTO Wizard (fontes externas):**
   - "MDF vs ICM: Rethinking Bluffing & Defense Strategies in MTTs" (2025)
   - "How ICM Impacts Postflop Strategy" (2025)
   - Ambos validam parcialmente o framework de Raphael: MDF quebra sob ICM, covering player mais agressivo, Downward Drift confirmado, large bets suprimidas (alinha com k_ip_bet_large = -12)
   - GTO Wizard descreve fenômenos sem equação geral; Raphael formaliza o mecanismo via ΔRP + equação côncava

2. **Expansão teórica do framework Perspectiva/Esperança/Expectativa:**
   - Caso do CL: agressividade não é por ICM EV do pot mas para proteger Perspectiva contra melhoria dos rivais
   - Caso do river (player investiu 3 streets): RP aumentou mas Esperança de melhorar Perspectiva pode dominar. Dois casos: pot muda escalão (pagar) vs pot não muda (cautela)
   - Simetria: mesma lógica vale para RP maior e RP menor, adaptada ao referencial de cada um
   - Crítica fundamentada ao FGS de solvers: lógica interna impecável sobre modelo incompleto. Solver raciocina sobre o objeto errado. FGS projeta dentro do mesmo toy game (mais profundo, não mais real). Não captura trajetória de campo, adaptação, context multi-orbit.

3. **Verificação de integridade do simulador:**
   - Audio: COMPLETAMENTE removido do codebase (useAudioFeedback, isMuted, playTone, playDeathZone, playPredatorZone) — zero referências em src/
   - NashPanel: já atualizado v4.1 (3 streets, 6 ações, IcmDistortionResult)
   - ScenarioStage: limpo, sem audio, tipado com Scenario
   - RiskGauge: sem isMuted, CSS vars
   - Build: limpo. tsc --noEmit: zero erros.

4. **Créditos e atribuições verificados:**
   - icm-masterclass/page.tsx: seção "Referências e Atribuições" profissional
     - Downward Drift → O'Kearney & Carter, Endgame Poker Strategy: The ICM Book (D&B Publishing)
     - ICM → Malmuth-Harville
     - Dados → 93 nodes HRC vs GTO Wizard (Aula 1.2)
     - GTO Wizard Blog (2025) como validação parcial
     - Framework original → Raphael Vitoi (2026)

5. **Identificação da fonte original geometria_texto.md:**
   - Localizada em `frontend/research/icm-materials/geometria_texto.md`
   - Texto original de Raphael, sintetizado pela Gemini
   - Contém: 5 arquétipos, teoria ChipEV vs ICM, RP/BF, MDF colapso, FGS
   - Linguagem: português de Portugal (requer adaptação para pt-BR no site)
   - Atualmente referenciada no V75 como backlog de reescrita

### Pendências (por ordem de prioridade)

1. **Reescrita Geometria de Risco (icm-masterclass/page.tsx):**
   - Fonte principal: `frontend/research/icm-materials/geometria_texto.md`
   - Fontes adicionais: archive/engine_original/GeometriaDoRisco_v1_standalone.html, archive/legacy_icm_components/RiskGeometryMasterclass.tsx
   - O que fazer: auditar conteúdo da página atual vs fonte original, melhorar, corrigir, refinar, aprender pontos não tocados, densificar com teoria atualizada desta sessão (E/P/E expandido, crítica FGS, validação GTO Wizard)
   - Adaptar linguagem pt-PT → pt-BR onde necessário

2. **Formalizar E/P/E em página dedicada:**
   - Conceitos Expectativa, Perspectiva e Esperança Matemática com definição formal
   - Caso CL como demonstrativo, river como exemplo prático
   - Separação de ICM EV puro, relação com FGS
   - Atribuições

3. **icm-pos-flop seção Comparativo:** Layout legado, sem ContentFooter

### Memória atualizada nesta sessão

- `project_teoria_icm_perspectiva_esperanca.md` — reescrita completa com hierarquia E/P/E, atribuição Downward Drift, validação GTO Wizard, crítica FGS, implicação para motor

### Arquivos NÃO modificados nesta sessão

Nenhum arquivo de código foi editado. Sessão puramente de absorção teórica, verificação de integridade e planejamento.

### Build

Build limpo. tsc --noEmit: zero erros. Zero referências a audio.
