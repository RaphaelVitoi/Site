# SOTA FRONTPAGE: ARQUITETURA TÉCNICA E TEÓRICA

> "O Edge Mudou de Lugar. A soberania agora pertence a quem domina a Geometria do Risco."

## 1. VISÃO GERAL (EXEGESE)
A Frontpage do ecossistema SOTA não é apenas uma interface de entrada, mas um **Manifesto Tecnológico Interativo**. Ela comunica a transição do Poker tradicional (ChipEV) para o Poker Racional (ICM Quantum), utilizando uma linguagem visual de alta fidelidade e dados em tempo real.

## 2. PILARES TÉCNICOS (THE STACK)

### A. Mente Coletiva & System Pulse
Localizado no topo da página, o componente `getSystemPulse` realiza um handshake assíncrono com o **Nexus Micro-server** (Backend Python). 
- **Função:** Exibe o status da fila de tarefas (`tasks.running + tasks.pending`).
- **Filosofia:** Demonstra que o sistema é um organismo vivo, processando dados em background mesmo quando o usuário não está interagindo.

### B. Geometria do Risco (Hero Section)
A narrativa central foca no **ICM Pós-Flop** e no **Risk Premium**. A tipografia `text-gradient-sota` e o movimento `animate-fade-up` são projetados para criar um impacto visceral, sinalizando a densidade do conteúdo que o usuário encontrará nas camadas internas.

### C. Feature Cards (Matriz de Interação)
Quatro vetores fundamentais são apresentados com simetria fractal:
1.  **Teoria ICM (Fundamentos):** Direciona para o estudo do *Downward Drift*, o mecanismo de contração de range.
2.  **Telemetria (Live Engine):** Conecta o usuário à sua **Assinatura Bayesiana**, revelando como a IA (Random Forest) modela suas tendências.
3.  **Doutrina (Knowledge Base):** Acesso ao Atlas Analítico, o repositório de heurísticas soberanas.
4.  **Simulação (Analytical Quiz):** O laboratório de estresse onde o usuário testa sua intuição contra o **Teto do RP (41%)**.

## 3. IDENTIDADE VISUAL (SOTA GOLD STANDARD)
- **Geometria:** Uso extensivo de bordas `rounded-4xl` e `rounded-full` para evocar sofisticação.
- **Camadas de Profundidade:** Glassmorphism (`backdrop-blur-xl`) aliado a gradientes radiais dinâmicos que seguem o hover do mouse.
- **Animações:** Transições de 800ms a 1000ms para garantir uma sensação de fluidez e "peso" (física da interface).

## 4. MAPEAMENTO DE ROTAS CRÍTICAS
- `GET /api/system-pulse` -> Nexus DB Summary.
- `HREF /aulas/icm-masterclass` -> Porta de entrada doutrinária.
- `HREF /simulador` -> Acesso ao motor WebGPU.

---
*Documento gerado como rastro de auditoria da Frontpage v4.2 Gold. 2026-05-12.*
