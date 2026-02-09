@echo off
echo ====================================
echo Installation de uv pour Windows
echo ====================================
echo.
echo Ce script va installer uv automatiquement.
echo.
pause

powershell.exe -ExecutionPolicy Bypass -File "%~dp0install-uv.ps1"

pause
