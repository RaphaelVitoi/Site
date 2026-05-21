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
        # Stubs globais robustos para evitar CommandNotFoundException no Pester 3.x
        function global:Invoke-WebRequest { param($Uri, $Body) return @{ StatusCode = 200 } }
        function global:Write-Warning { param($Message) }
        function global:Set-Clipboard { param($Value) }
        function global:Get-Help { param() }
        function global:Invoke-NexusScript { param($ScriptName, $Message, $Arguments) }

        # Configurar Mock Pester para espionar os Stubs já declarados
        Mock -CommandName Invoke-WebRequest
        Mock -CommandName Write-Warning
        Mock -CommandName Set-Clipboard
        Mock -CommandName Get-Help
        Mock -CommandName Invoke-NexusScript
    }

    Context 'Roteamento de Parametros Core' {

        It 'Deve chamar Get-Help quando nenhum parametro e fornecido' {
            & $scriptFile
            Assert-MockCalled Get-Help -Times 1 -Exactly
        }

        It 'Deve enfileirar uma tarefa via API com o parametro -Description' {
            # Mockar a API de modo que ela pareça online para o teste
            Mock Invoke-WebRequest { return @{ StatusCode = 200 } }
            & $scriptFile -Description "Testar a API" -TestMode
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

            & $scriptFile -Description "@implementor corrigir o bug X" -TestMode
            Assert-MockCalled Invoke-WebRequest -Times 1 -Exactly -Scope It
        }

        It 'Deve montar o contexto via Delegacao SOTA e copiar para o clipboard com -Web' {
            # -Force pula o Read-Host interativo (selecao de motor cognitivo).
            & $scriptFile -Web -Force -TestMode
            
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
                -ParameterFilter { $ScriptName -like '*invoke_full_backup*' }
        }

        It 'Deve invocar o script de setup com -Setup' {
            & $scriptFile -Setup -TestMode
            Assert-MockCalled Invoke-NexusScript -Times 1 -Exactly -Scope It `
                -ParameterFilter { $ScriptName -like '*Setup-NexusProfile*' }
        }
    }
}
