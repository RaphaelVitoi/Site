/* eslint-disable no-console */
/// <reference types="node" />

import type { PrismaClient } from '@prisma/client';
import crypto from 'node:crypto';

export async function seedContent( prisma: PrismaClient ) {
      console.log( '[SEED] Injetando Conteúdo da Biblioteca e Lições...' );

    const lesson = await prisma.lesson.upsert( {
        where: { slug: 'aula-1-2-referencial' },
        update: {},
        create: {
            slug: 'aula-1-2-referencial',
            title: 'Referencial Aula 1.2',
            markdown_body: '# A Matemática do Viés\nA base empírica da Fricção Zero em ICM.',
            type: 'Article',
            tags: 'icm, referencial'
        }
    } );
      console.log( `  [+] Lição SOTA injetada: ${lesson.title}` );

    const contentId = crypto.randomUUID ? crypto.randomUUID() : 'c' + Math.random().toString( 36 ).substring( 2, 15 );
    const contentFalacia = await ( prisma as PrismaClient & { content: { upsert: (arg: unknown) => Promise<{ title: string }> } } ).content.upsert( {
        where: { slug: 'falacia-das-pot-odds-e-perspectiva' },
        update: {},
        create: {
            id: contentId,
            slug: 'falacia-das-pot-odds-e-perspectiva',
            category: 'biblioteca',
            title: 'A Falácia das Pot Odds e a Perspectiva Matemática',
            description: 'O abismo entre o EV do Fold, a armadilha das Reverse Implied Odds e a Amortização da Edge.',
            body: '# A Falácia das Pot Odds e a Matemática da Perspectiva\n\nO EV do fold nunca é 0, exceto em cash games. Em torneios com antes, o seu baseline é o custo de existência na órbita. O EV do fold em chipEV é `-antes`.',
            isPublished: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    } ).catch( () => {
        console.warn( '  [AVISO] Tabela Content ausente ou falha de tipagem. Conteúdo não injetado.' );
    } );

    if ( contentFalacia )   console.log( `  [+] Artigo da Biblioteca SOTA injetado: ${contentFalacia.title}` );
}

