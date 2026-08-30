@echo off
REM SOTA: Launcher Direto do Dashboard Executivo SOTA (v8.0 GOLD)
REM `uv run` resolve o projeto pelo CWD, nao pelo caminho deste arquivo.
REM Sem o pushd o launcher so funciona de dentro do Site (medido: EXIT=2,
REM "Failed to spawn: nexus", a partir de C:\Users\rapha). %~dp0 e o
REM diretorio deste .cmd. Ver a nota gemea em dashboard.ps1.
pushd "%~dp0"
uv run nexus dashboard %*
set "NEXUS_DASHBOARD_RC=%ERRORLEVEL%"
popd
exit /b %NEXUS_DASHBOARD_RC%
popd
exit /b %EXIT_CODE%
