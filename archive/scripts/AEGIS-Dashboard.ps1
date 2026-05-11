#!/usr/bin/env pwsh
# AEGIS-Dashboard.ps1 — Lanceur autonome GANTT/KANBAN avec auto-decouverte + V&V JP
# Emplacement : C:\Projects\jeanpierrecharles\AEGIS-Dashboard.ps1
# Usage : clic droit > Executer avec PowerShell  OU  pwsh .\AEGIS-Dashboard.ps1
# Raccourci Bureau : cible = pwsh.exe -File "C:\Projects\jeanpierrecharles\AEGIS-Dashboard.ps1"

param(
    [switch]$Silent,       # Lance sans notification (usage quotidien)
    [switch]$Check,        # Verifie uniquement, n'ouvre pas Chrome
    [switch]$Approve       # JP approuve la nouvelle version detectee
)

$ErrorActionPreference = "Stop"
$BaseDir = "C:\Projects\jeanpierrecharles"
$Pattern = "AEGIS_GANTT_KANBAN_v*.html"
$StateFile = Join-Path $BaseDir ".aegis-dashboard-state.json"
$LogFile = Join-Path "C:\Projects\aegis-ops\logs" "aegis-dashboard.log"

# --- Fonctions utilitaires ---

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $line = "[$ts] [$Level] $Message"
    if (Test-Path (Split-Path $LogFile -Parent)) {
        Add-Content -Path $LogFile -Value $line -Encoding UTF8
    }
    if ($Level -eq "ERROR") { Write-Host $line -ForegroundColor Red }
    elseif ($Level -eq "WARN") { Write-Host $line -ForegroundColor Yellow }
    elseif ($Level -eq "OK") { Write-Host $line -ForegroundColor Green }
    else { Write-Host $line -ForegroundColor Cyan }
}

function Get-LatestDashboard {
    $files = Get-ChildItem -Path $BaseDir -Filter $Pattern -File |
        Sort-Object Name -Descending
    if ($files.Count -eq 0) { return $null }
    return $files[0]
}

function Read-State {
    if (Test-Path $StateFile) {
        return Get-Content $StateFile -Raw | ConvertFrom-Json
    }
    return @{ approved_file = ""; approved_hash = ""; last_check = "" }
}

function Save-State {
    param($State)
    $State | ConvertTo-Json -Depth 3 | Set-Content $StateFile -Encoding UTF8
}

function Get-FileHashSHA256 {
    param([string]$Path)
    return (Get-FileHash -Path $Path -Algorithm SHA256).Hash
}

function Show-Notification {
    param([string]$Title, [string]$Message, [string]$Type = "Info")
    # Toast notification Windows 10/11
    try {
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom, ContentType = WindowsRuntime] | Out-Null

        $template = @"
<toast>
  <visual>
    <binding template="ToastGeneric">
      <text>$Title</text>
      <text>$Message</text>
    </binding>
  </visual>
</toast>
"@
        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml($template)
        $toast = [Windows.UI.Notifications.ToastNotification]::new($xml)
        $appId = "AEGIS.Dashboard"
        [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
    }
    catch {
        # Fallback : MessageBox
        Add-Type -AssemblyName System.Windows.Forms
        $icon = if ($Type -eq "Warning") {
            [System.Windows.Forms.MessageBoxIcon]::Warning
        } else {
            [System.Windows.Forms.MessageBoxIcon]::Information
        }
        [System.Windows.Forms.MessageBox]::Show($Message, $Title, "OK", $icon)
    }
}

# --- Logique principale ---

Write-Log "=== AEGIS Dashboard Launcher ==="

# 1. Decouvrir le fichier le plus recent
$latest = Get-LatestDashboard
if (-not $latest) {
    Write-Log "Aucun fichier $Pattern trouve dans $BaseDir" "ERROR"
    Show-Notification "AEGIS Dashboard" "Aucun fichier dashboard trouve. Verifiez $BaseDir." "Warning"
    exit 1
}
Write-Log "Fichier le plus recent : $($latest.Name)"

# 2. Calculer le hash
$currentHash = Get-FileHashSHA256 -Path $latest.FullName
Write-Log "Hash SHA256 : $($currentHash.Substring(0,16))..."

# 3. Lire l'etat precedent
$state = Read-State

# 4. Detecter changement
$isNewVersion = ($state.approved_file -ne $latest.Name) -or ($state.approved_hash -ne $currentHash)

if ($isNewVersion) {
    Write-Log "NOUVELLE VERSION DETECTEE : $($latest.Name)" "WARN"
    Write-Log "  Ancienne : $($state.approved_file)" "WARN"
    Write-Log "  Nouvelle : $($latest.Name)" "WARN"

    if ($Approve) {
        # JP approuve explicitement
        $state.approved_file = $latest.Name
        $state.approved_hash = $currentHash
        $state.last_check = (Get-Date -Format "o")
        Save-State $state
        Write-Log "VERSION APPROUVEE PAR JP : $($latest.Name)" "OK"
        Show-Notification "AEGIS Dashboard V&V" "Version approuvee : $($latest.Name)" "Info"
    }
    elseif ($Check) {
        Write-Log "Mode Check : nouvelle version detectee, approbation requise" "WARN"
        Write-Log "  Commande : pwsh .\AEGIS-Dashboard.ps1 -Approve" "WARN"
        Show-Notification "AEGIS Dashboard — V&V REQUISE" "Nouvelle version : $($latest.Name)`nCommande : pwsh .\AEGIS-Dashboard.ps1 -Approve" "Warning"
        exit 0
    }
    else {
        # Lancement normal mais version non approuvee
        Write-Log "Version non approuvee — notification JP" "WARN"

        Add-Type -AssemblyName System.Windows.Forms
        $result = [System.Windows.Forms.MessageBox]::Show(
            "Nouvelle version detectee :`n$($latest.Name)`n`nHash : $($currentHash.Substring(0,16))...`n`nApprouver et ouvrir ?",
            "AEGIS Dashboard — Approbation V&V",
            "YesNoCancel",
            [System.Windows.Forms.MessageBoxIcon]::Question
        )

        switch ($result) {
            "Yes" {
                $state.approved_file = $latest.Name
                $state.approved_hash = $currentHash
                $state.last_check = (Get-Date -Format "o")
                Save-State $state
                Write-Log "VERSION APPROUVEE PAR JP (dialogue)" "OK"
            }
            "No" {
                Write-Log "JP a refuse la nouvelle version — ouverture ancienne version" "WARN"
                if ($state.approved_file -and (Test-Path (Join-Path $BaseDir $state.approved_file))) {
                    $latest = Get-Item (Join-Path $BaseDir $state.approved_file)
                    Write-Log "Fallback vers : $($latest.Name)"
                } else {
                    Write-Log "Aucune version approuvee precedente — abandon" "ERROR"
                    exit 1
                }
            }
            "Cancel" {
                Write-Log "JP a annule — pas d'ouverture" "WARN"
                exit 0
            }
        }
    }
} else {
    Write-Log "Version inchangee : $($latest.Name) — OK" "OK"
    $state.last_check = (Get-Date -Format "o")
    Save-State $state
}

# 5. Ouvrir dans Chrome (sauf mode Check)
if (-not $Check) {
    $chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
    if (-not (Test-Path $chromePath)) {
        $chromePath = "chrome"  # Fallback PATH
    }

    $fileUrl = "file:///$($latest.FullName -replace '\\','/')"
    Write-Log "Ouverture Chrome : $fileUrl"
    Start-Process $chromePath -ArgumentList $fileUrl

    if (-not $Silent) {
        Write-Log "Dashboard ouvert dans Chrome" "OK"
    }
}

Write-Log "=== Fin ==="
