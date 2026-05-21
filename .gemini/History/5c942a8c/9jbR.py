import os
import sys
import time
import shutil
import re
from pathlib import Path

try:
    from google import genai
    from google.genai import types
    from pydantic import BaseModel
    from rich.console import Console
    from rich.panel import Panel
except ImportError:
    print("[ERRO] Dependencias ausentes. Execute: pip install google-genai rich pydantic")
    sys.exit(1)

console = Console()

# 1. Matriz de Seguranca SOTA (Schema Enforcement)
class FileDef(BaseModel):
    path: str
    content: str

class StructureDef(BaseModel):
    directory: str
    files: list[FileDef]
    main_file_update: str

class RefactorOutput(BaseModel):
    project_structure: StructureDef

# 2. Coleta Dinamica da Chave (Bypass de Hardcode)
def load_api_key():
    base_dir = Path(__file__).resolve().parent.parent.parent
    for file_name in ["_env.ps1", ".env"]:
        env_path = base_dir / file_name
        if env_path.exists():
            with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
                for line in f:
                    match = re.search(r'(?:\$env:|\$)?(GEMINI[A-Z0-9_]*|GOOGLE[A-Z0-9_]*)\s*[:=]\s*[\'"]?([^\'"\s#]+)[\'"]?', line, re.IGNORECASE)
                    if match and "CLI" not in match.group(1).upper():
                        return match.group(2)
    return os.environ.get("GEMINI_API_KEY", "")

def execute_vitoi_refactor(file_path):
    path = Path(file_path)
    if not path.exists() or path.is_dir():
        console.print(f"[bold red][ERRO] Alvo invalido ou nao encontrado: {file_path}[/]")
        return

    console.print(Panel(f"Iniciando Refatoracao Agentica SOTA\nAlvo: [yellow]{path.name}[/]", border_style="cyan"))
    
    with open(path, 'r', encoding='utf-8') as f:
        original_content = f.read()

    # 3. Protocolo de Falha: Backup Imediato
    backup_path = f"{path}.bak_{int(time.time())}"
    shutil.copy(path, backup_path)
    console.print(f"[cyan][+] Backup forjado:[/] {Path(backup_path).name}")

    api_key = load_api_key()
    client = genai.Client(api_key=api_key)
    model_name = 'gemini-2.5-pro' # Raciocinio profundo exigido para arquitetura

    prompt = f"""
    SISTEMA: VITOI 3.2 - AGENTE DE REFATORACAO (SOTA).
    TAREFA: Analise o codigo abaixo e aplique a Poda de Entropia. Divida-o em modulos logicos independentes (SRP).
    RESTRIÇÕES:
    1. Identifique nomes de arquivos baseados em Clean Code.
    2. Garanta que os imports necessarios sejam mantidos ou criados relativos a nova pasta.
    3. O codigo original deve ser reduzido a um arquivo principal de orquestracao/export.
    
    CÓDIGO ORIGINAL:
    {original_content}
    """

    console.print(f"[magenta][*] Evocando o Oraculo ({model_name}) para calculo de interface...[/]")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RefactorOutput,
                temperature=0.1
            )
        )
        
        data = json.loads(response.text)
        structure = data.get('project_structure', {})
        
        # Execucao do Side Effect (God Mode Local)
        target_dir = path.parent / structure['directory']
        target_dir.mkdir(exist_ok=True)
        console.print(f"[green][+] Diretorio forjado:[/] {target_dir}")
        
        for file_info in structure['files']:
            new_file_path = target_dir / file_info['path']
            with open(new_file_path, 'w', encoding='utf-8') as nf:
                nf.write(file_info['content'])
            console.print(f"[green]  -> Modulo materializado:[/] {file_info['path']}")

        with open(path, 'w', encoding='utf-8') as f:
            f.write(structure['main_file_update'])
        
        console.print(f"\n[bold green]=== SINTESE CONCLUIDA: Entropia Reduzida ==-[/]")
        console.print(f"O arquivo {path.name} foi atualizado e atua agora como Orquestrador.")
        
    except Exception as e:
        console.print(f"[bold red][ERRO CRITICO] Ocorreu uma arritmia na forja: {e}[/]")
        console.print(f"[yellow][!] Revertendo as alteracoes via backup...[/]")
        shutil.copy(backup_path, path)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        execute_vitoi_refactor(sys.argv[1])
    else:
        console.print("[red]Uso: python vitoi_refactor_engine.py <caminho_do_arquivo>[/]")