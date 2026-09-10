<#
.SYNOPSIS
  Encontra e remove residuos deixados por auditorias Lighthouse interrompidas.

.DESCRIPTION
  Medido em 2026-09-10: o artefato Lighthouse vence sempre que o input do
  frontend muda -- comportamento CORRETO do portao, que recusa medir TBT com
  auditoria expirada (LIGHTHOUSE_FINGERPRINT_MISMATCH). O que quebrava o ciclo
  nao era a expiracao, e sim a impossibilidade de regenerar:

    1. a auditoria sobe um Chrome headless numa porta CDP dedicada (9230);
    2. se ela morre antes do fim, o headless fica orfao segurando a porta;
    3. `invoke_lighthouse_production_audit.ps1` se recusa -- corretamente -- a
       encerrar processo que nao iniciou, e aborta com "porta em uso";
    4. o artefato nunca regenera, e os dois avisos de cobertura voltam sempre.

  Havia tres perfis de auditoria orfaos no temp quando isto foi medido, e o
  proprio orquestrador avisa que as vezes nao consegue remover o perfil ("lock
  do Chrome em encerramento") -- ou seja, o residuo e esperado, so faltava
  quem o recolhesse.

  Este script NAO encerra Chrome arbitrario. Ele so considera alvo o processo
  que satisfaz as tres condicoes ao mesmo tempo: escuta a porta de auditoria,
  usa um perfil `sota-lighthouse-audit-*`, e tem processo-pai morto. Qualquer
  uma faltando, o processo e preservado e reportado.

.PARAMETER CdpPort
  Porta CDP da auditoria. Padrao 9230, igual ao orquestrador.

.PARAMETER IdadeMinimaHoras
  So considera perfil de disco com mais de N horas. Padrao 2, para nunca tocar
  numa auditoria em andamento.

.PARAMETER Executar
  Sem este switch o script apenas RELATA. Nada e removido por padrao.

.EXAMPLE
  .\Clear-LighthouseOrfaos.ps1

.EXAMPLE
  .\Clear-LighthouseOrfaos.ps1 -Executar

.OUTPUTS
  Exit 0 = nada pendente, ou limpeza concluida. Exit 1 = residuo encontrado
  que este script nao pode remover (tipicamente exige elevacao).
#>
[CmdletBinding()]
param(
    [ValidateRange(1, 65535)][int]$CdpPort = 9230,
    [ValidateRange(0, 720)][int]$IdadeMinimaHoras = 2,
    [switch]$Executar
)

$ErrorActionPreference = 'Stop'
$MarcaPerfil = 'sota-lighthouse-audit-'
$pendencias = 0

function Test-PaiMorto {
    param([int]$Id)
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$Id" -ErrorAction SilentlyContinue
    if (-not $p) { return $false }
    return -not (Get-Process -Id $p.ParentProcessId -ErrorAction SilentlyContinue)
}

function Get-ArvoreDe {
    param([int]$Raiz)
    $todos = @($Raiz); $fila = @($Raiz)
    while ($fila.Count) {
        $novos = @()
        foreach ($id in $fila) {
            $novos += @(Get-CimInstance Win32_Process -Filter "ParentProcessId=$id" -ErrorAction SilentlyContinue |
                Select-Object -ExpandProperty ProcessId)
        }
        $novos = @($novos | Where-Object { $_ -notin $todos })
        $todos += $novos; $fila = $novos
    }
    return $todos
}

Write-Host "== Residuos de auditoria Lighthouse ==" -ForegroundColor Cyan
Write-Host ("Modo: {0}" -f $(if ($Executar) { 'EXECUTAR' } else { 'RELATORIO (use -Executar para remover)' })) -ForegroundColor DarkGray

# ---------- 1. processo segurando a porta de auditoria ----------
$donos = @(Get-NetTCPConnection -State Listen -LocalPort $CdpPort -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique)

if (-not $donos.Count) {
    Write-Host "[porta $CdpPort] livre." -ForegroundColor Green
}
foreach ($dono in $donos) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$dono" -ErrorAction SilentlyContinue
    if (-not $proc) { continue }

    $arvore = Get-ArvoreDe -Raiz $dono
    $usaPerfil = @(Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
        Where-Object { $_.ProcessId -in $arvore -and $_.CommandLine -and $_.CommandLine -match $MarcaPerfil }).Count -gt 0
    $paiMorto = Test-PaiMorto -Id $dono
    $ehChrome = $proc.Name -eq 'chrome.exe'

    Write-Host ("[porta $CdpPort] PID {0} ({1}) desde {2}" -f $dono, $proc.Name, $proc.CreationDate)
    Write-Host ("    chrome={0}  perfil-de-auditoria={1}  pai-morto={2}" -f $ehChrome, $usaPerfil, $paiMorto)

    if (-not ($ehChrome -and $usaPerfil -and $paiMorto)) {
        Write-Host "    PRESERVADO -- nao satisfaz as tres condicoes. Nada foi encerrado." -ForegroundColor Yellow
        $pendencias++
        continue
    }

    if (-not $Executar) { Write-Host "    seria encerrado (arvore de $($arvore.Count) processo(s))." -ForegroundColor DarkYellow; $pendencias++; continue }

    $falhou = @()
    foreach ($id in $arvore) {
        try { Stop-Process -Id $id -Force -ErrorAction Stop }
        catch { if (Get-Process -Id $id -ErrorAction SilentlyContinue) { $falhou += $id } }
    }
    Start-Sleep -Seconds 2
    if ($falhou.Count) {
        Write-Host ("    FALHA ao encerrar {0} -- tipicamente 'Acesso negado': o processo roda em nivel de integridade acima desta sessao. Encerre por um shell elevado." -f ($falhou -join ', ')) -ForegroundColor Red
        $pendencias++
    } else {
        Write-Host "    encerrado." -ForegroundColor Green
    }
}

# ---------- 2. perfis de disco abandonados ----------
$limite = (Get-Date).AddHours(-$IdadeMinimaHoras)
$perfis = @(Get-ChildItem -Path ([IO.Path]::GetTempPath()) -Directory -Filter "$MarcaPerfil*" -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $limite })

if (-not $perfis.Count) {
    Write-Host "[perfis] nenhum com mais de $IdadeMinimaHoras h." -ForegroundColor Green
} else {
    Write-Host ("[perfis] {0} candidato(s) com mais de {1} h:" -f $perfis.Count, $IdadeMinimaHoras)
    foreach ($perfil in $perfis) {
        if (-not $Executar) { Write-Host ("    seria removido: {0} ({1})" -f $perfil.Name, $perfil.LastWriteTime) -ForegroundColor DarkYellow; $pendencias++; continue }
        try {
            Remove-Item -LiteralPath $perfil.FullName -Recurse -Force -ErrorAction Stop
            Write-Host ("    removido: {0}" -f $perfil.Name) -ForegroundColor Green
        } catch {
            Write-Host ("    em uso, mantido: {0}" -f $perfil.Name) -ForegroundColor Yellow
            $pendencias++
        }
    }
}

Write-Host ""
if ($pendencias -eq 0) { Write-Host "Sem residuo pendente." -ForegroundColor Green; exit 0 }
Write-Host "$pendencias pendencia(s)." -ForegroundColor Yellow
exit 1
