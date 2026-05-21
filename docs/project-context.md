# Poker Racional: Contexto do Projeto (SOTA v6)

## Visão Geral
Repositório central do ecossistema **Poker Racional**, integrando um motor de equidade de alta performance (Rust/WASM) a uma interface reativa de última geração (React 19/Antigravity).

## Ecossistema de Execução (Identidades)
- **Gemini CLI (Chico)**: Super-Admin, Gerente do Sistema, orquestrador mestre e núcleo analítico profundo.
- **Antigravity**: Córtex Visual e interface de visualização via MCP.
- **Gemini Code Assist**: Braço Executor Técnico do Chico, responsável pela automação de código e refatoração inline no VSCode.
- **VSCode**: Ambiente de Desenvolvimento (IDE) otimizado e limpo.

## Diretórios Chave
- `/Site`: Código fonte do projeto Poker Racional.
  - `/frontend`: Interface reativa Next.js (React 19) e integração WASM.
  - `/api`: Endpoints do backend em Python (FastAPI).
  - `/wasm-equity` / `/engine`: Motor de Equidade em Rust copilado para WASM.
- `/docs/architecture`: Documentação técnica e especificações.
  - `THEORY_SOTA_CONVENCIONAL.md`: Framework Perspectiva/Esperança.

## Mandatos Técnicos
1. **Zero-Any**: Tipagem estrita via Zod no frontend e Pydantic no backend.
2. **Shannon Limit**: Minimização de ruído em logs e console outputs (auditoria de logs ativa).
3. **Pure ASCII Backend**: Servidores e logs operam estritamente em ASCII.
4. **Verificação Matemática**: Mudanças no motor e lógica de equidade exigem validação via `test_math_sota.py` e `test_math_rio.py`.

---
*Este arquivo serve como âncora de conhecimento para todos os agentes do sistema.*
