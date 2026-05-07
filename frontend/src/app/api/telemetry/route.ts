import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';
import { TelemetryPayloadSchema } from '@/lib/schemas';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const data = TelemetryPayloadSchema.parse(body);

        // Resolvendo o path absoluto para o banco de dados principal do Kernel Python
        const dbPath = path.resolve(process.cwd(), '../queue/tasks.db');

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        await db.run(
            `INSERT INTO telemetry_logs (type, category, time_ms, is_correct, ev_loss, user_id, timestamp) 
             VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [
                data.componentName, 
                data.category, 
                data.latency || 0, 
                data.isCorrect ? 1 : 0, 
                data.evLoss, 
                'local'
            ]
        );
        await db.close();

        return NextResponse.json({ status: 'SUCCESS' });
    } catch (error) {
        console.error('[TELEMETRY] Erro Catastrófico ao salvar telemetria:', error);
        return NextResponse.json({ status: 'ERROR', error: String(error) }, { status: 500 });
    }
}