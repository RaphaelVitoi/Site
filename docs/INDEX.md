# Índice Canônico de Engenharia

Este índice é o ponto de entrada documental do repositório. Ele organiza as fontes de verdade por decisão, não por ferramenta ou sessão de agente.

## Ordem de autoridade

1. [Kernel de governança](../governance/KERNEL.md) — autoridade, aprovação e regras de mutação.
2. [Regras mestras do repositório](../governance/REPOSITORY_RULES.md) — invariantes operacionais e roteamento de mudanças.
3. [Ambiente](../governance/environment.md) — perfis de execução e gates de qualidade.
4. [Mapa sistêmico](architecture/SYSTEM_MAP.md) — fronteiras de domínio e dependência.
5. [Matriz de roteamento](architecture/ROUTING_MATRIX.md) — destino, validação e revisão de cada tipo de mudança.
6. [Índice de dependências externas](architecture/DEPENDENCY_BOUNDARY_INDEX.md) — submódulos, origem e regra de atualização.
7. [Fronteira de integrações de host](security/HOST_INTEGRATION_BOUNDARY.md) — plugins, MCPs, hooks e arquivos locais.

## Referências existentes

| Necessidade | Referência |
|---|---|
| Topologia executiva e comandos de entrada | [README](../README.md) |
| Arquitetura Padrão-Ouro (4 Camadas & MCP) | [ARQUITETURA_PADRAO_OURO_SOTA_2026.md](ARQUITETURA_PADRAO_OURO_SOTA_2026.md) |
| Tratado Canônico da Perspectiva Matemática | [PERSPECTIVA_MATEMATICA_PMEV_MASTER.md](PERSPECTIVA_MATEMATICA_PMEV_MASTER.md) |
| Arquitetura de frontend | [architecture/frontend.md](architecture/frontend.md) |
| Banco, rotas e contratos | [architecture/SPEC_ROTEAMENTO_DB.md](architecture/SPEC_ROTEAMENTO_DB.md) |
| Simulador ICM/PMev | [architecture/SPEC_SIMULADOR_ICM_GLOBAL.md](architecture/SPEC_SIMULADOR_ICM_GLOBAL.md) |
| Auditorias e handoffs | [audits](audits) |
| Relatório Oficial de Sessão (2026-08-24) | [../reports/RELATORIO_SESSAO_2026_08_24_SOTA_v8_GOLD.md](../reports/RELATORIO_SESSAO_2026_08_24_SOTA_v8_GOLD.md) |
| Auditoria Mensal de Roteamento (2026_08) | [../reports/audits/AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_2026_08.md](../reports/audits/AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_2026_08.md) |
| Segurança | [security](security) |
| Pesquisa de produto e teoria | [research](research) |

Auditoria temporal recente: [quarentena do catálogo de plugins Claude — 2026-08-21](audits/2026-08-21-claude-plugin-quarantine.md).

## Regra de manutenção

Uma mudança estrutural só está concluída quando seu módulo, contrato, validação e documento canônico apontam para a mesma fonte de verdade. Relatórios temporários, caches, memórias de host e configurações de editor não substituem documentação versionada.
