@echo off
echo ========================================
echo   JEAN-PIERRE CHARLES Portfolio
echo   Aegis AI Compliance Platform
echo   Demarrage du serveur de developpement
echo ========================================
echo.

REM Verifier si Node.js est installe
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERREUR] Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Verifier si les dependances sont installees
if not exist "node_modules\" (
    echo [INFO] Installation des dependances...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo [ERREUR] Echec de l'installation des dependances
        pause
        exit /b 1
    )
)

REM Verifier si le fichier .env.local existe
if not exist ".env.local" (
    echo [ATTENTION] Le fichier .env.local n'existe pas
    echo Veuillez creer un fichier .env.local avec votre GEMINI_API_KEY
    echo.
)

REM Lancer le serveur de developpement
echo [INFO] Lancement du serveur de developpement...
echo.
call npm run dev

pause
