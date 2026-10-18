/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

export function seedScenarios(_prisma: PrismaClient): Promise<void> {
    console.log('[SEED] SOTA Scenarios Seeding initialized.');
    return Promise.resolve();
}
