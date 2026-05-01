function Invoke-SafeCommand {
    [CmdletBinding()]
    param (
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    # [SEC] Bloqueio implacavel contra encadeamento, sub-expressoes, redirecionamentos e escapes via backtick
    if ($Command -match '[;\|&$\(\)`><]') {
        Write-Error '[SEC] Comando bloqueado. Operadores de encadeamento, sub-expressoes, escapes (backtick) ou redirecionamentos nao sao permitidos na camada segura.'
        return $false
    }

    # SOTA: Split inteligente que respeita strings entre aspas duplas e filtra espacos
    $CommandParts = $Command -split '\s+(?=(?:[^"]*"[^"]*")*[^"]*$)' | Where-Object { $_ -match '\S' } | ForEach-Object { $_.Trim('"') }
    $CommandName = $CommandParts[0]
    $CommandArgs = if ($CommandParts.Length -gt 1) { $CommandParts[1..($CommandParts.Length - 1)] } else { @() }

    # Abordagem de Allowlist: Apenas comandos explicitamente seguros sao permitidos.
    switch ($CommandName) {
        'Get-Process' { & Get-Process @CommandArgs }
        'Get-Service' { & Get-Service @CommandArgs }
        'Get-ChildItem' { & Get-ChildItem @CommandArgs }
        'ls' { & Get-ChildItem @CommandArgs }
        'dir' { & Get-ChildItem @CommandArgs }
        'Get-Help' { & Get-Help @CommandArgs }
        'echo' { & Write-Host @CommandArgs }
        'Write-Host' { & Write-Host @CommandArgs }
        'npm' {
            $AllowedNpmSubCommands = @('install', 'i', 'uninstall', 'list', 'view', 'search', 'docs', 'outdated', 'ci', 'run')
            if ($CommandArgs.Length -eq 0 -or $CommandArgs[0] -notin $AllowedNpmSubCommands) {
                Write-Error "[SEC] Subcomando npm bloqueado. Permitidos: $($AllowedNpmSubCommands -join ', ')"
                return $false
            }
            & npm @CommandArgs
        }
        'pip' {
            $AllowedPipSubCommands = @('install', 'uninstall', 'list', 'show', 'search', 'check', 'freeze')
            if ($CommandArgs.Length -eq 0 -or $CommandArgs[0] -notin $AllowedPipSubCommands) {
                Write-Error "[SEC] Subcomando pip bloqueado. Permitidos: $($AllowedPipSubCommands -join ', ')"
                return $false
            }
            & pip @CommandArgs
        }
        'python' {
            if ($CommandArgs.Length -eq 0 -or ($CommandArgs[0] -notmatch '\.py$' -and $CommandArgs[0] -notin @('--version', '-V', '-m'))) {
                Write-Error '[SEC] Comando python bloqueado. Permitido apenas para scripts .py, -m ou --version.'
                return $false
            }
            & python @CommandArgs
        }
        default {
            if ($CommandName -match '\.ps1$') {
                if ($CommandName -match '\.\.') {
                    Write-Error '[SEC] Comando bloqueado. Path traversal (..) não é permitido para scripts locais.'
                    return $false
                }
                if (Test-Path -LiteralPath $CommandName) {
                    & $CommandName @CommandArgs
                    return $true
                }
            }
            Write-Error "Comando '$CommandName' bloqueado. Apenas comandos na lista de permissoes (allowlist) podem ser executados via -Execute para garantir a seguranca do sistema."
            return $false
        }
    }
    return $true
}
