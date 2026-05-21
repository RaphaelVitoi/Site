import { PrismaClient } from '@prisma/client';
import fs from 'node:fs/promises';
import path from 'node:path';

const prisma = new PrismaClient();

async function processMarkdownFile ( fullPath: string, fileName: string, category: string ) {
    const fileContents = await fs.readFile( fullPath, 'utf8' );

    // Parser de Frontmatter
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = frontmatterRegex.exec( fileContents );

    let body = fileContents;
    const metadata: Record<string, string> = {};

    if ( match )
    {
        const frontmatterStr = match[ 1 ];
        body = match[ 2 ];

        for ( const line of frontmatterStr.split( '\n' ) )
        {
            const colonIndex = line.indexOf( ':' );
            if ( colonIndex !== -1 )
            {
                const key = line.slice( 0, colonIndex ).trim();
                const value = line.slice( colonIndex + 1 ).trim().replaceAll( /^['"]|['"]$/g, '' );
                if ( key ) metadata[ key ] = value;
            }
        }
    }

    const slugMatch = fileName.replace( '.md', '' );
    const titleMatch = /^#\s+(.*)/m.exec( body );
    const title = metadata.title || ( titleMatch ? titleMatch[ 1 ].trim() : slugMatch );
    const description = metadata.description || '';

    // Extirpa o H1 do body
    body = body.replace( /^#\s+.*\n?/, '' ).trim();
    const finalCategory = metadata.category?.toLowerCase().includes( 'biblioteca' ) ? 'biblioteca' : category;

    await prisma.content.upsert( {
        where: { slug: slugMatch },
        update: {
            title,
            description,
            body,
            category: finalCategory,
            isPublished: true,
        },
        create: {
            slug: slugMatch,
            title,
            description,
            body,
            category: finalCategory,
            isPublished: true,
            authorId: metadata.author || 'Raphael Vitoi'
        }
    } );

    console.log( `✅ Semeado [${category}]: ${slugMatch}` );
}

async function processDirectory ( dirPath: string, category: string ) {
    try
    {
        const entries = await fs.readdir( dirPath, { withFileTypes: true } );

        for ( const entry of entries )
        {
            const fullPath = path.join( dirPath, entry.name );

            if ( entry.isDirectory() )
            {
                await processDirectory( fullPath, category );
            } else if ( entry.isFile() && entry.name.endsWith( '.md' ) )
            {
                await processMarkdownFile( fullPath, entry.name, category );
            }
        }
    } catch ( e )
    {
        console.warn( `Aviso: Diretório não encontrado ou erro ao ler: ${dirPath}. Detalhe: ${e instanceof Error ? e.message : String( e )}` );
    }
}

async function main () {
    console.log( '🌱 Iniciando seed da Máquina de Conteúdo SOTA...' );

    const epicsPath = path.join( __dirname, '..', '..', 'docs', 'epics' );
    await processDirectory( epicsPath, 'aulas' );

    const artigosPath = path.join( __dirname, '..', '..', 'content', 'artigos' );
    await processDirectory( artigosPath, 'artigos' );

    // Injetar artigos hardcoded da biblioteca para manter a compatibilidade imediata
    const bibliotecaHardcoded = [
        {
            slug: 'voce-aprende-poker-errado',
            title: 'A Amortização da Edge',
            description: 'Por que a distância entre um jogador de elite e um amador diminui drasticamente quando ambos têm 10 big blinds.',
            body: 'Conteúdo renderizado nativamente no componente. Esta entrada existe para listagem.',
            category: 'biblioteca'
        },
        {
            slug: 'entendendo-o-icm-e-suas-heuristicas',
            title: 'Entendendo o ICM e suas heurísticas',
            description: 'Compreenda o ICM e suas heurísticas através da análise de RPs e Toy Games.',
            body: 'Conteúdo renderizado nativamente no componente. Esta entrada existe para listagem.',
            category: 'biblioteca'
        },
        {
            slug: 'motor-diluicao',
            title: 'O Motor de Diluição',
            description: 'Como o Risk Premium afeta os ranges de call de forma não-linear através das streets.',
            body: 'Conteúdo renderizado nativamente no componente. Esta entrada existe para listagem.',
            category: 'biblioteca'
        },
        {
            slug: 'paradoxo-valuation',
            title: 'O Paradoxo do Valuation no ICM',
            description: 'Por que acumular fichas pode ser matematicamente contraproducente em retas finais.',
            body: 'Conteúdo renderizado nativamente no componente. Esta entrada existe para listagem.',
            category: 'biblioteca'
        },
        {
            slug: 'hermeneutica-blefe',
            title: 'Hermenêutica do Blefe',
            description: 'Uma análise profunda sobre a estrutura lógica e psicológica do blefe no poker moderno.',
            body: 'Conteúdo renderizado nativamente no componente. Esta entrada existe para listagem.',
            category: 'biblioteca'
        }
    ];

    for ( const item of bibliotecaHardcoded )
    {
        await prisma.content.upsert( {
            where: { slug: item.slug },
            update: {
                title: item.title,
                description: item.description,
                category: item.category,
                isPublished: true,
            },
            create: {
                slug: item.slug,
                title: item.title,
                description: item.description,
                body: item.body,
                category: item.category,
                isPublished: true,
                authorId: 'Raphael Vitoi'
            }
        } );
        console.log( `✅ Semeado [biblioteca hardcoded]: ${item.slug}` );
    }

    console.log( '🏁 Seed concluído com sucesso.' );
}

main()
    .catch( ( e ) => {
        console.error( '❌ Erro no seed:', e );
        process.exit( 1 );
    } )
    .finally( async () => {
        await prisma.$disconnect();
    } );
