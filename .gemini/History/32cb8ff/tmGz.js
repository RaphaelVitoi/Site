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
        this.init();
    }

    init() {
        // Injeta dados no componente de lista
        this.ui.list.data = SCENARIOS;
        
        // Escuta evento customizado do Web Component
        this.ui.list.addEventListener('select', (e) => {
            this.loadScenario(e.detail);
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
        const solution = this.solver.solve(data.data.ip.rp, data.data.oop.rp);

        // Atualiza Textos
        this.ui.title.innerText = data.label;
        this.ui.context.innerText = data.context;
        this.ui.content.innerHTML = data.content;
        
        // Injeta conteúdo + Painel de Dados Calculados
        this.ui.content.innerHTML = `
            ${this._generateStatsPanel(solution)}
            <div class="mt-8 border-t border-white/10 pt-6">
                ${data.content}
            </div>
        `;
    }

    updateGauge(el, d) { el.setAttribute('value', d.rp); el.setAttribute('pos', d.pos); el.setAttribute('stack', d.stack); }

    _generateStatsPanel(sol) {
        const getColor = (v) => v > 0 ? 'text-emerald-400' : (v < 0 ? 'text-pink-400' : 'text-slate-400');
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div class="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">${sol.bluff.label}</span>
                        <span class="text-xs font-mono font-bold ${getColor(sol.bluff.delta)}">${sol.bluff.delta}%</span>
                    </div>
                    <div class="text-2xl font-mono font-bold text-white">${sol.bluff.value}%</div>
                    <div class="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div class="bg-indigo-500 h-full" style="width: ${sol.bluff.value}%"></div>
                    </div>
                </div>

                <div class="bg-slate-900/50 p-4 rounded-xl border border-white/5">
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-[10px] uppercase tracking-widest text-slate-500 font-bold">${sol.defense.label}</span>
                        <span class="text-xs font-mono font-bold ${getColor(sol.defense.delta)}">${sol.defense.delta}%</span>
                    </div>
                    <div class="text-2xl font-mono font-bold text-white">${sol.defense.value}%</div>
                    <div class="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                        <div class="bg-pink-500 h-full" style="width: ${sol.defense.value}%"></div>
                    </div>
                </div>
            </div>
            <div class="text-center"><span class="badge border-indigo-500/30 text-indigo-300 bg-indigo-500/10">${sol.verdict}</span></div>
        `;
    }
}

window.addEventListener('DOMContentLoaded', () => new GameEngine());