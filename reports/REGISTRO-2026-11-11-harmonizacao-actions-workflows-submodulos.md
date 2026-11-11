---
id: "2026-11-11-harmonizacao-actions-workflows-submodulos"
tipo: registro
escopo: site
autor: "Devin (SWE-2 Flash) [Tier 1]"
criado_em: "2026-11-11"
verificado:
  - "Actions harmonizadas para latest major via API GitHub: exa-mcp-server
    (checkout/setup-node v7, aws-credentials v6, buildx v4) commit 5be950c;
    gemini-cli-security (checkout/setup-node/upload-artifact v7,
    download-artifact v8, setup-go v7, SHA pin checkout->v7.0.1) commit fe75cc7
    — pushados aos forks RaphaelVitoi."
  - "Hooks e gemini-extension.json dos 6 skills validados estruturalmente (JSON
    parse OK, paths referenciados existem)."
  - "slsa-verifier installer v2.7.1, action-gh-release v3, release-please v5,
    run-gemini-cli v0.1.22, setup-uv v10.3.3 confirmados latest — sem alteracao."
nao_verificado:
  - "Workflows dos submodulos nao executados em runner real (mudanca de tag
    major de artifact actions v4->v8 assumiu API
    name/path/pattern/merge-multiple estavel; validar no proximo run de CI)."
  - "create-github-app-token pin v2 SHA mantido (v3.3.0 existe; major bump sem
    analise de breaking changes — Dependabot ratchet deve cobrir)."
  - "skills/gemini-cli-jules workflows com SHA pins v4-era (ratchet Dependabot)
    — fora do escopo desta harmonizacao."
  - "Portoes SOTA do repo pai (CWV/suite/audit) nao reexecutados nesta sessao —
    mudanca limitada a gitlinks de workflows."
revisoes_de_ancora:
  - registro: registro-2026-10-19-saneamento-warnings-skills-e-memoria-agentica
    caminhos:
      - skills/exa-mcp-server
    parecer:
      "Reconciliacao 2026-11-11: gitlink de skills/exa-mcp-server avancado para
      5be950c (harmonizacao de GitHub Actions: checkout/setup-node v4->v7,
      aws-credentials v4->v6, buildx v3->v4). O saneamento de warnings permanece
      intacto; a mudanca toca apenas .github/workflows."
  - registro: registro-2026-10-27-remediacao-dependabot-submodulo-e-integracao-sota
    caminhos:
      - skills/gemini-cli-security
    parecer:
      "Reconciliacao 2026-11-11: gitlink de skills/gemini-cli-security avancado
      para fe75cc7 (actions v7/v8 e SHA pin checkout->v7.0.1). A remediacao
      Dependabot permanece valida; mcp-server e codigo de extensao inalterados."
  - registro: registro-2026-10-28-homologacao-pr103-jules-e-selagem-montecarlo
    caminhos:
      - skills/gemini-cli-security
    parecer:
      "Reconciliacao 2026-11-11: gitlink de skills/gemini-cli-security avancado
      para fe75cc7 (somente .github/workflows). Homologacao PR103 e selagem
      Monte Carlo nao afetadas — nenhum arquivo de codigo ou teste do submodulo
      mudou."
---

# Harmonização de GitHub Actions nos submódulos

Auditoria de workflows do ecossistema: tags defasadas substituídas pelos latest
majors estáveis medidos via API de releases do GitHub.

| Submódulo           | Commit  | Mudanças                                                                                                  |
| ------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| exa-mcp-server      | 5be950c | checkout v4→v7, setup-node v4→v7, aws-credentials v4→v6, buildx v3→v4                                     |
| gemini-cli-security | fe75cc7 | checkout/setup-node/upload-artifact →v7, download-artifact v4→v8, setup-go v5→v7, SHA pin checkout→v7.0.1 |

Já no latest (sem alteração): slsa-verifier installer v2.7.1, action-gh-release
v3, release-please-action v5, run-gemini-cli v0.1.22, setup-uv v10.3.3, e todos
os workflows do repo pai (v7 + SHA pins).

SHA-pins gerenciados pelo ratchet do Dependabot (gemini-review
create-github-app-token v2, jules checkout/setup-node v4-era) mantidos —
atualização cabe ao Dependabot.
