# ============================================================================
# DRAFT N4-bis -- Phase 1 fact-check URLs CELEX -- non execute en draft
# ============================================================================
# Auteur draft  : ACDC Code Claude Code CLI (Opus 4.6) -- Night Builder N4-bis
# Date draft    : 20260414
# Statut        : DRAFT pour audit Opus matinal -- NE PAS EXECUTER SANS VALIDATION JP
# Brief parent  : 20260413T2230_BRIEF_NIGHT-BUILDER-N4-BIS-AUTONOMATION-DRAFTS.md
# Couches DIVA  : C1 (validation URLs CELEX) + C3 partiel (dates dans URLs)
# Ref protocole : L_T1015_02 (pivot scientifique -- preuve quantitative)
# ============================================================================
#
# USAGE :
#   .\aegis-fact-check-urls.ps1 -InputMd "C:\Projects\aegis-ops\diagnostics\AEGIS-DIAGNOSTIC-20260413T1227-C3fix.md"
#   .\aegis-fact-check-urls.ps1 -InputMd ".\diagnostic.md" -OutputReport ".\rapport-urls.txt" -VerboseOutput
#   .\aegis-fact-check-urls.ps1 -InputMd ".\diagnostic.md" -TimeoutSec 15
#
# SORTIES :
#   - Console : rapport texte structure PASS/FAIL par URL + score global
#   - Fichier : si -OutputReport precise, le rapport est ecrit dans le fichier
#   - Code retour : 0 (score = 100%), 1 (95% <= score < 100%), 2 (score < 95%)
#
# DEPENDANCES : aucune (PowerShell 7+ natif, Invoke-WebRequest built-in)
#
# CAS LIMITES DOCUMENTES :
#   - URL malformee (ne match pas le pattern CELEX) : ignoree avec warning
#   - Redirect HTTP 301/302 : suivie automatiquement par Invoke-WebRequest
#   - Timeout depassement : marque FAIL avec code "TIMEOUT"
#   - Serveur EUR-Lex indisponible : marque FAIL avec code "CONNECTION_ERROR"
#   - Fichier .md vide ou sans URLs CELEX : rapport vide, score 0/0, exit 0
#   - URLs dupliquees dans le .md : deduplication automatique
# ============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, HelpMessage = "Chemin vers le fichier .md DIAGNOSTIC a analyser")]
    [ValidateScript({ Test-Path $_ -PathType Leaf })]
    [string]$InputMd,

    [Parameter(Mandatory = $false, HelpMessage = "Chemin vers le fichier de sortie du rapport (optionnel)")]
    [string]$OutputReport = $null,

    [Parameter(Mandatory = $false, HelpMessage = "Timeout en secondes pour chaque requete HTTP")]
    [ValidateRange(1, 60)]
    [int]$TimeoutSec = 10,

    [Parameter(Mandatory = $false, HelpMessage = "Affiche les details de chaque requete HTTP")]
    [switch]$VerboseOutput
)

# ----------------------------------------------------------------------------
# 1. Lecture du fichier .md
# ----------------------------------------------------------------------------
Write-Host "`n=== AEGIS Fact-Check URLs CELEX ===" -ForegroundColor Cyan
Write-Host "Fichier source : $InputMd"
Write-Host "Timeout HTTP   : ${TimeoutSec}s"
Write-Host ""

try {
    $content = Get-Content -Path $InputMd -Raw -Encoding UTF8 -ErrorAction Stop
} catch {
    Write-Error "ERREUR : impossible de lire le fichier '$InputMd' -- $_"
    exit 2
}

if ([string]::IsNullOrWhiteSpace($content)) {
    Write-Warning "Le fichier '$InputMd' est vide. Aucune URL a verifier."
    exit 0
}

# ----------------------------------------------------------------------------
# 2. Extraction URLs CELEX via regex
# ----------------------------------------------------------------------------
# Pattern : URLs EUR-Lex avec format CELEX standard
# Couvre les variantes /FR/TXT/, /EN/TXT/, /FR/ALL/, etc.
$celexPattern = 'https?://eur-lex\.europa\.eu/legal-content/[A-Z]{2}/[A-Z]+/[^\s\)\]\}>\"]+'

$matchesFound = [regex]::Matches($content, $celexPattern)

if ($matchesFound.Count -eq 0) {
    Write-Host "Aucune URL CELEX trouvee dans le fichier." -ForegroundColor Yellow
    Write-Host "SUMMARY: 0 URLs total, 0 PASS, 0 FAIL"
    Write-Host "SCORE: N/A (aucune URL)"
    exit 0
}

# Deduplication et tri
$urls = $matchesFound | ForEach-Object { $_.Value.TrimEnd('.', ',', ';', ')') } | Select-Object -Unique | Sort-Object

Write-Host "URLs CELEX trouvees : $($urls.Count) (uniques)" -ForegroundColor Green
Write-Host ""

# ----------------------------------------------------------------------------
# 3. Verification HTTP de chaque URL
# ----------------------------------------------------------------------------
$results = [System.Collections.ArrayList]::new()
$index = 0

foreach ($url in $urls) {
    $index++
    $prefix = "[$index/$($urls.Count)]"

    try {
        $response = Invoke-WebRequest `
            -Uri $url `
            -TimeoutSec $TimeoutSec `
            -UseBasicParsing `
            -MaximumRedirection 5 `
            -ErrorAction Stop

        $statusCode = $response.StatusCode
        $status = "PASS"
        $detail = "HTTP $statusCode"

        if ($VerboseOutput) {
            Write-Host "$prefix $url -> PASS (HTTP $statusCode)" -ForegroundColor Green
        }
    } catch {
        $status = "FAIL"
        $statusCode = $null
        $detail = ""

        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
            $detail = "HTTP $statusCode"
        } elseif ($_.Exception.Message -match "timeout|timed out") {
            $detail = "TIMEOUT"
        } else {
            $detail = "CONNECTION_ERROR"
        }

        if ($VerboseOutput) {
            Write-Host "$prefix $url -> FAIL ($detail)" -ForegroundColor Red
        }
    }

    [void]$results.Add([PSCustomObject]@{
        Index      = $index
        Url        = $url
        Status     = $status
        StatusCode = $statusCode
        Detail     = $detail
    })
}

# ----------------------------------------------------------------------------
# 4. Synthese et score
# ----------------------------------------------------------------------------
$passCount = ($results | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($results | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $results.Count

if ($totalCount -gt 0) {
    $score = [math]::Round($passCount / $totalCount * 100, 1)
} else {
    $score = 0
}

# ----------------------------------------------------------------------------
# 5. Generation du rapport texte
# ----------------------------------------------------------------------------
$reportLines = [System.Collections.ArrayList]::new()

[void]$reportLines.Add("=== AEGIS Fact-Check URLs CELEX ===")
[void]$reportLines.Add("Fichier source : $InputMd")
[void]$reportLines.Add("Date execution : $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')")
[void]$reportLines.Add("Timeout HTTP   : ${TimeoutSec}s")
[void]$reportLines.Add("")
[void]$reportLines.Add("--- RESULTATS DETAILLES ---")

foreach ($r in $results) {
    [void]$reportLines.Add("[$($r.Index)/$totalCount] $($r.Url) -> $($r.Status) ($($r.Detail))")
}

[void]$reportLines.Add("")
[void]$reportLines.Add("--- SYNTHESE ---")
[void]$reportLines.Add("SUMMARY: $totalCount URLs total, $passCount PASS, $failCount FAIL")
[void]$reportLines.Add("SCORE: $passCount/$totalCount = ${score}%")

# Lister les URLs en echec si present
if ($failCount -gt 0) {
    [void]$reportLines.Add("")
    [void]$reportLines.Add("--- URLs EN ECHEC ---")
    foreach ($r in ($results | Where-Object { $_.Status -eq "FAIL" })) {
        [void]$reportLines.Add("  FAIL: $($r.Url) ($($r.Detail))")
    }
}

$reportText = $reportLines -join "`n"

# Affichage console
Write-Host ""
Write-Host "--- SYNTHESE ---" -ForegroundColor Cyan
foreach ($r in $results) {
    $color = if ($r.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "[$($r.Index)/$totalCount] $($r.Url) -> $($r.Status) ($($r.Detail))" -ForegroundColor $color
}
Write-Host ""
Write-Host "SUMMARY: $totalCount URLs total, $passCount PASS, $failCount FAIL" -ForegroundColor Cyan
Write-Host "SCORE: $passCount/$totalCount = ${score}%" -ForegroundColor $(if ($score -ge 95) { "Green" } elseif ($score -ge 80) { "Yellow" } else { "Red" })

# Ecriture fichier si OutputReport precise
if (-not [string]::IsNullOrWhiteSpace($OutputReport)) {
    try {
        $reportText | Out-File -FilePath $OutputReport -Encoding UTF8 -Force
        Write-Host "`nRapport ecrit dans : $OutputReport" -ForegroundColor Green
    } catch {
        Write-Error "ERREUR : impossible d'ecrire le rapport dans '$OutputReport' -- $_"
    }
}

# ----------------------------------------------------------------------------
# 6. Code retour
# ----------------------------------------------------------------------------
if ($score -eq 100) {
    Write-Host "`nRESULTAT : PASS COMPLET (100%)" -ForegroundColor Green
    exit 0
} elseif ($score -ge 95) {
    Write-Host "`nRESULTAT : PASS PARTIEL (${score}% >= 95%)" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "`nRESULTAT : ECHEC (${score}% < 95%)" -ForegroundColor Red
    exit 2
}
