---
id: registro-2026-09-07-certificacao-tbt-e-zero-warnings-cwv
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: "Gemini 3.6 Flash -- sessao sota-v8-gold"
criado_em: 2026-09-07T19:15:00-03:00
atualizado_em: 2026-09-07T19:15:00-03:00
classes: [interno, medido, cwv, qualidade]
caminhos:
  - scripts/ops/invoke_lighthouse_production_audit.ps1
  - reports/cwv/latest_lighthouse_production.json
  - frontend/next-env.d.ts
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
  pwsh: '7.6.5'
verificado:
  - >-
    Auditoria Lighthouse de producao executada em Chrome isolado via
    scripts/ops/invoke_lighthouse_production_audit.ps1 com alvo em 127.0.0.1:3100.
  - >-
    Metricas certificadas no artefato latest_lighthouse_production.json:
    TBT 0 ms, LCP 373.25 ms, CLS 0, Performance Score 1.0 (100%).
  - >-
    Input fingerprint sha256 42b84cd618ff110f9552aa90878cc7c7e96adf129cf3967b9a604fc6fb80f2e0
    perfeitamente alinhado com a arvore do frontend em build.
  - >-
    Resiliencia implementada em scripts/ops/invoke_lighthouse_production_audit.ps1
    com lista de navegadores candidatos para fallback caso o Chrome Dev exija
    elevacao UAC no host Windows.
  - >-
    SOTA Quality Gate (cwv_gate.ps1) medido com SUCESSO VERDE pleno:
    0 erros e 0 warnings nas 5 fases auditadas (LCP 353.9 ms, CLS 0, TBT 0 ms,
    TTFB 77.8 ms, Heap 103.1 MB, Axe 0 violacoes, CVE 0, SRI integro, Higiene limpa).
  - >-
    Arbitragem humana Tier 0 (Raphael Vitoi): 100% de adequacao e coerencia
    de acessibilidade homologada e formalizada no registro.
nao_verificado:
  - >-
    Execucao sob estresse extremo com milhares de usuarios concorrentes simultaneos
    no servidor de producao local.
revisoes_de_ancora:
  - registro: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
    caminhos:
      - reports/cwv/latest_lighthouse_production.json
    parecer: >-
      Atualizacao do artefato de producao com fingerprint recalculado para o estado
      atual do frontend (sha256 42b84cd6...), certificando TBT 0 ms e Score 1.0.
  - registro: auditoria-cwv-lighthouse-2026-09-01
    caminhos:
      - scripts/ops/invoke_lighthouse_production_audit.ps1
    parecer: >-
      Adicao de fallback para Google Chrome padrao quando a execucao do Chrome Dev
      requerer elevacao de privilegios UAC, garantindo execucao confiavel em
      ambientes nao elevados.
---

# Registro de Certificacao de TBT e Homeostase Verde do Quality Gate

## 1. Contexto e Diagnostico

Durante a checagem das metricas de Performance & CWV no portao `cwv_gate.ps1`,
detectou-se que a bateria apresentava 1 warning ativo (`cwv.cobertura` com
`LIGHTHOUSE_FINGERPRINT_MISMATCH`), status `[FRAGIL (AMARELO)]`.

A causa raiz foi a alteracao previa de arquivos no diretorio `frontend/`,
que invalidou o hash de entrada de producao registrado em 2026-09-05 no arquivo
`reports/cwv/latest_lighthouse_production.json`. Alem disso, o script de auditoria
`invoke_lighthouse_production_audit.ps1` falhava ao invocar o executavel do
Chrome Dev devido a restricao de elevacao UAC na instalacao local do Windows.

## 2. Acoes Executadas

1. **Resiliencia no Script de Auditoria:**
   - Em `scripts/ops/invoke_lighthouse_production_audit.ps1`, adicionado suporte
     a uma lista ordenada de candidatos executaveis do Chrome (Chrome Dev,
     Chrome padrao 64-bit e 32-bit), com tentativa sucessiva e tratamento de erro.

2. **Auditoria de Producao e Certificacao do TBT:**
   - Executada a rotina completa `npm run sota:audit:production`:
     - Compilacao Next.js em modo producao.
     - Servidor temporario iniciado na porta 3100.
     - Instancia isolada headless iniciada com sucesso.
     - Coleta Lighthouse gerou artefato com:
       - `TBT`: 0 ms.
       - `LCP`: 373.25 ms.
       - `CLS`: 0.
       - `Performance Score`: 1.0 (100%).
       - Fingerprint atualizado e vinculado.

3. **Alinhamento de Tipos Next.js:**
   - `frontend/next-env.d.ts` atualizado para as rotas e tipos estritos do build.

## 3. Resultados Medidos no Quality Gate

Execucao de `npm run sota:audit` (`scripts/ops/cwv_gate.ps1`):

- **Erros:** 0 (Teto: 0)
- **Warnings:** 0 (Teto: 2)
- **Status:** `[SUCESSO (VERDE)]` — Homeostase total nas 5 fases.

## 4. Auditoria de Acessibilidade pelo Arbitro Humano (Tier 0)

Em adicao as assercoes automatizadas do axe-core (0 violacoes), o arbitro humano
e autoridade soberana Tier 0 (Raphael Vitoi) registrou formalmente durante a auditoria:
"100% de adequacao e coerencia de acessibilidade". A homologacao integral passa a
constar como estado auditado deste ciclo.

