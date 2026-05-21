<#
.SYNOPSIS
    Script de Remediacao Automatica SOTA para os Problemas Criticos (P0-1, P0-2, P0-3).
#>

$ErrorActionPreference = "Stop"
$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$GlobalsCssPath = Join-Path $ProjectRoot "frontend\src\app\globals.css"
$LayoutTsxPath = Join-Path $ProjectRoot "frontend\src\app\layout.tsx"

Write-Host "=== INICIANDO PROTOCOLO DE REMEDIACAO P0 ===" -ForegroundColor Magenta

# P0-1: Restaurar globals.css do Git
Write-Host "[1/4] Restaurando globals.css do repositorio Git..." -ForegroundColor Cyan
Set-Location $ProjectRoot
git checkout HEAD -- $GlobalsCssPath

# P0-1 & P0-3: Compatibilizar Tailwind v4 e Injetar FontAwesome
Write-Host "[2/4] Aplicando sintaxe Tailwind v4 e FontAwesome..." -ForegroundColor Cyan
$CssContent = Get-Content -Path $GlobalsCssPath -Raw
$CssContent = $CssContent -replace "(?m)^@tailwind\s+base;.*`r?`n", ""
$CssContent = $CssContent -replace "(?m)^@tailwind\s+components;.*`r?`n", ""
$CssContent = $CssContent -replace "(?m)^@tailwind\s+utilities;.*`r?`n", ""

$NewHeaders = "@import `"tailwindcss`";`n@import url(`"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css`");`n"
$CssContent = $NewHeaders + $CssContent.TrimStart()

Set-Content -Path $GlobalsCssPath -Value $CssContent -Encoding UTF8

# P0-2: Reescrever layout.tsx para incluir Header e Footer
Write-Host "[3/4] Reescrevendo layout.tsx para injetar Header e Footer..." -ForegroundColor Cyan
$LayoutContent = @"
import './globals.css';
import { ReactNode } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen flex flex-col bg-gray-950 text-gray-200">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
"@
Set-Content -Path $LayoutTsxPath -Value $LayoutContent -Encoding UTF8

Write-Host "[4/4] Remediacao concluida com sucesso. SOTA restaurado." -ForegroundColor Green
