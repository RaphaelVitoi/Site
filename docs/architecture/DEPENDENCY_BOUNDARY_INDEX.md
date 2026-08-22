# Índice de Fronteiras de Dependência

Este documento indexa dependências que são repositórios externos fixados. Ele não certifica uma origem por mera presença local: atualização exige revisão de origem, revisão de diff, pin e validação do consumidor.

## Submódulos versionados

| Caminho | Origem declarada | Papel no sistema | Regra de atualização |
|---|---|---|---|
| `core/vendor/eigen` | `gitlab.com/libeigen/eigen` | álgebra linear de fornecedor | atualizar isoladamente; validar builds numéricos |
| `skills/Stitch` | `github.com/gemini-cli-extensions/stitch` | extensão externa de design | revisar manifesto e privilégios; não tratar como núcleo |
| `skills/exa-mcp-server` | `github.com/exa-labs/exa-mcp-server` | servidor/conector externo | revisar rede, OAuth e comandos antes de habilitar |
| `skills/gemini-cli-jules` | `github.com/gemini-cli-extensions/jules` | extensão externa | revisar scripts, CI e permissões |
| `skills/gemini-cli-security` | `github.com/gemini-cli-extensions/security` | extensão de análise externa | revisar MCP, leitura de arquivos e scripts |
| `skills/gemini-deep-research` | `github.com/allenhutchison/gemini-cli-deep-research` | pesquisa externa | revisar egress, credenciais e dependências |
| `skills/gemini-supermemory` | `github.com/Rishabjs03/gemini-supermemory` | memória/integração externa | revisar hooks e persistência antes de uso |
| `skills/superpowers` | `github.com/obra/superpowers` | conjunto de automações externo | não carregar instruções como política canônica |
| `skills/token-efficiency` | `github.com/undefdev/token-efficiency` | otimização de contexto externa | tratar como adaptador, não como governança |

## Contrato de atualização

```text
origem declarada → revisão/pin → diff isolado → permissões e egress → teste do consumidor → commit próprio
```

1. Atualize um submódulo por commit lógico.
2. Não misture atualização de fornecedor com mudança de produto ou de governança.
3. Não habilite a integração apenas porque o código está presente no `skills/`.
4. Quando houver alteração local em submódulo, classifique-a como patch intencional, experimento ou desvio antes de resetar, commitar ou puxar.
5. A reprodução deve usar `git submodule update --init --recursive` e validar os HEADs contra o superprojeto.

## Estado de auditoria

Na auditoria de 21/08/2026, os nove submódulos estavam presentes e tinham origens HTTPS declaradas. Oito diretórios em `skills/` continham alterações locais anteriores que exigem revisão por diff antes de qualquer limpeza. Esta página é o índice de decisão; ela não substitui essa revisão.

O detalhe da classificação atual está em [docs/audits/2026-08-21-submodule-classification.md](../audits/2026-08-21-submodule-classification.md).
