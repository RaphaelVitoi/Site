# SPEC: Smart CLI v2.0 - "A Membrana Inteligente"

> **Autor:** @planner | **Baseado em:** IDENTITY_SPEC.md (@maverick)
> **Status:** Pronto para Implementação

---

## 1. Visão Técnica
O script `do.ps1` deixará de ser um wrapper passivo para se tornar uma interface conversacional ativa. Ele deve atuar como um **Roteador Heurístico**, interceptando input natural, classificando a intenção via Regex e formatando a saída com a identidade visual "Cyber/Sintética" definida pelo Maverick.

---

## 2. Matriz de Captura de Intenção (Regex Engine)

O núcleo da inteligência é um *Hashtable* associativo onde a Chave é o Agente e o Valor é o padrão Regex.

### 2.1 Mapeamento Obrigatório

| Agente | Keywords/Padrões (Regex Case-Insensitive) | Intenção |
| :--- | :--- | :--- |
| **@implementor** | `(cria|codific|implement|bug|fix|erro|script|código|js|html|css|layout|design|imersiv|refinar)` | Execução técnica/Frontend |
| **@pesquisador** | `(pesquisa|busca|encontr|estado da arte|compar|lista|o que é)` | Exploração |
| **@planner** | `(planej|estrutur|spec|prd|roadmap|arquitetur|como fazer)` | Arquitetura |
| **@auditor** | `(audit|verific|valid|confer|revis|seguran|compliance|check)` | Validação |
| **@maverick** | `(ideia|inova|pensar|estratégia|analis|sentinela|invent|melhorar)` | Intelectual |
| **@curator** | `(ética|estética|tom|texto|copy|revisão text|identidade|visual)` | Refinamento |

### 2.2 Lógica de Resolução (`Resolve-Intent`)
1. Iterar sobre o mapa.
2. Se `Input -match Regex`, incrementar score do agente.
3. Retornar o agente com maior score (ou o primeiro match em caso de empate).
4. Se nenhum match, retornar `$null` (fallback para input manual).

---

## 3. Identidade Visual & UX (Conforme IDENTITY_SPEC)

A interface deve abandonar o tom padrão do PowerShell.

### 3.1 Paleta de Cores (Write-Host)
- **Prompt:** `Cyan` (`[NEXUS] Awaiting Directive >`)
- **Sistema:** `DarkGray` (Logs internos, IDs)
- **Maverick/Inovação:** `Magenta`
- **Sucesso/Confirmação:** `Green`
- **Erro/Bloqueio:** `Red`

### 3.2 Easter Eggs (A Alma)
Ao iniciar o script sem argumentos (modo interativo), gerar um número aleatório (1-100).
- Se `rnd <= 5`: Exibir aforismo do Maverick (ex: *"Chaos is just unrecognized order."*) em `DarkMagenta` antes do prompt.

---

## 4. Arquitetura do Script (`do.ps1`)

### Fluxo de Execução
1. **Boot:** Carregar `Agent-TaskManager.psm1`.
2. **Verificação de Argumentos:**
   - Se `$args[0]` existe -> Processamento direto (Modo Rápido).
   - Se vazio -> **Modo Interativo (UI Rica)**.
3. **Modo Interativo:**
   - Renderizar Header "CHICO SMART CLI v2.0".
   - (Opcional) Renderizar Easter Egg.
   - Prompt: `[NEXUS] Awaiting Directive >`
   - Input: `Read-Host`
4. **Processamento:**
   - Sanitizar Input (Whitelist: `[a-zA-Z0-9\-\_\s\u00C0-\u00FF?.!]+`).
   - Executar `Resolve-Intent`.
5. **Confirmação (The Handshake):**
   - Se agente detectado: `[PATTERN MATCH] Intent detected: '@agente'. Confirm? [Y/n]`
   - Se `Y` (ou enter): Enfileirar.
   - Se `n`: Pedir agente manualmente.
6. **Feedback:**
   - Exibir ID da Task em `DarkGray`.
   - Mensagem final: `[SYMMETRY] Integrity verified. Cycle complete.`

---

## 5. Checklist de Segurança
- [ ] **Sanitização:** O input do usuário NUNCA deve ser executado como código (Invoke-Expression proibido). Apenas string literal para o JSON.
- [ ] **Escape:** Aspas no input do usuário devem ser escapadas antes de virar JSON.

---

## 6. Casos de Teste
1. Input: "criar um arquivo js" -> Deve sugerir `@implementor`.
2. Input: "analisar a estratégia" -> Deve sugerir `@maverick`.
3. Input: (Vazio) -> Deve abrir prompt interativo colorido.