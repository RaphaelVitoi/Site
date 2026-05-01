<#
.SYNOPSIS
    Protocolo Seguro de Expansão Cognitiva para a Memória do CHICO.
.DESCRIPTION
    Injeta os princípios da "Perspectiva Matemática" via append, sem sobrescrever o passado.
#>

$MemoryPath = Join-Path $PSScriptRoot '..\..\.claude\agent-memory\chico\MEMORY.md'

$Injection = @"

## [$(Get-Date -Format 'yyyy-MM-dd')] Padrões Observados: Paradigma VITOI (Perspectiva Matemática)
- **Descoberta:** O conceito estático de `$EV_{fold} = 0` é falho; na prática, atua como piso negativo limitante em ChipEV, e possui polaridade dinâmica em ICM (*Pot Entrapment* vs *Payjump Passivo*).
- **Heurística de Elite:** As *Pot Odds* geram pseudo-densidade decisional e mascaram as *Reverse Implied Odds* (RIO). A tomada de decisão verdadeira ignora a "barateza" ilusória quando o passivo estrutural (RIO) ameaça degradar o FGS.
- **A Síntese da Ação:** A `Perspectiva Matemática` engloba e subjuga o `$ICM_{ev}$`, unindo a Esperança, Expectativa, Antevisão (*Table Draw* / *Blinds*), e a incalculável Taxa de Maluquice Humana (Tilt).
- **Diretriz de Roteamento Global:** A partir de hoje, para resoluções avançadas sobre tomada de decisão sob pressão em GTO/ICM, devo rotear o contexto em primeira instância para a ontologia oficial `docs/theories/TEORIA_PERSPECTIVA_MATEMATICA_VITOI.md`.
"@

if (Test-Path $MemoryPath) {
    Add-Content -Path $MemoryPath -Value $Injection -Encoding UTF8
    Write-Host '[SOTA] Memória do @chico expandida atómicamente com a Teoria da Perspectiva Matemática.' -ForegroundColor Green

    # Força a Ingestão no RAG de forma assíncrona (se o worker estiver de pé)
    $PythonCmd = if (Test-Path '..\..\.venv\Scripts\python.exe') { '..\..\.venv\Scripts\python.exe' } else { 'python' }
    Start-Process -FilePath $PythonCmd -ArgumentList '..\..\memory_rag.py ingest' -WindowStyle Hidden
}
else {
    Write-Warning "O arquivo de memória não foi encontrado em $MemoryPath. Verifique a topologia do repositório."
}
