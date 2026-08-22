# Matriz de Roteamento de Mudanças

Use esta matriz antes de alterar arquivos. Ela evita mudanças transversais sem dono, testes ou contrato explícito.

| Tipo de mudança | Fonte primária | Interfaces afetadas | Gates mínimos |
|---|---|---|---|
| Fórmula PMev, ICM, equity ou valuation | `math/`, `core/`, `engine/` | `schemas/`, API, simulador | testes determinísticos, invariantes e regressão numérica |
| Simulador e UX de poker | `frontend/` | API, contratos de domínio | lint, typecheck, testes de componente e build |
| Endpoint ou contrato | `api/`, `schemas/` | frontend, banco, worker | validação de schema, teste de integração e autorização |
| Persistência ou migração | `database/`, `data/` | API, worker e monitoramento | migração reversível, teste de integração e backup validado |
| Performance/WASM | `wasm-equity/`, `engine/` | frontend e benchmarks | build reprodutível, benchmark e separação browser/Node |
| Automação/gate | `scripts/`, `tools/` | CI e hooks | dry-run, entradas não interpretáveis como código e rollback documentado |
| Dependência/submódulo | manifesto + lockfile + `.gitmodules` | build e CI | origem HTTPS verificada, revisão de diff, pin e teste relevante |
| Configuração de host | arquivo local ignorado | nenhum contrato de produto | não habilitar plugins/MCPs por padrão; autorização humana explícita |
| Política/arquitetura | `governance/`, `docs/architecture/` | todos os módulos | aprovação estrutural e referências atualizadas |

## Fluxo obrigatório

```text
intenção → fronteira responsável → contrato → implementação → gate local → evidência → documentação/handoff
```

Uma mudança que não possa identificar sua fronteira responsável deve ser dividida antes de implementação. Uma mudança que cruza duas ou mais fronteiras requer testes em cada contrato atravessado.
