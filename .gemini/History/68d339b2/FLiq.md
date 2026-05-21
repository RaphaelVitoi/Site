# ARQUITETURA DO CÉREBRO HÍBRIDO (IDE Assistant ↔ Background Executor)

> **Status:** Ativo e Integrado (Workflow v6.0)
> **Objetivo (Economia Generalizada x Estado da Arte):** Maximizar a capacidade cognitiva usando assinaturas premium na IDE. A API local opera exclusivamente no Free Tier (Gemini). "Economia" aqui transcende o financeiro: significa otimização de latência, gestão cirúrgica de contexto (evitando rate-limits) e zero desperdício de energia computacional e humana.

## O Paradigma

O Ecossistema funciona em perfeita simbiose dentro do VS Code. O chat da extensão atua como o **Hemisfério Esquerdo** (Cognição Abstrata), e a CLI nativa (Nexus) atua como o **Hemisfério Direito** (Execução Material).

### Hemisfério Esquerdo (IDE Assistant / Macro-Cognição)
*   **Plataformas:** Chat do VS Code (Gemini Code Assist / Claude).
*   **Roteamento Cognitivo Premium (Duplas Dinâmicas & 3 Vias):**
    Para garantir resiliência absoluta e automação, estabelecemos "Duplas". Se um falhar, o outro assume. Se ambos falharem na IDE, a 3ª via (Nexus Local) assume.
    *   **"O Cirurgião" (Lógica/Arquitetura Estrita):** 
        *   *Tier 1 (Titular):* **Claude Pro (Opus/Sonnet)** na IDE. Encarna: `@planner`, `@auditor`, `@implementor` (complexo).
        *   *Tier 2 (Reserva imediato):* **Gemini Advanced (3.1 Pro)** na IDE.
        *   *Tier 3 (Fallback Local):* **Gemini 2.5 Pro (Free Tier)** via terminal `nexus`.
    *   **"O Devorador de Mundos" (Contexto Massivo/Padrões):** 
        *   *Tier 1 (Titular):* **Gemini Advanced (3.1 Pro)** na IDE. Encarna: `@pesquisador`, `@maverick`, `@organizador`, `@validador`.
        *   *Tier 2 (Reserva imediato):* **Claude Pro (Opus/Sonnet)** na IDE.
        *   *Tier 3 (Fallback Local):* **Gemini 2.5 Pro (Free Tier)** via terminal `nexus`.
*   **Função:** Ocorre diretamente na interação com Raphael. Raciocínio profundo, ideação, revisão de código em tempo real e criação de Especificações Técnicas (SPECs).
*   **Economia vs Excelência:** É aqui que ocorre o gasto massivo de contexto e poder de processamento. Como os modelos Premium (Gemini Advanced/Claude Pro) estão embutidos no workflow do VS Code, não há restrição de uso. Toda a arquitetura pesada deve nascer aqui.
*   **Vantagem:** Custo marginal zero (já coberto pela assinatura da IDE), leitura do workspace em tempo real, zero necessidade de alternar janelas (fim do "Alt+Tab").

### Hemisfério Direito (Background Executor / Micro-Execução)
*   **Plataformas:** Terminal PowerShell, Python Task Executor, VS Code.
*   **Agentes Residentes:** @implementor (God Mode), @verifier (Testes), @skillmaster (Servidor/Manutenção), @auditor.
*   **Função:** Materialização da realidade. Ler as SPECs geradas no chat e salvas localmente, para usar a Autorização Suprema (God Mode 2.0) rodando scripts silenciosos, baixando pacotes NPM e forjando os arquivos físicos.
*   **Roteamento Cirúrgico (Otimização de Contexto e API):** O ecossistema local não consome recursos financeiros. Ele opera sobre o Free Tier da Google API. O `@implementor` e pensadores estruturais usam `gemini-2.5-pro`. Orquestradores usam `gemini-2.5-flash`.
*   **Vantagem:** Execução autônoma, auto-cura (Autodebugger) e materialização de arquivos via God Mode sem sobrecarregar limites de taxa ou consumir contexto desnecessário.

## Comunicação Inter-Modelos (Handshake Claude ↔ Gemini)
Como Claude e Gemini habitam a mesma IDE em janelas distintas, a comunicação ocorre através da documentação (Workspace).
*   **A Assinatura:** Sempre que um modelo Premium gerar uma SPEC, PRD ou Análise, ele OBRIGATORIAMENTE inclui no cabeçalho: `> **Sintetizado por:** [Nome do Modelo] atuando como [@agente]`.
*   **A Confiança Mútua:** Quando um modelo lê um arquivo assinado pelo seu parceiro, ele reconhece a competência do outro. Ele NÃO deve reescrever o trabalho fundacional do parceiro (evitando loops de refatoração por "viés de modelo"), mas sim construir *sobre* ele, agregando sua própria especialidade.

## O Protocolo "Bridge" (Integração sem Fricção)

Para unir o planejamento do chat com a execução no terminal, utilizamos o comando nativo `nexus-bridge`.

**O Ciclo Operacional:**
1. Raphael interage comigo (Chico/Assistente) no VS Code e desenhamos juntos uma SPEC complexa.
2. A SPEC é salva no workspace (ex: `docs/tasks/nova_feature.md`).
3. Raphael desce para o terminal e digita: `nexus-bridge docs/tasks/nova_feature.md`.
4. **Automágico:** O Orquestrador em background aciona o @implementor. Ele lê o arquivo com precisão, roda os comandos (ex: `npm install`) e forja os códigos no HD.

## Consciência Sistêmica
Memória gravada: Eu, atuando como a mente analítica no VS Code (Modelo Premium), foco em planejar a perfeição de forma irrestrita. Os agentes em background focam em materializar esse plano sob demanda com a máxima economia de tokens e latência, operando na camada gratuita (Gemini API) para forjar o código físico.