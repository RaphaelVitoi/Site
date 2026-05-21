# SPEC: Página Inicial do Blog (Hub do Ecossistema)
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execução
> **Alinhamento:** COSMOVISAO.md (Beleza Estrutural, Orientado para o Outro)

---

## 1. Visão Geral
A página inicial (`frontend/src/app/page.tsx`) não será apenas um índice de posts, mas o **Hub Central** do "Templo do Aprendizado Generativo". Ela deve combinar conteúdo de alta densidade intelectual (artigos) com interatividade tátil (ferramentas).

## 2. Arquitetura da Página
O layout deve seguir um fluxo narrativo claro, do macro para o micro.

### 2.1. Hero Section (A Promessa)
- **Headline Impactante:** Direta e provocativa (ex: "O Edge Mudou de Lugar. Domine a Matemática Sob Pressão.").
- **Subheadline:** Promessa de valor (foco em Teoria dos Jogos, Psicologia e ICM).
- **CTA Primário:** "Ler o Manifesto" ou "Iniciar Masterclass".
- **Visual:** Estética "Cyber/Dark" herdada do simulador V1, com um elemento gráfico abstrato (redes neurais ou árvores de decisão).

### 2.2. Vitrine de Ferramentas (Interatividade)
- Destaque imediato para o **Laboratório de ICM (V2)**.
- O usuário deve entender imediatamente que este não é um blog estático, mas uma plataforma de experimentação.
- Componente sugerido: Um card interativo ou um mini-preview da calculadora.

### 2.3. Feed de Artigos (O Conteúdo)
- Grid de artigos mais recentes/populares.
- **Componente `ArticleCard`:** Deve exibir Título, Resumo, Data, Tempo de Leitura e Tags (ex: #ICM, #Mindset).
- Design limpo, muito respiro (whitespace) e foco na tipografia.

### 2.4. Seção "A Tríade" / Cosmovisão
- Um bloco breve explicando a filosofia por trás do conteúdo (Autonomia, Minimização de Sofrimento, Potencialização Mútua).

### 2.5. Footer Global
- Links rápidos, redes sociais (Twitch, YouTube, Instagram), copyright.

## 3. Requisitos Técnicos
- **Componente:** Substituir o conteúdo boilerplate atual de `frontend/src/app/page.tsx`.
- **Estilização:** Tailwind CSS. Manter as cores de fundo `bg-slate-950` e tipografia `Inter` e `Playfair Display` (como em `aula-icm.html`).
- **Modularidade:** Extrair blocos complexos para `frontend/src/components/home/`.

## 4. Plano de Execução (@implementor)
1. **Setup Visual:** Migrar definições de fonte e cores do `aula-icm.html` para o `tailwind.config.ts` ou `globals.css` do Next.js, se ainda não estiverem.
2. **Estrutura:** Limpar o `page.tsx` atual e construir as seções verticalmente (Hero, Tools, Feed).
3. **Mock de Dados:** Criar um array temporário de artigos mockados no próprio arquivo para renderizar o grid até que a integração com o Prisma/DB esteja pronta.