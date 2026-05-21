import { SCENARIOS } from './scenarios.js';
import { TOY_GAMES } from '../../../scenarios_toygame.js';
import { NashSolver } from './NashSolver.js';
import './risk-gauge.js';
import './scenario-list.js';

const safeScenarios = Array.isArray(SCENARIOS) ? SCENARIOS : [];
const safeToyGames = Array.isArray(TOY_GAMES) ? TOY_GAMES : [];
const ALL_SCENARIOS = [...safeScenarios, ...safeToyGames];

class GameEngine {
    constructor() {
        this.ui = {
            list: document.getElementById('main-scenario-list'),
            gaugeIP: document.getElementById('gauge-ip'),
            gaugeOOP: document.getElementById('gauge-oop'),
            title: document.getElementById('stage-title'),
            contextBadge: document.getElementById('stage-context'),
            context: document.getElementById('stage-context'),
            singleView: document.getElementById('single-scenario-view'),
            content: document.getElementById('content-area'),
            compareArea: document.getElementById('compare-area'),
            btnCompare: document.getElementById('btn-mode-compare')
        };
        
        this.solver = new NashSolver();
        this.currentSolution = null;
        this.currentScenarioData = null;
        this.agressionFactor = 1.0;
        this.charts = {}; // Armazena instâncias do ApexCharts
        this.isMuted = true; // Inicia mutado para contornar bloqueio de Autoplay dos navegadores
        this.init();
    }

    init() {
        if (this.ui.list) {
            this.ui.list.data = ALL_SCENARIOS;
            
            const handleSelect = (e) => {
                const id = e.detail?.id || e.detail;
                this.loadScenario(id);
            };
            this.ui.list.addEventListener('select', handleSelect);
            this.ui.list.addEventListener('scenario-select', handleSelect);
        }

        // Alternar modo de comparação
        this.ui.btnCompare.addEventListener('click', () => {
            const isHidden = this.ui.compareArea.classList.contains('hidden');
            if (isHidden) {
                if (window.Analytics) window.Analytics.trackEvent('simulator_compare_mode', { action: 'enter' });
                this.ui.compareArea.classList.remove('hidden');
                if (this.ui.singleView) this.ui.singleView.classList.add('hidden');
                this.ui.btnCompare.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Voltar';
                this.ui.title.innerText = "Comparação Tática";
                this.ui.contextBadge.innerText = "Modo Análise";
                this.renderComparisonInterface();
            } else {
                this.ui.compareArea.classList.add('hidden');
                if (this.ui.singleView) this.ui.singleView.classList.remove('hidden');
                this.ui.btnCompare.innerHTML = '<i class="fa-solid fa-code-compare"></i> Comparar';
                // Recarrega o cenário atual para restaurar títulos
                if(this.currentScenarioData) this.loadScenario(this.currentScenarioData.id);
            }
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

        // Listener para o fator de agressividade (Delegate)
        this.ui.content.addEventListener('input', (e) => {
            if (e.target.id === 'agression-slider') {
                this.agressionFactor = parseFloat(e.target.value);
                document.getElementById('agression-value').innerText = this.agressionFactor.toFixed(1) + 'x';
                // Recalcula e atualiza apenas o painel, mantendo o conteúdo estático
                this.recalcScenario();
                if (window.Analytics) window.Analytics.trackEvent('simulator_agression_change', { factor: this.agressionFactor });
            }
        });

        // Listeners da Área de Comparação
        this.ui.compareArea.addEventListener('change', (e) => {
            if (e.target.classList.contains('scenario-selector')) {
                this.updateComparisonChart();
            }
        });

        // Listener para exportar PDF
        this.ui.content.addEventListener('click', (e) => {
            if (e.target.closest('#btn-export-pdf')) {
                this.exportPDF();
                if (window.Analytics) window.Analytics.trackEvent('simulator_export_pdf', { scenario: this.currentScenarioData?.id });
            }
        });

        // Listener para o botão Mute
        this.ui.content.addEventListener('click', (e) => {
            const btn = e.target.closest('#btn-toggle-mute');
            if (btn) {
                this.isMuted = !this.isMuted;
                // Atualiza o painel (ícone do botão)
                this.recalcScenario();
                // Propaga o estado para os Web Components imediatamente
                if (this.currentScenarioData) {
                    const d = this.currentScenarioData.data;
                    this.updateGauge(this.ui.gaugeIP, d.ip, d.oop.rp);
                    this.updateGauge(this.ui.gaugeOOP, d.oop, d.ip.rp);
                }
            }
        });

        // Carrega inicial
        try {
            if (ALL_SCENARIOS.length > 0) {
                this.loadScenario(ALL_SCENARIOS[0].id);
            }
        } catch (err) {
            if (this.ui.title) this.ui.title.innerText = "Erro Crítico de Motor";
            if (this.ui.content) this.ui.content.innerHTML = `<div class="bg-rose-500/10 border border-rose-500/30 p-4 rounded text-rose-400 font-mono text-xs">${err.message}</div>`;
        }
    }

    loadScenario(id) {
        try {
            const data = ALL_SCENARIOS.find(s => s.id === id);
            if (!data) throw new Error("Cenário não encontrado.");
            if (window.Analytics) window.Analytics.trackEvent('simulator_load_scenario', { id: data.id, label: data.label });
            
            this.currentScenarioData = data;
            this.agressionFactor = 1.0;

            if (data.data?.ip && data.data?.oop) {
                this.updateGauge(this.ui.gaugeIP, data.data.ip, data.data.oop.rp);
                this.updateGauge(this.ui.gaugeOOP, data.data.oop, data.data.ip.rp);
            }

            if (this.ui.title) this.ui.title.innerText = data.label || '';
            if (this.ui.context) this.ui.context.innerText = data.context || '';
            
            const contentHtml = (data.content && typeof data.content === 'object') ? (data.content.theory || '') : (data.content || '');

            this.currentSolution = this.solver.solve(data.data.ip.rp, data.data.oop.rp, this.agressionFactor);

            if (this.ui.content) {
                this.ui.content.innerHTML = `
                    <div id="stats-panel-container">
                        ${this._generateStatsPanel(this.currentSolution)}
                    </div>
                    <div id="main-chart" class="mt-4 min-h-[150px]"></div>
                    <div class="mt-8 border-t border-slate-800 pt-6 text-slate-300 leading-relaxed space-y-4">
                        ${contentHtml}
                    </div>
                `;
            }

            this._renderMainChart(this.currentSolution);
        } catch (err) {
            if (this.ui.title) this.ui.title.innerText = "Erro ao Renderizar Cenário";
            if (this.ui.content) this.ui.content.innerHTML = `<div class="bg-rose-500/10 border border-rose-500/30 p-4 rounded text-rose-400 font-mono text-xs">${err.stack}</div>`;
        }
    }

    recalcScenario() {
        if (!this.currentScenarioData) return;
        const data = this.currentScenarioData;
        this.currentSolution = this.solver.solve(data.data.ip.rp, data.data.oop.rp, this.agressionFactor);
        document.getElementById('stats-panel-container').innerHTML = this._generateStatsPanel(this.currentSolution);
        this._renderMainChart(this.currentSolution);
    }

    updateGauge(el, d, opponentRp) { 
        if (!el) return;
        el.setAttribute('value', d.rp); 
        el.setAttribute('pos', d.pos); 
        el.setAttribute('stack', d.stack);
        el.setAttribute('threshold', '20'); // Define limite crítico de 20%
        el.setAttribute('opponent-value', opponentRp); // Alimenta lógica do Predator Mode
        // Aplica atributo muted se o estado global estiver silenciado
        if (this.isMuted) el.setAttribute('muted', ''); else el.removeAttribute('muted');
    }

    runSimulation(val) {
        const equity = parseFloat(val);
        const output = document.getElementById('sim-result');
        
        if (isNaN(equity) || !this.currentSolution) {
            output.innerHTML = '<span class="text-slate-500 text-xs">Aguardando input...</span>';
            return;
        }

        const req = parseFloat(this.currentSolution.evDiff.totalRequired);
        
        // Cálculo de Simulação Reversa (Internalizado)
        const margin = equity - req;
        const isCall = margin >= 0;
        const isClose = Math.abs(margin) <= 3.5;
        const action = isCall ? 'CALL' : 'FOLD';
        const statusClass = isCall ? 'text-emerald-400' : 'text-rose-400';
        const sign = margin > 0 ? '+' : '';

        output.innerHTML = `
            <span class="font-bold ${statusClass} text-lg tracking-wider">${action}</span>
            <span class="text-xs text-slate-400 ml-2">
                (${isClose ? 'Marginal' : 'Claro'}, ${sign}${margin.toFixed(1)}%)
            </span>
        `;
    }

    _generateStatsPanel(sol) {
        const getStatus = (v) => v > 0 ? 'status-positive' : (v < 0 ? 'status-negative' : 'status-neutral');
        
        const chartHtml = this._renderChart(sol);
        
        // Estado visual sofisticado para o controle de áudio
        const muteStateClass = this.isMuted 
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20' 
            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white';
        const muteIcon = this.isMuted ? 'fa-volume-xmark' : 'fa-volume-high';
        const muteText = this.isMuted ? 'Mutado' : 'Som Ativo';
        
        return `
            <!-- Controles de Simulação Avançada -->
            <div class="flex items-center justify-between mb-6 bg-slate-900/30 p-3 rounded-lg border border-white/5">
                <div class="flex items-center gap-3">
                    <div class="text-[9px] font-bold uppercase tracking-widest text-slate-500">Agressividade (IP)</div>
                    <input type="range" id="agression-slider" min="0.5" max="1.5" step="0.1" value="${this.agressionFactor}" class="w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer">
                    <span id="agression-value" class="text-xs font-mono font-bold text-indigo-400">${this.agressionFactor.toFixed(1)}x</span>
                </div>
                <div class="flex gap-4">
                    <button id="btn-toggle-mute" class="btn-interactive text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-all duration-300 flex items-center gap-2 ${muteStateClass}">
                        <i class="fa-solid ${muteIcon}"></i> ${muteText}
                    </button>
                    <button id="btn-export-pdf" class="btn-interactive bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-all duration-300 flex items-center gap-2">
                        <i class="fa-solid fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>

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
                <div class="ev-diff-panel col-span-1 md:col-span-2 bg-slate-900/50 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
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
                    ${chartHtml}
                </div>
            </div>
            <div class="text-center"><span class="badge border-indigo-500/30 text-indigo-300 bg-indigo-500/10">${sol.verdict}</span></div>
        `;
    }

    _renderChart(sol) {
        const bBase = 33.3;
        const dBase = 50.0;
        const bIcm = parseFloat(sol.bluff.value);
        const dIcm = parseFloat(sol.defense.value);

        const bar = (x, val, color, label) => {
            const h = Math.max(2, val * 0.8);
            const y = 90 - h;
            return `<g class="group cursor-help">
                        <rect x="${x}" y="${y}" width="16" height="${h}" fill="${color}" rx="2" class="transition-all duration-500 hover:opacity-80"><title>${label}: ${val}%</title></rect>
                        <text x="${x+8}" y="${y-4}" font-family="monospace" font-size="9" fill="#cbd5e1" text-anchor="middle">${val}%</text>
                    </g>`;
        };

        return `
            <svg viewBox="0 0 240 110" class="w-full h-24 overflow-visible">
                <line x1="0" y1="90" x2="240" y2="90" stroke="#334155" stroke-width="1" />
                <g transform="translate(40,0)">
                    ${bar(0, bBase, '#334155', 'GTO Base (ChipEV)')}
                    ${bar(20, bIcm, '#6366f1', 'Ajustado (ICM)')}
                    <text x="18" y="105" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="1">BLUFF</text>
                </g>
                <g transform="translate(140,0)">
                    ${bar(0, dBase, '#334155', 'GTO Base (MDF)')}
                    ${bar(20, dIcm, '#ec4899', 'Ajustado (ICM)')}
                    <text x="18" y="105" font-size="9" font-weight="bold" fill="#64748b" text-anchor="middle" letter-spacing="1">DEFESA</text>
                </g>
            </svg>
            <div class="flex gap-4 mt-2 text-[9px] uppercase font-bold text-slate-500">
                <div class="flex items-center gap-1"><div class="w-2 h-2 bg-[#334155] rounded-sm"></div> Base GTO</div>
                <div class="flex items-center gap-1"><div class="w-2 h-2 bg-indigo-500 rounded-sm"></div> ICM Ajustado</div>
            </div>`;
    }

    _renderMainChart(sol) {
        if (this.charts.main) this.charts.main.destroy();

        const bBase = 33.3;
        const dBase = 50.0;
        const bIcm = parseFloat(sol.bluff.value);
        const dIcm = parseFloat(sol.defense.value);

        const options = {
            series: [{
                name: 'GTO Base (ChipEV)',
                data: [bBase, dBase]
            }, {
                name: 'ICM Ajustado',
                data: [bIcm, dIcm]
            }],
            chart: {
                type: 'bar',
                height: 200,
                fontFamily: 'Inter, sans-serif',
                background: 'transparent',
                toolbar: { show: false }
            },
            colors: ['#334155', '#6366f1'],
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: '45%',
                    borderRadius: 4
                },
            },
            dataLabels: { enabled: false },
            stroke: { show: true, width: 2, colors: ['transparent'] },
            xaxis: {
                categories: ['Frequência de Bluff', 'Frequência de Defesa'],
                labels: { style: { colors: '#94a3b8', fontSize: '11px' } },
                axisBorder: { show: false },
                axisTicks: { show: false }
            },
            yaxis: { show: false },
            fill: { opacity: 1 },
            tooltip: {
                theme: 'dark',
                style: { fontSize: '12px', fontFamily: 'Inter' },
                y: { formatter: function (val) { return val + "%" } }
            },
            legend: {
                position: 'bottom',
                labels: { colors: '#cbd5e1' }
            },
            grid: { show: false }
        };

        const el = document.querySelector("#main-chart");
        if(el) {
            this.charts.main = new ApexCharts(el, options);
            this.charts.main.render();
        }
    }

    renderComparisonInterface() {
        const optionsHtml = ALL_SCENARIOS.map(s => `<option value="${s.id}">${s.label}</option>`).join('');
        
        this.ui.compareArea.innerHTML = `
            <div class="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label class="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cenário A</label>
                    <select id="sel-sc1" class="scenario-selector w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none">
                        ${optionsHtml}
                    </select>
                </div>
                <div>
                    <label class="text-[10px] uppercase font-bold text-slate-500 block mb-1">Cenário B</label>
                    <select id="sel-sc2" class="scenario-selector w-full bg-slate-900 border border-slate-700 text-white text-sm rounded-lg p-2 focus:ring-2 focus:ring-pink-500 outline-none">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
            <div id="comparison-chart" class="min-h-[300px]"></div>
            <div id="comparison-verdict" class="mt-4 text-center text-xs text-slate-400"></div>
        `;

        // Define valores iniciais (1º e 2º cenário se possível)
        const sel2 = document.getElementById('sel-sc2');
        if(ALL_SCENARIOS.length > 1) sel2.value = ALL_SCENARIOS[1].id;

        this.updateComparisonChart();
    }

    updateComparisonChart() {
        if (this.charts.compare) this.charts.compare.destroy();

        const id1 = document.getElementById('sel-sc1').value;
        const id2 = document.getElementById('sel-sc2').value;

        const s1 = ALL_SCENARIOS.find(s => s.id === id1);
        const s2 = ALL_SCENARIOS.find(s => s.id === id2);

        if (!s1 || !s2) return;

        const comparison = this._compareScenarios(s1, s2);

        const options = {
            series: comparison.series,
            chart: {
                height: 350,
                type: 'radar',
                background: 'transparent',
                toolbar: { show: false },
                fontFamily: 'Inter, sans-serif'
            },
            colors: ['#6366f1', '#ec4899'],
            stroke: { width: 2, colors: ['#6366f1', '#ec4899'] },
            fill: { opacity: 0.2 },
            markers: { size: 4 },
            xaxis: {
                categories: comparison.categories,
                labels: {
                    style: {
                        colors: ['#cbd5e1', '#cbd5e1', '#cbd5e1'],
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif'
                    }
                }
            },
            yaxis: { show: false },
            legend: {
                position: 'bottom',
                labels: { colors: '#cbd5e1' }
            },
            tooltip: {
                theme: 'dark',
                y: { formatter: function(val) { return val + "%" } }
            }
        };

        this.charts.compare = new ApexCharts(document.querySelector("#comparison-chart"), options);
        this.charts.compare.render();

        // Verdict simples
        document.getElementById('comparison-verdict').innerHTML = `
            <span class="text-indigo-400 font-bold">${s1.label}:</span> ${comparison.analysis.s1.verdict} <br>
            <span class="text-pink-400 font-bold">${s2.label}:</span> ${comparison.analysis.s2.verdict}
        `;
    }

    _compareScenarios(s1, s2) {
        const sol1 = this.solver.solve(s1.data.ip.rp, s1.data.oop.rp, this.agressionFactor);
        const sol2 = this.solver.solve(s2.data.ip.rp, s2.data.oop.rp, this.agressionFactor);

        return {
            series: [
                { name: s1.label, data: [s1.data.ip.rp, s1.data.oop.rp, parseFloat(sol1.bluff.value), parseFloat(sol1.defense.value), parseFloat(sol1.evDiff.value)] },
                { name: s2.label, data: [s2.data.ip.rp, s2.data.oop.rp, parseFloat(sol2.bluff.value), parseFloat(sol2.defense.value), parseFloat(sol2.evDiff.value)] }
            ],
            categories: ['RP Agressor', 'RP Defensor', 'Bluff %', 'Defesa %', 'EV Shift %'],
            analysis: {
                s1: { verdict: sol1.verdict },
                s2: { verdict: sol2.verdict }
            }
        };
    }

    exportPDF() {
        this._generatePDF();
    }

    _generatePDF() {
        const element = document.createElement('div');
        const data = this.currentScenarioData;
        const sol = this.currentSolution;

        // Template Minimalista para PDF
        element.innerHTML = `
            <div style="padding: 40px; font-family: 'Helvetica', sans-serif; color: #1e293b; background: #fff;">
                <div style="border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <h1 style="margin: 0; font-size: 24px; color: #0f172a;">Relatório de Análise ICM</h1>
                        <p style="margin: 5px 0 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px;">Geometria do Risco | Masterclass</p>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 10px; color: #94a3b8;">DATA</div>
                        <div style="font-weight: bold;">${new Date().toLocaleDateString()}</div>
                    </div>
                </div>

                <div style="margin-bottom: 30px; background: #f8fafc; padding: 20px; border-radius: 8px;">
                    <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #6366f1; margin-top: 0;">Cenário: ${data.label}</h2>
                    <p style="font-size: 14px; margin: 5px 0 0; color: #334155;"><strong>Contexto:</strong> ${data.context}</p>
                    <div style="display: flex; gap: 40px; margin-top: 20px;">
                        <div>
                            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Agressor (IP)</div>
                            <div style="font-size: 18px; font-weight: bold;">${data.data.ip.rp}% RP</div>
                            <div style="font-size: 12px; color: #64748b;">${data.data.ip.stack} (${data.data.ip.morph})</div>
                        </div>
                        <div>
                            <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Defensor (OOP)</div>
                            <div style="font-size: 18px; font-weight: bold;">${data.data.oop.rp}% RP</div>
                            <div style="font-size: 12px; color: #64748b;">${data.data.oop.stack} (${data.data.oop.morph})</div>
                        </div>
                    </div>
                </div>

                <div style="margin-bottom: 30px;">
                    <h3 style="font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">Resultados da Simulação</h3>
                    <table style="width: 100%; margin-top: 15px; border-collapse: collapse;">
                        <tr style="text-align: left; color: #64748b; font-size: 10px; text-transform: uppercase;">
                            <th style="padding-bottom: 10px;">Métrica</th>
                            <th style="padding-bottom: 10px;">GTO Base</th>
                            <th style="padding-bottom: 10px;">Ajustado (ICM)</th>
                            <th style="padding-bottom: 10px;">Delta</th>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px 0; font-weight: bold; font-size: 14px;">Frequência de Bluff</td>
                            <td style="padding: 10px 0; color: #64748b;">33.3%</td>
                            <td style="padding: 10px 0; color: #6366f1; font-weight: bold;">${sol.bluff.value}%</td>
                            <td style="padding: 10px 0; font-family: monospace;">${sol.bluff.delta > 0 ? '+' : ''}${sol.bluff.delta}%</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px 0; font-weight: bold; font-size: 14px;">Frequência de Defesa</td>
                            <td style="padding: 10px 0; color: #64748b;">50.0%</td>
                            <td style="padding: 10px 0; color: #ec4899; font-weight: bold;">${sol.defense.value}%</td>
                            <td style="padding: 10px 0; font-family: monospace;">${sol.defense.delta > 0 ? '+' : ''}${sol.defense.delta}%</td>
                        </tr>
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 10px 0; font-weight: bold; font-size: 14px;">EV Diff (Shift)</td>
                            <td style="padding: 10px 0; color: #64748b;">0.0%</td>
                            <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${sol.evDiff.value}%</td>
                            <td style="padding: 10px 0; font-size: 10px; color: #94a3b8;">(Risco Adicional)</td>
                        </tr>
                    </table>
                </div>

                <div style="background: #f1f5f9; padding: 15px; border-left: 4px solid #334155; border-radius: 4px; font-size: 12px; color: #334155; margin-top: 40px;">
                    <strong>Veredito do Solver:</strong> ${sol.verdict}
                    <br><span style="color: #64748b;">Fator de Agressividade Simulado: ${this.agressionFactor.toFixed(1)}x</span>
                </div>
                
                <div style="margin-top: 50px; text-align: center; font-size: 10px; color: #cbd5e1;">
                    Gerado via Geometria do Risco Engine | Raphael Vitoi
                </div>
            </div>
        `;

        html2pdf().set({
            margin: 10,
            filename: `Analise_ICM_${data.id}_${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        }).from(element).save();
    }
}

if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => new GameEngine());
} else {
    new GameEngine();
}