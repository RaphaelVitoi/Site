# Índice de Fronteiras de Dependência

Este documento indexa dependências que são repositórios externos fixados. Ele não certifica uma origem por mera presença local: atualização exige revisão de origem, revisão de diff, pin e validação do consumidor.

## Submódulos versionados

| Caminho | Origem declarada | Papel no sistema | Regra de atualização |
|---|---|---|---|
| `core/vendor/eigen` | snapshot Eigen `0430489b826d88f7d3879232fe13468e16ced465` | álgebra linear vendorizada | atualizar somente por importação deliberada; validar builds numéricos |
| `skills/Stitch` | `github.com/gemini-cli-extensions/stitch` | extensão externa de design | revisar manifesto e privilégios; não tratar como núcleo |
| `skills/exa-mcp-server` | `github.com/exa-labs/exa-mcp-server` | servidor/conector externo | revisar rede, OAuth e comandos antes de habilitar |

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

Na auditoria de 22/08/2026, sete gitlinks apontavam para commits que já não eram recuperáveis dos upstreams declarados. Os seis adaptadores de `skills/` foram retirados do superprojeto; o Eigen, dependência viva do motor tensorial, foi convertido em snapshot vendorizado a partir do commit local limpo `0430489b826d88f7d3879232fe13468e16ced465`. As cópias locais e alterações auditadas permanecem preservadas fora desta mudança, aguardando fork ou vendor seletivo. Esta página é o índice de decisão; ela não substitui essa revisão.

O detalhe da classificação atual está em [docs/audits/2026-08-21-submodule-classification.md](../audits/2026-08-21-submodule-classification.md).
