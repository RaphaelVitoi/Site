<#
.SYNOPSIS
    Testes de unidade para a Membrana Inteligente (do.ps1) usando Pester 3.x.
.DESCRIPTION
    Valida o roteamento de parametros e o comportamento esperado do script principal
    do ecossistema. Compativel com Pester 3.4.0 (sem Remove-Mock, sem -Output Detailed).

    Mecanismo -TestMode:
    - do.ps1 recebe -TestMode e suprime as definicoes locais de Invoke-NexusScript e
      Invoke-ContextAssembler. O PowerShell sobe na cadeia de escopo e encontra as
      versoes global: mockadas pelo Pester -- tornando todos os roteamentos interceptaveis.

    Notas de invocacao:
    - -Web requer -Force para pular o Read-Host interativo.
    - Mocks de Invoke-NexusScript verificam $ScriptName via -ParameterFilter.
#>

$scriptFile = Join-Path $PSScriptRoot 'do.ps1'

Describe 'do.ps1 - A Membrana Inteligente SOTA' -Tags 'Unit' {

    BeforeAll {
        # Stubs globais necessarios para que Pester 3.x encontre os comandos antes de mocka-los.
        function global:Invoke-ContextAssembler { param() return "stub" }
        function global:Invoke-NexusScript {
            param([string]$ScriptName, [string]$Message, [string[]]$Arguments)
        }

        # Mock de dependencias externas para isolar o script sob teste.
        Mock Invoke-WebRequest {
            return [pscustomobject]@{ StatusCode = 200; Content = '{"status":"SUCCESS"}' }
        }

        # Mock de Write-Warning para capturar a delegacao SOTA
        Mock Write-Warning { }
        Mock Set-Clipboard { }
        Mock Get-Help { }
        Mock -CommandName 'npx.cmd' { }
        Mock -CommandName 'npx' { }
        Mock Invoke-NexusScript { }
    }

    Context 'Roteamento de Parametros Core' {

        It 'Deve chamar Get-Help quando nenhum parametro e fornecido' {
            & $scriptFile
            Assert-MockCalled Get-Help -Times 1 -Exactly
        }

        It 'Deve enfileirar uma tarefa via API com o parametro -Description' {
            & $scriptFile -Description "Testar a API"
            Assert-MockCalled Invoke-WebRequest -Times 1 -Exactly -Scope It
        }

        It 'Deve usar o fallback (DAL via Python) se a API falhar' {
            # Cria executavel fake que simula DAL respondendo com sucesso (exit 0).
            $fakeBat = Join-Path $env:TEMP 'fake_python_dal.bat'
            '@echo SUCCESS: TASK-ID-FALLBACK' | Set-Content $fakeBat -Encoding ASCII
            $Global:TestPythonCmd = $fakeBat

            # Forca a API a falhar para acionar o caminho de fallback.
            Mock Invoke-WebRequest { throw "Connection refused" }

            & $scriptFile -Description "Testar fallback DAL" -TestMode

            $Global:TestPythonCmd = $null
            Remove-Item $fakeBat -Force -ErrorAction SilentlyContinue

            # API foi tentada uma vez antes do fallback.
            Assert-MockCalled Invoke-WebRequest -Times 1 -Exactly -Scope It
        }

        It 'Deve rotear corretamente agente e descricao' {
            $expectedAgent = "@implementor"
            $expectedDesc = "corrigir o bug X"

            Mock Invoke-WebRequest -MockWith {
                param($Body)
                $task = $Body | ConvertFrom-Json
                $task.agent | Should -Be $expectedAgent
                $task.description | Should -Be $expectedDesc
            }

            & $scriptFile -Description "@implementor corrigir o bug X"
            Assert-MockCalled Invoke-WebRequest -Times 1 -Exactly -Scope It
        }

        It 'Deve montar o contexto via Delegacao SOTA e copiar para o clipboard com -Web' {
            # -Force pula o Read-Host interativo (selecao de motor cognitivo).
            & $scriptFile -Web -Force -TestMode
            
            # Valida que o script avisou sobre a delegacao SOTA ao Kernel
            Assert-MockCalled Write-Warning -Times 1 -Exactly -ParameterFilter {
                $Message -match 'SOTA.*Delegando composicao holistica ao Kernel'
            }
            Assert-MockCalled Set-Clipboard -Times 1 -Exactly -Scope It
        }
    }

    Context 'Roteamento de Comandos de Manutencao' {

        It 'Deve invocar o script de auditoria com -Audit' {
            & $scriptFile -Audit 'full' -TestMode
            Assert-MockCalled Invoke-NexusScript -Times 1 -Exactly -Scope It `
                -ParameterFilter { $ScriptName -like '*sota_audit*' }
        }

        It 'Deve invocar o script de sincronia com -SyncAgents' {
            & $scriptFile -SyncAgents -TestMode
            Assert-MockCalled Invoke-NexusScript -Times 1 -Exactly -Scope It `
                -ParameterFilter { $ScriptName -like '*sync_agents*' }
        }

        It 'Deve invocar o script de backup (safeguard) com -Backup' {
            & $scriptFile -Backup -TestMode
            Assert-MockCalled Invoke-NexusScript -Times 1 -Exactly -Scope It `
                -ParameterFilter { $ScriptName -like '*safeguard*' }
        }

        It 'Deve invocar o script de setup com -Setup' {
            & $scriptFile -Setup -TestMode
            Assert-MockCalled Invoke-NexusScript -Times 1 -Exactly -Scope It `
                -ParameterFilter { $ScriptName -like '*Setup-NexusProfile*' }
        }
    }
}
