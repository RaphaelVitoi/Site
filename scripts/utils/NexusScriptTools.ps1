function Get-NexusProjectRoot {
    param(
        [string]$StartDir = $PSScriptRoot
    )

    $cursor = [System.IO.Path]::GetFullPath($StartDir)
    while ($true) {
        $taskExecutor = Join-Path $cursor "task_executor.py"
        $packageJson = Join-Path $cursor "package.json"
        $scriptsDir = Join-Path $cursor "scripts"

        if ((Test-Path $taskExecutor) -and (Test-Path $packageJson) -and (Test-Path $scriptsDir)) {
            return $cursor
        }

        $parent = Split-Path $cursor -Parent
        if (-not $parent -or $parent -eq $cursor) {
            throw "Nao foi possivel resolver a raiz do projeto Nexus a partir de '$StartDir'."
        }
        $cursor = $parent
    }
}

function Get-NexusPythonCmd {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectRoot
    )

    $venvPython = Join-Path $ProjectRoot ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) {
        return $venvPython
    }
    return "python"
}

function Invoke-NexusPython {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectRoot,

        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $pythonCmd = Get-NexusPythonCmd -ProjectRoot $ProjectRoot
    & $pythonCmd @Arguments
    return $LASTEXITCODE
}

function Enqueue-NexusTask {
    param(
        [Parameter(Mandatory = $true)]
        [string]$ProjectRoot,

        [Parameter(Mandatory = $true)]
        [hashtable]$TaskData
    )

    $taskJson = $TaskData | ConvertTo-Json -Depth 10 -Compress
    $taskB64 = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($taskJson))
    $taskExecutor = Join-Path $ProjectRoot "task_executor.py"
    $exitCode = Invoke-NexusPython -ProjectRoot $ProjectRoot -Arguments @($taskExecutor, "db-add", $taskB64)

    if ($exitCode -ne 0) {
        throw "Falha ao enfileirar tarefa $($TaskData.id)."
    }
}
