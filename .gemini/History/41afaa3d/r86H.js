export class RiskGauge extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() { return ['value', 'label', 'pos', 'stack', 'color', 'threshold']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const value = parseFloat(this.getAttribute('value')); 
        const label = this.getAttribute('label') || '--';
        const pos = this.getAttribute('pos') || '--';
        const stack = this.getAttribute('stack') || '--';
        const baseColor = this.getAttribute('color') === 'pink' ? '#ec4899' : '#6366f1';
        const threshold = parseFloat(this.getAttribute('threshold'));

        // Lógica de Cor Crítica (Threshold)
        const safeValue = isNaN(value) ? 0 : value;
        const isCritical = !isNaN(threshold) && safeValue >= threshold;
        const isDeathZone = safeValue >= 40.0; // A Singularidade
        
        // Definição de Cores e Estados
        let color = baseColor;
        if (isCritical) color = '#ef4444'; // Red-500
        if (isDeathZone) color = '#ff0055'; // Neon Pink/Red (Radioativo)
        
        // Cálculo do dash array para animação SVG
        const dash = (safeValue / 26) * 100; // Escala visual arbitrária para drama (Max RP ~26%)
        const clampDash = Math.min(100, Math.max(0, dash));

        // @maverick: Easter Egg Filosófico (Singularidade)
        // Só dispara se estiver na Death Zone e evita spam no console se já tiver disparado recentemente
        if (isDeathZone) {
            const msg = [
                "%c⚠️ SINGULARIDADE ICM DETECTADA (RP > 40%) ⚠️",
                "color: #ff0055; font-weight: bold; font-size: 12px; background: #200010; padding: 4px; border: 1px solid #ff0055;",
                "\nNeste nível de pressão, a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.",
                "Foldar não é covardia; é darwinismo aplicado.\n",
                "Survival > Accumulation."
            ];
            // Pequeno delay para garantir que o console esteja pronto e não bloqueie a renderização
            setTimeout(() => console.log(msg[0], msg[1], msg[2], msg[3], msg[4]), 500);
        }

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif; }
                .gauge-wrap { position: relative; width: 140px; height: 140px; margin-bottom: 1rem; }
                svg { width: 100%; height: 100%; transform: rotate(-90deg); }
                .circle-bg { fill: none; stroke: rgba(30, 41, 59, 0.5); stroke-width: 2; }
                .circle-val { 
                    fill: none; stroke: ${color}; stroke-width: 2.5; stroke-linecap: round;
                    transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1);
                    filter: drop-shadow(0 0 8px ${color}80);
                }
                .center-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .val { font-family: 'JetBrains Mono', monospace; font-size: 2rem; font-weight: 700; color: white; letter-spacing: -0.05em; }
                .lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${color}; margin-top: 4px; }
                .meta { text-align: center; }
                .pos { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: white; }
                .stack { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #94a3b8; }
            </style>

            <div class="gauge-wrap">
                <svg viewBox="0 0 36 36">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="circle-val" stroke-dasharray="${clampDash}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="center-text">
                    <span class="val" style="${isCritical ? 'color: #ef4444;' : ''}">${safeValue.toFixed(1)}%</span>
                    <span class="lbl">RP</span>
                </div>
            </div>
            <div class="meta">
                <div class="lbl">${label}</div>
                <div class="pos">${pos}</div>
                <div class="stack">${stack}</div>
            </div>
        `;
    }
}
customElements.define('risk-gauge', RiskGauge);