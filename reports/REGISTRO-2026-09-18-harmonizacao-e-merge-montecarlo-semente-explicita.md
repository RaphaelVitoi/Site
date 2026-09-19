---
id: registro-2026-09-18-harmonizacao-e-merge-montecarlo-semente-explicita
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: antigravity@gemini-3.8-flash
criado_em: '2026-09-18T17:10:00-03:00'
atualizado_em: '2026-09-18T17:10:00-03:00'
classes: [interno, medido, qualidade, frontend, matematico]
caminhos:
  - reports/REGISTRO-2026-09-18-harmonizacao-e-merge-montecarlo-semente-explicita.md
  - frontend/src/lib/icmWorkerPool.ts
  - frontend/src/lib/montecarlo.ts
  - frontend/src/lib/perspectiva.ts
  - frontend/src/tests/simulator/montecarlo.reproducibility.test.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  host: Windows 11 Pro, Python 3.12+ (.venv), Node.js v22+
  data_das_medicoes: 2026-09-18
verificado:
  - integracao harmoniosa do branch claude/project-thread-ks36i7 (commit c8ba32c) via merge local auditado
  - eliminacao definitiva de Math.random em calculateIcmMonteCarlo -- semente sempre sorteada via deriveSeed() e retornada no resultado
  - exportacao de seededRandom (mulberry32) blindada por vetor congelado contra alteracoes silenciosas de algoritmo
  - calculateMapaICM torna-se pura via MAPA_ICM_SEED constante eliminando flutuacoes de cache entre sessoes
  - IcmSimulationResult documenta formalmente o contrato de replay do pool paralelo (seed, iterations, concurrency)
  - 10 novos testes unitarios em montecarlo.reproducibility.test.ts 100% aprovados
  - todas as 57 suites de simulador frontend (398 testes) aprovadas no Jest
  - tsc --build e eslint limpos com zero erros e zero avisos
  - bateria de 44 testes Python (fechamento de ciclo, H8, RP canonico, lazy loading) 100% verde
nao_verificado:
  - execucao do dev server na porta 3000 / CDP 9222 durante este commit
---

# Harmonização e Merge: Semente Explícita e Replay Auditável do ICM

Este registro formaliza o merge harmonioso e a validação do trabalho desenvolvido por Claude Opus 5 no branch `claude/project-thread-ks36i7` (commit `c8ba32c`), importado a partir do bundle local.

## 1. Problema Diagnosticado e Solução

Anteriormente, `calculateIcmMonteCarlo` só operava de forma determinística quando o chamador passava `seed` explicitamente. Omitir a semente fazia a função recorrer ao `Math.random` nativo, devolvendo `seed: null`, o que tornava a simulação irreproduzível e disparava o sonar `typescript:S2245`. Ademais, o fallback para $N > 10$ em `calculateMapaICM` memoizava resultados ruidosos em `_icmCache`.

A solução implementada:
1. **Semente Sempre Presente:** Omitir `seed` agora invoca `deriveSeed()` (via `crypto.getRandomValues`), garantindo que o resultado sempre devolva um `seed: number` de 32 bits replayável.
2. **Vetor Congelado:** `seededRandom` (mulberry32) é exportado e testado contra um vetor estático imutável, garantindo que qualquer substituição do gerador seja imediatamente flagrada.
3. **Função Pura no Mapa:** `calculateMapaICM` adota a constante `MAPA_ICM_SEED = 0x5ed1c3`, eliminando flutuações de cache entre sessões.
4. **Contrato de Replay do Pool:** Documentado que o replay exato no worker pool requer a tríade `(seed, iterations, concurrency)`.

## 2. Validações Locais

- **TypeScript / ESLint:** `tsc --build` e `eslint` sem erros e sem avisos no workspace `frontend`.
- **Jest:** 57 suítes e 398 testes aprovados (incluindo os 10 testes de `montecarlo.reproducibility.test.ts`).
- **Python:** 44 testes aprovados nas suítes críticas do motor, comprovando que `test_calibracao_fechamento_do_ciclo.py` está 100% verde no ambiente canônico.
- **Portões de Registro e Integridade:** Aprovados sem restrições.
