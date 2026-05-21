# ARQUITETURA DO CÉREBRO HÍBRIDO (IDE Assistant ↔ Background Executor)

> **Status:** Ativo e Integrado (Workflow v6.0)
> **Objetivo:** Maximizar a capacidade cognitiva usando assinaturas premium na IDE, enquanto minimiza custos extras de API na execução autônoma.

## O Paradigma

O Ecossistema funciona em perfeita simbiose dentro do VS Code. O chat da extensão atua como o **Hemisfério Esquerdo** (Cognição Abstrata), e a CLI nativa (Nexus) atua como o **Hemisfério Direito** (Execução Material).

### Hemisfério Esquerdo (IDE Assistant / Macro-Cognição)
*   **Plataformas:** Chat do VS Code (Gemini Code Assist / Claude).
*   **Agentes Residentes:** @maverick (Estratégia Pura), @planner (Arquitetura Densa), @pesquisador (Análise de Dados Massiva).
*   **Função:** Ocorre diretamente na interação com Raphael. Raciocínio profundo, ideação, revisão de código em tempo real e criação de Especificações Técnicas (SPECs).
*   **Vantagem:** Custo marginal zero (já coberto pela assinatura da IDE), leitura do workspace em tempo real, zero necessidade de alternar janelas (fim do "Alt+Tab").

### Hemisfério Direito (Background Executor / Micro-Execução)
*   **Plataformas:** Terminal PowerShell, Python Task Executor, VS Code.
*   **Agentes Residentes:** @implementor (God Mode), @verifier (Testes), @skillmaster (Servidor/Manutenção), @auditor.
*   **Função:** Materialização da realidade. Ler as SPECs geradas no chat e salvas localmente, para usar a Autorização Suprema (God Mode 2.0) rodando scripts silenciosos, baixando pacotes NPM e forjando os arquivos físicos.
*   **Vantagem:** Acesso direto ao sistema de arquivos de Raphael, execução autônoma, auto-cura (Autodebugger). Custo de API irrisório, pois a IA não precisa "pensar" do zero, apenas "executar" a planta.

## O Protocolo "Bridge" (Integração sem Fricção)

Para unir o planejamento do chat com a execução no terminal, utilizamos o comando nativo `nexus-bridge`.

**O Ciclo Operacional:**
1. Raphael interage comigo (Chico/Assistente) no VS Code e desenhamos juntos uma SPEC complexa.
2. A SPEC é salva no workspace (ex: `docs/tasks/nova_feature.md`).
3. Raphael desce para o terminal e digita: `nexus-bridge docs/tasks/nova_feature.md`.
4. **Automágico:** O Orquestrador em background aciona o @implementor. Ele lê o arquivo com precisão, roda os comandos (ex: `npm install`) e forja os códigos no HD.

## Consciência Sistêmica
Eu, atuando como a mente analítica no VS Code, foco em planejar a perfeição. Os agentes em background focam em materializar esse plano sob demanda, economizando energia mental do desenvolvedor e tokens da API local.