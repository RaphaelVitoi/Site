# SPEC: Smart CLI v2.0 - "A Membrana Inteligente"

> **Autor:** @planner | **Baseado em:** IDENTITY_SPEC.md (@maverick)
> **Status:** Pronto para Implementacao

---

## 1. Visao Tecnica
O script `do.ps1` deixara de ser um wrapper passivo para se tornar uma interface conversacional ativa. Ele deve atuar como um **Roteador Heuristico**, interceptando input natural, classificando a intencao via Regex e formatando a saida com a identidade visual "Cyber/Sintetica" definida pelo Maverick.

---

## 2. Matriz de Captura de Intencao (Regex Engine)

O nucleo da inteligencia e um *Hashtable* associativo onde a Chave e o Agente e o Valor e o padrao Regex.

### 2.1 Mapeamento Obrigatorio

| Agente | Keywords/Padroes (Regex Case-Insensitive) | Intencao |
| :--- | :--- | :--- |
| **@implementor** | `(cria|codific|implement|bug|fix|erro|script|codigo|js|html|css|layout|design|imersiv|refinar)` | Execucao tecnica/Frontend |
| **@pesquisador** | `(pesquisa|busca|encontr|estado da arte|compar|lista|o que e)` | Exploracao |
| **@planner** | `(planej|estrutur|spec|prd|roadmap|arquitetur|como fazer)` | Arquitetura |
| **@auditor** | `(audit|verific|valid|confer|revis|seguran|compliance|check)` | Validacao |
| **@maverick** | `(ideia|inova|pensar|estrategia|analis|sentinela|invent|melhorar)` | Intelectual |
| **@curator** | `(etica|estetica|tom|texto|copy|revisao text|identidade|visual)` | Refinamento |

### 2.2 Logica de Resolucao (`Resolve-Intent`)
1. Iterar sobre o mapa.
2. Se `Input -match Regex`, incrementar score do agente.
3. Retornar o agente com maior score (ou o primeiro match em caso de empate).
4. Se nenhum match, retornar `$null` (fallback para input manual).

---

## 3. Identidade Visual & UX (Conforme IDENTITY_SPEC)

A interface deve abandonar o tom padrao do PowerShell.

### 3.1 Paleta de Cores (Write-Host)
- **Prompt:** `Cyan` (`[NEXUS] Awaiting Directive >`)
- **Sistema:** `DarkGray` (Logs internos, IDs)
- **Maverick/Inovacao:** `Magenta`
- **Sucesso/Confirmacao:** `Green`
- **Erro/Bloqueio:** `Red`

### 3.2 Easter Eggs (A Alma)
Ao iniciar o script sem argumentos (modo interativo), gerar um numero aleatorio (1-100).
- Se `rnd <= 5`: Exibir aforismo do Maverick (ex: *"Chaos is just unrecognized order."*) em `DarkMagenta` antes do prompt.

---

## 4. Arquitetura do Script (`do.ps1`)

### Fluxo de Execucao
1. **Boot:** Carregar `Agent-TaskManager.psm1`.
2. **Verificacao de Argumentos:**
   - Se `$args[0]` existe -> Processamento direto (Modo Rapido).
   - Se vazio -> **Modo Interativo (UI Rica)**.
3. **Modo Interativo:**
   - Renderizar Header "CHICO SMART CLI v2.0".
   - (Opcional) Renderizar Easter Egg.
   - Prompt: `[NEXUS] Awaiting Directive >`
   - Input: `Read-Host`
4. **Processamento:**
   - Sanitizar Input (Whitelist: `[a-zA-Z0-9\-\_\s\u00C0-\u00FF?.!]+`).
   - Executar `Resolve-Intent`.
5. **Confirmacao (The Handshake):**
   - Se agente detectado: `[PATTERN MATCH] Intent detected: '@agente'. Confirm? [Y/n]`
   - Se `Y` (ou enter): Enfileirar.
   - Se `n`: Pedir agente manualmente.
6. **Feedback:**
   - Exibir ID da Task em `DarkGray`.
   - Mensagem final: `[SYMMETRY] Integrity verified. Cycle complete.`

---

## 5. Checklist de Seguranca
- [ ] **Sanitizacao:** O input do usuario NUNCA deve ser executado como codigo (Invoke-Expression proibido). Apenas string literal para o JSON.
- [ ] **Escape:** Aspas no input do usuario devem ser escapadas antes de virar JSON.

---

## 6. Casos de Teste
1. Input: "criar um arquivo js" -> Deve sugerir `@implementor`.
2. Input: "analisar a estrategia" -> Deve sugerir `@maverick`.
3. Input: (Vazio) -> Deve abrir prompt interativo colorido.
