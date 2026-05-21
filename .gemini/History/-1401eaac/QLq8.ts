/**
 * IDENTITY: SOTA Frontend Logger
 * PATH: src/lib/logger.ts
 * ROLE: Capturar eventos, erros e métricas de performance do frontend e enviá-los para o motor de auditoria (task_executor).
 * BINDING: [web/handlers.py (handle_frontend_event)]
 * TELEOLOGY: Monitoramento em tempo real de anomalias matemáticas e de UI, garantindo a integridade SOTA v3.4.
 */

type LogLevel = 'info' | 'warn' | 'error' | 'critical' | 'metric';

interface LogEvent {
  level: LogLevel;
  component: string;
  message: string;
  data?: any;
  timestamp: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class SOTALogger {
  private static instance: SOTALogger;
  private queue: LogEvent[] = [];
  private isProcessing: boolean = false;

  private constructor () {
    // Escuta erros globais
    if ( typeof window !== 'undefined' )
    {
      window.addEventListener( 'error', ( e ) => this.error( 'Window', e.message, { stack: e.error?.stack } ) );
      window.addEventListener( 'unhandledrejection', ( e ) => this.error( 'Promise', e.reason?.message || 'Unhandled Rejection', { reason: e.reason } ) );
    }
  }

  public static getInstance (): SOTALogger {
    if ( !SOTALogger.instance )
    {
      SOTALogger.instance = new SOTALogger();
    }
    return SOTALogger.instance;
  }

  public info ( component: string, message: string, data?: any ) {
    this.log( 'info', component, message, data );
  }

  public warn ( component: string, message: string, data?: any ) {
    this.log( 'warn', component, message, data );
  }

  public error ( component: string, message: string, data?: any ) {
    this.log( 'error', component, message, data );
  }

  public critical ( component: string, message: string, data?: any ) {
    this.log( 'critical', component, message, data );
  }

  public metric ( component: string, name: string, value: number, data?: any ) {
    this.log( 'metric', component, name, { ...data, value } );
  }

  private log ( level: LogLevel, component: string, message: string, data?: any ) {
    const event: LogEvent = {
      level,
      component,
      message,
      data,
      timestamp: new Date().toISOString()
    };

    // Print local para desenvolvimento
    const colors = {
      info: '\x1b[32m',
      warn: '\x1b[33m',
      error: '\x1b[31m',
      critical: '\x1b[41m',
      metric: '\x1b[36m'
    };
    console.log( `${colors[ level ]}[${level.toUpperCase()}] [${component}] ${message}\x1b[0m`, data || '' );

    this.queue.push( event );
    this.flush();
  }

  private async flush () {
    if ( this.isProcessing || this.queue.length === 0 ) return;
    if ( process.env.NODE_ENV === 'development' ) return; // Friccao Zero Absoluta: aniquila a tentativa de rede local.
    this.isProcessing = true;

    const events = [ ...this.queue ];
    this.queue = [];

    try
    {
      await fetch( `${API_URL}/api/logs/frontend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( { events } )
      } );
    } catch ( err )
    {
      // Falha silenciosa absoluta. Fricção zero. O navegador já acusa o network error nativamente.
    } finally
    {
      this.isProcessing = false;
      if ( this.queue.length > 0 )
      {
        setTimeout( () => this.flush(), 5000 );
      }
    }
  }
}

export const logger = SOTALogger.getInstance();
