# aegis-5s-seiri-phase1.ps1
# AEGIS 5S Digital — Phase 1 Seiri (Trier)
# Genere par Sonnet MCP — 20260331T0515
# EXECUTION : JP lance manuellement dans PowerShell 7.6.0
# REVERSIBLE : rien n'est supprime, tout est deplace vers cold storage

$ErrorActionPreference = "Stop"
$timestamp = Get-Date -Format "yyyyMMddTHHmm"

# --- Configuration ---
$projectRoot = "C:\Projects\jeanpierrecharles"
$coldStorage  = "C:\Projects\aegis-archives"
$coldLifecycle = "$coldStorage\lifecycle-versions"
$coldDeltas    = "$coldStorage\delta-versions"
$coldAfrs      = "$coldStorage\afrs-legacy-v1v2"
$coldBridgesPre32 = "$coldStorage\bridges-pre-sprint-v32"

# --- Creer structure cold storage ---
Write-Host "`n=== AEGIS 5S SEIRI — Phase 1 ===" -ForegroundColor Cyan
Write-Host "Timestamp : $timestamp"
Write-Host "Source    : $projectRoot"
Write-Host "Cold      : $coldStorage`n"

$dirs = @($coldStorage, $coldLifecycle, $coldDeltas, $coldAfrs, $coldBridgesPre32)
foreach ($d in $dirs) {
    if (!(Test-Path $d)) {
        New-Item -ItemType Directory -Path $d -Force | Out-Null
        Write-Host "[CREE] $d" -ForegroundColor Green
    } else {
        Write-Host "[EXISTE] $d" -ForegroundColor Yellow
    }
}

# --- S1.1 : Deplacer _archives/ (85 fichiers AFRS legacy) ---
Write-Host "`n--- S1.1 : Cold storage _archives/ (AFRS legacy) ---" -ForegroundColor Cyan
$archivesSource = "$projectRoot\_archives"
if (Test-Path $archivesSource) {
    $files = Get-ChildItem -Path $archivesSource -File
    Write-Host "Fichiers a deplacer : $($files.Count)"
    foreach ($f in $files) {
        Move-Item -Path $f.FullName -Destination $coldAfrs -Force
        Write-Host "  [MOVE] $($f.Name)" -ForegroundColor DarkGray
    }
    # Supprimer le repertoire vide
    if ((Get-ChildItem -Path $archivesSource -Force).Count -eq 0) {
        Remove-Item -Path $archivesSource -Force
        Write-Host "[SUPPRIME] _archives/ (vide)" -ForegroundColor Green
    }
} else {
    Write-Host "[SKIP] _archives/ non trouve" -ForegroundColor Yellow
}

# --- S1.2 : Deplacer LIFECYCLE versions anterieures ---
Write-Host "`n--- S1.2 : Cold storage LIFECYCLE anciens ---" -ForegroundColor Cyan
$lifecycleOld = @(
    "20260227T1100_AEGIS_LIFECYCLE_MASTER.md",
    "20260305T1100_LIFECYCLE_MASTER.md",
    "20260306T1100_LIFECYCLE_MASTER.md",
    "20260310T1700_LIFECYCLE_MASTER.md",
    "20260311T2000_LIFECYCLE_MASTER.md",
    "20260323T1630_LIFECYCLE_MASTER.md"
)
# GARDER : 20260326T1145_LIFECYCLE_MASTER.md (actif v2.6.0)
# GARDER : 20260327T1750_LIFECYCLE_MASTER.md (si c'est v2.7.0 source)

foreach ($f in $lifecycleOld) {
    $src = "$projectRoot\$f"
    if (Test-Path $src) {
        Move-Item -Path $src -Destination $coldLifecycle -Force
        Write-Host "  [MOVE] $f" -ForegroundColor DarkGray
    } else {
        Write-Host "  [SKIP] $f non trouve" -ForegroundColor Yellow
    }
}

# --- S1.3 : Deplacer DELTA versions anterieures ---
Write-Host "`n--- S1.3 : Cold storage DELTA anciens ---" -ForegroundColor Cyan
$deltaOld = @(
    "20260305T1030_LIFECYCLE_MASTER_DELTA.md",
    "20260305T1030_REGISTRE_DELTA.md",
    "20260306T1100_DELTA_LIFECYCLE-INTEGRATION-7BRIDGES.md",
    "20260306T1100_RAPPORT_RATTRAPAGE-REGISTRE-TRACABILITE.md",
    "20260307T1800_DELTA_LIFECYCLE-INTEGRATION-EPISTEMOLOGIE.md",
    "20260308T2000_DELTA_LIFECYCLE-INTEGRATION-0703-0803.md",
    "20260323T1630_DELTA_LIFECYCLE-V251-INTEGRATION.md",
    "20260326T1200_BRIDGE_LIFECYCLE-V260-INTEGRATION-8BRIDGES.md"
)
# GARDER : 20260330T1105_DELTA_LIFECYCLE-V270-INTEGRATION.md (courant)

foreach ($f in $deltaOld) {
    $src = "$projectRoot\$f"
    if (Test-Path $src) {
        Move-Item -Path $src -Destination $coldDeltas -Force
        Write-Host "  [MOVE] $f" -ForegroundColor DarkGray
    } else {
        Write-Host "  [SKIP] $f non trouve" -ForegroundColor Yellow
    }
}

# --- S1.4 : Deplacer bridges pre-sprint v3.2 (avant 24/03) ---
Write-Host "`n--- S1.4 : Cold storage bridges pre-sprint v3.2 ---" -ForegroundColor Cyan
$cutoffDate = "20260324"
$bridgeFiles = Get-ChildItem -Path $projectRoot -Filter "*.md" -File |
    Where-Object {
        $_.Name -match "^\d{8}T\d{4}_" -and
        $_.Name.Substring(0,8) -lt $cutoffDate -and
        $_.Name -ne "BRIDGE_STATE.md" -and
        $_.Name -ne "CAUSAL_GRAPH.md" -and
        $_.Name -notmatch "LIFECYCLE_MASTER" -and
        $_.Name -notmatch "PRINCIPE_FONDATEUR" -and
        $_.Name -notmatch "REGISTRE_TRACABILITE"
    }

Write-Host "Bridges pre-24/03 a deplacer : $($bridgeFiles.Count)"
foreach ($f in $bridgeFiles) {
    Move-Item -Path $f.FullName -Destination $coldBridgesPre32 -Force
    Write-Host "  [MOVE] $($f.Name)" -ForegroundColor DarkGray
}

# --- Rapport final ---
Write-Host "`n=== RAPPORT SEIRI ===" -ForegroundColor Green
$remaining = (Get-ChildItem -Path $projectRoot -File).Count
$coldTotal = (Get-ChildItem -Path $coldStorage -Recurse -File).Count
Write-Host "Fichiers restants racine : $remaining"
Write-Host "Fichiers cold storage    : $coldTotal"
Write-Host "`n5S Seiri Phase 1 TERMINE — $timestamp" -ForegroundColor Green
Write-Host "Prochaine etape : verifier que npm run build fonctionne toujours"
