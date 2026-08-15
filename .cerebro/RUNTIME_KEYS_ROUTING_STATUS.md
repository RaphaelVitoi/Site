# Runtime Keys and Routing Status

- timestamp: 2026-06-20T03:59:59.436929+00:00
- total_keys: 9
- online_keys: 3
- failed_keys: 6
- validation_method: Gemini=ListModels; OpenRouter=Models; Anthropic=Messages ping

## Routing Notes
- Chaves Gemini validadas via endpoint /v1beta/models (ListModels).
- Falha de modelo fixo nao invalida chave; separar problema de roteamento de modelo.

## Last Audit Rows
- Gemini | AIzaSy...kVr4 | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | AIzaSy...sx_A | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | AIzaSy...hgSk | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | AIzaSy...BktM | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | AIzaSy...Orck | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | origin...8419 | FALHA | HTTP 400 (chave/permissao) | N/A
- OpenRouter | sk-or-...ec70 | ONLINE | Operacional SOTA | 0.14s
- OpenRouter | sk-or-...55b0 | ONLINE | Operacional SOTA | 0.11s
- OpenRouter | sk-or-...8e86 | ONLINE | Operacional SOTA | 0.09s