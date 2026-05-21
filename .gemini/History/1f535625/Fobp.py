import json
from pathlib import Path
from datetime import datetime

def read_json_sota(file_path: Path):
    with open(file_path, "r", encoding="utf-8-sig") as f:
        # Arranca todos os BOMs e espacos em branco mutiplos implacavelmente
        content = f.read().lstrip('\ufeff \t\n\r')
        return json.loads(content)

def build_matrix():
    base = Path(__file__).parent.parent.parent.resolve()
    
    intents = read_json_sota(base / "data/intentmap.json")
    routes = read_json_sota(base / "data/routing_map.json")
    sys_cfg = read_json_sota(base / "data/system_config.json")

    handoffs = sys_cfg.get("handoff_pipeline", {})
    agent_models = routes.get("agent_map", {})
    
    md = f"# MATRIZ HOLOGRAFICA DE ROTEAMENTO (SOTA)\n"
    md += f"> **Gerado Automaticamente** | Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"
    
    md += "## 1. A Malha de Entrada (Usuario -> Agente)\n"
    md += "| Agente | Prioridade | Padrao de Gatilho (Regex) |\n|---|---|---|\n"
    for ag, data in sorted(intents.items(), key=lambda x: x[1].get('priority', 99)):
        md += f"| **{ag}** | {data.get('priority')} | `{data.get('pattern')}` |\n"
        
    md += "\n## 2. A Malha de Handoff Automatica (Parte -> Parte)\n"
    md += "| Agente Origem | Passa o bastao para | Condicao |\n|---|---|---|\n"
    for orig, dest in handoffs.items():
        md += f"| **{orig}** | **{dest}** | Automatico ao concluir tarefa sem falhas |\n"
        
    md += "\n## 3. Topologia de Cognicao (Agente -> LLM Tier)\n"
    md += "| Agente | Nivel de Raciocinio | Modelos Alocados (Cascata) |\n|---|---|---|\n"
    for ag, tier in agent_models.items():
        models = ", ".join(routes.get(tier, []))
        md += f"| **{ag}** | `{tier}` | {models} |\n"
        
    out_path = base / "docs/reports/HOLOGRAPHIC_ROUTING_MATRIX.md"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(md)
        
    print(f"[SOTA] Matriz Holografica de Roteamento forjada em: {out_path}")

if __name__ == "__main__":
    build_matrix()