# Índice Canônico de Engenharia

Este índice é o ponto de entrada documental do repositório. Ele organiza as fontes de verdade por decisão, não por ferramenta ou sessão de agente.

## Ordem de leitura

**Este índice é mapa de leitura, não ordem de autoridade.** A ordem de
autoridade está consolidada em [`CLAUDE.md`](../CLAUDE.md), como a Pirâmide
de 8 Tiers declara.

O [`governance/KERNEL.md`](../governance/KERNEL.md) é ponteiro para a constituição — mantém o histórico da crise de dual-authority de 2026-09-29.

A ordem de leitura acima corresponde à que `AGENTS.md`, `GEMINI.md` e
`GLOBAL_INSTRUCTIONS.md` declararam como fontes. Após a consolidação em
Setembro/2026, o KERNEL.md foi rebaixado a ponteiro.

1. [Governança do projeto `Site`](../CLAUDE.md) — **canônica**: portão, soberania, Tiers, taxonomia.
2. [Ambiente](../governance/environment.md) — perfis de execução e gates de qualidade.
3. [Regras mestras do repositório](../governance/REPOSITORY_RULES.md) — invariantes operacionais e roteamento de mudanças.
4. [Mapa sistêmico](architecture/SYSTEM_MAP.md) — fronteiras de domínio e dependência.
5. [Matriz de roteamento](architecture/ROUTING_MATRIX.md) — destino, validação e revisão de cada tipo de mudança.
6. [Índice de dependências externas](architecture/DEPENDENCY_BOUNDARY_INDEX.md) — submódulos, origem e regra de atualização.
7. [Fronteira de integrações de host](security/HOST_INTEGRATION_BOUNDARY.md) — plugins, MCPs, hooks e arquivos locais.

## Referências existentes

|| Necessidade | Referência |
||---|---|
|| Topologia executiva e comandos de entrada | [README](../README.md) |
|| Arquitetura Padrão-Ouro (4 Camadas & MCP) | [ARQUITETURA_PADRAO_OURO_SOTA_2026.md](ARQUITETURA_PADRAO_OURO_SOTA_2026.md) |
|| Topologia do Ecossistema MCP | [MCP_ECOSYSTEM_TOPOLOGY_2026.md](MCP_ECOSYSTEM_TOPOLOGY_2026.md) — inventário por camada; **as contagens são do catálogo, não deste índice** |
|| Tratado Canônico da Perspectiva Matemática | [PERSPECTIVA_MATEMATICA_PMEV_MASTER.md](PERSPECTIVA_MATEMATICA_PMEV_MASTER.md) |
|| Arquitetura de frontend | [architecture/frontend.md](architecture/frontend.md) |
|| Banco, rotas e contratos | [architecture/SPEC_ROTEAMENTO_DB.md](architecture/SPEC_ROTEAMENTO_DB.md) |
|| Simulador ICM/PMev | [architecture/SPEC_SIMULADOR_ICM_GLOBAL.md](architecture/SPEC_SIMULADOR_ICM_GLOBAL.md) |
|| Auditorias e handoffs | [audits](audits) |
|| Relatório Oficial de Sessão (2026-08-24) | [../reports/RELATORIO_SESSAO_2026_08_24_SOTA_v8_GOLD.md](../reports/RELATORIO_SESSAO_2026_08_24_SOTA_v8_GOLD.md) |
|| Auditoria Mensal de Roteamento (2026_08) | [../reports/audits/AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_2026_08.md](../reports/audits/AUDITORIA_MENSAL_MODUS_OPERANDI_ROUTING_2026_08.md) |
|| Segurança | [security](security) |
|| Pesquisa de produto e teoria | [research](research) |

Auditoria temporal recente: [quarentena do catálogo de plugins Claude — 2026-08-21](audits/2026-08-21-claude-plugin-quarantine.md).

## Regra de manutenção

Uma mudança estrutural só está concluída quando seu módulo, contrato, validação e documento canônico apontam para a mesma fonte de verdade. Relatórios temporários, caches, memórias de host e configurações de editor não substituem documentação versionada.
