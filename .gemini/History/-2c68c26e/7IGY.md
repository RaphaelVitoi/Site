# SPEC: Página de Artigo Individual
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execução
> **Alinhamento:** COSMOVISAO.md (Hierarquia Clara, Foco, Didática Visceral)

---

## 1. Visão Geral e Roteamento
A página `frontend/src/app/blog/[slug]/page.tsx` é o santuário de leitura. Ela recebe o `slug` pela URL, busca o artigo correspondente no banco de dados Prisma e renderiza o conteúdo. Se o artigo não existir, deve retornar um 404 (Not Found).

## 2. Requisitos de Renderização (O Motor de Leitura)

### 2.1 Tipografia e Estética
- Utilizar o plugin `@tailwindcss/typography` (conhecido como `prose`).
- O design deve ser minimalista, fundo escuro (`prose-invert`), com a fonte `Inter` para leitura longa e `Playfair Display` para títulos.
- Foco absoluto na leitura: sem sidebars poluídas, coluna central com largura máxima otimizada para os olhos (`max-w-3xl`).

### 2.2 Cabeçalho do Artigo
- Título em destaque máximo.
- Metadados sutis abaixo do título: Data de Publicação, Tempo de Leitura (`readTime`) e Badges das `tags`.

## 3. Renderização de Conteúdo e "Didática Visceral"
O campo `content` no banco de dados guardará conteúdo em Markdown/HTML. 

### 3.1. Integração do Simulador (O Templo Interativo)
Para atingir a "Didática Visceral", nossos artigos precisam ter simuladores acoplados organicamente no texto. Como os simuladores legados são HTML/JS (e o novo será um componente React), usaremos a seguinte abordagem mista para esta versão inicial:

- O conteúdo será renderizado de forma segura usando uma lib como `react-markdown` ou `html-react-parser`.
- **O Padrão de Injeção:** Sempre que o autor escrever `[SIMULADOR_V1]` ou um iframe no texto do banco de dados, o frontend deve substituir isso pela renderização do componente correspondente.
- *Abordagem recomendada para V1:* Utilizar um container largo (`w-full xl:max-w-5xl xl:-ml-32`) para "quebrar" a margem da leitura e dar destaque imersivo ao simulador.

## 4. Plano de Execução (@implementor)

1. **Setup de Tipografia:** Executar `npm install -D @tailwindcss/typography` e adicioná-lo ao `tailwind.config.ts`.
2. **Setup de Markdown:** Instalar pacote para parsear o conteúdo (ex: `npm install react-markdown` ou equivalente).
3. **Lógica de Dados:** No arquivo `[slug]/page.tsx`, criar a função assíncrona que faz o fetch do Post no Prisma usando o `params.slug`. Adicionar tratamento de `notFound()`.
4. **Montagem da UI:** Construir o layout do artigo.
   - Topo: Título, Data, Tempo de leitura, Tags.
   - Corpo: `<article className="prose prose-invert prose-lg"> {parsedContent} </article>`.
5. **Validação:** Garantir que o design bata com as guidelines estéticas da `COSMOVISAO.md`.

## 5. Próximos Passos (Fora do Escopo Atual)
- MDX completo (permitindo importar componentes React diretamente no corpo do texto). Por enquanto, strings Markdown com parse no client ou server resolvem a V1 de forma elegante.