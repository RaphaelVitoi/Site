# DIRETRIZ DE CONTINUIDADE - SESSÃO V26 (UX/UI E VISUALIZAÇÃO DE DADOS SOTA DO MOTOR ICM)

## 1. O ESTADO DA ARTE ATUAL (O QUE FOI CONSTRUÍDO)
Nesta sessão, realizamos uma revisão profunda de UX, UI e Data Visualization no **Motor ICM** (`ReferencialAula12.tsx` e `MasterSimulator.tsx`), além de integrações vitais de navegação.

- **A Verdade dos Dados (Data Viz):** Corrigimos o gráfico de barras da "Estrutura de Prêmios". Em vez de ancorar a barra do 1º lugar em 100% (o que criava uma falsa ilusão visual de achatamento), ancoramos em 100% do `TOTAL_POOL`. O 1º lugar agora preenche exatos ~18.8% físicos da tela, demonstrando visualmente e factualmente por que a estrutura é classificada como **FLAT**.
- **Harmonia e Hierarquia:** Abandonamos a "fadiga de densidade" (`0.58rem`). Padronizamos títulos em `0.85rem` com `letter-spacing`, textos de leitura em `0.75rem` e adicionamos respiro/padding em todos os componentes.
- **Arquitetura de Grid SOTA:** Empregamos `display: contents` e CSS Grid para o Glossário e Toy Games, resultando em um alinhamento tabular perfeito sem poluir a árvore do DOM. Criamos "pílulas" (badges) para chaves visuais (`↑`, `⊘ teto`).
- **Espacialidade:** Expandimos a proporção visual para `1.2fr 1fr`, tornando a mesa e as cartas maiores. Preenchemos o vazio sob a mesa com um bloco de insight dinâmico (Risk Advantage de +8.5%). Enxugamos a largura celular de `38px` para `32px` para que as duas matrizes de range ficassem perfeitamente lado a lado.
- **Integração do Funil:** Adicionamos o card "Motor ICM" na `page.tsx` (agora com 9 blocos simétricos), o link no Header e um botão "Início" direto na barra superior do `MasterSimulator.tsx`, fechando o ciclo de navegação Aula -> Whitepaper -> Simulador. Corrigimos links externos no `Footer.tsx`.

## 2. A FILOSOFIA DE DESIGN ESTABELECIDA (MEMÓRIA)
1. **O Paradoxo do Eixo X:** A escala relativa distorce o comportamento humano. A semântica visual deve sempre espelhar a matemática absoluta (fatia do torneio real).
2. **Downward Drift do Design:** A cura para a compressão de informações não é diminuir a fonte, mas agrupar logicamente (Grids), aumentar whitespace e usar cor semântica.
3. **Interface Socrática (Micro-copy):** O texto de UI não deve apenas descrever, deve *ensinar a pensar* (ex: "Foge dos extremos (20-24%). Avalie os saltos caso a caso.").

## 3. ARQUIVOS MODIFICADOS RECENTEMENTE
- `src/components/simulator/ReferencialAula12.tsx` (Refatoração total de matrizes, gráficos, grids e SVGs)
- `src/components/simulator/MasterSimulator.tsx` (Tipografia do header/footer, botão Início)
- `src/app/page.tsx` (Adição do card do Motor ICM)
- `src/components/layout/Header.tsx` (Inclusão do Início no menu)
- `src/components/layout/Footer.tsx` (Correção URL do YouTube)

## 4. O PRÓXIMO PASSO (BIFURCAÇÃO ESTRATÉGICA)
Escolha a próxima frente de ataque para a nossa IA:

**[OPÇÃO A] Refinamento da Calculadora ICM:**
Aplicar essa mesma filosofia visual, hierarquia tipográfica e grids modernos ao painel `EquityCalculator` (Calculadora ICM).

**[OPÇÃO B] Novos Componentes (RAG/Teoria):**
Iniciar o desenvolvimento de painéis interativos de comparação ou integrar dados dos "10 erros mais comuns" que mencionamos na Landing Page, transformando-os em features do app.

**[OPÇÃO C] Polimento Responsivo Global:**
Fazer uma auditoria exclusiva de uso mobile (telas pequenas) para garantir que todas as novas matrizes e tabelas rolem suavemente e que os painéis não estourem em celulares.

---
**Prompt de Início Rápido:**
*"Olá, Chico. Li o PROMPT_CONTINUIDADE_20260322_V26.md. Vamos prosseguir com a [OPÇÃO A / B / C]."*