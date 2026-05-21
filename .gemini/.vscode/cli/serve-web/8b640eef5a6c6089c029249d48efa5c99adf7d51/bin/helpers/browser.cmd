@echo off
setlocal
set ROOT_DIR=%~dp0..\..
start "Open Browser" /B "%ROOT_DIR%\node.exe" "%ROOT_DIR%\out\server-cli.js" "code" "1.119.0" "8b640eef5a6c6089c029249d48efa5c99adf7d51" "code.cmd" "--openExternal" "%*"
endlocal
