---
id: registro-2026-11-17-fase-4-governanca-estrutural-sota
tipo: registro
escopo: "Site -- Fase 4 da auditoria SOTA: governanca estrutural (catalogo de modelos como fonte unica, §0 do CLAUDE.md emagrecido sem renumerar enderecos, LIDERANCA reescrito para a piramide vigente, drift de versao da BIBLIA_TECNICA corrigido, fronteira de skills declarada, matriz de governanca reconciliada)"
ecossistema: nexus-sota
autor: "Devin (SWE-2 Flash) <158243242+devin-ai-integration[bot]@users.noreply.github.com>"
criado_em: "2026-11-17T20:30:00-03:00"
atualizado_em: "2026-11-17T20:30:00-03:00"
commit: HEAD
classes:
  - interno
  - medido
  - seguranca
  - governanca
  - registro
  - documentacao
caminhos:
  - CLAUDE.md
  - data/model_catalog.json
  - data/skills_registry.json
  - tests/test_model_catalog.py
  - .claude/GOVERNANCA/LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md
  - .claude/MATEMATICA/BIBLIA_TECNICA.md
  - .claude/MATEMATICA/BIBLIA_TECNICA_SOTA_v6_2.md
  - .claude/MATEMATICA/VITOI_PARADIGM_MANIFESTO_v7.md
  - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  condutor: Devin (SWE-2 Flash)
  veiculo: devin-desktop
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-11-17
verificado:
  - "data/model_catalog.json criado: roster tier->membros com tipo/status/fonte por entrada; tier 6 agregado modelado como 'frota-local' (ponteiro para data/ollama_models.json inteiro), nao como tag concreta"
  - "tests/test_model_catalog.py: 6/6 verdes -- schema, fontes declaradas, cruzamento com agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json; tags Ollama conferidas contra inventario medido (corrigidos sufixos :latest e tag hf.co completa)"
  - "CLAUDE.md §0 reescrito: inventario inline substituido por ponteiros para as 5 fontes canonicas; secoes ## 0..## 10 preservadas sem renumeracao; regras de soberania, notacao '+', prioridade FLAT_FEE, descontinuacao e assinaturas intactas; CLAUDE.md 99.249 -> ~94.700 bytes"
  - "Guarda de enderecos (tests/test_governanca_kernel_ponteiro.py) verde: nenhum endereco citado desapareceu; 40/40 no recorte de governanca/skills focado"
  - ".claude/GOVERNANCA/LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md reescrito para a piramide de 8 tiers vigente (era pre-piramide: 3 camadas, CHICO como 'GitHub Copilot/Gemini Super-Agente'); filename e caminho de injecao em engine/cognitive.py preservados"
  - "BIBLIA_TECNICA: renomeada de BIBLIA_TECNICA_SOTA_v6_2.md para BIBLIA_TECNICA.md (versao vive no frontmatter/titulo v8.0, nao no filename); referencias internas 'SOTA v6' corrigidas; ponteiro vivo em VITOI_PARADIGM_MANIFESTO_v7.md atualizado; referencias historicas em reports/ nao tocadas (sao registro do passado)"
  - "docs/GOVERNANCA_PIRAMIDAL_SOTA.md reconciliado: nomes de agentes inexistentes removidos (roster -> data/agents_manifest.json), contagens versionadas de testes/rotas removidas do no do Quality Gate, celula de tabela quebrada reconstruida, exemplo de assinatura atualizado para anatomia de 5 campos, tag Ollama nao inventariada marcada pendente"
  - "data/skills_registry.json: fronteira declarada entre .agents/skills (raiz local), .devin/skills (harness Devin), skills/ (submodulos git, nao raiz de skill) e ~/.agents/skills (escopo usuario, fora do repo)"
  - "Decisoes do Tier 0 preservadas: COSMOVISAO.md e ESTADO_ARTE_APRENDIZADO_GENERATIVO.md mantidos na injecao de contexto do cognitive.py sem alteracao; injecao nao foi podada nesta fase"
nao_verificado:
  - "Portao completo de pre-commit (sota:audit + suite integral) executado no commit desta fase; verificacao focada anterior: 40/40 governanca/skills, 6/6 catalogo, pyright 0 erros no teste novo"
  - "Fase 5 do plano de auditoria (coverage gate, benchmark de claims, caracterizacao de contratos) segue planejada, nao executada"
  - "docs/ e .claude/ podem conter outras copias historicas do roster de tiers em relatorios datados; sao registro do passado e nao foram reescritos -- apenas ponteiros vivos foram corrigidos"
referencias_nao_resolviveis: []
revisoes_de_ancora:
  - registro: auditoria-2026-09-03-trabalho-do-gemini-3-8-flash
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: auditoria-2026-09-12-o-ci-vermelho-que-nenhum-portao-local-media
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: auditoria-2026-09-24-mcp-gateway-compartilhado-e-persistencia
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: handoff-2026-09-22-integracao-system1-llm-dashboard
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: handoff-2026-09-25-governanca-pools-openrouter-e-impacto
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: handoff-2026-09-29-contraste-acessibilidade-e-identidade-de-condutor
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-02-correcao-de-escala-e-timestamp-no-ledger
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-03-triade-fronteira-chico-e-concorrencia
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-05-regua-para-agente-autonomo-de-nuvem
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-07-integracao-gpt6-astra-e-retirada-do-fable
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-08-arbitragem-soberana-sobre-a-lei-de-concorrencia
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-09-saneamento-medicao-datada-identificacao-agentes
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-14-harmonizacao-canonicos-astra-luna-gemini-anthropic
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-22-skill-handoff-e-calibracao
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-24-mcp-gateway-compartilhado-e-persistencia
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-25-precedencia-economica-assinaturas-pro-e-nuvem-free
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-25-skill-avaliacao-impacto-sessao
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-25-soberania-commit-push-e-staging-perpetuo
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-25-teto-de-commits-e-push-obrigatorio
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-12-anatomia-assinatura-5-campos
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-12-governanca-identidades-e-assinaturas
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-12-pool-multimodal-e-refactors-sonar
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-12-pools-chaves-reposicao-e-doc-consolidada
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-12-preferencia-devin-e-data-governanca
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-14-correcao-devin-e-entrypoints-gemini-3-1-pro
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-14-identidade-e-governanca-gemini-4-hydrogen
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-14-regua-graduada-familia-gemini-tier1
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-15-blindagem-calibracao-presencial-tier0
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-17-arbitragem-soberana-bypass-portao
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-11-17-auto-configuracao-harness-devin-swe2
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: validacao-2026-09-12-a-grade-que-nao-cabia-e-o-aviso-que-virou-bloqueio
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: validacao-2026-09-12-a-identidade-de-autoria-deixa-de-ser-prosa
    caminhos:
      - CLAUDE.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: o §0 do CLAUDE.md foi emagrecido -- o inventario inline de membros por tier virou data/model_catalog.json (fonte unica validada por tests/test_model_catalog.py contra agent_identities.json, model_registry.py, ollama_models.json e agents_manifest.json), e o documento passou a apontar para as fontes canonicas em vez de repetir roster. Nenhuma secao ## N foi renumerada ou removida (enderecos estaveis preservados), nenhuma regra de soberania/pirâmide/assinatura foi alterada, e a prosa continua sem contagem versionada de testes ou MCPs. As mudancas nao invalidam os contratos que este documento atestou nos caminhos ancorados; onde o texto do §0 mudou, a mudanca e de forma (ponteiro no lugar de copia), nao de substancia."
  - registro: registro-2026-09-01-resolucao-de-skill-e-referencia-por-ponto-de-partida
    caminhos:
      - data/skills_registry.json
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: data/skills_registry.json ganhou declaracao explicita da fronteira entre raizes de skill -- .agents/skills (raiz local de descoberta), .devin/skills (skills do harness Devin, fora do dominio de resolucao de agentes do projeto), skills/ (submodulos git de extensoes/bridges, nao raiz de skill de agente) e escopo de usuario (~/.agents/skills, fora do repo). O registry nao duplica conteudo de skills; a adicao e apenas documental. Nao altera os contratos que este documento atestou."
  - registro: registro-2026-10-18-resolucao-sonarqube-e-saneamento-global
    caminhos:
      - docs/GOVERNANCA_PIRAMIDAL_SOTA.md
    parecer: "Revisado em 2026-11-17. Fase 4 da auditoria SOTA de governanca: docs/GOVERNANCA_PIRAMIDAL_SOTA.md teve drift reconciliado -- nomes de agentes inexistentes (@arquiteto/@cientista/@guardiao/@redator) substituidos por ponteiro ao roster canonico em data/agents_manifest.json, contagens versionadas em prosa (testes/rotas) removidas do no do Quality Gate, linha de tabela com celula quebrada reconstruida, exemplo de assinatura atualizado para a anatomia vigente de 5 campos, e tag Ollama nao inventariada marcada como pendente de validacao. A secao 1 passou a declarar que o roster de membros vive em data/model_catalog.json. A matriz de especialidades/mitigacoes, que e o objeto deste documento, permanece."
---

# Fase 4 — Governança estrutural (auditoria SOTA)

Quinta fase do plano aprovado em 2026-11-17. Escopo: sanear a camada de
governança/documentação — o CLAUDE.md canônico inchado por cópias de dados que
já vivem em fontes canônicas, o documento de liderança superado injetado em
todo prompt de agente, drift de versão na BÍBLIA técnica, e a fronteira entre
os três diretórios de "skills" do repositório.

## Decisões e evidências

### F4.1 — inventário de tiers sai do §0 e vira fonte única

O §0 do CLAUDE.md carregava o roster completo da pirâmide de 8 tiers em prosa
— uma **quinta cópia** de dados que já vivem em fontes canônicas:

| Dado | Fonte canônica |
|---|---|
| Quem assina (autor, email, veículo, tier) | `data/agent_identities.json` |
| Capacidades/preço de API, autorização, tetos de esforço | `llm/model_registry.py` |
| Frota Ollama local | `data/ollama_models.json` |
| Os 19 agentes especialistas | `data/agents_manifest.json` |
| Cadeias de fallback | `data/system_config.json → model_routing` |

Foi criado `data/model_catalog.json`: roster legível por humanos por tier, com
`tipo` (`modelo-api`, `modelo-local`, `agente`, `bot`, `infra`, `frota-local`),
`status` e ponteiro de `fonte` para o detalhe volátil. O tier 6 agregado é
modelado como `frota-local` — ponteiro para o inventário Ollama inteiro — e
não como tag concreta (a primeira versão do teste pegou exatamente esse erro
de modelagem).

`tests/test_model_catalog.py` valida schema e **consistência cruzada** com as
quatro fontes — um modelo citado no catálogo que não resolve em nenhuma delas
falha o teste. No processo foram corrigidas tags Ollama que o §0 propagava sem
lastro no inventário medido (`gemma4:12b-unified-it` não existe em
`ollama list`; sufixos `:latest` e a tag `hf.co/unsloth/...` completa foram
alinhados).

O §0 foi reescrito como papéis + regras + ponteiros: soberania Tier 0,
sem-feudos, notação `+`, prioridade FLAT_FEE, política de descontinuação,
assinaturas e a tríade de fast operations permanecem — é governança, não
inventário. **Nenhuma seção `## N` foi renumerada ou removida**: o guarda
`test_governanca_kernel_ponteiro.py` trata os endereços como estáveis, e todos
os `§N` citados no repositório continuam resolvendo.

### F4.2 — LIDERANCA reescrito; BÍBLIA sem drift de versão

`LIDERANCA_GOVERNANCE_RAPHAEL_MAVERICK_CHICO.md` descrevia o modelo
**pré-pirâmide** (3 camadas, CHICO como "GitHub Copilot/Gemini Super-Agente
Administrativo", pipeline de 19 agentes) — e `engine/cognitive.py` o injeta no
system prompt de cada tarefa de agente. Ou seja, os agentes operavam com
governança vencida em runtime. Foi **reescrito** para a pirâmide vigente de 8
tiers (Tier 0 Raphael; CHICO coletivo Tier 1; frota de 19 + Qwen Tier 3;
Maverick como strategic epistemic Tier 3), mantendo filename e caminho de
injeção — o doc continua vivo, agora correto.

`BIBLIA_TECNICA_SOTA_v6_2.md` tinha filename v6_2, título/frontmatter v8.0 e
corpo "SOTA v6" — três versões para um documento. Renomeada para
`BIBLIA_TECNICA.md` (a versão vive no frontmatter, não no filename — doutrina
do próprio projeto), referências internas corrigidas para v8.0 e o ponteiro
vivo em `VITOI_PARADIGM_MANIFESTO_v7.md` atualizado. Citações em `reports/`
são históricas e não foram reescritas.

`docs/GOVERNANCA_PIRAMIDAL_SOTA.md` (matriz ativa, "verificada contra §0 em
2026-11-10") continha drift real: nomes de agentes inexistentes, contagens
versionadas de testes/rotas em prosa (o anti-padrão que os guards proíbem),
uma célula de tabela quebrada, um exemplo de assinatura que violava a regra
de autoria individual, e a tag Ollama fantasma. Tudo reconciliado; a matriz
de especialidades/mitigações — seu objeto — permanece, e a seção 1 agora
declara que o roster vive em `data/model_catalog.json`.

### F4.3 — fronteira de skills declarada

O sistema já era robusto (`skills_registry.json` declara `.agents/skills`
como raiz local; `skills/` são submódulos git de extensões, não skills de
agente). Faltava só a **declaração explícita** das fronteiras: `.devin/skills`
(3 skills do harness Devin: auto-review, design-system-review,
focused-verify), `skills/` (submódulos) e `~/.agents/skills` (escopo usuário,
fora do repo) agora constam do registry como fronteiras, sem duplicar
conteúdo de nenhuma skill.

### Decisões do Tier 0 preservadas

- `COSMOVISAO.md` e `ESTADO_ARTE_APRENDIZADO_GENERATIVO.md` permanecem na
  injeção de contexto do `cognitive.py`, inalterados — decisão explícita.
- `queue_manager.py` e `memory_rag.py` seguem deferidos da Fase 3.
- `.vscode/settings.json` (modificação alheia à fase) ficou fora do commit.

## Verificação

- Focado: `tests/test_model_catalog.py` 6/6; recorte governança+skills
  (`test_governanca_*`, `test_model_catalog`, skills registry) 40/40.
- Pyright no teste novo: 0 erros. Ruff/format limpos nos arquivos tocados.
- Portão de registro: `revisoes_de_ancora` reconcilia 37 registros vigentes
  ancorados em `CLAUDE.md`, `data/skills_registry.json` e
  `docs/GOVERNANCA_PIRAMIDAL_SOTA.md`.
- Portão completo de pre-commit (sota:audit + suíte integral + record gates):
  executado no commit desta fase — resultado no corpo do commit.

