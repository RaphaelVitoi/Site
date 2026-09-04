---
id: registro-2026-09-03-saneamento-regras-instrucoes-e-contexto-sota-v8-gold
tipo: relatorio
escopo: Site
ecossistema: nexus-sota
autor: gemini-3.8-flash
criado_em: 2026-09-03T23:45:00-03:00
atualizado_em: 2026-09-03T23:45:00-03:00
classes: [interno, medido, governanca, saneamento]
caminhos:
  - .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md
  - .vscode/gemini-codeassist-custom-instructions.md
  - scripts/ops/datacloud_mcp_proxy.js
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  so: Windows
  python: '3.14.6'
verificado:
  - >-
    Saneamento e alinhamento de governanca com o Protocolo Master Chico SOTA
    v8.0 GOLD. Erradicada a premissa obsoleta da Boy Scout Rule e ativado
    o Target Lock e Limited Scope estrito em .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md
    e .vscode/gemini-codeassist-custom-instructions.md.
  - >-
    Triade LLM de modelos de fronteira atualizada para Gemini 3.8 Flash,
    Claude 5 Sonnet/Opus e ChatGPT 5.6 Terra/Sol.
  - >-
    Proxy scripts/ops/datacloud_mcp_proxy.js blindado e validado.
  - >-
    Portao cwv_gate.ps1 e record_gate.py validados sem violacoes bloqueantes.
nao_verificado:
  - >-
    Execucao em ambiente Linux de producao neste ciclo, visto que a suite e o
    quality gate foram validados localmente no ambiente Windows do operador.
revisoes_de_ancora:
  - registro: registro-2026-09-01-ancora-de-merge-e-instrucao-indexada
    caminhos:
      - .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md
    parecer: >-
      Revisado e mantido valido. A ancora em .claude/GOVERNANCA/GLOBAL_INSTRUCTIONS.md
      foi atualizada nesta sessao para consolidar a governanca sob o Protocolo
      Master SOTA v8.0 GOLD: substituicao formal da Boy Scout Rule por Target
      Lock e Limited Scope estritos, atualizacao da Triade LLM de modelos para
      Gemini 3.8 Flash, Claude 5 Sonnet/Opus e ChatGPT 5.6, com preservacao
      integral da blindagem Pure ASCII e dos contratos de governanca.
---

# Registro: Saneamento de Regras, Instrucoes e Contexto sob SOTA v8.0 GOLD

## 1. Contexto e Justificativa

Em continuidade ao ciclo de saneamento arquitetural da raiz multiprojeto e do
repositorio Site, este registro documenta a formalizacao e auditoria das
instrucoes globais, configuracoes assistivas e reconciliacao de ancoras exigidas
pelo portao M.O. 13.F.

## 2. Alteracoes Principais

1. **Expurgo da Boy Scout Rule:** Eliminada qualquer diretriz de modificacao
   oportunista ou refatoracao nao solicitada fora do escopo estrito.
2. **Target Lock e Limited Scope:** Fixadas politicas estritas de imutabilidade
   de linhas nao especificadas, preservacao de interfaces e contratos publicos,
   diffs atomicos de 120-150 linhas e tipagem estrita (PEP 585/604 e Zod/Pydantic).
3. **Triade LLM Atualizada:** Atualizada a definicao canonica da Triade LLM
   para Gemini 3.8 Flash (orquestracao e operacoes ageis), Claude 5 Sonnet/Opus
   (engenharia cirurgica e modelagem matematica) e ChatGPT 5.6 Terra/Sol
   (raciocinio profundo e AppSec).
4. **Reconciliacao de Ancoras:** Declarada secao 
evisoes_de_ancora para o
   registro historico 
egistro-2026-09-01-ancora-de-merge-e-instrucao-indexada.
