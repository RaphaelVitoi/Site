import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { spawn, ChildProcess } from 'child_process';

// Configuração de ASCII Rígido e Logs (Colorimetria SOTA)
const logInfo = (msg: string) => console.log(`\x1b[36m[NEXUS-CHAOS]\x1b[0m ${msg}`); // Ciano
const logChaos = (msg: string) => console.log(`\x1b[31m[ENTROPIA]\x1b[0m ${msg}`); // Vermelho
const logWarn = (msg: string) => console.log(`\x1b[33m[ALERTA]\x1b[0m ${msg}`); // Amarelo
const logSuccess = (msg: string) => console.log(`\x1b[32m[SIMETRIA]\x1b[0m ${msg}`); // Verde

const program = new Command();

program
    .name('nexus-chaos')
    .description('Módulo de Chaos Engineering para testar a resiliência do Workflow v6.5')
    .option('-i, --intensity <level>', 'Intensidade do caos (low, medium, high, gto)', 'low')
    .option('-t, --target <target>', 'Alvo da execução: "frontend" (Next.js) ou "worker" (Python)', 'worker')
    .parse(process.argv);

const options = program.opts();

// Mapeamento de Intensidade (λ = taxa de falha)
const intensityMap: Record<string, number> = {
    'low': 0.05,    // 5% de chance de falha
    'medium': 0.15, // 15% de chance de falha
    'high': 0.30,   // 30% de chance de falha
    'gto': 0.50     // 50% de chance de falha (Stress Test Extremo)
};

const lambda = intensityMap[options.intensity] || 0.05;
let activeProcess: ChildProcess | null = null;
const shadowDbPath = path.resolve(process.cwd(), 'queue/tasks_shadow.db');

/**
 * Função utilitária para calcular a injeção estocástica
 */
function shouldInjectFault(lambdaRate: number): boolean {
    return Math.random() < lambdaRate;
}

/**
 * Isolamento do Banco de Dados (Shadow DB)
 * Alinhado com o diretório real da arquitetura: queue/tasks.db
 */
function isolateDatabase() {
    const prodDbPath = path.resolve(process.cwd(), 'queue/tasks.db');

    // Define a URL para o Prisma (Frontend) e para o Python (se ele ler ENV)
    process.env.DATABASE_URL = `"file:${shadowDbPath}"`;
    process.env.SQLITE_DB_PATH = shadowDbPath; // Flag customizada que o Python pode herdar

    logInfo(`Banco isolado. Operando em SHADOW MODE: ${shadowDbPath}`);

    if (fs.existsSync(prodDbPath)) {
        fs.copyFileSync(prodDbPath, shadowDbPath);
        logSuccess('Snapshot do banco de produção (Kernel) copiado para o ambiente shadow.');
    } else {
        logWarn('Banco de produção não encontrado. O ambiente shadow iniciará vazio.');
    }
}

/**
 * Interceptor de Rede Global (Efetivo apenas para o alvo Node.js / Frontend)
 */
function interceptNetwork() {
    const originalFetch = global.fetch;

    // @ts-ignore - Sobrescrevendo a tipagem global por motivos de engenharia de testes
    global.fetch = async (...args: Parameters<typeof originalFetch>) => {
        const [resource] = args;
        const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.toString() : resource.url;

        if (url.includes('api') || url.includes('openrouter')) {
            if (shouldInjectFault(lambda)) {
                const failureTypes = ['TIMEOUT', '503_UNAVAILABLE', '429_RATE_LIMIT'];
                const selectedFailure = failureTypes[Math.floor(Math.random() * failureTypes.length)];

                logChaos(`Anomalia injetada na rota: ${url} | Tipo: ${selectedFailure}`);

                switch (selectedFailure) {
                    case 'TIMEOUT':
                        return new Promise((_, reject) => {
                            setTimeout(() => reject(new Error('ECONNRESET: Simulação de Timeout da API (ChaosCore)')), 3000);
                        });
                    case '503_UNAVAILABLE':
                        return new Response(JSON.stringify({ error: 'ChaosCore: 503 Service Unavailable' }), {
                            status: 503, statusText: 'Service Unavailable', headers: { 'Content-Type': 'application/json' }
                        });
                    case '429_RATE_LIMIT':
                        return new Response(JSON.stringify({ error: 'ChaosCore: 429 Too Many Requests' }), {
                            status: 429, statusText: 'Too Many Requests', headers: { 'Content-Type': 'application/json', 'Retry-After': '5' }
                        });
                }
            }
        }
        return originalFetch(...args);
    };

    logWarn(`Interceptor de Rede Node.js ATIVADO. Taxa de entropia (λ): ${lambda * 100}%`);
}

/**
 * Executa o alvo (Worker Python ou Frontend) herdando o ambiente contaminado
 */
function spawnTarget(target: string) {
    logInfo(`Ignificando alvo sob efeito do Caos: [${target.toUpperCase()}]`);

    if (target === 'frontend') {
        activeProcess = spawn('npm', ['run', 'dev'], { stdio: 'inherit', shell: true, env: process.env });
    } else {
        // Para aplicar caos real no Python, o ideal futuro é corromper as chaves de API temporariamente no .env
        // ou passar um proxy host inválido nas variáveis de ambiente.
        process.env.GEMINI_API_KEY = shouldInjectFault(lambda) ? "CHAOS_CORRUPTED_KEY" : process.env.GEMINI_API_KEY;

        const isWindows = process.platform === 'win32';
        const venvPython = path.join('.venv', isWindows ? 'Scripts' : 'bin', isWindows ? 'python.exe' : 'python');
        const pythonCmd = fs.existsSync(venvPython) ? venvPython : 'python';
        activeProcess = spawn(pythonCmd, ['task_executor.py', 'worker'], { stdio: 'inherit', shell: true, env: process.env });
    }

    activeProcess.on('close', (code) => {
        logInfo(`Processo alvo finalizado com código ${code}.`);
        cleanupAndExit();
    });
}

function cleanupAndExit() {
    logInfo('Iniciando expurgo do Caos e restauração da homeostase...');
    if (activeProcess) {
        activeProcess.kill('SIGINT');
    }
    if (fs.existsSync(shadowDbPath)) {
        fs.unlinkSync(shadowDbPath);
        logSuccess('Shadow DB vaporizado. Zero resíduos deixados no HD.');
    }
    process.exit(0);
}

// Protocolos de desligamento limpo
process.on('SIGINT', cleanupAndExit);
process.on('SIGTERM', cleanupAndExit);

function bootstrapChaos() {
    console.clear();
    console.log(`\x1b[35m
   ____ _                       ____               
  / ___| |__   __ _  ___  ___  / ___|___  _ __ ___ 
 | |   | '_ \\ / _\` |/ _ \\/ __|| |   / _ \\| '__/ _ \\
 | |___| | | | (_| | (_) \\__ \\| |__| (_) | | |  __/
  \\____|_| |_|\\__,_|\\___/|___/ \\____\\___/|_|  \\___|
  \x1b[0m`);

    logInfo(`Inicializando Chaos Engineering Module (v1.0.0) | Workflow v6.5`);
    isolateDatabase();
    interceptNetwork();
    spawnTarget(options.target);
}

bootstrapChaos();