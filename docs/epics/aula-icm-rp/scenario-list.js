function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

const SAFE_ICON_CLASS = /^fa-[a-z0-9-]+$/;

export class ScenarioList extends HTMLElement {
    constructor() {
        super();
        this.scenarios = [];
        this.activeId = null;
    }

    set data(value) {
        this.scenarios = Array.isArray(value) ? value : [];
        if (!this.activeId && this.scenarios.length > 0) {
            this.activeId = this.scenarios[0].id;
        }
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = '';

        if (!this.scenarios || !Array.isArray(this.scenarios)) return;

        this.scenarios.forEach((sc, idx) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.dataset.scenarioId = sc.id;
            const isActive = this.activeId ? sc.id === this.activeId : idx === 0;
            btn.setAttribute('aria-pressed', String(isActive));

            const baseClasses = 'w-full text-left p-4 mb-2 rounded-xl border hover:bg-slate-800 transition-colors group flex items-center justify-between focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500';
            const stateClasses = isActive
                ? 'border-indigo-500 bg-indigo-500/10'
                : 'bg-slate-900/40 border-slate-800';
            btn.className = `${baseClasses} ${stateClasses}`;

            const iconClass = SAFE_ICON_CLASS.test(sc.icon || '') ? sc.icon : 'fa-layer-group';

            btn.innerHTML = `
                <div>
                    <div class="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-400 transition-colors mb-1">
                        ${escapeHTML(sc.context)}
                    </div>
                    <div class="font-bold text-slate-200 text-sm group-hover:text-white">
                        ${escapeHTML(sc.label)}
                    </div>
                </div>
                <i class="fa-solid ${iconClass} text-slate-500 text-xs opacity-70" aria-hidden="true"></i>
            `;

            btn.addEventListener('click', () => {
                this.activeId = sc.id;
                this.dispatchEvent(new CustomEvent('select', { detail: sc.id, bubbles: true }));
                this.updateActive(btn);
            });
            this.appendChild(btn);
        });
    }

    updateActive(targetBtn) {
        Array.from(this.children).forEach((c) => {
            c.classList.remove('border-indigo-500', 'bg-indigo-500/10');
            c.classList.add('bg-slate-900/40', 'border-slate-800');
            c.setAttribute('aria-pressed', 'false');
        });
        targetBtn.classList.add('border-indigo-500', 'bg-indigo-500/10');
        targetBtn.classList.remove('bg-slate-900/40', 'border-slate-800');
        targetBtn.setAttribute('aria-pressed', 'true');
    }
}
customElements.define('scenario-list', ScenarioList);
