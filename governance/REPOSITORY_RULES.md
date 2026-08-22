# Regras Mestras do Repositório

## Objetivo

Converter o repositório em um sistema navegável, auditável e reprodutível: cada decisão possui fonte de verdade, cada módulo possui fronteira e cada automação possui validação.

## Invariantes operacionais

1. **Uma responsabilidade, uma fonte primária.** Fórmulas em `math/core/engine`, interfaces em `frontend`, contratos em `schemas/api`, política em `governance`.
2. **Host não é sistema de registro.** Configurações de editor e agente são locais, reversíveis e não podem ativar capacidade externa por herança.
3. **Dependência é código de fornecedor.** Todo submódulo, pacote e binário entra por origem verificável, revisão, pin e teste.
4. **Estado transitório não vira arquitetura.** Caches, logs, relatórios efêmeros, memória de sessão e artefatos de build devem ser ignorados ou arquivados fora do caminho canônico.
5. **Mudança estrutural requer roteamento.** Antes de mover, renomear ou fundir diretórios, declare consumidores, contratos, plano de migração e rollback.
6. **Segurança falha fechada.** Quando política, origem, credencial ou validade não puder ser comprovada, a integração fica desabilitada.

## Convenções de localização

| Conteúdo | Local canônico |
|---|---|
| Constituição, aprovação e autonomia | `governance/` |
| Mapa e decisões de arquitetura | `docs/architecture/` |
| Segurança, auditoria e exceções | `docs/security/`, `docs/audits/` |
| Produto, teoria e pesquisa | `docs/research/`, `docs/epics/` |
| Código de domínio | `core/`, `engine/`, `math/`, `schemas/` |
| Interfaces e entradas | `frontend/`, `api/`, `cli/` |
| Operação reprodutível | `scripts/`, `tools/`, CI |
| Terceiros fixados | `skills/`, `core/vendor/` |

## Protocolo de mudança

1. Classifique a mudança pela [matriz de roteamento](../docs/architecture/ROUTING_MATRIX.md).
2. Faça alteração mínima em uma fronteira por vez.
3. Execute os gates definidos para essa fronteira.
4. Registre evidência e atualize a referência canônica quando contrato ou comportamento mudar.
5. Só então faça handoff, commit ou promoção.
