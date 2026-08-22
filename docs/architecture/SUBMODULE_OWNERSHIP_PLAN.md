# Plano de Propriedade dos Submódulos

## Decisão

O `Site` não deve transformar todo adaptador externo em dependência proprietária. A posse segue o consumidor vivo e a necessidade de manter patches próprios.

| Grupo | Componentes | Contrato |
|---|---|---|
| Vendor proprietário | `core/vendor/eigen` | Dependência viva do motor tensorial; snapshot limpo `0430489b…` incorporado ao `Site` para eliminar gitlink irrecuperável. |
| Fork próprio futuro | `gemini-cli-security` | Hardening local a preservar, mas o pin upstream não é recuperável. Só reentra após existir fork acessível e revisado. |
| Pin upstream opcional | `Stitch`, `exa-mcp-server` | Gitlinks recuperáveis; permanecem externos e fora do runtime central. |
| Arquivo local aguardando decisão | `gemini-cli-jules`, `gemini-deep-research`, `gemini-supermemory`, `superpowers`, `token-efficiency` | Sem consumidor vivo suficiente ou com pin upstream não recuperável. Saem do superprojeto; cópias locais não são apagadas. |

## Invariantes

1. Todo gitlink declarado em `.gitmodules` deve corresponder a um gitlink versionado, e vice-versa.
2. Nenhum fork é criado por conveniência; cada fork precisa de consumidor, mantenedor e política de atualização explícitos.
3. Dependências opcionais não podem ampliar o grafo automático de instalação da aplicação central.
4. Um gitlink sem commit recuperável no remoto é inválido e deve sair do superprojeto até ser substituído por fork ou vendor cloneável.
5. Alterações locais em submódulos externos não podem ser publicadas como gitlinks antes de existirem em um remoto cloneável.
