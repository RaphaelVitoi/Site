---
id: registro-2026-10-13-harmonizacao-powershell-7-6-7
tipo: registro
escopo: 'Site e Ecossistema -- atualizacao e harmonizacao do runtime PowerShell para versao 7.6.7 otimizada em todo o ambiente'
ecossistema: nexus-sota
autor: Gemini 3.8 Flash <noreply@google.com>
criado_em: '2026-10-13T18:05:00-03:00'
atualizado_em: '2026-10-13T18:05:00-03:00'
commit: HEAD
classes: [interno, medido, governanca, registro, ancoras, powershell, infraestrutura]
caminhos:
  - scripts/ops/Register-AgentCalibrationDailyTask.ps1
  - reports/REGISTRO-2026-10-13-harmonizacao-powershell-7-6-7.md
config_medida:
  raiz: C:/Users/rapha/.gemini/Site
  branch: master
  session_id: cadcf1cd-aadb-4958-851b-1635090658fe
  session_started_at: '2026-10-13T17:30:00-03:00'
  condutor: Gemini 3.8 Flash <noreply@google.com>
  modelo: gemini-3.8-flash
  veiculo: antigravity
  tier: 1
  supervisao: assistida
  data_das_medicoes: 2026-10-13
verificado:
  - "PowerShell 7.6.7 x64 oficial instalado e validado no diretorio de programas do usuario"
  - "User PATH em HKCU Environment atualizado para priorizar o diretorio do PowerShell 7.6.7"
  - "Perfil de usuario (Microsoft.PowerShell_profile.ps1 e profile.ps1) atualizado com bloco SOTA 7.6.7 Runtime Harmonization"
  - "Invocacao de pwsh em novo terminal confirmada executando PSVersion 7.6.7"
  - "scripts/ops/Register-AgentCalibrationDailyTask.ps1 harmonizado com deteccao dinamica priorizando PowerShell 7.6.7 preservando UTF-8 BOM"
  - "scripts/ops/Repair-SharedMcpGateway.ps1 harmonizado com deteccao dinamica do binario de pwsh"
  - "Pre-flight do record_gate.py aprovado com zero erros e integridade plena"
nao_verificado:
  - "atualizacao de tarefas do Task Scheduler que exigem elevacao administrativa UAC"
revisoes_de_ancora:
  - registro: registro-2026-09-02-portao-de-calibracao-por-sessao
    caminhos:
      - scripts/ops/Register-AgentCalibrationDailyTask.ps1
    parecer: >-
      Revisado em 2026-10-13 e mantido valido. O script mantem intacta toda a logica de contagem por sessao e definicao de tarefas, apenas priorizando o runtime local do PowerShell 7.6.7.
  - registro: registro-2026-09-05-fechamento-do-ciclo-de-calibracao
    caminhos:
      - scripts/ops/Register-AgentCalibrationDailyTask.ps1
    parecer: >-
      Revisado em 2026-10-13 e mantido valido. Preservado o parametro -File e o formato determinista de argumentos.
  - registro: registro-2026-09-12-preludio-o-instrumento-que-sabia-abrir-e-nao-fechar
    caminhos:
      - scripts/ops/Register-AgentCalibrationDailyTask.ps1
    parecer: >-
      Revisado em 2026-10-13 e mantido valido. Preservadas as diretivas de bateria e resiliencia de agendamento.
---

# Registro: Atualizacao e Harmonizacao do PowerShell 7.6.7 no Ecossistema

## 1. Contexto e Objetivos

O ecossistema operava anteriormente com o PowerShell 7.6.6 distribuido em nivel de maquina. Em 13/10/2026, a Microsoft disponibilizou a versao 7.6.7 com correcoes de estabilidade no motor de configuracao por usuario e cmdlets nativos.

O objetivo desta intervencao foi:
1. Instalar e validar o binario funcional do PowerShell 7.6.7 x64 sem exigir elevacao UAC intrusiva.
2. Configurar o ambiente do usuario (PATH e perfis de shell) para padronizar todas as sessoes interativas e agendadas na versao 7.6.7.
3. Atualizar os scripts de registro e reparo do ecossistema para resolver dinamicamente o executavel prioritario.

## 2. Acoes Executadas

- Binario extraido na pasta local do usuario em Programs/PowerShell/7/pwsh.exe.
- Ferramenta global dotnet sincronizada em .dotnet/tools/pwsh.exe (7.6.7).
- Atualizacao de HKCU/Environment PATH com prepend do diretorio local do PowerShell 7.6.7.
- Bloco injetado no topo do profile do usuario (%OneDrive%/Documentos/PowerShell/Microsoft.PowerShell_profile.ps1) e criacao de profile.ps1 garantindo prepend dinamico e alias forcado.
- Atualizacao de scripts/ops/Register-AgentCalibrationDailyTask.ps1 preservando UTF-8 BOM.
- Atualizacao de scripts/ops/Repair-SharedMcpGateway.ps1 com resolucao dinamica de pwshExe.
