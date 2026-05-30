# ==============================================================================
# TIER 0 POWERSHELL PROFILE - SOTA v7.0 GOLD PROTOCOL
# Bypass absoluto de restricoes, homeostase de performance e interop WSL simetrico
# ==============================================================================

# 1. Erradicacao de Atrito Termodinamico & Silenciamento (Bypass de Politicas)
$ProgressPreference = 'SilentlyContinue'
try {
    # Evita qualquer prompt ou restrição de execução de scripts locais
    Set-ExecutionPolicy Bypass -Scope Process -Force -ErrorAction SilentlyContinue
    Set-ExecutionPolicy Bypass -Scope CurrentUser -Force -ErrorAction SilentlyContinue
} catch {
    # Silencia limites impostos por politicas do Active Directory ou Registro do Sistema
}

# 2. Variaveis de Ambiente Host (Windows)
$env:UV_PROJECT_ENVIRONMENT = ".venv"
$env:PYTHONDONTWRITEBYTECODE = "1"

# 3. Workaround de Interoperabilidade WSL Simetrico (Sem overhead de shell interativo)
# Garante paridade absoluta delegando execucao ao WSL com privilegios do root
function nexus {
    $cmd = if ($args) { "uv run nexus $($args -join ' ')" } else { "uv run nexus" }
    wsl.exe --cd "$PWD" -u root -e bash -lc "$cmd"
}

function wsl-root {
    if ($args) {
        wsl.exe --cd "$PWD" -u root -e bash -lc "$($args -join ' ')"
    } else {
        wsl.exe --cd "$PWD" -u root
    }
}

function wsl-python {
    wsl.exe --cd "$PWD" -u root -e bash -lc "python3 $($args -join ' ')"
}

function wsl-uv {
    wsl.exe --cd "$PWD" -u root -e bash -lc "uv $($args -join ' ')"
}

function wsl-npm {
    wsl.exe --cd "$PWD" -u root -e bash -lc "npm $($args -join ' ')"
}

function wsl-npx {
    wsl.exe --cd "$PWD" -u root -e bash -lc "npx $($args -join ' ')"
}

# 4. Elevacao de Privilegio Nativa (Sudo do Windows)
function sudo {
    if ($args) {
        Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -Command $args" -Verb RunAs
    } else {
        Start-Process powershell -Verb RunAs
    }
}
