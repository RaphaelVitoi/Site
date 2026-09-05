---
id: registro-2026-09-04-lighthouse-certificado-e-o-certificado-que-nao-viajava
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: 2026-09-04T22:55:00-03:00
atualizado_em: 2026-09-04T22:55:00-03:00
classes: [interno, medido, cwv, higiene]
caminhos:
  - .gitignore
  - reports/cwv/latest_lighthouse_production.json
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
verificado:
  - auditoria Lighthouse de producao executada em Chrome Dev isolado, com build de producao servida em 127.0.0.1:3100
  - TBT 0 ms, LCP 447,576 ms, CLS 0, performanceScore 1.0
  - fingerprint 1c8c2fc656b846ef do artefato confere com o do frontend no HEAD publicado
  - working tree estava limpo no momento da auditoria, entao o certificado corresponde a ab37faac
  - reports/cwv/ tinha 1218 arquivos e 9,6 MB, dos quais 1209 sao cwv_report_* auto-gerados
  - apos a mudanca no .gitignore, apenas latest_lighthouse_production.json entra em stage
nao_verificado:
  - se o TBT permanece 0 sob carga de rede real ou hardware mais lento -- a auditoria roda em localhost
  - se o CI, quando existir, consegue reproduzir a auditoria sem Chrome Dev instalado
supersede: null
---

# Registro — Lighthouse certificado, e o certificado que não viajava

## 1. O que se acreditava, e o que se mediu

O Tier 0 supôs que o TBT tivesse sido resolvido nesta mesma data, na sessão
conduzida pelo Gemini 3.8 Flash. **A medição diz que não.**

| Evidência | Valor |
| :--- | :--- |
| Artefato vinculado ao portão | `2026-09-01 07:09` |
| Fingerprint registrado | `e2713285…` |
| Fingerprint do frontend hoje | `1c8c2fc6…` |
| Batiam? | **Não** |

Os arquivos de 04/09 em `reports/cwv/` eram `cwv_report_*` — relatórios do próprio
portão, não auditorias Lighthouse. E o handoff daquele condutor era honesto: ele
declarava, em `nao_verificado`, *"Auditoria de produção Lighthouse isolada (TBT
pendente de fingerprint novo de frontend)"*.

O warning não vinha de um defeito de medição: vinha de o frontend ter mudado
depois da última auditoria — inclusive por mudanças desta própria sessão.

## 2. A auditoria, e o resultado

Executada com `scripts/ops/invoke_lighthouse_production_audit.ps1`: build de
produção do Next, servida em `127.0.0.1:3100`, Chrome Dev em perfil efêmero sem
extensões.

```
TBT 0 ms · LCP 447,576 ms · CLS 0 · performanceScore 1.0
fingerprint 1c8c2fc656b846ef… — confere
```

A janela foi escolhida deliberadamente: **o working tree estava limpo**, logo o
certificado corresponde exatamente ao `ab37faac` publicado, e não a um estado
intermediário que ninguém mais teria.

## 3. O achado que importa mais que o número

**O certificado estava no `.gitignore`, e por isso a certificação não viajava.**

`cwv_gate.ps1:34` lê `reports/cwv/latest_lighthouse_production.json` para decidir
se o TBT está atestado. Esse caminho estava coberto por `reports/cwv/` na linha
91 do `.gitignore`. Consequência: **a certificação era local por máquina.**
Qualquer outro condutor — ou o CI, quando existir — veria o warning de cobertura
parcial mesmo com uma auditoria válida feita horas antes em outra máquina, e não
teria como saber que ela existia.

Isso explica por que o warning atravessou tantos handoffs sem nunca ser resolvido
em definitivo: **cada sessão que o resolvia, resolvia só para si.**

### Por que o diretório continua ignorado

Medido antes de mexer: `reports/cwv/` tinha **1218 arquivos e 9,6 MB**, dos quais
**1209** são `cwv_report_*.json/.md` gerados a cada execução do portão — dois por
commit, sem teto. Versionar o diretório inteiro poria esse ruído auto-gerado no
histórico, que é o oposto do que a fase 5 protege.

A regra passou a ignorar o **conteúdo** e liberar o **certificado**:

```gitignore
reports/cwv/*
!reports/cwv/latest_lighthouse_production.json
```

A forma importa: com `reports/cwv/` o git não desce na pasta e a negação nunca é
avaliada. Verificado depois da mudança — o certificado entra em stage, os 1209
`cwv_report_*` continuam fora.

## 4. A fragilidade que fica declarada, e não foi tocada

O fingerprint cobre **toda** a árvore `frontend/`, excluindo apenas `.git`,
`.next`, `coverage`, `node_modules` e `reports`: **792 arquivos, dos quais 28 são
de teste**. Um `.test.ts` novo invalida a certificação de performance sem tocar no
bundle que o Next produz — foi o que aconteceu nesta sessão com
`convergenciaDeSolve.test.ts`.

É conservador por desenho: falso positivo, nunca falso negativo. Mas num
repositório ativo torna a certificação um alvo móvel.

**Não foi alterado, e a razão é a §8.2:** restringir o escopo do fingerprint é
redução material de portão, e exige autorização explícita com os seis itens que
aquela seção lista. Fica declarado como achado, não como pendência a corrigir por
iniciativa própria.
