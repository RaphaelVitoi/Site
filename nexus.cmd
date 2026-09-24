@echo off
REM SOTA: Wrapper de Ignicao do Nexus CLI para Windows (v8.0 GOLD)
pushd "%~dp0"
uv run nexus %*
set "NEXUS_RC=%ERRORLEVEL%"
popd
exit /b %NEXUS_RC%
