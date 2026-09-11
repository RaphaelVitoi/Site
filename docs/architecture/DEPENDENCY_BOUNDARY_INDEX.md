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

### As oito alterações locais, todas classificadas em 11/09/2026

Em 10/09 havia oito diretórios de `skills/` com árvore suja em HEAD desanexado,
invisíveis ao `git status` do superprojeto por `ignore = dirty`. Todas foram
revisadas por diff e classificadas pela regra 4 acima. **Nenhuma era desvio.**

| Submódulo | Natureza medida | Verificação | Branch no fork |
| :--- | :--- | :--- | :--- |
| `exa-mcp-server` | 20 achados SonarLint; stub de teste sem `registerTool` reprovava 20 testes | 158/158, tsc 0 | `chore/sonarlint-campaign-20260911` |
| `Stitch` | escopo OAuth `cloud_platform` → `cloud-platform`; **bug real** | comparação com escopo canônico | `fix/escopo-oauth-cloud-platform` |
| `gemini-cli-jules` | injeção de script no workflow; `Reflect` removido | tsc paritário, 2/2 | `fix/injecao-no-workflow-e-registro-da-tool` |
| `gemini-cli-security` | extração de runners em `runPoc`; `vitest.config.ts` próprio | tsc 0; 32/36, **idêntico ao upstream** | `refactor-runners-de-poc-e-fronteira-do-vitest` |
| `gemini-deep-research` | `node:`, tipagem de mock, supressões estreitas | tsc 0, jest 47/47, eslint limpo | `chore/lint-e-tipagem-de-mock` |
| `gemini-supermemory` | **remove egress automático de sessão** | build 0; artefato órfão em `dist/` removido | `refactor/remove-egress-automatico-de-sessao` |
| `superpowers` | `node:`, `exec`, sonda de `dot` que roda no Windows | pytest 19/19, node:test 6/6 | `chore/lint-e-sonda-de-dot-no-windows` |
| `token-efficiency` | prefixo `node:` | leitura | `chore/prefixo-node-nos-imports` |

`core/vendor/eigen` estava limpo e segue limpo.

**O fork é destino do patch, não nova origem.** Em todos os oito casos, o `origin`
do submódulo e o ponteiro no superprojeto ficaram **inalterados**. Repontar criaria
obrigação permanente de rebase a cada versão upstream, para pacotes que a auditoria
manda *manter desabilitados até revisão*; e mudaria em silêncio a origem declarada
na tabela acima, que existe justamente para impedir isso. Vendorizar foi recusado
pelo mesmo motivo: apagaria a fronteira que este documento mantém.

Consequência para quem clonar: `git submodule update --init` traz o upstream sem os
consertos, **e isso é o esperado**. Os patches estão pinados e localizáveis; promovê-los
é ato deliberado, não efeito colateral.

**Dois achados que a revisão produziu e a contagem não mostraria.** No
`gemini-supermemory`, `src/hooks/session-end.js` enviava um resumo de cada sessão de
código para a API da Supermemory a cada encerramento; a remoção era necessária, e
estava *pela metade* — o artefato compilado `dist/hooks/session-end.js` seguia
versionado com o código de envio dentro. No `gemini-cli-jules`, o workflow
interpolava `${{ github.event.release.tag_name }}` direto num `run:`, que é o vetor
clássico de injeção de script em Actions.

Varredura de credencial com `data/PADROES_DE_CREDENCIAL.json` em todos os
submódulos antes de publicar: uma única ocorrência, em `gemini-cli-security/GEMINI.md`,
e é **falso positivo por construção** — a documentação da ferramenta lista
`-----BEGIN RSA PRIVATE KEY` como padrão a detectar. Arquivo intocado e já público
no upstream.
