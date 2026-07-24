@echo off
setlocal
title SQL Visual Optimizer DOI v1.1.0 Update
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0apply-doi-v1.1.0.ps1"
echo.
pause
endlocal
