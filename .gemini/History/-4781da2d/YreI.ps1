<#
.SYNOPSIS
    Testes de unidade para a Membrana Inteligente (do.ps1) usando Pester.
.DESCRIPTION
    Valida o roteamento de parametros e o comportamento esperado do script principal
    do ecossistema, garantindo a estabilidade da CLI.
#>

$scriptFile = (Resolve-Path "$PSScriptRoot/../do.ps1").Path

# Dot-source o script para ter acesso as suas funcoes internas para mocking, se necessario.
# No entanto, a melhor pratica e chamar o script como um processo externo para testar sua "API publica".
# Para simplicidade e controle de mocks, vamos usar uma abordagem hibrida.

Describe 'do.ps1 - A Membrana Inteligente SOTA' -Tags 'Unit' {

    # Mock de dependencias externas para isolar o script sob teste.
    BeforeAll {
        # Mock da API web
        Mock Invoke-WebRequest {
            return [pscustomobject]@{ StatusCode = 200; Content = '{"status":"SUCCESS"}' }
        }

        # Mock do executor Python para simular o fallback do DAL
        Mock -CommandName 'python' {
            param($script, $command, $payload)
            if ($script -like "*task_executor.py*" -and $command -eq 'db-add') {
                return "SUCCESS: TASK-ID-FALLBACK"
            }
        }

        # Mock de outras rotinas e comandos
        Mock Invoke-ContextAssembler { return "Mocked Context SOTA" } -ModuleName .
        Mock Set-Clipboard { } -ModuleName .
        Mock Get-Help { } -ModuleName .
        Mock -CommandName 'npx.cmd' { }
        Mock -CommandName 'npx' { }
        Mock -CommandName 'invoke_sota_audit.ps1' { }
        Mock -CommandName 'sync_agents_reality.ps1' { }
        Mock -CommandName 'safeguard_system.ps1' { } 
        Mock -CommandName 'Setup-NexusProfile.ps1' { }
        Mock Remove-Item { }
        Mock Stop-Process { }
        Mock Start-Process { }
    }

    AfterAll {
        Remove-Mock -CommandName Invoke-WebRequest, python, 'npx.cmd', 'npx', Get-Help, Remove-Item, Stop-Process, Start-Process
        Remove-Mock -CommandName invoke_sota_audit.ps1, sync_agents_reality.ps1, safeguard_system.ps1, Setup-NexusProfile.ps1
        Remove-Mock -ModuleName . -CommandName Invoke-ContextAssembler, Set-Clipboard
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
            Mock Invoke-WebRequest { throw "API Offline" }
            & $scriptFile -Description "Testar o fallback"
            Assert-MockCalled python -Times 1 -Exactly -Scope It
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

        It 'Deve montar o contexto e copiar para o clipboard com -Web' {
            Mock Read-Host { return '1' } # Simula a escolha de menu
            & $scriptFile -Web
            Assert-MockCalled Invoke-ContextAssembler -Times 1 -Exactly -Scope It
            Assert-MockCalled Set-Clipboard -Times 1 -Exactly -Scope It
        }

        It 'Deve invocar o script de auditoria com -Audit' {
            & $scriptFile -Audit "Teste de auditoria"
            Assert-MockCalled invoke_sota_audit.ps1 -Times 1 -Exactly -Scope It
        }

        It 'Deve invocar o script de sincronia com -SyncAgents' {
            & $scriptFile -SyncAgents
            Assert-MockCalled sync_agents_reality.ps1 -Times 1 -Exactly -Scope It
        }
    }
}