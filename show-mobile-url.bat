@echo off
echo ========================================
echo   URL d'acces reseau pour mobile
echo ========================================
echo.

REM Obtenir l'adresse IP WiFi
for /f "tokens=14" %%a in ('ipconfig ^| findstr /C:"IPv4"') do (
    set IP=%%a
    goto :found
)

:found
if "%IP%"=="" (
    echo [ERREUR] Impossible de detecter l'adresse IP
    echo Verifiez que vous etes connecte a un reseau WiFi
    echo.
    pause
    exit /b 1
)

echo Votre adresse IP locale : %IP%
echo.
echo ========================================
echo URL pour acceder depuis votre mobile :
echo.
echo    http://%IP%:3000/
echo.
echo ========================================
echo.
echo Copiez cette URL dans le navigateur de votre mobile
echo (Chrome, Safari, Firefox, etc.)
echo.
echo IMPORTANT :
echo 1. Le serveur dev doit etre lance (npm run dev)
echo 2. Votre mobile doit etre sur le meme WiFi que ce PC
echo 3. Si ca ne marche pas, voir ACCES-MOBILE.md
echo.
pause
