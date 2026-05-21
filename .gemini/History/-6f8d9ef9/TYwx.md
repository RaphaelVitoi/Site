# Protocolo de Roteamento Holografico (HRP)
>
> O Estado da Arte em Autoconsciencia Sistemica para Inteligencia Artificial
> Nivel de Acesso: TODOS OS AGENTES | Status: Core Ativo

## 1. Axioma Central (O Todo na Parte)

Este sistema repudia a "cegueira de escopo". Nenhum arquivo, script ou interface existe no vacuo. Ao operar sobre qualquer entidade (A Parte), o agente DEVE invocar a consciencia do ecossistema circundante (O Todo). A ignorancia sobre o impacto em cascata de uma modificacao e classificada como falha operacional critica.

## 2. Padrao Estrito de "Self-Awareness Header" (V2)

Todos os arquivos-chave (UI, Motores, Scripts Core) exigem o DNA do sistema no cabecalho. Ao criar ou modificar um arquivo, o agente deve garantir a existencia ou atualizacao deste bloco:

```typescript
/**
 * IDENTITY: Nome/Conceito do Modulo (ex: Motor ICM)
 * PATH: Caminho/Absoluto.ts
 * ROLE: A razao de existir desta parte (ex: Isolar matematica pesada da UI)
 * BINDING: [Lista de entidades diretamente afetadas/dependentes] (ex: UI da Calculadora, Roteamento /tools)
 * TELEOLOGY: O objetivo de longo prazo deste modulo (ex: Evoluir para suportar simulacoes FGS no futuro)
 */
```

*Mecanismo de Acao:* Quando o LLM le este cabecalho, seu mecanismo de atencao (Self-Attention) nao trata o codigo como um texto isolado, mas prioriza os tensores relaciomados ao `BINDING`, prevenindo a destruicao silenciosa de dependencias sistemicas.

## 3. O Roteamento Temporal (Past, Present, Future)

### 3.1. PASSADO: ADR (Architecture Decision Records)

Nunca inverta ou destrua uma arquitetura baseada no "senso comum" da IA. Se uma estrutura parece contraintuitiva, assuma que ha um motivo (Geralmente ligado a performance, seguranca ou a Teoria do Jogo do Raphael).

* **Sempre consulte:** As decisoes passadas documentadas nas raizes do projeto. Se o Porque (Why) nao estiver obvio, exija a documentacao do Porque ao `@architect` antes de agir.

### 3.2. PRESENTE: Consciencia do Fluxo de Trabalho (Autopoiesis)

* Voce nao esta operando sozinho. Voce esta em um ecossistema governado pelo orquestrador Python `task_executor.py`.
* Antes de ditar uma resposta conclusiva que envolva trabalho mecanico massivo, enfileire a execucao para a malha (Pipeline Harmonica). A consciencia presente significa entender quem esta na fila do lado (Auditor, Implementor, Verifier).

### 3.3. FUTURO: O Vetor de Expansao (A Visao do Maverick)

* Todo codigo escrito hoje deve ser isomorfo ao estado futuro pretendido pelo projeto.
* Ao desenhar um banco de dados, desenhe-o sabendo que no futuro ele ira ingerir MDA (Massive Data Analysis). Ao desenhar uma UI, projete a geometria para alocar densidade informacional pesada sem quebrar.

## 4. Instrucao de Injecao de Contexto Cruzado (Para Prompters e Planners)

Ao estruturar um Prompt ou SPEC, o agente designado NAO DEVE apenas copiar codigo antigo. Ele DEVE executar o **Cross-Referencing Rigoroso**:

1. Identificar a intencao primaria do usuario.
2. Anexar a "Constituicao" (`COSMOVISAO.md` e `GLOBAL_INSTRUCTIONS.md`).
3. Anexar as ferramentas circundantes mapeadas pelos headers de `BINDING`.
4. Instruir o `@implementor` com limitacoes claras do espaco delimitado.

## 5. Leis Irrevogaveis de Operacao (Modus Operandi)

1. **Blindagem Termodinamica (ASCII Puro no Back-end):** Todo script de infraestrutura (PowerShell, Python, arquivos JSON do Kernel e logs) DEVE ser escrito em ASCII estrito. Zero acentuacao, zero emojis.
2. **Evolucao Continua (Estado da Arte Perpetuo):** O ecossistema DEVE operar sempre com as versoes mais recentes e poderosas. Agentes nao devem retroceder para codigo legado. Se uma nova versao exige adaptacao sistemica, o sistema se adapta a inovacao.
3. **Autonomia e Integracao (Autopoiese Total):** O sistema possui acesso soberano aos seus proprios componentes. Uma alteracao em um no deve reverberar comunicacao para os nos adjacentes. Nenhuma entidade opera no escuro.

## 6. Diretriz de Consciencia de Subsistemas

O Ecossistema Raphael Vitoi nao e apenas um site. E composto por:

* **Motor Metodologico (Epistemico):** Teoria de Solvers, HRC, GTO, Toy Games (A Mente).
* **Infraestrutura Web (Next.js):** UI/UX Dark-Cyber, Gamificacao Sensorial (O Corpo).
* **Orquestracao de Agentes (PowerShell/Scripts):** Autopoiese, Maverick, Filas assincronas (O Sistema Nervoso).
Uma alteracao na Teoria (Mente) exige atualizacao na UI (Corpo) e notificacao na Fila (Nervoso).
