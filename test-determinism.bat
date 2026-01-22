@echo off
REM ====================================================================
REM Script de test du déterminisme Aegis Assistant
REM Date: 2026-01-22
REM Objectif: Valider que les réponses sont identiques entre appareils
REM ====================================================================

echo.
echo ===============================================================
echo  TEST DETERMINISME AEGIS - Assistant de Conformite
echo ===============================================================
echo.

REM Vérifier que node_modules existe
if not exist "node_modules\" (
    echo [ERREUR] node_modules non trouve. Installation des dependances...
    call npm install
    if errorlevel 1 (
        echo [ERREUR] Installation echouee !
        pause
        exit /b 1
    )
)

echo [INFO] Execution des tests de determinisme...
echo.

REM Exécuter les tests avec tsx (TypeScript execution)
npx tsx services/geminiService.test.ts

if errorlevel 1 (
    echo.
    echo ===============================================================
    echo  [ECHEC] Tests de determinisme ECHOUES
    echo ===============================================================
    echo.
    pause
    exit /b 1
) else (
    echo.
    echo ===============================================================
    echo  [SUCCES] Tests de determinisme REUSSIS
    echo ===============================================================
    echo.
    pause
    exit /b 0
)
