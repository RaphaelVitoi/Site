import { SCENARIOS } from './data/scenarios.js';
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

        // Atualiza Textos
        this.ui.title.innerText = data.label;
        this.ui.context.innerText = data.context;
        this.ui.content.innerHTML = data.content;
    }

    updateGauge(el, d) { el.setAttribute('value', d.rp); el.setAttribute('pos', d.pos); el.setAttribute('stack', d.stack); }
}

window.addEventListener('DOMContentLoaded', () => new GameEngine());