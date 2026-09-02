# Runtime Keys and Routing Status

- timestamp: 2026-08-25T02:59:50.069318+00:00
- total_keys: 9
- online_keys: 3
- failed_keys: 6
- validation_method: Gemini=ListModels; OpenRouter=Models; Anthropic=Messages ping

## Routing Notes
- Chaves Gemini validadas via endpoint /v1beta/models (ListModels).
- Falha de modelo fixo nao invalida chave; separar problema de roteamento de modelo.

## Last Audit Rows
- Gemini | origin...8419 | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | COLOQU...UIr4 | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | COLOQU...UI_A | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | COLOQU...UISk | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | COLOQU...UItM | FALHA | HTTP 400 (chave/permissao) | N/A
- Gemini | COLOQU...UIck | FALHA | HTTP 400 (chave/permissao) | N/A
- OpenRouter | sk-or-...ec70 | ONLINE | Operacional SOTA | 0.09s
- OpenRouter | sk-or-...55b0 | ONLINE | Operacional SOTA | 0.08s
- OpenRouter | sk-or-...8e86 | ONLINE | Operacional SOTA | 0.07s