# Fronteira de Integrações de Host

## Regra padrão

O repositório não habilita automaticamente plugins, MCPs, extensões, hooks de host, tarefas de editor ou conectores externos. Configuração de host é adaptação local; não é autoridade do projeto.

## Invariantes

1. `governance/` e `docs/` são a fonte de verdade; `.claude/`, `.codex/`, `.cursor/`, `.vscode/`, `.cerebro/` e `.antigravity/` não definem doutrina.
2. Credenciais, tokens, OAuth, arquivos `.env`, caches e memórias de agente permanecem fora do controle de versão.
3. Plugins e MCPs permanecem desabilitados por padrão. Cada exceção requer proprietário, escopo, origem, versão/pin, permissões, prazo de revisão e procedimento de remoção.
4. Operações automáticas de shell, agendamentos e hooks exigem código versionado, entrada tratada como dado, execução observável e rollback.
5. Um bypass de confirmação só pode decorrer de autorização humana explícita e não implica autorização para habilitar plugins, MCPs, conectores ou comandos adicionais.

## Registro mínimo para exceções

Registre em `docs/audits/` ou em uma decisão arquitetural:

| Campo | Obrigatório |
|---|---:|
| proprietário humano | sim |
| ferramenta e origem | sim |
| versão ou revisão fixa | sim |
| permissões concedidas | sim |
| dados acessados e destino de rede | sim |
| data de reavaliação | sim |
| rollback/remoção | sim |

## Resposta a desvio

Ao detectar plugin, MCP, hook ou configuração local inesperada: interrompa a ativação, preserve evidência mínima, compare com o estado versionado, remova apenas o alvo confirmado e revalide processos, listeners e configuração efetiva.
