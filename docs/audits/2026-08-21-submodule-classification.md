# Classificação de Submódulos — 21/08/2026

## Escopo

Auditoria estática dos nove submódulos declarados em `.gitmodules`, sem execução de código externo, sem rede e sem `reset`. O objetivo é separar desvio de segurança, patch legítimo e estado local ainda não comprovado.

## Resultado

| Submódulo | Alteração local | Natureza observada | Risco operacional | Decisão atual |
|---|---:|---|---|---|
| `core/vendor/eigen` | não | limpo no HEAD fixado | baixo | preservar |
| `skills/Stitch` | 1 arquivo | manifesto/configuração | médio | revisar diff isolado |
| `skills/exa-mcp-server` | 27 arquivos + 2 não rastreados | OAuth, parsing de ambiente, API e testes | alto | manter desabilitado; revisar antes de promover |
| `skills/gemini-cli-jules` | 2 arquivos | workflow e executor Node | alto | revisar origem e subprocesso |
| `skills/gemini-cli-security` | 10 arquivos + 1 não rastreado | MCP, filesystem, workflow e actionlint | alto | revisar permissões e CI |
| `skills/gemini-deep-research` | 10 arquivos | runtime, watcher e workflows | médio/alto | revisar subprocesso e egress |
| `skills/gemini-supermemory` | 12 arquivos | hooks, servidor, API externa e persistência | alto | manter desabilitado; revisão prioritária |
| `skills/superpowers` | 11 arquivos | plugins OpenCode, scripts e testes | alto | não carregar instruções como política |
| `skills/token-efficiency` | 1 arquivo | plugin OpenCode | médio | revisar diff e manter fora da ativação |

## Evidências negativas

As linhas adicionadas que dispararam a triagem são imports de `node:child_process`, parsing de headers/URLs e chamadas de API. Não foi encontrada, nas linhas adicionadas, evidência textual de `curl`, `wget`, `Invoke-WebRequest`, PowerShell codificado, `remote-allow-origins`, Arko ou Serena.

Essa ausência não certifica segurança do fornecedor; apenas impede classificá-los como malware com base nessa busca. O estado correto continua sendo **presente, fixado, não habilitado e pendente de revisão**.

## Arquivos não rastreados

- `skills/exa-mcp-server/src/utils/env.ts` e seu teste: schema de ambiente e validação; contém nomes de variáveis, não valores.
- `skills/gemini-cli-security/.github/actionlint.yaml`: configuração de validação de workflow; contém nomes de variáveis CI, não credenciais.

## Regra de decisão

Nenhum submódulo deve ser resetado, atualizado, habilitado ou movido até que o diff correspondente tenha revisão própria, teste do consumidor e decisão registrada. A ativação global do Codex permanece limitada aos plugins nativos; a presença física em `skills/` não equivale a autorização.
