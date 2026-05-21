# SPECIFICATION: Laboratório "Psicologia High Stakes"
> **Autor:** @planner
> **Alvo Primário:** `src/app/psicologia-hs/page.tsx` e `src/components/PsychologyHub.tsx`
> **Alinhamento HRP:** Este módulo deve atuar como o contrapeso humano/epistêmico à rigidez matemática do ICM. Ele extrai conteúdo do banco de dados (Prisma) e apresenta através de nossa interface sensorial Cyber/Dark.

## 1. Visão Geral e Teleologia
A seção "Psicologia High Stakes" não é apenas um blog, é um portal de imersão ("Laboratório"). Ele precisa carregar os artigos semeados em nosso banco de dados (ex: "A Ameaça Orgânica", "O Paradoxo do Valuation no ICM") e listá-los em uma interface que traduza o peso psicológico do High Stakes.

## 2. Requisitos de Arquitetura (O Todo na Parte)
A página será dividida em duas responsabilidades:
- **Servidor (Server Component):** O `page.tsx` fará a chamada assíncrona ao Prisma Client (`prisma.post.findMany()`) para capturar os artigos. Isso garante SEO impecável e First Contentful Paint (FCP) de 0ms no Next.js.
- **Cliente (Client Component):** O `PsychologyHub.tsx` receberá os dados serializados e os renderizará utilizando nossa estrutura de `glass-panel` e o efeito `animate-fade-up` presente no `globals.css`.

## 3. Estrutura de Interface (Gamificação Elegante)
- **Cabeçalho Holográfico:** Título em gradiente (Magenta/Violeta para contrastar com o Azul do ICM) e uma citação provocativa do Raphael.
- **Grid de Módulos (Cards):** Cada artigo aparecerá como um nó no painel.
  - *Metadata Visual:* Tempo de leitura (ex: "8 min read") exibido na fonte `data-mono`.
  - *Sistema de Tags:* Tags nativas ("Mindset", "Teoria") exibidas como badges brilhantes (bordas de opacidade baixa, texto neon).
  - *Estado de Hover:* Ao passar o mouse, o card deve emitir um `glow` sutil, convidando o usuário ao clique sem agressividade.

## 4. O Roteamento Temporal (Consciência do Futuro)
A interface será desenhada já esperando a expansão para "Vídeos" e "Relatórios de Sessão". Mesmo que agora só tenhamos textos/artigos (Posts), a geometria do componente não pode quebrar caso adicionemos mídias pesadas posteriormente.

## 5. Ordem de Implementação (Para o @implementor)
1. **Criação do Componente:** Construir `src/components/PsychologyHub.tsx` (UI pura recebendo os tipos exportados do Prisma).
2. **Criação da Rota:** Construir `src/app/psicologia-hs/page.tsx`, instanciar o Prisma, realizar o fetch e repassar ao Hub.
3. **Cabeçalho de Autoconsciência (HRP V2):** Aplicar o bloco IDENTITY, ROLE, BINDING, e TELEOLOGY no topo de ambos os novos arquivos.