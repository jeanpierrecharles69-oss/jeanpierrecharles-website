# Script d'installation de uv pour Windows
Write-Host "Installation de uv pour Windows" -ForegroundColor Cyan
Write-Host ""

# Verifier si uv existe deja
$uvExists = Get-Command uv -ErrorAction SilentlyContinue

if ($uvExists) {
    Write-Host "uv est deja installe !" -ForegroundColor Green
    uv --version
    pause
    exit 0
}

Write-Host "Telechargement et installation de uv..." -ForegroundColor Yellow
Write-Host ""

# Installer uv
irm https://astral.sh/uv/install.ps1 | iex

Write-Host ""
Write-Host "Installation terminee !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "1. Fermez Claude Desktop completement"
Write-Host "2. Redemarrez Claude Desktop"
Write-Host "3. L'erreur devrait disparaitre"
Write-Host ""
pause
