/**
 * IDENTITY: SOTA Frontend Logger
 * PATH: src/lib/logger.ts
 * ROLE: Capturar eventos, erros e métricas de performance do frontend e enviá-los para o motor de auditoria (task_executor).
 * BINDING: [web/handlers.py (handle_frontend_logs)]
 * TELEOLOGY: Monitoramento em tempo real de anomalias matemáticas e de UI, garantindo a integridade SOTA v6.2.1 GOLD.
 */
declare class SOTALogger {
    private static instance;
    private queue;
    private isProcessing;
    private constructor();
    static getInstance(): SOTALogger;
    info(component: string, message: string, data?: Record<string, unknown>): void;
    warn(component: string, message: string, data?: Record<string, unknown>): void;
    error(component: string, message: string, data?: Record<string, unknown>): void;
    critical(component: string, message: string, data?: Record<string, unknown>): void;
    metric(component: string, name: string, value: number, data?: Record<string, unknown>): void;
    private log;
    private flush;
}
export declare const logger: SOTALogger;
export {};
