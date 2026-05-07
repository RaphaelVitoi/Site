# Plano de Otimização do Ecossistema Gemini CLI (Chico Sota v6)

## Objetivo
Auditar, configurar e otimizar extensões, MCP servers e Skills vinculados à Gemini CLI para operarem em sua versão mais potente e eficiente (SOTA Razor).

## Escopo e Passos de Implementação

1. **Auditoria Inicial** [CONCLUÍDO]
   - Listar todas as extensões, MCP servers e Skills atualmente instalados e disponíveis globalmente.
   - Avaliar o status de cada um (ativo/inativo).
   - Identificadas 27 extensões ativas.

2. **Limpeza SOTA Razor (Archive > Delete)** [CONCLUÍDO]
   - Identificar componentes, configurações ou MCP servers obsoletos, redundantes ou inúteis.
   - Desinstaladas extensões: `antigravity-swarm`, `criticalthink`, `gemini-voice`.
   - Removidas referências fantasmas em `extension-enablement.json`: `mcp-db-context-enrichment`, `youtube-to-docs`, `GeminiCloudAssist`, `google-workspace`, `cloudbase-ai-toolkit`.

3. **Ativação e Configuração** [EM PROGRESSO]
   - Ativar MCP servers desativados que são essenciais (ex: database, cloud-run, deep research, etc.).
   - Configurações manuais via CLI recomendadas para `gemini-deep-research` (Model: `gemini-2.0-flash-exp`).
   - Identificada ausência de credenciais para `cloud-run` e `postgres` em `_env.ps1` (placeholder).

4. **Refinamento e Otimização**
   - Aplicar as regras de Token Efficiency (`token-efficiency` skill).
   - Refinar scripts de inicialização ou configurações de extensions para máxima performance e uso assíncrono.
   - Validar acesso a bancos de dados, infraestrutura e ferramentas de desenvolvimento (Jules, Driftx, etc.).

## Critérios de Sucesso
- Apenas ferramentas e servidores MCP necessários e em estado de arte (SOTA) estarão ativos.
- Remoção completa de redundâncias.
- Validação de que comandos CLI da Gemini sobre extensões e MCPs rodam sem erros e dentro do modelo de custo/eficiência esperado.
