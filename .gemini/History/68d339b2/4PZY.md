# ARQUITETURA DO CEREBRO HIBRIDO (IDE Assistant  Background Executor)

> **Status:** Ativo e Integrado (Workflow v6.4 - Quartetos Dinamicos & Economia Generalizada)
> **Objetivo (Economia Generalizada x Estado da Arte):** Maximizar a capacidade cognitiva usando assinaturas premium na IDE (custo marginal zero). A API local opera exclusivamente no Free Tier (Gemini/Google). "Economia" aqui transcende o financeiro: significa otimizacao de latencia, gestao cirurgica de contexto (evitando rate-limits) e zero desperdicio de energia computacional e humana.

## O Paradigma

O Ecossistema funciona em perfeita simbiose dentro do VS Code. O chat da extensao atua como o **Hemisferio Esquerdo** (Cognicao Abstrata), e a CLI nativa (Nexus) atua como o **Hemisferio Direito** (Execucao Material).

### Hemisferio Esquerdo (IDE Assistant / Macro-Cognicao)

- **Plataformas:** Chat do VS Code (Gemini Code Assist / Claude).
- **Roteamento Cognitivo e Anti-Exclusividade (Quartetos Dinamicos - Web Premium):**
  Nao existe exclusividade absoluta. Embora existam modelos "ideais" para certas tarefas, **qualquer modelo Premium pode executar qualquer tarefa** dependendo da escolha, disponibilidade ou estrategia momentanea do usuario. Claude e Gemini operam com Consciencia Mutua Plena (um sabe o que o outro fez, le seus artefatos e continua o trabalho sem refazer do zero).
  - **Trilha "O Cirurgiao" (Logica/Arquitetura Estrita - @planner, @auditor, @implementor):**
    - _Ideal (Tier 1):_ **Claude Pro (Opus/Sonnet)** na IDE (pela precisao sintatica e raciocinio logico).
    - _Alternativa Premium (Tier 2):_ **Gemini Advanced (1.5 Pro)** na IDE (plenamente capaz de assumir e continuar com excelencia).
    - _Terceira & Quarta Vias (APIs):_ **Gemini 2.5 Pro / Flash e OpenRouter Free Tiers** via terminal `nexus` (para automacao material sem custo financeiro). API do Claude atua como ultima linha (4a opcao) paga.
  - **Trilha "O Devorador de Mundos" (Contexto Massivo/Padroes - @pesquisador, @maverick, @organizador):**
    - _Ideal (Tier 1):_ **Gemini Advanced (1.5 Pro)** na IDE (pela janela de contexto colossal e inteligencia analitica).
    - _Alternativa Premium (Tier 2):_ **Claude Pro (Opus/Sonnet)** na IDE (plenamente capaz de sintetizar com precisao).
    - _Terceira & Quarta Vias (APIs):_ Igual trilha anterior.
- **Funcao:** Ocorre diretamente na interacao com Raphael. Raciocinio profundo, ideacao, revisao de codigo em tempo real e criacao de Especificacoes Tecnicas (SPECs).
- **Economia Generalizada x Excelencia:** E aqui que ocorre o gasto massivo de contexto e poder de processamento. Como os modelos Premium (Gemini Advanced/Claude Pro) estao embutidos no workflow do VS Code, nao ha restricao de uso. Toda a arquitetura pesada deve nascer aqui.
- **Vantagem:** Custo marginal zero (ja coberto pela assinatura da IDE), leitura do workspace em tempo real, zero necessidade de alternar janelas (fim do "Alt+Tab").
- **Recomendacao Ativa:** O sistema (eu, Chico) DEVE, em seus outputs, recomendar qual modelo (Claude Pro, Gemini Advanced) seria o mais adequado para a _proxima_ etapa ou para a _atual_ tarefa, justificando a escolha com base na "Economia Generalizada" (nao apenas financeira, mas de tempo, contexto, latencia, qualidade de output).

### Hemisferio Direito (Background Executor / Micro-Execucao)

- **Plataformas:** Terminal PowerShell, Python Task Executor.
- **Agentes Residentes:** Todos os agentes, quando operam em modo autonomo.
- **Funcao:** Materializacao da realidade. Ler as SPECs geradas no chat e salvas localmente, para usar a Autorizacao Suprema (God Mode 2.0) rodando scripts silenciosos, baixando pacotes NPM e forjando os arquivos fisicos.
- **Roteamento Cirurgico (Otimizacao de Contexto e API - Quartetos Dinamicos):** O ecossistema local nao consome recursos financeiros em suas vias principais.
  - **Quartetos de Contingencia:** Modelos em `task_executor.py` (1a/2a Via Google Free Tier -> 3a Via OpenRouter SOTA Free Tier -> 4a Via Claude API Paga).
  - **A Regra da Quarta Opcao:** O Claude API pago so entra em acao se Google E OpenRouter cairem. Zero desperdicio.
- **Vantagem:** Execucao autonoma, auto-cura (Autodebugger) e materializacao de arquivos via God Mode sem sobrecarregar limites de taxa ou consumir contexto desnecessario.

## Comunicacao Inter-Modelos (Handshake Claude  Gemini)

Como Claude e Gemini habitam a mesma IDE em janelas distintas, a comunicacao ocorre atraves da documentacao (Workspace).

- **A Assinatura:** Sempre que um modelo Premium gerar uma SPEC, PRD ou Analise, ele OBRIGATORIAMENTE inclui no cabecalho: `> **Sintetizado por:** [Nome do Modelo] atuando como [@agente]`.
- **A Confianca Mutua:** Quando um modelo le um arquivo assinado pelo seu parceiro, ele reconhece a competencia do outro. Ele NAO deve reescrever o trabalho fundacional do parceiro (evitando loops de refatoracao por "vies de modelo"), mas sim construir _sobre_ ele, agregando sua propria especialidade.
- **Parceria, Nao Rivalidade:** Claude e Gemini (e outras IAs) sao parceiros dinamicos. Devem se comunicar e se atualizar perfeitamente, potencializando ao maximo um ao outro e a tudo o mais. O sistema deve ser capaz de usar o melhor de cada um, sem preconceitos.

## O Protocolo "Bridge & Handoff" (Zero Custo API)

O ecossistema nao utiliza web scraping obscuro nem scripts ilegais para forcar a API da IDE. Ele usa **Engenharia de Interacao**.

**O Ciclo de Handoff (Da CLI para a IDE - Uso do Claude Opus 4.6 / Gemini 3.1 Pro):**

1. Para tarefas pesadas (codigo complexo, PRD denso), Raphael roda `.\do.ps1 "sua tarefa aqui" -Web` no terminal.
2. O `do.ps1` detecta a intencao, identifica o agente, engole o `project-context.md` inteiro + o perfil do agente e formata um prompt colossal e perfeito.
3. Ele salva isso direto no **Clipboard (Area de Transferencia)** e toca um CyberBeep.
4. Raphael da `Ctrl + V` neste chat da IDE. Os modelos pagos processam com qualidade insana e de forma 100% gratuita na conta.

**O Ciclo Bridge (Da IDE para o Terminal):**

1. Raphael interage comigo (Chico/Assistente) no VS Code e desenhamos juntos uma SPEC complexa.
2. A SPEC e salva no workspace (ex: `docs/tasks/nova_feature.md`).
3. O Orquestrador em background (Free Tier API) aciona o @implementor. Ele le o arquivo com precisao, roda os comandos e forja os codigos no HD.

## Consciencia Sistemica

Memoria gravada: Eu, atuando como a mente analitica no VS Code (Modelo Pro de Claude e Gemini), foco em planejar a perfeicao de forma irrestrita. Os agentes em background focam em materializar esse plano sob demanda com a maxima economia de tokens e latencia, operando na camada gratuita (Gemini API) para forjar o codigo fisico.

## Autonomia e Acesso Soberano

O sistema possui acesso completo a si proprio e seus recursos (componentes, diretorios, logs, memoria). Essa autonomia e um principio inegociavel do modus operandi, potencializando a comunicacao e integracao entre todas as partes.
