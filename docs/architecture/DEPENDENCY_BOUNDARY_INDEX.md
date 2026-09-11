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

### Uma das oito alterações locais, classificada em 11/09/2026

`skills/exa-mcp-server` era, em 10/09, uma árvore suja em HEAD desanexado com 22
arquivos modificados e 20 de 158 testes reprovando. Revisada por diff, corrigida e
**classificada como patch intencional** pela regra 4 acima.

| Fato | Valor |
| :--- | :--- |
| Commit do patch | `f3b1349` |
| Onde vive | `github.com/RaphaelVitoi/exa-mcp-server`, branch `chore/sonarlint-campaign-20260911` |
| Origem declarada | **inalterada** — `origin` do submódulo segue `exa-labs/exa-mcp-server` |
| Ponteiro no superprojeto | **inalterado** — `15ffb505`, o HEAD upstream |

**O fork é destino do patch, não nova origem.** Repontar o submódulo criaria
obrigação permanente de rebase a cada versão upstream, para um pacote que a
auditoria manda *manter desabilitado até revisão*; e mudaria em silêncio a origem
declarada na tabela acima, que existe justamente para impedir isso. Vendorizar foi
recusado pelo mesmo motivo: apagaria a fronteira que este documento mantém, e 473 KB
de código externo de OAuth e rede passariam a parecer código próprio num repositório
público.

Consequência para quem clonar: `git submodule update --init` traz o upstream sem os
consertos, **e isso é o esperado**. O patch está pinado e localizável; promovê-lo é
ato deliberado, não efeito colateral.

As outras sete alterações locais seguem sem revisão por diff. Varredura de
credencial com `data/PADROES_DE_CREDENCIAL.json` nos 88 arquivos rastreados do
`exa-mcp-server` antes da publicação do fork: zero ocorrências.
