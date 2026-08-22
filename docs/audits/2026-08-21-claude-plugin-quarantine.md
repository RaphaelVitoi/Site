# Quarentena de catálogo de plugins Claude — 2026-08-21

## Decisão

Em 21/08/2026, foi removido da superfície ativa o lote de diretórios de catálogo/cache Claude criado ou alterado no mesmo dia, entre 19:51 e 20:05 (horário local).

O lote continha 62 diretórios, incluindo catálogos de Aikido, Azure, MCPs, LSPs, Playwright, Superpowers, segurança, pesquisa e integrações de nuvem. Não havia manifesto de instalação correspondente em `.claude/plugins/.install-manifests`; a evidência disponível caracteriza catalogação/cache, não uma instalação confirmada.

## Contenção

- Origem: `C:\Users\rapha\.claude\plugins\data`
- Destino reversível: `C:\Users\rapha\.claude\quarantine\plugins-data-2026-08-21`
- Itens movidos: `62`
- Itens que permaneceram ativos: `vercel-claude-plugins-official` e `vercel-inline`, ambos datados de 20/08/2026 e fora do critério temporal desta ação.

## Validação

- Nenhum valor de credencial foi copiado para este registro.
- As configurações do projeto `.claude` permanecem sem plugins externos habilitados.
- O hook Azure/Copilot versionado em `.gemini/.agents/hooks` foi tratado como artefato dormente: sua configuração aponta para `C:\Users\rapha\.agents\hooks`, diretório global que não existe neste host.
- O lote foi movido, não apagado, para preservar recuperação e evidência.

## Pendências deliberadamente preservadas

- Fechada em 22/08/2026: as referências `gpdoc` em `.codex/config.toml`, `.mcp.json`, `.cursor/mcp.json` e `.vscode/mcp.json` foram removidas após confirmação de que apontavam para extensão inexistente. Não permaneceu configuração operacional `gpdoc`.
- `.cerebro` contém integrações históricas e operações Bash; requer decisão específica antes de remoção.
- Processos Claude já abertos podem manter estado carregado até serem reiniciados; a quarentena impede carregamento futuro a partir do cache removido.

## Segundo anel: Codex e Antigravity

Também foram contidos os artefatos externos criados em 21/08:

- Codex: `C:\Users\rapha\.codex\quarantine\external-2026-08-21` recebeu o cache `openai-curated-remote`, o catálogo Claude em `.codex\.tmp`, o staging de marketplace e `agent-plugins`.
- Codex: os marketplaces `claude-plugins-official` e `claude-cowork` foram removidos de `C:\Users\rapha\.codex\config.toml`; `external-agent-import-sync-enabled` foi definido como `false`; os estados de hooks desses plugins foram removidos.
- Antigravity: `C:\Users\rapha\.antigravity-ide\quarantine\extensions-2026-08-21` recebeu `anthropic.claude-code` 2.1.238, `anthropic.claude-code` 2.1.239 e `openai.chatgpt` 26.721.30844.
- Preservados: `openai-bundled`, `openai-primary-runtime`, os plugins nativos habilitados do Codex, `node_repl`, `google-workspace`, BlueStacks e as extensões de linguagem do VS Code/Antigravity.

O `config.toml` foi validado com o parser TOML nativo do Python. Restaram apenas a seção de estado de hook local desabilitada e referências históricas de projetos, sem marketplace externo ativo.
