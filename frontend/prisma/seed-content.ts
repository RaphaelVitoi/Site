/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

export function seedContent(_prisma: PrismaClient): Promise<void> {
    console.log('[SEED] SOTA Content Seeding initialized.');
    return Promise.resolve();
}
