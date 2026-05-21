# Função de Validação de Schema JSON para Queue v1.0
# Implementa validação preditiva antes de qualquer operação de escrita

function Validate-JsonSchema {
    param(
        [Parameter(Mandatory = $true)]
        [string]$JsonString,
        
        [Parameter(Mandatory = $false)]
        [string]$SchemaVersion = "1.0"
    )
    
    # Tentar parsear JSON
    $obj = try {
        $JsonString | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        return @{
            Valid   = $false
            Error   = "JSON mal formado: $($_.Exception.Message)"
            Details = @()
        }
    }
    
    $errors = @()
    
    # Validações obrigatórias para schema v1.0
    if (-not $obj.version) {
        $errors += "Campo 'version' é obrigatório"
    }
    elseif ($obj.version -ne "1.0") {
        $errors += "Versão '$($obj.version)' não é suportada. Use 'version': '1.0'"
    }
    
    if (-not $obj.createdAt) {
        $errors += "Campo 'createdAt' é obrigatório (ISO 8601: YYYY-MM-DDTHH:mm:ssZ)"
    }
    
    if (-not $obj.lastModified) {
        $errors += "Campo 'lastModified' é obrigatório (ISO 8601: YYYY-MM-DDTHH:mm:ssZ)"
    }
    
    # Validar metadata
    if ($null -eq $obj.metadata) {
        $errors += "Campo 'metadata' é obrigatório"
    }
    elseif (-not $obj.metadata.description) {
        $errors += "Campo 'metadata.description' é obrigatório"
    }
    
    # Validar tasks (deve ser array ou omitido)
    if ($null -ne $obj.tasks) {
        if ($obj.tasks -isnot [array] -and -not (($obj.tasks | GetType).Name -eq "Object")) {
            $errors += "Campo 'tasks' deve ser array ou objeto"
        }
        else {
            # Validar cada tarefa no array
            $taskArray = if ($obj.tasks -is [array]) { $obj.tasks } else { @($obj.tasks) }
            
            foreach ($idx in 0..($taskArray.Length - 1)) {
                $task = $taskArray[$idx]
                
                # Validações de tarefa
                if (-not $task.id) {
                    $errors += "Task[$idx]: Campo 'id' é obrigatório"
                }
                
                if (-not $task.status) {
                    $errors += "Task[$idx]: Campo 'status' é obrigatório"
                }
                elseif ($task.status -notin @("pending", "running", "completed", "failed", "cancelled")) {
                    $errors += "Task[$idx]: Status '$($task.status)' inválido. Use: pending, running, completed, failed, cancelled"
                }
                
                if (-not $task.timestamp) {
                    $errors += "Task[$idx]: Campo 'timestamp' é obrigatório"
                }
            }
        }
    }
    
    return @{
        Valid   = $errors.Count -eq 0
        Error   = if ($errors.Count -gt 0) { "Validação falhou com $($errors.Count) erro(s)" } else { $null }
        Details = $errors
    }
}

function Atomic-WriteJson {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        
        [Parameter(Mandatory = $true)]
        [PSObject]$Data,
        
        [Parameter(Mandatory = $false)]
        [ValidateSet("1.0")]
        [string]$SchemaVersion = "1.0"
    )
    
    # Garantir que o objeto tem versão
    if (-not $Data.version) {
        $Data | Add-Member -NotePropertyName "version" -NotePropertyValue $SchemaVersion -Force
    }
    
    # Garantir que tem timestamps
    if (-not $Data.createdAt) {
        $Data | Add-Member -NotePropertyName "createdAt" -NotePropertyValue (Get-Date -Format "o") -Force
    }
    
    $Data | Add-Member -NotePropertyName "lastModified" -NotePropertyValue (Get-Date -Format "o") -Force
    
    # Converter para JSON
    $jsonString = $Data | ConvertTo-Json -Depth 10
    
    # Validar antes de escrever
    $validation = Validate-JsonSchema -JsonString $jsonString -SchemaVersion $SchemaVersion
    
    if (-not $validation.Valid) {
        throw @"
Validação de schema falhou. Não escrevendo arquivo.
Erros encontrados:
$($validation.Details -join "`n")
"@
    }
    
    # Atomic Swap: escrever em temp, depois mover
    $tempPath = "$Path.tmp"
    $backupPath = "$Path.backup"
    
    try {
        # Escrever em arquivo temporário
        $jsonString | Set-Content -Path $tempPath -Encoding UTF8 -ErrorAction Stop
        
        # Criar backup do original se existir
        if (Test-Path $Path) {
            Copy-Item -Path $Path -Destination $backupPath -Force -ErrorAction SilentlyContinue
        }
        
        # Mover temp para destino (operação atómica)
        Move-Item -Path $tempPath -Destination $Path -Force -ErrorAction Stop
        
        Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [ATOMIC-WRITE] Escrita bem-sucedida em '$Path'"
        
        return $true
    }
    catch {
        # Rollback: apagar temp se existir
        if (Test-Path $tempPath) {
            Remove-Item -Path $tempPath -Force -ErrorAction SilentlyContinue
        }
        
        # Restaurar backup se escrita falhar
        if (Test-Path $backupPath) {
            Copy-Item -Path $backupPath -Destination $Path -Force -ErrorAction SilentlyContinue
            Write-Output "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] [ATOMIC-WRITE] Rollback bem-sucedido. Backup restaurado."
        }
        
        throw "Falha ao escrever arquivo atômicamente: $($_.Exception.Message)"
    }
}

# Exportar funções
Export-ModuleMember -Function Validate-JsonSchema, Atomic-WriteJson
