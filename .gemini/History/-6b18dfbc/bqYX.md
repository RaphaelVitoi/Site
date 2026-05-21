# INVARIANTES ARQUITETURAIS SOTA (LEIS IMUTÁVEIS)

> **Fonte da Verdade:** Este arquivo contém as lições críticas e irrevogáveis aprendidas durante a evolução do ecossistema. Ele serve como memória de longo prazo para a IA e DEVE ser injetado em todos os prompts para prevenir regressão cognitiva. Violar uma invariante é uma falha sistêmica.

---

## INVARIANTE #1: O Veneno do Circuit Breaker Hiper-Reativo

- **Data da Descoberta:** 2026-03-27
- **Origem do Erro:** `task_executor.py` (versão legada).
- **Sintoma:** Falhas em cascata de 100% nas chaves de API, mesmo com chaves válidas no pool.
- **Causa Raiz:** Uma lógica de banimento que punia a **ROTA INTEIRA** (ex: `gemini-3.1-pro`) por uma falha de rede transitória (`Connection Closed`) em uma **ÚNICA CHAVE**.
- **A Lei Imutável:** **NUNCA** se deve banir uma rota inteira ou um modelo inteiro por causa de uma falha de chave individual. A punição deve ser cirúrgica e aplicada exclusivamente à **chave específica** que falhou (`provider:key_hash`). O banimento de rotas só pode ocorrer se *múltiplas chaves* naquela rota falharem em sequência, indicando um problema real no endpoint do provedor, e não um problema de chave ou rede local.
- **Diretriz de Implementação:** A lógica de `_register_route_failure` e `_block_key` deve ser sempre desacoplada. A falha de uma chave (`_block_key`) é um evento de baixa severidade. A falha de uma rota (`_register_route_failure`) é um evento de alta severidade que só pode ser acionado por falhas *agregadas* de múltiplas chaves.

---