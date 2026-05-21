# Security Report

## Newly Introduced Vulnerabilities

### VULN-001: Hardcoded NextAuth Secret

* **Vulnerability:** Hardcoded Secret
* **Vulnerability Type:** Security
* **Severity:** High
* **Source Location:** `frontend/src/auth.ts`
* **Line Content:** `secret: process.env.AUTH_SECRET || "sota-quantum-nexus-secret-key-2026",`
* **Description:** A configuração do NextAuth utiliza uma string estática hardcoded como fallback caso a variável de ambiente `AUTH_SECRET` não seja fornecida. Se o sistema for executado em produção sem essa variável, um atacante pode utilizar essa string conhecida (vazada no código-fonte) para forjar e assinar tokens de sessão JWT maliciosos, resultando em bypass de autenticação e account takeover.
* **Recommendation:** Remova o fallback hardcoded. O aplicativo deve lançar um erro claro ou falhar ao iniciar caso a variável `AUTH_SECRET` não esteja presente, garantindo o "Fail Securely".

### VULN-002: Hardcoded Local API Token

* **Vulnerability:** Hardcoded API Key
* **Vulnerability Type:** Security
* **Severity:** Medium
* **Source Location:** `llm/gemma_local.py`
* **Line Content:** `headers = {"X-Vitoi-Auth": "sota-token-2026", "Content-Type": "application/json"}`
* **Description:** O token de autenticação local para a inferência do Gemma 4 está hardcoded no código. Embora o escopo seja local, hardcodar tokens em código fonte é uma falha estrutural que vaza credenciais em caso de repositório público ou vazamento de código.
* **Recommendation:** Utilizar a variável de ambiente `VITOI_AUTH_TOKEN` exigindo que a aplicação falhe (Fail Securely) caso a mesma não esteja presente.

### VULN-003: Command Injection via PowerShell Format String

* **Vulnerability:** PowerShell Command/XML Injection
* **Vulnerability Type:** Security
* **Severity:** High
* **Source Location:** `scripts/utils/notifications.py`
* **Line Content:** `$xml.LoadXml("<toast><visual><binding template='ToastText02'><text id='1'>{title}</text><text id='2'>{message}</text></binding></visual></toast>")`
* **Description:** As variáveis `title` e `message` fornecidas externamente eram injetadas diretamente em um comando que era invocado pelo `subprocess.Popen` via `powershell -Command`. Se a mensagem possuísse aspas simples (`'`) combinadas com payloads arbitrários de PS ou manipulação do buffer XML, poderia resultar em Remote Command Execution (RCE) no sistema operacional local.
* **Recommendation:** Fazer sanitização explícita nos parâmetros ou escapar símbolos HTML/XML restritivos para inviabilizar escape do payload XML, o que barra qualquer bypass subsequente no PS.
