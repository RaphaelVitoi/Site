# SPEC: Pagina Inicial do Blog (Hub do Ecossistema)
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execucao
> **Alinhamento:** COSMOVISAO.md (Beleza Estrutural, Orientado para o Outro)

---

## 1. Visao Geral
A pagina inicial (`frontend/src/app/page.tsx`) nao sera apenas um indice de posts, mas o **Hub Central** do "Templo do Aprendizado Generativo". Ela deve combinar conteudo de alta densidade intelectual (artigos) com interatividade tatil (ferramentas).

## 2. Arquitetura da Pagina
O layout deve seguir um fluxo narrativo claro, do macro para o micro.

### 2.1. Hero Section (A Promessa)
- **Headline Impactante:** Direta e provocativa (ex: "O Edge Mudou de Lugar. Domine a Matematica Sob Pressao.").
- **Subheadline:** Promessa de valor (foco em Teoria dos Jogos, Psicologia e ICM).
- **CTA Primario:** "Ler o Manifesto" ou "Iniciar Masterclass".
- **Visual:** Estetica "Cyber/Dark" herdada do simulador V1, com um elemento grafico abstrato (redes neurais ou arvores de decisao).

### 2.2. Vitrine de Ferramentas (Interatividade)
- Destaque imediato para o **Laboratorio de ICM (V2)**.
- O usuario deve entender imediatamente que este nao e um blog estatico, mas uma plataforma de experimentacao.
- Componente sugerido: Um card interativo ou um mini-preview da calculadora.

### 2.3. Feed de Artigos (O Conteudo)
- Grid de artigos mais recentes/populares.
- **Componente `ArticleCard`:** Deve exibir Titulo, Resumo, Data, Tempo de Leitura e Tags (ex: #ICM, #Mindset).
- Design limpo, muito respiro (whitespace) e foco na tipografia.

### 2.4. Secao "A Triade" / Cosmovisao
- Um bloco breve explicando a filosofia por tras do conteudo (Autonomia, Minimizacao de Sofrimento, Potencializacao Mutua).

### 2.5. Footer Global
- Links rapidos, redes sociais (Twitch, YouTube, Instagram), copyright.

## 3. Requisitos Tecnicos
- **Componente:** Substituir o conteudo boilerplate atual de `frontend/src/app/page.tsx`.
- **Estilizacao:** Tailwind CSS. Manter as cores de fundo `bg-slate-950` e tipografia `Inter` e `Playfair Display` (como em `aula-icm.html`).
- **Modularidade:** Extrair blocos complexos para `frontend/src/components/home/`.

## 4. Plano de Execucao (@implementor)
1. **Setup Visual:** Migrar definicoes de fonte e cores do `aula-icm.html` para o `tailwind.config.ts` ou `globals.css` do Next.js, se ainda nao estiverem.
2. **Estrutura:** Limpar o `page.tsx` atual e construir as secoes verticalmente (Hero, Tools, Feed).
3. **Mock de Dados:** Criar um array temporario de artigos mockados no proprio arquivo para renderizar o grid ate que a integracao com o Prisma/DB esteja pronta.
