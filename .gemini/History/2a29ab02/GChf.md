# Prompt de Continuidade - MasterSimulator & Base de Conhecimento SOTA
**Data:** 2026-03-17 | **Versão:** V4 | **Sessão:** Refinamento de UI/UX, Quiz e Ingestão Teórica

---

## CONTEXTO DA SESSÃO ANTERIOR

Alcançamos estabilidade total no frontend e expandimos a base de conhecimento matemático do ecossistema:
1. **Quiz SOTA (`QuizEngine.tsx`):** Componente blindado contra transições de cenário, suportando objetos únicos ou arrays, com injeção de Mocks para testes e sistema de pontuação responsivo.
2. **Manual do ICM (`/docs/manual-icm`):** Rota movida da raiz para o App Router do Next.js com sucesso, adotando tipografia `prose-invert`.
3. **Design System:** Botões utilitários convertidos para formato pílula (pill-shaped) com reflexos neon e remoção inteligente de scrollbars no mobile (`simulator.module.css`).
4. **Calculadora de Equidade (`EquityCalculator.tsx`):** Inputs numéricos blindados nativamente (`Math.max`) evitando corrupção com stacks e prêmios negativos; tratamento visual de erros no parser de Hand History concluído.
5. **Expansão da Mente Coletiva (RAG):**
   - Masterclass `geometria_texto` convertida para `.md` puro.
   - Criada a prova matemática definitiva: `prova_matematica_icm.md` (provando o Teto de 41% de equidade no River sob pressão ICM extrema).

---

## O QUE PRECISA SER FEITO NA NOVA SESSÃO

1. **Sincronização Neural (Imediato):** É vital rodar a ingestão (`python memory_rag.py ingest` ou `.\do.ps1 -Ingest`) para que o Oráculo AI decore os novos arquivos Markdown.
2. **Nova Feature (Cenários de Fundador - ICM-FEAT-FOUNDERS):** Iniciar o planejamento (PRD/SPEC) para a adição de controles/botões no Simulador ICM que permitam comparar Cap Tables dinamicamente (Fundador A vs Fundador B).

---

## DIRETRIZ DE ENTRADA PARA O LLM (PROMPT DE RETOMADA)

Copie e cole o bloco abaixo assim que abrir a nova aba do chat:

***

> Assuma a identidade de Arquiteto SOTA (Fricção Zero). O nosso frontend (Next.js) do Simulador ICM foi estabilizado na última sessão.
> 
> **1.** Leia o arquivo `.claude/backups/PROMPT_CONTINUIDADE_20260317_V4.backup.md` para carregar o estado imediato do projeto em sua memória.


***