# SPEC: Pagina de Artigo Individual
> **Autor:** CHICO (atuando como @planner)
> **Status:** Pronto para Execucao
> **Alinhamento:** COSMOVISAO.md (Hierarquia Clara, Foco, Didatica Visceral)

---

## 1. Visao Geral e Roteamento
A pagina `frontend/src/app/blog/[slug]/page.tsx` e o santuario de leitura. Ela recebe o `slug` pela URL, busca o artigo correspondente no banco de dados Prisma e renderiza o conteudo. Se o artigo nao existir, deve retornar um 404 (Not Found).

## 2. Requisitos de Renderizacao (O Motor de Leitura)

### 2.1 Tipografia e Estetica
- Utilizar o plugin `@tailwindcss/typography` (conhecido como `prose`).
- O design deve ser minimalista, fundo escuro (`prose-invert`), com a fonte `Inter` para leitura longa e `Playfair Display` para titulos.
- Foco absoluto na leitura: sem sidebars poluidas, coluna central com largura maxima otimizada para os olhos (`max-w-3xl`).

### 2.2 Cabecalho do Artigo
- Titulo em destaque maximo.
- Metadados sutis abaixo do titulo: Data de Publicacao, Tempo de Leitura (`readTime`) e Badges das `tags`.

## 3. Renderizacao de Conteudo e "Didatica Visceral"
O campo `content` no banco de dados guardara conteudo em Markdown/HTML. 

### 3.1. Integracao do Simulador (O Templo Interativo)
Para atingir a "Didatica Visceral", nossos artigos precisam ter simuladores acoplados organicamente no texto. Como os simuladores legados sao HTML/JS (e o novo sera um componente React), usaremos a seguinte abordagem mista para esta versao inicial:

- O conteudo sera renderizado de forma segura usando uma lib como `react-markdown` ou `html-react-parser`.
- **O Padrao de Injecao:** Sempre que o autor escrever `[SIMULADOR_V1]` ou um iframe no texto do banco de dados, o frontend deve substituir isso pela renderizacao do componente correspondente.
- *Abordagem recomendada para V1:* Utilizar um container largo (`w-full xl:max-w-5xl xl:-ml-32`) para "quebrar" a margem da leitura e dar destaque imersivo ao simulador.

## 4. Plano de Execucao (@implementor)

1. **Setup de Tipografia:** Executar `npm install -D @tailwindcss/typography` e adiciona-lo ao `tailwind.config.ts`.
2. **Setup de Markdown:** Instalar pacote para parsear o conteudo (ex: `npm install react-markdown` ou equivalente).
3. **Logica de Dados:** No arquivo `[slug]/page.tsx`, criar a funcao assincrona que faz o fetch do Post no Prisma usando o `params.slug`. Adicionar tratamento de `notFound()`.
4. **Montagem da UI:** Construir o layout do artigo.
   - Topo: Titulo, Data, Tempo de leitura, Tags.
   - Corpo: `<article className="prose prose-invert prose-lg"> {parsedContent} </article>`.
5. **Validacao:** Garantir que o design bata com as guidelines esteticas da `COSMOVISAO.md`.

## 5. Proximos Passos (Fora do Escopo Atual)
- MDX completo (permitindo importar componentes React diretamente no corpo do texto). Por enquanto, strings Markdown com parse no client ou server resolvem a V1 de forma elegante.
