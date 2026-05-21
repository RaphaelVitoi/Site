---
name: Prompt de Continuidade V72
description: Auditoria COMPLETA de todas as páginas do site. 8 correções executadas (V71+V72). 3 layouts legados pendentes de migração SOTA. Próximo passo = migrar layouts + formalizar E/P/E.
type: project
---

## V72 — Sessão 2026-04-04 (continuação da V71)

### O que foi feito nesta sessão

1. **5 correções da V71 executadas** (P0-P2):
   - P0: Removida fabricação "Homem Bomba = jouissance lacaniano" em `psicologia-hs/page.tsx` linha 151. Reescrito como "Pedagogia Vitoi" com Antevisão + E/P/E
   - P1a: Reescrito parágrafo verboso (cortado "ontogênese", "subsumido", "hermenêutica", "teleologia") em `psicologia-hs/page.tsx` linha 98
   - P1b: "O framework definitivo Framework ICM" → "O framework definitivo de ICM" em `leitura-icm/page.tsx` linha 7
   - P2a: "0% a 60%" → "0% a ~24% em mesas finais reais; teto teórico mais alto em cenários extremos" em `leitura-icm/page.tsx` linha 20
   - P2b: Referências formalizadas em `psicologia-hs/page.tsx` (5 entradas com editoras, obras, framework original)

2. **Auditoria COMPLETA de todas as páginas restantes** (12 páginas lidas e avaliadas):
   - Landing page (page.tsx): OK
   - quem-sou: OK
   - biblioteca index: typo corrigido ("téorica" → "teórica")
   - entendendo-o-icm: 2 correções aplicadas (âncora empírica + referências formais)
   - hermeneutica-blefe: SÓLIDO (Lacan legítimo, diferente da fabricação Gemini)
   - paradoxo-valuation: SÓLIDO
   - motor-diluicao: 2 correções aplicadas (Barry Carter + referências formais)
   - voce-aprende-poker-errado (Amortização da Edge): SÓLIDO (melhor artigo da biblioteca)
   - estado-da-arte: OK
   - smart-sniper: SÓLIDO
   - validacao-smart-sniper: SÓLIDO
   - [slug], laboratorio-icm, simulador, ICMlaboratory, dashboard, analytics: utilitários OK

3. **Correções V72 executadas** (3 novas):
   - OBS-3: Typo "téorica" → "teórica" em `biblioteca/page.tsx` linha 96
   - P3a: "heurística de Vitoi" → "Âncora empírica de Vitoi (calibrada contra 93 nodes HRC)" em `entendendo-o-icm` linha 37
   - P4: "Dara O'Kearney" → "Dara O'Kearney & Barry Carter" em `motor-diluicao` linha 37
   - P3b: Seção formal de referências adicionada em `entendendo-o-icm` (Downward Drift, Malmuth-Harville, dados calibração, framework original)
   - Seção formal de referências adicionada em `motor-diluicao` (Downward Drift com quantificação, Malmuth-Harville, Motor de Diluição/SPR Pipeline)

### Pendentes (NÃO executados por janela de contexto)

**MIGRAÇÃO DE LAYOUT LEGADO → SOTA** (3 páginas):
Estas 3 páginas usam `className="container"`, `page-header`, `page-label`, `section-divider`, `verdict-box`, `article-nav` (estilo legado) em vez do padrão SOTA (SectionHeader + glass-panel + ContentFooter):

1. `biblioteca/hermeneutica-blefe/page.tsx` — 126 linhas, 6 seções
2. `biblioteca/paradoxo-valuation/page.tsx` — 125 linhas, 5 seções
3. `biblioteca/motor-diluicao/page.tsx` — 143 linhas, 6 seções (referências já adicionadas, mas layout ainda legado)

Padrão SOTA a seguir: mesmo de `voce-aprende-poker-errado/page.tsx` (SectionHeader com step/label/title/description, div maxWidth 1200px, glass-panel, ContentFooter).

Também falta adicionar referências formais em `hermeneutica-blefe` e `paradoxo-valuation`.

### Estado geral

- Build: LIMPO (verificado após V71 correções, V72 não rebuild ainda)
- Todas as páginas de conteúdo auditadas (17 pages total)
- 8 correções de conteúdo executadas no total (5 V71 + 3 V72 + 2 referências)
- Consistência de atribuição: Downward Drift → O'Kearney & Barry Carter em todas as páginas
- Consistência de terminologia: "âncora empírica" (não "heurística") para Teto do RP 24%

### Ordem de prioridade (definida pelo Raphael)

1. ~~Simulador funcional~~ ✅
2. ~~Auditar conteúdo~~ ✅ (auditoria completa, 8 correções aplicadas)
3. **Migrar 3 layouts legados** → pendente
4. **Formalizar conceitos E/P/E em página dedicada** → após migração
