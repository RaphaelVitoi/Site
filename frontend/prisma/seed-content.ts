/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

export async function seedContent(_prisma: PrismaClient): Promise<void> {
    console.log('[SEED] SOTA Content Seeding initialized.');
}
