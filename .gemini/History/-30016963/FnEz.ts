import { PrismaClient } from '@prisma/client';
import * as fs from 'node:fs';
import * as path from 'node:path';

const prisma = new PrismaClient();

async function main () {
    // Caminho absoluto alinhado à Lei 4 de Ancoragem SOTA
    const targetPath = path.resolve( __dirname, '../content/blog/perspectiva-matematica-paradigma-vitoi.md' );

    console.log( `[SEED SOTA] Iniciando ingestão do artigo a partir de: ${targetPath}` );

    if ( !fs.existsSync( targetPath ) )
    {
        throw new Error( `[ENTROPIA CRÍTICA] Arquivo alvo não localizado em: ${targetPath}` );
    }

    const rawData = fs.readFileSync( targetPath, 'utf-8' );

    // Extração determinística do Frontmatter e Conteúdo
    const frontmatterMatch = rawData.match( /^---\n([\s\S]*?)\n---/ );
    const content = frontmatterMatch ? rawData.replace( frontmatterMatch[ 0 ], '' ).trim() : rawData.trim();

    // Parser nativo sem dependências externas de terceiros (Fricção Zero)
    const titleMatch = frontmatterMatch ? frontmatterMatch[ 1 ].match( /title:\s*"([^"]+)"/ ) : null;
    const dateMatch = frontmatterMatch ? frontmatterMatch[ 1 ].match( /date:\s*"([^"]+)"/ ) : null;
    const readTimeMatch = frontmatterMatch ? frontmatterMatch[ 1 ].match( /readTime:\s*"([^"]+)"/ ) : null;

    const title = titleMatch ? titleMatch[ 1 ] : 'A Falácia das Pot Odds e a Ontologia da Decisão';
    const publishedAt = dateMatch ? new Date( dateMatch[ 1 ] ) : new Date();
    const readTime = readTimeMatch ? readTimeMatch[ 1 ] : '14 min';
    const slug = 'perspectiva-matematica-paradigma-vitoi';

    const article = await prisma.article.upsert( {
        where: { slug: slug },
        update: {
            title: title,
            content: content,
            readTime: readTime,
            publishedAt: publishedAt,
        },
        create: {
            slug: slug,
            title: title,
            content: content,
            readTime: readTime,
            publishedAt: publishedAt,
        }
    } );

    console.log( `[SUCESSO] Artigo '${article.title}' materializado no banco de dados com ID: ${article.id}` );
}

main()
    .catch( ( e ) => {
        console.error( '[FALHA SISTÊMICA] Erro na execução do Seed:', e );
        process.exit( 1 );
    } )
    .finally( async () => {
        await prisma.$disconnect();
    } );
