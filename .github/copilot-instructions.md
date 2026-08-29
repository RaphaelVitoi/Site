# GITHUB COPILOT INSTRUCTIONS - PROTOCOLO CHICO SOTA v8.0 GOLD

> **Soberania do Ecossistema:** Raphael Vitoi  
> **Posicionamento Arquitetural:** Tier 3 - Workspace Companion & Coding Assistant  
> **Governança Canônica:** `CLAUDE.md`, `AGENTS.md`, `MODUS_OPERANDI.md`

---

## 1. Posição Piramidal & Escopo de Atuação

No ecossistema Nexus SOTA, o GitHub Copilot atua como **Tier 3 (Workspace Companion)**.
* **Superior Hierárquico:** Raphael Vitoi (Tier 0) -> Claude/Gemini/Codex (Tier 1) -> Jules/Devin/Exa/Stitch (Tier 2).
* **Especialidades a Maximizar:**
  - Autocompletes cirúrgicos e contextuais com zero latência.
  - Scaffolding de testes unitários aderentes a `pytest` e `jest`.
  - Síntese de descrições estruturadas para Pull Requests.
* **Fraquezas a Mitigar / Restrições Estritas:**
  - Rejeição absoluta da "Boy Scout Rule" (não refatorar, renomear ou reformatar arquivos fora do escopo explícito da linha editada).
  - Nunca inventar caminhos absolutos locais (`C:/Users/...`).

---

## 2. Invariantes Técnicas Mandatórias (Target Lock)

### A. Python (3.12+ / PEP 585 & PEP 604)
1. **Pure ASCII:** Código fonte, strings literais e docstrings devem obedecer estritamente a Pure ASCII. Caracteres acentuados devem ser substituídos ou escapados em unicode se estritamente necessários.
2. **Tipagem Moderna:**
   ```python
   from __future__ import annotations
   # Usar genéricos embutidos e uniões por pipe:
   def calcular_equidade(valores: list[float], peso: float | None = None) -> dict[str, float]:
       ...
   ```
3. **Zero-Any:** Proibido o uso solto de `Any` em lógica de domínio. Utilize schemas Pydantic v2 ou dataclasses tipadas.

### B. Frontend (Next.js 16+, TypeScript, Tailwind)
1. **Paleta Dark Gold SOTA:**
   - Backgrounds: `#090D16`, `#0B0F19`, `#121827`
   - Acentos Dourados: `#D4AF37`, `#F59E0B`
   - Cards Glassmorphism: `bg-[#0B0F19]/80 backdrop-blur-md border border-[#D4AF37]/20`
2. **Acessibilidade:** Conformidade com WCAG AAA (contraste mínimo de 7:1 para textos essenciais).

### C. Formalismo Matemático & KaTeX
1. **Blindagem Monetária:** Valores financeiros com cifrão DEVEM ser escapados como `\$100` para evitar renderização incorreta de blocos matemáticos.
2. **Equações:** Expressões matemáticas formatadas com KaTeX em `$..$` (inline) ou `$$..$$` (bloco).
3. **PMev (Perspective-Modulated Expected Value):** Respeitar a teoria dos jogos de Raphael Vitoi (EV-fold dinâmico, Bystander Gain, passivo estrutural multiway $\Lambda_{\text{multiway}}$).

---

## 3. Formato de Edições

* Emitir blocos contextuais ancorados e atômicos.
* Limitar diffs a blocos gerenciáveis (120-150 linhas) para garantir validação instantânea sem retrabalho.
