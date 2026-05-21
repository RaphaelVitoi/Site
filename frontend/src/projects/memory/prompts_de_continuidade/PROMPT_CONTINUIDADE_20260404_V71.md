---
name: Prompt de Continuidade V71
description: Auditoria conteúdo ICM concluída. 5 correções pendentes (P0-P2). Simulador íntegro build limpo. Créditos formais adicionados.
type: project
---

## V71 — Sessão 2026-04-04 (continuação da V70)

### O que foi feito nesta sessão

1. **Leitura e análise de 2 artigos GTO Wizard Blog (2025)**:
   - "MDF vs ICM: Rethinking Bluffing & Defense Strategies in MTTs"
   - "How ICM Impacts Postflop Strategy"
   - Ambos validam parcialmente o framework de Raphael (MDF quebra sob ICM, covering player mais agressivo, downward drift, small sizing dominante)

2. **Discussão teórica profunda — Perspectiva/Esperança/Expectativa vs FGS dos solvers**:
   - Raphael formalizou: solver raciocina perfeitamente sobre o objeto errado (toy game isolado vs torneio completo)
   - FGS em solvers é precário (~6 mãos, RAM proibitiva, ignorado na prática)
   - Framework E/P/E preenche o gap: mecanismo causal transferível, não simulação exaustiva
   - Exemplo do river após 3 streets de investimento: RP aumentou (stack menor) MAS Esperança de melhorar Perspectiva pode dominar — depende de se o pot ganho muda escalão

3. **Audio removido** — verificado: já estava limpo (hook, imports, isMuted). Zero resíduos.

4. **Créditos profissionais adicionados**:
   - `aulas/icm-masterclass/page.tsx`: seção formal "Referências e Atribuições" com 4 entradas (O'Kearney/Carter com editora, Malmuth-Harville, GTO Wizard dados, framework original Raphael)
   - `aulas/icm-pos-flop/page.tsx`: atribuição inline "(O'Kearney & Carter)" na menção de Downward Drift

5. **Simulador verificado** — build limpo, interface Opção B com 3 streets, NashPanel atualizado, MasterSimulator integrado.

6. **Auditoria de conteúdo concluída** — 5 arquivos auditados:
   - conceitos-icm: SÓLIDO (melhor página)
   - icm-masterclass: OK (créditos adicionados)
   - leitura-icm: 2 correções pendentes
   - psicologia-hs: 3 problemas (1 erro factual)
   - PsychologyHub.tsx: OK (componente funcional)

7. **Memória atualizada**: `project_teoria_icm_perspectiva_esperanca.md` reescrita com hierarquia completa v2 (foi editada externamente pelo usuário/sistema com versão mais completa)

### Correções PENDENTES (não executadas)

**P0 — psicologia-hs/page.tsx linha 151-152:**
ERRO FACTUAL: "A obra 'Homem Bomba' utiliza a metáfora da bomba para descrever o excesso de 'gozo' (jouissance) lacaniano."
REALIDADE: O Homem-Bomba é obra literária publicada em 2015 pela Kazua. NÃO é texto sobre poker nem sobre jouissance lacaniano. Fabricação da Gemini. Remover ou corrigir.

**P1a — psicologia-hs/page.tsx linha 98+:**
Verbosidade acadêmica ("ontogênese", "subsumido", "hermenêutica", "teleologia") contradiz princípio de sofisticação (densidade + palavras mínimas). Reescrever mantendo conteúdo, cortando jargão.

**P1b — leitura-icm/page.tsx linha 7:**
Description duplicada: "O framework definitivo Framework ICM" — "Framework" aparece 2x.

**P2a — leitura-icm/page.tsx linha 20:**
"opera em uma escala percentual intuitiva (0% a 60%)" — 60% é enganoso. Âncora empírica = 24%. Ajustar para faixa realista ou omitir.

**P2b — psicologia-hs/page.tsx linha 203:**
Referências informais: "Chen & Ankenman, GTO Wizard Blog, HRC Simulations, Raphael Vitoi (Homem Bomba)." — formalizar no padrão das outras páginas.

### Estado do simulador

- Build: LIMPO (zero erros)
- Motor: `solveIcmDistortion` com equação côncava, 3 streets, 6 ações
- NashPanel: Opção B com inputs editáveis por street, aggressionFactor, PKO slider
- Cenários: 9 cenários com defaultStreetFreqs por street
- Audio: completamente removido
- CSS vars: migração completa (V70 anterior)

### Ordem de prioridade definida pelo Raphael

1. ~~Simulador funcional~~ ✅
2. **Auditar conteúdo** → auditoria feita, correções pendentes (P0-P2 acima)
3. Formalizar conceitos E/P/E em página dedicada (depois das correções)

### Próximo passo imediato

Executar as 5 correções na ordem P0 → P1 → P2, depois prosseguir para item 3 (formalização dos conceitos em página dedicada).
