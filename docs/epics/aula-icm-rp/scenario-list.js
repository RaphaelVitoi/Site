export class ScenarioList extends HTMLElement {
    constructor() {
        super();
        this.scenarios = [];
    }

    set data(value) {
        this.scenarios = value;
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.innerHTML = ''; // Limpa conteúdo (Light DOM para herdar CSS global se desejar)
        
        // @verifier: Safety check - garante que scenarios é iterável
        if (!this.scenarios || !Array.isArray(this.scenarios)) return;

        this.scenarios.forEach(sc => {
            const btn = document.createElement('button');
            // Usando classes do Tailwind/Global CSS
            btn.className = 'w-full text-left p-4 mb-2 rounded-xl bg-slate-900/40 border border-slate-800 hover:bg-slate-800 transition-colors group flex items-center justify-between';
            
            btn.innerHTML = `
                <div>
                    <div class="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-indigo-400 transition-colors mb-1">
                        ${sc.context}
                    </div>
                    <div class="font-bold text-slate-200 text-sm group-hover:text-white">
                        ${sc.label}
                    </div>
                </div>
                <i class="fa-solid ${sc.icon} text-slate-600 text-xs opacity-50"></i>
            `;

            btn.onclick = () => {
                this.dispatchEvent(new CustomEvent('select', { detail: sc.id }));
                this.updateActive(btn);
            };
            this.appendChild(btn);
        });
    }

    updateActive(targetBtn) {
        Array.from(this.children).forEach(c => c.classList.remove('border-indigo-500', 'bg-indigo-500/10'));
        targetBtn.classList.add('border-indigo-500', 'bg-indigo-500/10');
        targetBtn.classList.remove('bg-slate-900/40', 'border-slate-800');
    }
}
customElements.define('scenario-list', ScenarioList);