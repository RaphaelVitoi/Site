/**
 * IDENTITY: SOTA Frontend Logger
 * PATH: src/lib/logger.ts
 * ROLE: Capturar eventos, erros e métricas de performance do frontend e enviá-los para o motor de auditoria (task_executor).
 * BINDING: [web/handlers.py (handle_frontend_logs)]
 * TELEOLOGY: Monitoramento em tempo real de anomalias matemáticas e de UI, garantindo a integridade SOTA v7.0 GOLD.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'critical' | 'metric';

/** Espelha MAX_FRONTEND_EVENTS_PER_REQUEST em api/v1/handlers.py. */
export const MAX_EVENTS_PER_REQUEST = 100;

/**
 * Gateway de mesma origem (src/app/api/v1/logs/frontend/route.ts). O navegador não chama mais o
 * backend Python direto: sem a credencial de serviço, que ele não pode portar, recebia 401 sempre.
 */
export const LOGS_GATEWAY_PATH = '/api/v1/logs/frontend';

interface LogEvent {
  level: LogLevel;
  component: string;
  message: string;
  data?: Record<string, unknown> | undefined;
  timestamp: string;
}

class SOTALogger {
  private static instance: SOTALogger;
  private queue: LogEvent[] = [];
  private isProcessing: boolean = false;

  private constructor() {
    // Escuta erros globais
    if (globalThis.window !== undefined) {
      globalThis.addEventListener('error', (e) => this.error('Window', e.message, { stack: e.error?.stack }));
      globalThis.addEventListener('unhandledrejection', (e) =>
        this.error('Promise', e.reason?.message || 'Unhandled Rejection', {
          reason: e.reason,
        }),
      );
    }
  }

  public static getInstance(): SOTALogger {
    if (!SOTALogger.instance) {
      SOTALogger.instance = new SOTALogger();
    }
    return SOTALogger.instance;
  }

  public info(component: string, message: string, data?: Record<string, unknown>) {
    this.log('info', component, message, data);
  }

  public warn(component: string, message: string, data?: Record<string, unknown>) {
    this.log('warn', component, message, data);
  }

  public error(component: string, message: string, data?: Record<string, unknown>) {
    this.log('error', component, message, data);
  }

  public critical(component: string, message: string, data?: Record<string, unknown>) {
    this.log('critical', component, message, data);
  }

  public metric(component: string, name: string, value: number, data?: Record<string, unknown>) {
    this.log('metric', component, name, { ...data, value });
  }

  private log(level: LogLevel, component: string, message: string, data?: Record<string, unknown>) {
    const event: LogEvent = {
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
    if (process.env['NODE_ENV'] !== 'production') {
      /* eslint-disable-next-line no-console */
      console.log(`${colors[level]}[${level.toUpperCase()}] [${component}] ${message}\x1b[0m`, data || '');
    }

    this.queue.push(event);
    this.flush();
  }

  private async flush() {
    if (this.isProcessing || this.queue.length === 0) return;
    if (process.env['NODE_ENV'] === 'development') return; // Friccao Zero Absoluta: aniquila a tentativa de rede local.
    // No servidor (route handlers) o log vai ao stdout; URL relativa nao resolve em Node e a
    // telemetria remota e a da UI do visitante.
    if (globalThis.window === undefined) {
      this.queue = [];
      return;
    }
    this.isProcessing = true;

    // O backend aceita no maximo MAX_EVENTS_PER_REQUEST por chamada (BK-05);
    // o restante segue no proximo flush.
    const events = this.queue.slice(0, MAX_EVENTS_PER_REQUEST);
    this.queue = this.queue.slice(MAX_EVENTS_PER_REQUEST);

    try {
      await fetch(LOGS_GATEWAY_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ events }),
      });
    } catch (err) {
      if (process.env['NODE_ENV'] !== 'production') {
        console.error('[Logger] Failed to flush logs', err);
      }
    } finally {
      this.isProcessing = false;
      if (this.queue.length > 0) {
        setTimeout(() => this.flush(), 5000);
      }
    }
  }
}

export const logger = SOTALogger.getInstance();

