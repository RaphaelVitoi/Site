<#
.SYNOPSIS
    Injeta o modelo VitoiPerspectiveMetrics no schema.prisma e executa a migração SOTA.
.DESCRIPTION
    Materializa a Perspectiva Matemática no banco de dados e sincroniza o Prisma Client.
#>

$ProjectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..'))
$PrismaFile = Join-Path $ProjectRoot 'prisma\schema.prisma'

$ModelDef = @'

// SOTA: Tabela de Telemetria e Perspectiva Matemática Vitoi (Motor Híbrido)
model VitoiPerspectiveMetrics {
  id                        String   @id @default(cuid())
  scenarioId                String?  // Opcional, permitindo linkar ao MasterSimulator

  // Base State
  chipEvFold                Float
  icmValuation              Float

  // Modificadores Dinâmicos
  timeToBlindJumpMinutes    Float
  payjumpProximityFactor    Float
  positionalUrgency         String   // Ex: "UTG", "BTN", "BB"

  // Passivos Estruturais
  multiwayOpponents         Int
  reverseImpliedOddsPenalty Float

  // Amortização de Edge
  stackDepthBb              Float
  humanNoiseFactor          Float
  technicalSuperiority      Float

  // Análise de Insolvência
  potOddsRatio              Float
  perspectiveUtility        Float
  insolvencyCoefficient     Float    // Ci = PotOdds / PM
  isViable                  Boolean  // O Veredito final

  createdAt                 DateTime @default(now())
}
'@

if (Test-Path $PrismaFile) {
    Write-Host "[CHICO] Modificando $PrismaFile ativamente via God Mode..." -ForegroundColor Cyan
    Add-Content -Path $PrismaFile -Value $ModelDef -Encoding UTF8
    Write-Host '[CHICO] Contrato IVitoiMathematicalPerspective injetado. Iniciando engine Prisma...' -ForegroundColor Yellow

    Set-Location $ProjectRoot
    # Fricção Zero: Roda a migração de banco de dados e reconstrói o Prisma Client local
    npx prisma migrate dev --name init_vitoi_perspective
    Write-Host '[OK] Migração SOTA concluída. Banco de Dados operando em Homeostase Absoluta.' -ForegroundColor Green
}
else {
    Write-Error '[ENTROPIA FATAL] Arquivo schema.prisma não localizado no root do projeto.'
    exit 1
}
