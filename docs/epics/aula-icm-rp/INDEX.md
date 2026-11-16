---
id: aula-icm-rp-index
tipo: indice
escopo: Site
autor: Raphael Vitoi
criado_em: 2026-05-01T00:00:00-03:00
verificado:
  - Indice de documentacao do epico aula-icm-rp
nao_verificado:
  - Validacao de links externos em producao
title: "Indice de Documentacao - Aula de ICM e Risk Premium"
type: index
status: active
owner: site-governance
updated_at: 2026-11-15
---

# Indice de Documentacao - Aula de ICM e Risk Premium

> Atualizado: 2026-11-15 | Epico consolidado e prototipo interativo restaurado

---

## Documentos Ativos

### [SPEC.md](SPEC.md)

- **Status:** Ativo | Padrao Ouro
- **Conteudo:** Especificacao tecnica, didatica e arquitetural unificada do
  epico `aula-icm-rp` (aula em 5 modulos, 8 Toy-Games, fronteira epistemica PMev
  e arquitetura do prototipo Web Components).

### [aula-icm-rp.md](aula-icm-rp.md)

- **Status:** Final | Versao 7.0 GOLD
- **Autor:** Raphael Vitoi
- **Conteudo:** Aula completa sobre ICM, Risk Premium e extensoes pos-flop
  (Bunching Effect, RIO, Prova dos 41%, Erosao Antecipada, Fator Psi, Gravidade
  Estrategica e PKO).
- **Publico-alvo:** Jogadores profissionais de poker, nivel intermediario (AVG
  US\$ 109 a US\$ 530).

### Prototipo Interativo ("Geometria do Risco | Architecture v2")

- **Entrada:** [index.html](index.html)
- **Motor e Componentes:** [main.js](main.js), [NashSolver.js](NashSolver.js),
  [risk-gauge.js](risk-gauge.js), [scenario-list.js](scenario-list.js),
  [scenarios.js](scenarios.js), [scenarios_toygame.js](scenarios_toygame.js),
  [style.css](style.css), [style-overrides.css](style-overrides.css).
- **Nota:** Os artefatos de especificacao da Smart CLI v2.0 que residiam neste
  diretorio foram migrados para
  [../cli-interativa/SPEC.md](../cli-interativa/SPEC.md) e
  [../cli-interativa/IDENTITY_SPEC.md](../cli-interativa/IDENTITY_SPEC.md).

---

## Documentos Arquivados (Fase de Planejamento)

Estes arquivos em [archived/](archived/) cumpriram sua funcao no pipeline
historico e estao mantidos para rastreabilidade:

| Arquivo                                                   | Proposito                                              | Data       | Status    |
| :-------------------------------------------------------- | :----------------------------------------------------- | :--------- | :-------- |
| [pesquisa.md](archived/pesquisa.md)                       | Phase 0: Pesquisa especializada em ICM/Risk Premium    | 2026-02    | Arquivado |
| [prompt.md](archived/prompt.md)                           | Phase 1: Prompt estruturado para planejamento          | 2026-02    | Arquivado |
| [PRD.md](archived/PRD.md)                                 | Phase 2: Product Requirements Document                 | 2026-03-08 | Arquivado |
| [SPEC.md](archived/SPEC.md)                               | Phase 3: Especificacao tecnica historica com auditoria | 2026-03-08 | Arquivado |
| [auditoria.md](archived/auditoria.md)                     | Phase 4: Auditoria de qualidade                        | 2026-03-08 | Arquivado |
| [RELATORIO_VALIDACAO.md](archived/RELATORIO_VALIDACAO.md) | Phase 5: Validacao de conteudo especializado           | 2026-03-11 | Arquivado |
| [PRD_M6_Interativo.md](archived/PRD_M6_Interativo.md)     | PRD do Modulo 6: Simulador Interativo de Toy-Games     | 2026-03-11 | Arquivado |
| [SPEC_M6_Interativo.md](archived/SPEC_M6_Interativo.md)   | SPEC do Modulo 6: Simulador Interativo                 | 2026-03-11 | Arquivado |

---

## Estrutura da Aula (`aula-icm-rp.md`)

1. **Modulo 1:** O Problema e o Mapa
2. **Modulo 2:** Toy-Games como Laboratorio (8 cenarios)
3. **Modulo 3:** ICM Pos-Flop, a Fronteira
4. **Modulo 4:** Variaveis Contextuais
5. **Modulo 5:** Aplicacao Pratica e Erros Comuns

---

## Rastreabilidade

- **Autor da aula:** Raphael Vitoi (conteudo original desde 2013)
- **Ledgers de evidencia primaria:**
  [ENTENDENDO_ICM_HEURISTICAS_LEDGER.md](../../research/pmev/ENTENDENDO_ICM_HEURISTICAS_LEDGER.md)
  e
  [AULA_1_2_EVIDENCE_LEDGER.md](../../research/pmev/AULA_1_2_EVIDENCE_LEDGER.md)
- **Contrato de producao relacionado:**
  [SPEC_icm_toy.md](../../../frontend/src/content/interativo/SPEC_icm_toy.md)
