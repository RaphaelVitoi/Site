import { SCENARIOS } from './data/scenarios.js';
import { NashSolver } from './services/NashSolver.js';
import './components/risk-gauge.js';
import './components/scenario-list.js';

class GameEngine {
    constructor() {
        this.ui = {
            list: document.getElementById('main-scenario-list'),
            gaugeIP: document.getElementById('gauge-ip'),
            gaugeOOP: document.getElementById('gauge-oop'),
            title: document.getElementById('stage-title'),
            context: document.getElementById('stage-context'),
            content: document.getElementById('content-area')
        };
        
        this.solver = new NashSolver();
        this.currentSolution = null;
        this.init();
    }

    init() {
        // Injeta dados no componente de lista
        this.ui.list.data = SCENARIOS;
        
        // Escuta evento customizado do Web Component
        this.ui.list.addEventListener('select', (e) => {
            this.loadScenario(e.detail);
        });

        // Configura listener global para o input de simulação (Delegate)
        this.ui.content.addEventListener('input', (e) => {
            if (e.target.id === 'sim-equity-input') {
                this.runSimulation(e.target.value);
            }
            // Listener para o select de mãos
            if (e.target.id === 'sim-hand-select') {
                const equity = e.target.value;
                if (equity) {
                    const input = document.getElementById('sim-equity-input');
                    input.value = equity;
                    this.runSimulation(equity);
                }
            }
        });

        // Carrega inicial
        this.loadScenario(SCENARIOS[0].id);
    }

    loadScenario(id) {
        const data = SCENARIOS.find(s => s.id === id);
        if (!data) return;

        // Atualiza Gauges (Reatividade via Attributes)
        this.updateGauge(this.ui.gaugeIP, data.data.ip);
        this.updateGauge(this.ui.gaugeOOP, data.data.oop);

        // Calcular Nash Equilibrium Dinâmico
        this.currentSolution = this.solver.solve(data.data.ip.rp, data.data.oop.rp);

        // Atualiza Textos
        this.ui.title.innerText = data.label;
        this.ui.context.innerText = data.context;
        
        // Injeta conteúdo + Painel de Dados Calculados
        this.ui.content.innerHTML = `
            ${this._generateStatsPanel(this.currentSolution)}
            <div class="mt-8 border-t border-white/10 pt-6">
                ${data.content}
            </div>
        `;
    }

    updateGauge(el, d) { 
        el.setAttribute('value', d.rp); 
        el.setAttribute('pos', d.pos); 
        el.setAttribute('stack', d.stack);
        el.setAttribute('threshold', '20'); // Define limite crítico de 20%
    }

    runSimulation(val) {
        const equity = parseFloat(val);
        const output = document.getElementById('sim-result');
        
        if (isNaN(equity) || !this.currentSolution) {
            output.innerHTML = '<span class="text-slate-500 text-xs">Aguardando input...</span>';
            return;
        }

        const req = parseFloat(this.currentSolution.evDiff.totalRequired);
        const result = this.solver.simulateHand(equity, req);
        
        output.innerHTML = `
            <span class="font-bold ${result.statusClass} text-lg tracking-wider">${result.action}</span>
            <span class="text-xs text-slate-400 ml-2">
                (${result.isClose ? 'Marginal' : 'Claro'}, ${result.action === 'CALL' ? '+' : '-'}${result.margin}%)
            </span>
        `;
    }

    _generateStatsPanel(sol) {
        const getStatus = (v) => v > 0 ? 'status-positive' : (v < 0 ? 'status-negative' : 'status-neutral');
        
        // Dados para o Gráfico SVG
        const bBase = 33.3;
        const dBase = 50.0;
        const bIcm = parseFloat(sol.bluff.value);
        const dIcm = parseFloat(sol.defense.value);

        // Helper de Barra SVG
        const bar = (x, val, color) => {
            const h = Math.max(2, val * 0.8); // Escala 100% -> 80px
            const y = 90 - h;
            return `<rect x="${x}" y="${y}" width="16" height="${h}" fill="${color}" rx="2" class="transition-all duration-500" />
                    <text x="${x+8}" y="${y-4}" font-family="monospace" font-size="9" fill="#cbd5e1" text-anchor="middle">${val}%</text>`;
        };
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div class="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">${sol.bluff.label}</span>
                        <span class="text-xs font-mono font-bold ${getStatus(sol.bluff.delta)}">${sol.bluff.delta}%</span>
                    </div>
                    <div class="text-2xl font-mono font-bold text-white">${sol.bluff.value}%</div>
                    <div class="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div class="bg-indigo-500 h-full" style="width: ${sol.bluff.value}%"></div>
                    </div>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">${sol.defense.label}</span>
                        <span class="text-xs font-mono font-bold ${getStatus(sol.defense.delta)}">${sol.defense.delta}%</span>
                    </div>
                    <div class="text-2xl font-mono font-bold text-white">${sol.defense.value}%</div>
                    <div class="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div class="bg-pink-500 h-full" style="width: ${sol.defense.value}%"></div>
                    </div>
                </div>

                <!-- EV Diff / Equity Shift Panel -->
                <div class="col-span-1 md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                        <div class="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">${sol.evDiff.label}</div>
                        <div class="flex items-baseline gap-2">
                            <span class="text-3xl font-mono font-bold text-white tracking-tighter">${sol.evDiff.totalRequired}%</span>
                            <span class="text-xs font-bold status-negative bg-status-negative px-2 py-0.5 rounded border">+${sol.evDiff.value}% vs ChipEV</span>
                        </div>
                    </div>
                    <div class="w-full md:w-1/2 flex flex-col gap-1">
                        <div class="flex justify-between text-[9px] font-bold text-slate-500 uppercase"><span>Base (33%)</span><span>Risco Adicional</span></div>
                        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex"><div class="bg-slate-600 h-full" style="width: 33%"></div><div class="bg-pink-500 h-full shadow-[0_0_10px_rgba(236,72,153,0.5)]" style="width: ${Math.min(67, parseFloat(sol.evDiff.value))}%"></div></div>
                    </div>
                </div>

                <!-- Simulação Reversa (Novo) -->
                <div class="col-span-1 md:col-span-2 bg-slate-900/40 border border-white/5 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-slate-400"><i class="fa-solid fa-calculator"></i></div>
                        <div class="flex flex-col gap-1">
                            <div class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Simulação Reversa</div>
                            <div class="flex gap-2">
                                <select id="sim-hand-select" class="bg-slate-800 border-none text-white text-[10px] rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer">
                                    <option value="">Exemplos...</option>
                                    <option value="65">AA (65%)</option>
                                    <option value="55">KK (55%)</option>
                                    <option value="48">AKo (48%)</option>
                                    <option value="42">JJ (42%)</option>
                                    <option value="38">TT (38%)</option>
                                    <option value="33">88 (33%)</option>
                                    <option value="28">AJo (28%)</option>
                                </select>
                                <input type="number" id="sim-equity-input" placeholder="Equity %" class="bg-transparent border-b border-slate-600 text-white text-sm w-16 focus:outline-none focus:border-indigo-500 transition-colors font-mono text-center" min="0" max="100">
                            </div>
                        </div>
                    </div>
                    <div id="sim-result" class="text-right">
                        <span class="text-slate-600 text-[10px] uppercase font-bold">Resultado</span>
                    </div>
                </div>

                <!-- Gráfico Comparativo SVG -->
                <div class="col-span-1 md:col-span-2 bg-slate-900/40 border border-white/5 rounded-xl p-4 flex flex-col items-center">
                    <span class="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-4">Impacto ICM (GTO vs Ajustado)</span>
                    <svg viewBox="0 0 240 110" class="w-full h-24 overflow-visible">
                        <line x1="0" y1="90" x2="240" y2="90" stroke="#334155" stroke-width="1" />
                        
                        <g transform="translate(40,0)">
                            ${bar(0, bBase, '#334155')}
                            ${bar(20, bIcm, '#6366f1')}
                            <text x="18" y="105" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="1">BLUFF</text>
                        </g>

                        <g transform="translate(140,0)">
                            ${bar(0, dBase, '#334155')}
                            ${bar(20, dIcm, '#ec4899')}
                            <text x="18" y="105" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="1">DEFESA</text>
                        </g>
                    </svg>
                </div>
            </div>
            <div class="text-center"><span class="badge border-indigo-500/30 text-indigo-300 bg-indigo-500/10">${sol.verdict}</span></div>
        `;
    }
}

window.addEventListener('DOMContentLoaded', () => new GameEngine());