# Memoria — Aposentadoria do eixo Strata (2026-11-13)

> Condutor: Devin (SWE-2 Flash) [Tier 1] | veiculo: devin-desktop
> Fonte: auditoria Goldfish `reports/reviews/goldfish_review_20261113.md` +
> handoff `reports/HANDOFF-2026-11-13-aposentadoria-strata-e-fecho-de-sessao.md`

## Decisao soberana registrada

O eixo Strata esta **aposentado** neste ecossistema: upstream v0.1.39 nao tem
Vulkan, exige CUDA/HIP com 12GB+ VRAM e nao suporta Polaris/gfx803. A via
canonica de inferencia local e **llama.cpp Vulkan via llama-swap :8080**
(Qwen3.6-35B-A3B-MTP, draft-mtp, ~13.45 t/s medido) + Ollama para os tiers
System-2. Artefatos Strata vivem em
`~/.gemini/quarantine/strata-retired-2026-11-13/` (fora do repo).

## Aprendizados reutilizaveis

1. **Health-check HTTP 200 nao prova identidade.** `GET /health` aceitava
   qualquer backend na :8080. Correcao canonica: verificar marcador de
   identidade (`GET /v1/models` exigindo modelo `qwen*`) antes de classificar
   o servico — aplicado em `llm/system2_local.py::llama_server_online`.
2. **Roteamento por substring de modelo e armadilha.** `"qwen3.8" in model_l`
   capturava `qwen3.8:27b` (Ollama) para o provider Strata. Provider local
   dedicado deve ser opt-in explicito; modelo local conhecido vai para o
   provider local correto por nome exato, nunca por substring ampla.
3. **Shim API-compatible e risco de proveniencia.** `strata_local_node.py`
   delegava a Ollama ou fabricava resposta rotulando-se como "Strata MoE
   125B". Regra: `meta.engine`/telemetria devem refletir o motor real que
   produziu o token, nunca o rotulo configurado no cliente.
4. **Colisao de porta e falha silenciosa classica.** Strata real, shim e
   llama-swap disputavam 127.0.0.1:8080; sem checagem de identidade, o ultimo
   a subir vencia e o roteador mentia sobre quem respondia.

## Estado

- Repo: provider/roteamento/dashboard/skills limpos; arquivos Strata
  deletados; testes 213 focados verdes; ruff/pyright limpos.
- Pendente de validacao viva: exercitar tier `moe` com llama-swap no ar.
