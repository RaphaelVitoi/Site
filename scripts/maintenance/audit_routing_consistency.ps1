<#
.SYNOPSIS
    Audita a consistência entre o mapa de rotas canônico (ROUTES.md) e a estrutura de arquivos do frontend.
.DESCRIPTION
    Este script, acionado pelo @organizador, garante a homeostase documental do sistema de roteamento.
    Ele compara as rotas declaradas em ROUTES.md com as páginas (`page.tsx`) existentes no diretório `src/app`,
    identificando e reportando quaisquer discrepâncias.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$RoutesMdPath = Join-Path $ProjectRoot 'ROUTES.md'
$AppDir = Join-Path $ProjectRoot 'frontend\src\app'

Write-Host '=== [ORGANIZADOR] INICIANDO AUDITORIA DE CONSISTÊNCIA DE ROTAS ===' -ForegroundColor Cyan

# --- Etapa 1: Extrair rotas do ROUTES.md ---
Write-Host '[1/3] Lendo o mapa de rotas canônico (ROUTES.md)...' -ForegroundColor Yellow
$declaredRoutes = [System.Collections.Generic.List[string]]::new()
$inRoutesSection = $false
$routesContent = Get-Content $RoutesMdPath
$currentParent = ""

foreach ($line in $routesContent) {
    if ($line -match '```') {
        $inRoutesSection = -not $inRoutesSection
        continue
    }
    if ($inRoutesSection) {
        $trimmed = $line.Trim()
        if ($trimmed -match '^#') {
            continue
        }
        
        # Match lines starting with '/' (with optional leading spaces, e.g. parent routes)
        if ($line -match '^\s*/') {
            $tokens = $trimmed -split '\s+'
            $route = $tokens[0]
            
            if ($route -like '*/') {
                $currentParent = $route
                if ($route -ne '/' -and -not ($route -like '*/[slug]/')) {
                    $declaredRoutes.Add($route)
                }
            } else {
                $currentParent = ""
                $routeWithSlash = "$route/"
                if ($routeWithSlash -ne '/' -and -not ($routeWithSlash -like '*/[slug]/')) {
                    $declaredRoutes.Add($routeWithSlash)
                }
            }
        }
        # Match indented lines (sub-routes) starting with word chars, brackets, etc.
        elseif ($line -match '^\s+[\w\[\(#]' -and $currentParent -ne "") {
            $tokens = $trimmed -split '\s+'
            $subRoute = $tokens[0]
            # Ignore comments and non-route entries like page.tsx
            if ($subRoute -match '^#' -or $subRoute -like '*page.tsx*') {
                continue
            }
            if ($subRoute -like '*/') {
                $route = "$currentParent$subRoute"
                if (-not ($route -like '*/[slug]/')) {
                    $declaredRoutes.Add($route)
                }
            }
        }
    }
}
Write-Host "  [OK] $($declaredRoutes.Count) rotas declaradas encontradas." -ForegroundColor Green


# --- Etapa 2: Mapear rotas do sistema de arquivos ---
Write-Host "[2/3] Mapeando a estrutura de arquivos do frontend (`src/app`)..." -ForegroundColor Yellow
$fileSystemRoutes = [System.Collections.Generic.List[string]]::new()
Get-ChildItem -Path $AppDir -Filter 'page.tsx' -Recurse | ForEach-Object {
    $routePath = $_.Directory.FullName.Replace($AppDir, '').Replace('\', '/')
    if (-not [string]::IsNullOrEmpty($routePath)) {
        $fileSystemRoutes.Add("$routePath/")
    }
}
Write-Host "  [OK] $($fileSystemRoutes.Count) rotas físicas encontradas." -ForegroundColor Green


# --- Etapa 3: Comparar e reportar discrepâncias ---
Write-Host '[3/3] Cruzando dados e gerando relatório de simetria...' -ForegroundColor Yellow
$hasDiscrepancy = $false

# Verificar rotas físicas que não estão declaradas
$undeclaredPages = $fileSystemRoutes | Where-Object { $_ -notin $declaredRoutes }
if ($undeclaredPages) {
    $hasDiscrepancy = $true
    Write-Warning "`n[ALERTA] Páginas (`page.tsx`) encontradas no sistema de arquivos mas não declaradas em ROUTES.md:"
    $undeclaredPages | ForEach-Object { Write-Warning "  - $_" }
}

if (-not $hasDiscrepancy) {
    Write-Host "`n[SUCESSO] A simetria entre ROUTES.md e a estrutura de arquivos está PERFEITA." -ForegroundColor Green
}
else {
    Write-Host "`n[CONCLUÍDO] Auditoria finalizada com as discrepâncias acima. Recomenda-se alinhar o ROUTES.md." -ForegroundColor Yellow
}