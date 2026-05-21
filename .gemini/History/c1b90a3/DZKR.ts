import { NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'node:path';

export async function POST(request: Request) {
    try {
        const data = await request.json();
        const {
            type = 'quiz',
            category = 'Geral',
            time_ms = 0,
            is_correct,
            ev_loss = 0,
            user_id = 'local'
        } = data;

        // Resolvendo o path absoluto para o banco de dados principal do Kernel Python
        // Assumindo que o Next.js roda em /frontend e o banco em /queue/tasks.db
        const dbPath = path.resolve(process.cwd(), '../queue/tasks.db');

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        // A tabela é forjada pelo Python, mas o Node realiza a injeção não-bloqueante
        await db.run(
            `INSERT INTO telemetry_logs (type, category, time_ms, is_correct, ev_loss, user_id, timestamp) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
            [type, category, time_ms, is_correct ? 1 : 0, ev_loss, user_id]
        );
        await db.close();

        return NextResponse.json({ status: 'SUCCESS' });
    } catch (error) {
        console.error('[TELEMETRY] Erro Catastrófico ao salvar telemetria:', error);
        return NextResponse.json({ status: 'ERROR', error: String(error) }, { status: 500 });
    }
}