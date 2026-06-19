---
name: Prompt de Continuidade V33
description: Sessao 20260327 - Auditoria completa do projeto. 4 criticos corrigidos (agentes $Model, BOM, test import, Prisma). Alertas pendentes (lixo raiz, node_modules orfao, configs Gemini).
type: project
---

# Continuidade - Sessao 20260327 V33

## O que aconteceu nesta sessao

### Auditoria completa do projeto (raiz em diante)
Relatorio gerado pelo @auditor cobrindo integridade, correcoes e lixo acumulado.

### 4 CRITICOS CORRIGIDOS

1. **C-01: Prisma schemas divergentes** - `prisma/schema.prisma` (game theory) renomeado para `prisma/schema.gametheory.prisma`. O frontend mantem `frontend/prisma/schema.prisma` (CMS). Nenhum e canonico, agora estao distinguidos.

2. **C-02: 18 agentes com $Model/$Color corrompido** - Todos restaurados usando `data/agents_manifest.json` como fonte de verdade. Causa: sessao Gemini.

3. **C-03: perspectiva.test.ts import quebrado** - Corrigido de `'../perspectiva'` para `'@/lib/perspectiva'`.

4. **C-04: BOM quadruplicado em routing_map.json** - 4 BOMs removidos (12 bytes).

### page.tsx restaurado (pre-auditoria)
`frontend/src/app/page.tsx` estava com 1883 linhas (conteudo duplicado ~7x). Restaurado do HEAD (272 linhas).

## ALERTAS PENDENTES (proxima sessao)

### A-01: node_modules/ orfao na raiz
- Existe `node_modules/` na raiz (fora de `frontend/`). Nao ha `package.json` na raiz.
- **Acao:** Deletar `node_modules/` da raiz.

### A-02: 15+ arquivos fantasma na raiz
Arquivos soltos que nao pertencem ali:
- `page.tsx` - duplicata legada de frontend/src/app/tools/icm/page.tsx
- `icm.ts` - versao legada de frontend/src/lib/icm.ts
- `DownwardDriftSimulator.tsx` - componente legado
- `IcmUniversalLab.tsx` - componente legado
- `route.tsx` - OG image generator orfao
- `hello_sota.py` - arquivo de teste trivial (3 linhas)
- `convert_docx_to_markdown.py` - deveria estar em scripts/utils/
- `extract_docx_media.py` - deveria estar em scripts/utils/
- `test_task_routing.py` - deveria estar em tests/
- `_write_probe_root.txt` - lixo de debug
- `settings.json` - config Gemini duplicada
- `settings.py` - config Gemini com extensao ERRADA (.py contem JSON)
- `entendendo-o-icm-e-suas-heuristicas.md` - conteudo ja existe como page
- `SESSION_LOG_20260327-020735.md` - log temporario
- `HANDOFF_SOTA_20260327.md` - deveria estar em docs/reports/
- `flowchart.svg` - imagem solta
- `caminho/do/arquivo.ext` - placeholder de teste (puro lixo)
- **Acao:** Mover utilitarios, deletar lixo, arquivar legados.

### A-03: Diretorio memory/ na raiz com 62 arquivos
- Parece ser o auto-memory do Claude. Verificar se pode ser consolidado/arquivado.

### A-04: .cerebro/page.tsx fora de lugar
- Arquivo de blog dentro de .cerebro/. Deletar.

### A-05: Configs Gemini triplicadas
- `settings.json` (raiz), `settings.py` (raiz, extensao errada), `.vscode/settings.json`
- **Acao:** Consolidar em `.vscode/settings.json`, deletar as da raiz.

### A-06: _env.example.ps1 staging suspeito
- Git status mostra `MM` (modificado no index E working tree). Verificar se nao ha chaves reais staged.

## Estado tecnico atual

- **Stack:** Next.js 16.1.6, React 19.2.4, Tailwind 4.2.2, TS 5.9.3
- **Frontend:** `frontend/` e o diretorio ativo. Build nao verificado nesta sessao (rodar `npx tsc --noEmit`).
- **Agentes:** 18/18 com model/color corretos agora.
- **agents_manifest.json:** Fonte de verdade funcional para agentes.
- **Ultimo commit:** `50add2a` (rpDeriver reescrito)

## Prioridades proxima sessao

1. Limpar arquivos fantasma da raiz (A-02)
2. Deletar node_modules/ orfao (A-01)
3. Consolidar configs Gemini (A-05)
4. Verificar _env.example.ps1 staging (A-06)
5. Verificar build do frontend (tsc --noEmit)
6. Avaliar memory/ na raiz (A-03)
