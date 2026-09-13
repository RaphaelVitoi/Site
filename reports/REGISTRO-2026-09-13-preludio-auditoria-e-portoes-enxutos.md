---
id: registro-2026-09-13-preludio-auditoria-e-portoes-enxutos
tipo: registro
escopo: Site
ecossistema: nexus-sota
autor: claude@opus-5
criado_em: '2026-09-13T18:59:01-03:00'
atualizado_em: '2026-09-13T18:59:01-03:00'
classes: [interno, medido, preludio]
session_id: 186abdd7-d9aa-481f-bbe0-143b0d27bcff
conductor_model: claude-opus-5
conductor_vehicle: claude-code
supervision_mode: assistida
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  so: Windows
  python: '3.14.6'
  congelada_em: '2026-09-13'
verificado:
  - auditoria do ecossistema no inicio da sessao, com operacoes do dia registradas como arbitradas pelo Tier 0
  - token Notion literal em config/mcp_config.json migrado para HKCU NOTION_TOKEN sem exibir valor -- len 50, sha8 d8cabd0b
  - 21d098d1 -- __all__ do pmev_postflop_matrix corrigido, trabalho do Gemini commitado por arbitragem
  - 540601ba -- record_gate de 22,3 s para 1,5 s, pre-push sem sota audit repetido, commit-msg em ate 3 linhas
  - fef65ffe -- cache da fase CVE do cwv_gate, 33,4 s para 5,7 s, invalidacao por chave e por TTL provada
  - 0f033ad7 -- G2 so bloqueia registro VIGENTE; regra antiga e nova iguais em 233 registros
  - CI verde em 540601ba, fef65ffe e 0f033ad7; c1905461 estava vermelho antes da correcao
  - pre-commit do dia caiu de 40,1 s para 13,2 s
  - raiz 29c8fb6 -- autostart falhava no PowerShell 5.1 por splat de array; tarefa volta com codigo 0
  - raiz efa0696 -- Ollama servidor unico em 127.0.0.1, contexto 32768, flash attention e KV q8_0 medidos
  - Ollama qwen2.5-coder 7B q5 roda 32K 100% na GPU a 15,5 tok/s; gemma4:12b 6,3 tok/s a 32K e 77% na GPU
  - servidor de producao do frontend em 127.0.0.1:3000, LAN recusada
  - Tier 0 mediu erros por ciclo -- Claude Opus 5 3 a 4, GPT Sol e Astra 2 a 3, Gemini cerca de 7
nao_verificado:
  - notion-mcp-server lendo NOTION_TOKEN apos o reinicio do Antigravity -- nenhum processo ativo na checagem
  - token Notion ainda presente em 8 transcricoes do antigravity/brain e em 2 backups de rollback
  - autostart num logon real com o app do Ollama fechado
  - qualidade de saida com KV q8_0 alem da amostra do benchmark
  - efeito das mudancas de portao nos erros por ciclo de cada familia de modelo
---

# Prelúdio — auditoria e portões enxutos

Sessão ainda aberta. Este registro dá lastro ao que foi medido antes da
compactação; a nota do Tier 0 vem no handoff.

A sessão começou como auditoria do ecossistema e, pelo diagnóstico do Tier 0 de
que os portões gastavam tempo e provocavam erro em todas as famílias de modelo,
passou a reduzir o custo por tentativa sem remover verificação.
