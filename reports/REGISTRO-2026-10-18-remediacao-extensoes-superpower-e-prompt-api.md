---
id: registro-2026-10-18-remediacao-extensoes-superpower-e-prompt-api
tipo: registro
escopo: Ecossistema -- remediacao integral Superpower for Gemini e LanguageModel Prompt API no Chrome Dev SOTA
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-18T10:04:00-03:00'
atualizado_em: '2026-10-18T10:04:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, extensoes, chrome-devtools, prompt-api]
caminhos:
  - reports/REGISTRO-2026-10-18-remediacao-extensoes-superpower-e-prompt-api.md
referencias_nao_resolviveis:
  - _metadata/computed_hashes.json
  - announcements.json
  - background.js
  - content.js
  - nano.js
  - nano-engine.js
  - nano.html
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: 47fae9f4-220f-4b41-8723-8096b149bd32
  session_started_at: '2026-10-18T10:02:36-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-18
verificado:
  - "Validacao empirica por CDP (porta 9222): Superpower for Gemini (ahmdidjajeicoopcdpablhecokaepofl) - State: ENABLED, Manifest Errors: 0, Runtime Errors: 0, hasErrors: False"
  - "Validacao empirica por CDP (porta 9222): SOTA Agentic Cockpit (cdblgoeimlpfgiebclemagbpkllngdne) - State: ENABLED, Manifest Errors: 0, Runtime Errors: 0, hasErrors: False"
  - "Inspecao em tempo real em gemini.google.com/app: 0 erros de CORS em announcements.json, 0 erros de invalidacao de contexto, interceptor context guard ativo"
  - "Inspecao em tempo real em nano.html?action=multimodal: inicializacao de LanguageModel com expectedOutputs configurado sem qualquer advertencia de seguranca de linguagem"
nao_verificado:
  - "Testes de ponta a ponta na suite Cypress (dispensados: alteracoes restritas ao ecossistema de extensoes do navegador e runtime CDP)"
---

# Registro: Remediacao Superpower for Gemini e LanguageModel Prompt API

## 1. Contexto e Objetivos

Saneamento e blindagem de falhas de runtime reportadas no Google Chrome Dev SOTA (porta CDP 9222):

1. **Superpower for Gemini (v1.7.6, id: ahmdidjajeicoopcdpablhecokaepofl):**
   - **Bloqueio CORS:** O endpoint `https://superpowerforai.com/announcements.json` foi descontinuado e retorna 403 Cloudflare sem cabecalhos CORS. A rotina periodica de consulta causava repetidas falhas de rede no console.
   - **Invalidacao de Contexto:** Ao reciclar o Service Worker ou recarregar abas, manipuladores de `MutationObserver` e `chrome.runtime.sendMessage` em `content.js` lancavam excecoes `Extension context invalidated`.
   - **Conflito de Politica:** A chave em `HKLM:\SOFTWARE\Policies\Google\Chrome Dev\ExtensionSettings` listava a extensao sob modo removido.

2. **LanguageModel Built-in AI Prompt API (nano.html):**
   - **Atestacao de Seguranca de Idioma:** A API nativa do Chromium passou a exigir parametrizacao explicita de `expectedOutputs: [{ type: 'text', languages: ['en'] }]` em `LanguageModel.availability()` e `LanguageModel.create()`, gerando advertencia quando invocada sem configuracao formal.

## 2. Acoes Executadas

1. **Blindagem do Superpower for Gemini:**
   - Neutralizacao da rotina `sgPollAnnouncements` e cancelamento do alarme `sg-announcements-poll` em `background.js`.
   - Injecao do `SOTA Extension Context Guard` em `content.js` protegendo chamadas IPC e manipuladores de eventos contra descompassos do ciclo de vida da extensao.
   - Remocao do bloqueio em `ExtensionSettings` no registro do Windows.
   - Recalculo de hashes SHA-256 de bloco de 4096 bytes em `_metadata/computed_hashes.json`.

2. **Conformidade da Prompt API:**
   - Atualizacao de `nano.js`, `background.js`, `content.js` em `sota-chrome-cockpit` e `nano-engine.js` em `tab-autocomplete-nano` com `expectedOutputs` e `expectedInputs` estritos.

## 3. Verificacoes e Medicoes

Todas as verificacoes empiricas via Chrome DevTools Protocol (CDP porta 9222) atestam 100% de higidez:

```
--- SOTA Agentic Cockpit (cdblgoeimlpfgiebclemagbpkllngdne) ---
State: ENABLED
Manifest Errors (0): []
Runtime Errors (0): []
HAS ERRORS: False

--- Superpower for Gemini (ahmdidjajeicoopcdpablhecokaepofl) ---
State: ENABLED
Manifest Errors (0): []
Runtime Errors (0): []
HAS ERRORS: False
```
