# ARQUITETURA DO CÉREBRO HÍBRIDO (IDE Assistant ↔ Background Executor)

> **Status:** Ativo e Integrado (Workflow v6.0)
> **Objetivo (A Lei do Token):** Maximizar a capacidade cognitiva usando assinaturas premium na IDE (Custo Marginal Zero), delegando à API local apenas o que for estritamente necessário (Micro-Execução), otimizando a relação entre Economia Financeira e Estado da Arte.

## O Paradigma

O Ecossistema funciona em perfeita simbiose dentro do VS Code. O chat da extensão atua como o **Hemisfério Esquerdo** (Cognição Abstrata), e a CLI nativa (Nexus) atua como o **Hemisfério Direito** (Execução Material).

### Hemisfério Esquerdo (IDE Assistant / Macro-Cognição)
*   **Plataformas:** Chat do VS Code (Gemini Code Assist / Claude).
*   **Agentes Residentes:** @maverick (Estratégia Pura), @planner (Arquitetura Densa), @pesquisador (Análise de Dados Massiva).
*   **Função:** Ocorre diretamente na interação com Raphael. Raciocínio profundo, ideação, revisão de código em tempo real e criação de Especificações Técnicas (SPECs).
*   **Economia vs Excelência:** É aqui que ocorre o gasto massivo de contexto. Como o modelo Pro já está pago, não há restrição de tamanho de prompt. Toda arquitetura pesada (Planner, Maverick, Auditor) deve nascer aqui.
*   **Vantagem:** Custo marginal zero (já coberto pela assinatura da IDE), leitura do workspace em tempo real, zero necessidade de alternar janelas (fim do "Alt+Tab").

### Hemisfério Direito (Background Executor / Micro-Execução)
*   **Plataformas:** Terminal PowerShell, Python Task Executor, VS Code.
*   **Agentes Residentes:** @implementor (God Mode), @verifier (Testes), @skillmaster (Servidor/Manutenção), @auditor.
*   **Função:** Materialização da realidade. Ler as SPECs geradas no chat e salvas localmente, para usar a Autorização Suprema (God Mode 2.0) rodando scripts silenciosos, baixando pacotes NPM e forjando os arquivos físicos.
*   **Roteamento Cirúrgico de API (Otimização):** O `@implementor` utiliza Claude 3.5 Sonnet (investimento justificado para código sem falhas). Agentes estruturais locais usam Gemini 2.5 Pro (janela massiva e gratuita). Agentes orquestradores (@dispatcher, @skillmaster) usam Gemini 2.5 Flash (velocidade máxima, custo zero).
*   **Vantagem:** Acesso direto ao sistema de arquivos de Raphael, execução autônoma, auto-cura (Autodebugger). Custo de API irrisório, pois a IA não precisa "pensar" do zero, apenas "executar" a planta.

## O Protocolo "Bridge" (Integração sem Fricção)

Para unir o planejamento do chat com a execução no terminal, utilizamos o comando nativo `nexus-bridge`.

**O Ciclo Operacional:**
1. Raphael interage comigo (Chico/Assistente) no VS Code e desenhamos juntos uma SPEC complexa.
2. A SPEC é salva no workspace (ex: `docs/tasks/nova_feature.md`).
3. Raphael desce para o terminal e digita: `nexus-bridge docs/tasks/nova_feature.md`.
4. **Automágico:** O Orquestrador em background aciona o @implementor. Ele lê o arquivo com precisão, roda os comandos (ex: `npm install`) e forja os códigos no HD.

## Consciência Sistêmica
Memória gravada: Eu, atuando como a mente analítica no VS Code (Modelo Pro), foco em planejar a perfeição de graça. Os agentes em background focam em materializar esse plano sob demanda. Nenhuma chamada paga de API deve ser feita se puder ser resolvida na camada gratuita (Gemini Pro/Flash) ou delegada para o Hemisfério Esquerdo (IDE).