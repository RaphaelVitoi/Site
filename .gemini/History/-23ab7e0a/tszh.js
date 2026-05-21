export class RiskGauge extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._lastState = 'normal'; // Rastreia estado para evitar spam sonoro
    }

    static get observedAttributes() { return ['value', 'label', 'pos', 'stack', 'color', 'threshold', 'opponent-value', 'muted', 'dynamic-death-zone', 'max-rp']; }

    attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) this.render();
    }

    connectedCallback() {
        this.render();
    }

    disconnectedCallback() {
        this.shadowRoot.innerHTML = ''; // Quebra os nós do Shadow DOM forçando o GC
        this._lastState = null;         // Elimina closure de estado retida em memória
    }

    _handleSoundTrigger(currentState, isDeathZone, safeValue, safeOpponentValue) {
        if (this.isConnected && currentState !== this._lastState) {
            const intensity = isDeathZone ? safeValue : safeOpponentValue;
            if (currentState === 'predator') this._playTone('predator', intensity);
            if (currentState === 'death') this._playTone('death', intensity);
            this._lastState = currentState;
        }
    }

    _logEasterEgg(isDeathZone) {
        if (isDeathZone) {
            const msg = [
                "%c⚠️ SINGULARIDADE ICM DETECTADA (Teto Rompido) ⚠️",
                "color: #ff0055; font-weight: bold; font-size: 12px; background: #200010; padding: 4px; border: 1px solid #ff0055;",
                "\nNeste nível de pressão, a matemática sugere que a coragem é apenas uma forma elaborada de suicídio financeiro.",
                "Foldar não é covardia; é darwinismo aplicado.\n",
                "Survival > Accumulation."
            ];
            setTimeout(() => console.log(msg[0], msg[1], msg[2], msg[3], msg[4]), 500);
        }
    }

    _getDeathStyle(isDeathZone, color) {
        if (!isDeathZone) return '';
        return `
            .circle-val {
                animation: death-pulse 2s infinite;
                filter: drop-shadow(0 0 15px ${color});
            }
            .val { text-shadow: 0 0 10px ${color}; }
            @keyframes death-pulse {
                0% { stroke-opacity: 1; stroke-width: 2.5; }
                50% { stroke-opacity: 0.6; stroke-width: 4.5; }
                100% { stroke-opacity: 1; stroke-width: 2.5; }
            }
        `;
    }

    _getPredatorStyle(isPredatorZone, color) {
        if (!isPredatorZone) return '';
        return `
            .circle-val {
                animation: predator-pulse 3s infinite;
                filter: drop-shadow(0 0 10px ${color});
            }
            .val { text-shadow: 0 0 15px ${color}; }
            @keyframes predator-pulse {
                0% { stroke-opacity: 0.8; }
                50% { stroke-opacity: 1; stroke-width: 3; }
                100% { stroke-opacity: 0.8; }
            }
        `;
    }

    render() { // NOSONAR
        const value = Number.parseFloat(this.getAttribute('value'));
        const label = this.getAttribute('label') || '--';
        const pos = this.getAttribute('pos') || '--';
        const stack = this.getAttribute('stack') || '--';
        const baseColor = this.getAttribute('color') === 'pink' ? '#ec4899' : '#6366f1';
        const threshold = Number.parseFloat(this.getAttribute('threshold'));
        const opponentValue = Number.parseFloat(this.getAttribute('opponent-value'));

        // Lógica de Cor Crítica (Threshold)
        const safeValue = Number.isNaN(value) ? 0 : value;
        const safeOpponentValue = Number.isNaN(opponentValue) ? 0 : opponentValue;

        const isCritical = !Number.isNaN(threshold) && safeValue >= threshold;

        // SOTA: Absorção do Teto Dinâmico pelo Motor (ou Baseline fallback 41%)
        const rawDeathZone = Number.parseFloat(this.getAttribute('dynamic-death-zone'));
        const deathThreshold = Number.isNaN(rawDeathZone) ? 41 : rawDeathZone;
        const isDeathZone = safeValue >= deathThreshold; // A Singularidade Quântica
        const isPredatorZone = safeOpponentValue >= deathThreshold && safeValue < 25; // Oportunidade de Pressão

        // Lógica de Gatilho Sonoro (Easter Egg)
        let currentState = 'normal';
        if (isDeathZone) {
            currentState = 'death';
        } else if (isPredatorZone) {
            currentState = 'predator';
        }

        this._handleSoundTrigger(currentState, isDeathZone, safeValue, safeOpponentValue);

        // Definição de Cores e Estados
        let color = baseColor;
        if (isCritical) color = '#ef4444'; // Red-500
        if (isDeathZone) color = '#ff0055'; // Neon Pink/Red (Radioativo)
        if (isPredatorZone) color = '#10b981'; // Emerald-500 (Green Light/Go)

        // SOTA: Escala Dinâmica (Adequada para extremos de Bolha/ICM onde RP ultrapassa 40%)
        const maxRp = Number.parseFloat(this.getAttribute('max-rp')) || 50;
        const dash = (safeValue / maxRp) * 100;
        const clampDash = Math.min(100, Math.max(0, dash));

        this._logEasterEgg(isDeathZone);

        let centerTextHtml = '';
        if (isDeathZone) {
            centerTextHtml = `<i class="fa-solid fa-biohazard" style="color: ${color}; font-size: 1.5rem; margin-bottom: 4px; animation: death-pulse 2s infinite;"></i>`;
        } else if (isPredatorZone) {
            centerTextHtml = `<i class="fa-solid fa-crosshairs" style="color: ${color}; font-size: 1.5rem; margin-bottom: 4px;"></i>`;
        } else {
            const criticalStyle = isCritical ? 'color: #ef4444;' : '';
            centerTextHtml = `<span class="val" style="${criticalStyle}">${safeValue.toFixed(1)}%</span>`;
        }

        let labelText = 'RP';
        if (isDeathZone) labelText = 'CRITICAL';
        else if (isPredatorZone) labelText = 'ATTACK';

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: flex; flex-direction: column; align-items: center; font-family: 'Inter', sans-serif; }
                .gauge-wrap { position: relative; width: 100%; max-width: 140px; aspect-ratio: 1; margin: 0 auto 1rem auto; }
                svg { width: 100%; height: 100%; transform: rotate(-90deg); }
                .circle-bg { fill: none; stroke: rgba(30, 41, 59, 0.5); stroke-width: 2; }
                .circle-val {
                    fill: none; stroke: ${color}; stroke-width: 2.5; stroke-linecap: round;
                    transition: stroke-dasharray 1s cubic-bezier(0.16, 1, 0.3, 1);
                    filter: drop-shadow(0 0 8px ${color}80);
                }
                .center-text { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .val { font-family: 'JetBrains Mono', monospace; font-size: clamp(1.5rem, 15vw, 2rem); font-weight: 700; color: white; letter-spacing: -0.05em; }
                .lbl { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: ${color}; margin-top: 4px; }
                .meta { text-align: center; }
                .pos { font-family: 'Playfair Display', serif; font-size: 1.25rem; font-weight: 700; color: white; }
                .stack { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; color: #94a3b8; }

                /* Animação da Zona da Morte */
                ${this._getDeathStyle(isDeathZone, color)}

                /* Animação Predator Mode (Green Pulse) */
                ${this._getPredatorStyle(isPredatorZone, color)}
            </style>

            <div class="gauge-wrap">
                <svg viewBox="0 0 36 36">
                    <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    <path class="circle-val" stroke-dasharray="${clampDash}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <div class="center-text">
                    ${centerTextHtml}
                    <span class="lbl">${labelText}</span>
                </div>
            </div>
            <div class="meta">
                <div class="lbl">${label}</div>
                <div class="pos">${pos}</div>
                <div class="stack">${stack}</div>
            </div>
        `;
    }

    // Sintetizador de Áudio Minimalista (Sem arquivos externos)
    _playTone(type, intensity = 40) {
        // Verifica se está mutado antes de tentar tocar
        if (this.hasAttribute('muted')) return;

        try {
            const AudioContext = globalThis.AudioContext || globalThis.webkitAudioContext;
            if (!AudioContext) return;

            // SOTA: Prevenção de AudioContext Limit Exhaustion (Memory Leak de Hardware)
            // Navegadores impõem um limite estrito (geralmente 6) de contextos simultâneos.
            if (!globalThis.__vitoiSharedAudioContext) {
                globalThis.__vitoiSharedAudioContext = new AudioContext();
            }
            const ctx = globalThis.__vitoiSharedAudioContext;
            if (ctx.state === 'suspended') ctx.resume();

            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'predator') {
                // Radar Ping (Alta frequência, tecnológico, limpo)
                // Modulação: Quanto maior o RP do vilão, mais agudo e urgente é o lock (40% -> 1200Hz, 80% -> 2200Hz)
                const freq = 1200 + ((intensity - 40) * 25);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + 0.15);
                gain.gain.setValueAtTime(0.05, ctx.currentTime); // Volume baixo
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.15);

                // SOTA: Garbage Collection nativa para os nós de áudio
                osc.onended = () => {
                    osc.disconnect();
                    gain.disconnect();
                };

            } else if (type === 'death') {
                // Radiation Hazard (Baixa frequência, "sujo", alerta)
                // Modulação: Quanto maior o RP, mais grave e instável ("Geiger" pesado) (40% -> 80Hz, 80% -> 40Hz)
                const freq = Math.max(40, 80 - ((intensity - 40) * 1));

                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.4);
                osc.start(ctx.currentTime);
                osc.stop(ctx.currentTime + 0.4);

                // SOTA: Garbage Collection nativa para os nós de áudio
                osc.onended = () => {
                    osc.disconnect();
                    gain.disconnect();
                };
            }
        } catch (e) {
            console.warn("Autoplay audio blocked or not supported.", e);
            // Silenciosamente falha se o navegador bloquear autoplay
        }
    }
}
customElements.define('risk-gauge', RiskGauge);
