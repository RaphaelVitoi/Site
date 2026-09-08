# Sentinela de delecao -- .claude/RELATORIOS e logs/
#
# MOTIVO MEDIDO, 2026-09-08. `.claude/RELATORIOS/INVENTARIO_FERRAMENTAS.md`
# sumiu do disco tres vezes (03/09, 07/09, 08/09) sem commit algum. O journal
# USN do NTFS datou a terceira em 16:05:19 e mostrou `logs/task_executor.log`
# apagado no registro IMEDIATAMENTE anterior: dois arquivos, dois diretorios,
# um unico ator. Nenhuma linha deste repositorio apaga o segundo -- medido por
# grep em todo o codigo --, logo o ator esta FORA do projeto.
#
# O USN nao grava processo. Este sentinela grava.
#
# POR QUE SONDAGEM, E NAO FileSystemWatcher. A primeira versao usava
# Register-ObjectEvent e NAO capturou a isca de teste: falhou em SILENCIO, que
# e a pior classe de falha para um instrumento de medicao -- ele pareceria
# ligado e nao registraria nada. Sondar e mais burro e verificavel: se a isca
# some e nao aparece no JSONL, o defeito aparece na hora. Para um arquivo que
# some uma vez a cada dois dias, a resolucao sobra.
#
# POR QUE DELTA DE CPU, E NAO RETRATO. A segunda versao anexava todos os
# processos candidatos e devolveu 240 deles -- nao apontava ninguem. O que
# discrimina e quem trabalhou NA JANELA da delecao.
#
# LIMITE QUE O INSTRUMENTO NAO VENCE. Delta de CPU e INDICIO, nao prova: um IDE
# ocupado lidera a lista mesmo em delecao que nao foi dele (medido com isca de
# controle). O que fecha atribuicao e padrao repetido entre ocorrencias, nao uma
# leitura isolada. Prova de processo exigiria Sysmon ou Process Monitor.
#
# NAO ALTERA NADA. So le diretorio e anexa a um JSONL. Ctrl+C encerra.

param(
    [string]$Repo = (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)),
    [string]$Saida = (Join-Path $env:TEMP 'sentinela_delecoes.jsonl'),
    [int]$IntervaloMs = 300,
    [int]$MaximoDeCiclos = 0
)

$ErrorActionPreference = 'Continue'

$pastas = @(
    (Join-Path $Repo '.claude\RELATORIOS'),
    (Join-Path $Repo 'logs')
) | Where-Object { Test-Path $_ }

if (-not $pastas) { throw "Nenhuma pasta alvo existe sob $Repo." }

# Lista ampla de proposito: estreitar antes de medir e o erro que esta
# investigacao ja cometeu uma vez, ao descartar a concorrencia sem medi-la.
$candidatos = @(
    'Antigravity*', 'Code*', 'node', 'python*', 'powershell', 'pwsh',
    'git', 'cloudcode*', 'gemini*', 'Codex*', 'chrome', 'msedge*', 'Defender*'
)

function CpuPorProcesso {
    $mapa = @{}
    foreach ($p in (Get-Process -ErrorAction SilentlyContinue)) {
        $n = $p.Name
        if (@($candidatos | Where-Object { $n -like $_ }).Count -eq 0) { continue }
        $c = $(try { $p.CPU } catch { $null })
        if ($null -ne $c) { $mapa["$($p.Id)|$n"] = $c }
    }
    return $mapa
}

function Suspeitos($antes, $depois) {
    $lista = foreach ($k in $depois.Keys) {
        $base = 0
        if ($antes.ContainsKey($k)) { $base = $antes[$k] }
        $d = $depois[$k] - $base
        if ($d -gt 0.001) {
            $partes = $k -split '\|', 2
            [pscustomobject]@{
                nome        = $partes[1]
                proc        = [int]$partes[0]
                cpu_delta_s = [math]::Round($d, 3)
            }
        }
    }
    return @($lista | Sort-Object cpu_delta_s -Descending | Select-Object -First 12)
}

function Instantaneo {
    $mapa = @{}
    foreach ($p in $pastas) {
        foreach ($f in (Get-ChildItem $p -File -Force -ErrorAction SilentlyContinue)) {
            $mapa[$f.FullName] = $f.Length
        }
    }
    return $mapa
}

$anterior = Instantaneo
$cpuAntes = CpuPorProcesso

Write-Host ("[SENTINELA] {0} arquivo(s) sob vigilancia em {1} pasta(s)." -f $anterior.Count, @($pastas).Count) -ForegroundColor Green
foreach ($p in $pastas) { Write-Host ("[SENTINELA]   {0}" -f $p) -ForegroundColor DarkGray }
Write-Host ("[SENTINELA] registrando em {0}. Ctrl+C encerra." -f $Saida) -ForegroundColor Cyan

$ciclos = 0
while ($true) {
    Start-Sleep -Milliseconds $IntervaloMs
    $atual = Instantaneo
    $cpuDepois = CpuPorProcesso

    $sumidos = @($anterior.Keys | Where-Object { -not $atual.ContainsKey($_) })
    if ($sumidos.Count -gt 0) {
        $suspeitos = Suspeitos $cpuAntes $cpuDepois
        foreach ($caminho in $sumidos) {
            $registro = [pscustomobject]@{
                quando      = (Get-Date).ToString('o')
                evento      = 'sumiu'
                caminho     = $caminho
                bytes_antes = $anterior[$caminho]
                janela_ms   = $IntervaloMs
                suspeitos   = $suspeitos
            }
            $registro | ConvertTo-Json -Depth 4 -Compress | Add-Content -Path $Saida -Encoding utf8
            Write-Host ("[SENTINELA] SUMIU {0} ({1} bytes)" -f $caminho, $anterior[$caminho]) -ForegroundColor Yellow
            foreach ($s in @($suspeitos | Select-Object -First 5)) {
                Write-Host ("[SENTINELA]   suspeito {0} (pid {1}) +{2}s CPU" -f $s.nome, $s.proc, $s.cpu_delta_s) -ForegroundColor DarkYellow
            }
        }
    }

    $anterior = $atual
    $cpuAntes = $cpuDepois

    # MaximoDeCiclos existe para a suite: sem ele o teste dependeria de matar
    # processo, e teste que mata processo e teste que deixa orfao quando falha.
    $ciclos = $ciclos + 1
    if ($MaximoDeCiclos -gt 0 -and $ciclos -ge $MaximoDeCiclos) { break }
}
