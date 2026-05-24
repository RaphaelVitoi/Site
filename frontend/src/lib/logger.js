/**
 * IDENTITY: SOTA Frontend Logger
 * PATH: src/lib/logger.ts
 * ROLE: Capturar eventos, erros e métricas de performance do frontend e enviá-los para o motor de auditoria (task_executor).
 * BINDING: [web/handlers.py (handle_frontend_logs)]
 * TELEOLOGY: Monitoramento em tempo real de anomalias matemáticas e de UI, garantindo a integridade SOTA v6.2.1 GOLD.
 */
/* eslint-disable no-console */
import { buildNexusClientUrl } from '@/lib/api-contract';
class SOTALogger {
    static instance;
    queue = [];
    isProcessing = false;
    constructor() {
        // Escuta erros globais
        if (typeof globalThis !== 'undefined' && 'window' in globalThis) {
            const browserGlobal = globalThis;
            browserGlobal.addEventListener('error', (e) => this.error('Window', e.message, { stack: e.error?.stack }));
            browserGlobal.addEventListener('unhandledrejection', (e) => this.error('Promise', e.reason?.message || 'Unhandled Rejection', {
                reason: e.reason,
            }));
        }
    }
    static getInstance() {
        if (!SOTALogger.instance) {
            SOTALogger.instance = new SOTALogger();
        }
        return SOTALogger.instance;
    }
    info(component, message, data) {
        this.log('info', component, message, data);
    }
    warn(component, message, data) {
        this.log('warn', component, message, data);
    }
    error(component, message, data) {
        this.log('error', component, message, data);
    }
    critical(component, message, data) {
        this.log('critical', component, message, data);
    }
    metric(component, name, value, data) {
        this.log('metric', component, name, { ...data, value });
    }
    log(level, component, message, data) {
        const event = {
            level,
            component,
            message,
            data,
            timestamp: new Date().toISOString(),
        };
        // Print local para desenvolvimento
        const colors = {
            info: '\x1b[32m',
            warn: '\x1b[33m',
            error: '\x1b[31m',
            critical: '\x1b[41m',
            metric: '\x1b[36m',
        };
        if (process.env.NODE_ENV !== 'production') {
            console.log(`${colors[level]}[${level.toUpperCase()}] [${component}] ${message}\x1b[0m`, data || '');
        }
        this.queue.push(event);
        this.flush();
    }
    async flush() {
        if (this.isProcessing || this.queue.length === 0)
            return;
        if (process.env.NODE_ENV === 'development')
            return; // Friccao Zero Absoluta: aniquila a tentativa de rede local.
        this.isProcessing = true;
        const events = [...this.queue];
        this.queue = [];
        try {
            await fetch(buildNexusClientUrl('/api/logs/frontend'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ events }),
            });
        }
        catch (err) {
            if (process.env.NODE_ENV !== 'production') {
                console.error('[Logger] Failed to flush logs', err);
            }
        }
        finally {
            this.isProcessing = false;
            if (this.queue.length > 0) {
                setTimeout(() => this.flush(), 5000);
            }
        }
    }
}
export const logger = SOTALogger.getInstance();
