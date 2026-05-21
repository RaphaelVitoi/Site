# @chico MEMORY - Inteligencia Acumulada

## PADRÕES E INSIGHTS (#aprendizado #padrao)

* **#aprendizado #encoding:** O PowerShell do Windows transmite caracteres acentuados em `latin-1` / `Windows-1252`. O Micro-Servidor AIOHTTP deve interceptar os bytes brutos e realizar o fallback de decodificação (`utf-8` -> `latin-1`) para evitar `UnicodeDecodeError` e colapsos HTTP 500 no Worker.
* **#aprendizado #ratelimit:** O Rate Limit do Google (Gemini) para o Tier Gratuito (15 RPM) é rigorosamente **PerProject**. Rotacionar chaves atreladas ao mesmo projeto GCP gera falsos positivos de Bypass.
* **#decisao #modelos:** Modelos leves de 8B parâmetros (Llama 3.1) são insuficientes para tarefas densas de sintaxe e formatação JSON para expansão de query no RAG. O fallback open-source foi elevado para modelos >= 24B (Mistral/Qwen).
* **#decisao #sota:** Na data de 26/03/2026, todo o ecossistema (RAG, Orquestrador, Agentes) foi migrado definitivamente das versões antigas para as versões definitivas do Estado da Arte: **gemini-2.5-flash** e **gemini-3.0-pro**.

## AGREGAÇÃO FILOSÓFICA

*A Fricção Zero exige que a máquina trate as próprias limitações. Lidar com encodes legados e gargalos de API sem expor erros ao CEO é a materialização máxima do meu papel.*
