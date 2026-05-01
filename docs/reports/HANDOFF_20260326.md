# RELATÓRIO DE HANDOFF SOTA (26/03/2026)

## 1. Resumo da Purificação e Aprendizados

- **Blindagem de Encoding:** Descobrimos que o PowerShell clássico envia payloads de caracteres acentuados (ex: "í") usando `latin-1` / `Windows-1252`. O `task_executor.py` foi atualizado com um interceptador que realiza o fallback de decodificação, erradicando falhas HTTP 500 silenciosas.
- **A Ilusão do Rate Limit (Google API):** Constatamos que o limite do Free Tier do Gemini (15 RPM) é contabilizado **PerProject**. Rotacionar chaves de um mesmo projeto no GCP não contorna o limite.
- **Roteamento de Economia (Soberania Gemini):** Corrigimos o algoritmo de priorização de modelos. O sistema antes protegia equivocadamente o `Llama 3.1 8B` (que falhava em alucinações JSON) e o elevava acima do Gemini. A lógica agora força o Tier 0 para os modelos SOTA principais.
- **Ascensão Cognitiva SOTA:** Todo o ecossistema manifestado (Manifesto, RAG, Orquestrador e CLI) foi atualizado para abolir os modelos experimentais 1.5 e 2.0 em favor da nova geração madura: **gemini-2.5-flash** e **gemini-3.0-pro**.

## 2. Estado Atual do Sistema

- O Worker (`task_executor.py`) opera com Fricção Zero e máxima resiliência.
- O `do.ps1` orquestra perfeitamente as requisições nativas com fallback para SQLite.
- O RAG (`memory_rag.py`) está calibrado para comprimir e sintetizar inteligência usando os pesos 2.5 Flash de forma econômica.

## 3. Próximos Passos Estratégicos

- Iniciar a auditoria do MasterSimulator no Frontend (Next.js/React).
- Avaliar o impacto das novas latências de API no carregamento da UI.
