# Prompt de Continuidade - Motor ICM (2026-03-16)

## Contexto
Cole este prompt numa nova conversa para retomar o trabalho.

---

## PROMPT

Estou retomando o trabalho do Motor ICM. Leia a memoria `project_simulador_mestre_20260316.md` para contexto completo.

### Estado atual
- **Fases 0-4 COMPLETAS**: Motor ICM unificado criado em `frontend/src/components/simulator/` com 22 arquivos (engine, hooks, ui, panels, orquestrador)
- **Build OK**: `npx next build` passa sem erros
- **Verificacao 13/13**: Todos os pontos validados (cenarios, CSS, imports, redirects, navegacao)
- **Rota**: `/tools/simulador` ativa
- **Redirects**: `/tools/icm`, `/tools/masterclass`, `/tools/toy-games` todos redirecionam

### O que fazer agora
1. **Testar visualmente**: Roda `cd frontend && npm run dev` e navega para `http://localhost:3000/tools/simulador`. Verifica:
   - Sidebar com 9 cenarios agrupados (Clinicos, Baseline, Toy Games)
   - Gauges SVG funcionam ao trocar cenario
   - NashPanel mostra bluff/defense com slider de agressividade
   - TheoryPanel com 4 tabs (Fundamento, SPR, Exploit, Quiz)
   - Quiz interativo funciona (shuffle, feedback, explicacao)
   - Calculadora Malmuth-Harville (tab Calculadora)
   - Modo comparacao (tab Comparacao) com radar Recharts
   - Simulacao por mao (tab Mao) com presets AA/KK/AKs
   - Payouts (tab Payouts) com 5 estruturas
   - Ticker axiomatico animado no topo
   - Audio toggle funcional
   - Responsividade mobile

2. **Corrigir bugs visuais** encontrados no teste

3. **Features futuras** (requerem backend/API - NAO implementar agora):
   - AI Coach (Gemini chat)
   - Gerador de Cenarios IA
   - TTS (Text-to-Speech)

### Arquivos-chave
- Orquestrador: `frontend/src/components/simulator/MasterSimulator.tsx`
- Cenarios: `frontend/src/components/simulator/engine/scenarios.ts`
- CSS: `frontend/src/components/simulator/simulator.module.css`
- Rota: `frontend/src/app/tools/simulador/page.tsx`
- Plano original: `.claude/plans/shimmering-stargazing-rainbow.md`

### Regras
- Site e EXCLUSIVAMENTE sobre poker (nao financas)
- Paleta: indigo/rose/emerald, dark cyber theme (#020617, slate-950)
- Nunca criar simuladores separados - tudo no Motor ICM unificado
