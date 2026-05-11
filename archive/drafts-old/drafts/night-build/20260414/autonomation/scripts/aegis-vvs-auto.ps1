# ============================================================================
# DRAFT N4-bis -- Phase 1 VVS auto -- non execute en draft
# ============================================================================
# Auteur draft  : ACDC Code Claude Code CLI (Opus 4.6) -- Night Builder N4-bis
# Date draft    : 20260414
# Statut        : DRAFT pour audit Opus matinal -- NE PAS EXECUTER SANS VALIDATION JP
# Brief parent  : 20260413T2230_BRIEF_NIGHT-BUILDER-N4-BIS-AUTONOMATION-DRAFTS.md
# Couches DIVA  : C5 (VVS PDF visuel -- assertions automatisables uniquement)
# Ref protocole : L_T1330_01 (VVS 43 criteres), L_T1310_02 (memoire bergsonienne)
# ============================================================================
#
# HORS SCOPE EXPLICITE :
#   Les couches C6 (interpretation juridique fine), C7 (coherence business
#   actionnable) et C8 (signature juridique engageante) sont 100% JP
#   irreplacable et NE SONT PAS couvertes par ce script. Ce script automatise
#   uniquement les assertions visuelles et textuelles mecaniques de la grille
#   VVS 43 criteres.
#
# USAGE :
#   .\aegis-vvs-auto.ps1 -InputPdf "C:\Projects\aegis-ops\diagnostics\AEGIS-DIAGNOSTIC-20260413T1227-C3fix.pdf"
#   .\aegis-vvs-auto.ps1 -InputPdf ".\diagnostic.pdf" -OutputReport ".\rapport-vvs.txt"
#   .\aegis-vvs-auto.ps1 -InputPdf ".\diagnostic.pdf" -SkipRasterize
#
# SORTIES :
#   - Console : rapport VVS structure avec assertions PASS/FAIL + score global
#   - Fichier : si -OutputReport precise, le rapport est ecrit dans le fichier
#   - Code retour : 0 (score = 100%), 1 (95% <= score < 100%), 2 (score < 95%)
#
# DEPENDANCES :
#   - PowerShell 7+
#   - poppler-utils : pdfinfo, pdftotext, pdftoppm
#     Installation Windows : choco install poppler -y
#     Verification : pdfinfo --version
#
# CAS LIMITES DOCUMENTES :
#   - PDF protege par mot de passe : echec pdftotext, FAIL global
#   - PDF sans texte (scan image) : pdftotext vide, assertions texte echouent
#   - PDF < 3 pages : certaines assertions sautees (pas de milieu corps, pas de longtable)
#   - poppler-utils absent : pre-flight echoue, exit 2 avec message explicite
# ============================================================================

[CmdletBinding()]
param(
    [Parameter(Mandatory = $true, HelpMessage = "Chemin vers le fichier .pdf DIAGNOSTIC a analyser")]
    [ValidateScript({ Test-Path $_ -PathType Leaf })]
    [string]$InputPdf,

    [Parameter(Mandatory = $false, HelpMessage = "Chemin vers le fichier de sortie du rapport (optionnel)")]
    [string]$OutputReport = $null,

    [Parameter(Mandatory = $false, HelpMessage = "Passer la rasterisation pdftoppm (test texte uniquement)")]
    [switch]$SkipRasterize
)

# ----------------------------------------------------------------------------
# 0. Pre-flight : verification dependances poppler-utils
# ----------------------------------------------------------------------------
Write-Host "`n=== AEGIS VVS Auto -- Visual Verification & Validation ===" -ForegroundColor Cyan
Write-Host "Fichier source : $InputPdf"
Write-Host ""

$requiredTools = @("pdfinfo", "pdftotext")
if (-not $SkipRasterize) {
    $requiredTools += "pdftoppm"
}

$missingTools = @()
foreach ($tool in $requiredTools) {
    $found = Get-Command $tool -ErrorAction SilentlyContinue
    if (-not $found) {
        $missingTools += $tool
    }
}

if ($missingTools.Count -gt 0) {
    Write-Error "PRE-FLIGHT ECHEC : outils manquants : $($missingTools -join ', ')"
    Write-Error "Installation : choco install poppler -y (Windows) ou apt install poppler-utils (Linux)"
    exit 2
}

Write-Host "Pre-flight OK : $($requiredTools -join ', ') disponibles" -ForegroundColor Green

# ----------------------------------------------------------------------------
# 1. Extraction metadonnees PDF via pdfinfo
# ----------------------------------------------------------------------------
Write-Host "`n--- Phase 1 : Metadonnees PDF ---" -ForegroundColor Yellow

$pdfInfoRaw = & pdfinfo $InputPdf 2>&1
$pdfInfoText = $pdfInfoRaw -join "`n"

# Parser les metadonnees cles
$pdfTitle = if ($pdfInfoText -match "Title:\s+(.+)") { $Matches[1].Trim() } else { "" }
$pdfPages = if ($pdfInfoText -match "Pages:\s+(\d+)") { [int]$Matches[1] } else { 0 }
$pdfCreator = if ($pdfInfoText -match "Creator:\s+(.+)") { $Matches[1].Trim() } else { "" }
$pdfProducer = if ($pdfInfoText -match "Producer:\s+(.+)") { $Matches[1].Trim() } else { "" }

Write-Host "  Title    : $pdfTitle"
Write-Host "  Pages    : $pdfPages"
Write-Host "  Creator  : $pdfCreator"
Write-Host "  Producer : $pdfProducer"

# ----------------------------------------------------------------------------
# 2. Extraction texte complet via pdftotext
# ----------------------------------------------------------------------------
Write-Host "`n--- Phase 2 : Extraction texte ---" -ForegroundColor Yellow

$tempTextFile = [System.IO.Path]::GetTempFileName()
& pdftotext -layout $InputPdf $tempTextFile 2>&1 | Out-Null

$pdfText = ""
if (Test-Path $tempTextFile) {
    $pdfText = Get-Content -Path $tempTextFile -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
    Remove-Item -Path $tempTextFile -Force -ErrorAction SilentlyContinue
}

$textLength = if ($pdfText) { $pdfText.Length } else { 0 }
Write-Host "  Texte extrait : $textLength caracteres"

# ----------------------------------------------------------------------------
# 3. Rasterisation pages cles via pdftoppm (si pas SkipRasterize)
# ----------------------------------------------------------------------------
$rasterDir = $null
if (-not $SkipRasterize -and $pdfPages -gt 0) {
    Write-Host "`n--- Phase 3 : Rasterisation pages cles ---" -ForegroundColor Yellow

    $rasterDir = Join-Path ([System.IO.Path]::GetTempPath()) "aegis-vvs-$(Get-Date -Format 'yyyyMMddHHmmss')"
    New-Item -ItemType Directory -Path $rasterDir -Force | Out-Null

    # Pages cles a rasteriser : cover (1), TOC (2), milieu corps, avant-derniere, derniere
    $pagesToRaster = @(1)
    if ($pdfPages -ge 2) { $pagesToRaster += 2 }
    if ($pdfPages -ge 6) { $pagesToRaster += [math]::Floor($pdfPages / 2) }
    if ($pdfPages -ge 4) { $pagesToRaster += ($pdfPages - 1) }
    $pagesToRaster += $pdfPages
    $pagesToRaster = $pagesToRaster | Select-Object -Unique | Sort-Object

    foreach ($pageNum in $pagesToRaster) {
        $outputPrefix = Join-Path $rasterDir "page-$pageNum"
        & pdftoppm -f $pageNum -l $pageNum -png -r 150 $InputPdf $outputPrefix 2>&1 | Out-Null
    }

    $rasterFiles = Get-ChildItem -Path $rasterDir -Filter "*.png" -ErrorAction SilentlyContinue
    Write-Host "  Pages rasterisees : $($rasterFiles.Count) fichiers PNG dans $rasterDir"
} else {
    Write-Host "`n--- Phase 3 : Rasterisation SAUTEE (-SkipRasterize ou 0 pages) ---" -ForegroundColor Yellow
}

# ----------------------------------------------------------------------------
# 4. Assertions automatisees VVS
# ----------------------------------------------------------------------------
Write-Host "`n--- Phase 4 : Assertions VVS automatisees ---" -ForegroundColor Yellow

$assertions = [System.Collections.ArrayList]::new()

# --- Assertion A1 : Cover -- titre PDF contient "AEGIS" ---
# Ref VVS L_T1330_01 : grille 1 critere 1 (identification document)
$a1Pass = $pdfTitle -match "(?i)AEGIS"
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A1"
    Grille  = "G1-Cover"
    Desc    = "Metadata Title contient 'AEGIS'"
    RefVVS  = "L_T1330_01 G1-C1"
    Status  = if ($a1Pass) { "PASS" } else { "FAIL" }
    Detail  = "Title='$pdfTitle'"
})

# --- Assertion A2 : Cover -- texte contient piliers symbiotiques ---
# Ref VVS L_T1330_01 : grille 1 critere 3 (identification methodologie)
$a2Pass = $pdfText -match "(?i)(5\s+piliers?\s+symbiotiques?|5\s+symbiotic\s+regulatory\s+pillars?)"
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A2"
    Grille  = "G1-Cover"
    Desc    = "Texte contient '5 piliers symbiotiques' ou '5 symbiotic regulatory pillars'"
    RefVVS  = "L_T1330_01 G1-C3"
    Status  = if ($a2Pass) { "PASS" } else { "FAIL" }
    Detail  = ""
})

# --- Assertion A3 : TOC -- aucune entree parasite de generation ---
# Ref VVS L_T1330_01 : grille 2 critere 1 (proprete TOC)
$parasitePatterns = @("Genere le", "Generated on", "Modele :", "Model:", "Tokens :", "Tokens:", "Duree :", "Duration:", "stop_reason")
$parasitesFound = @()
foreach ($pattern in $parasitePatterns) {
    if ($pdfText -match [regex]::Escape($pattern)) {
        $parasitesFound += $pattern
    }
}
$a3Pass = $parasitesFound.Count -eq 0
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A3"
    Grille  = "G2-TOC"
    Desc    = "Aucune entree parasite de generation dans le texte (metadata API visibles)"
    RefVVS  = "L_T1330_01 G2-C1"
    Status  = if ($a3Pass) { "PASS" } else { "FAIL" }
    Detail  = if (-not $a3Pass) { "Parasites trouves : $($parasitesFound -join ', ')" } else { "" }
})

# --- Assertion A4 : Footer -- pattern numero diagnostic ---
# Ref VVS L_T1330_01 : grille 3 critere 2 (identification unique)
$a4Pass = $pdfText -match "AEGIS-DIAG-2026-"
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A4"
    Grille  = "G3-Footer"
    Desc    = "Footer contient pattern 'AEGIS-DIAG-2026-'"
    RefVVS  = "L_T1330_01 G3-C2"
    Status  = if ($a4Pass) { "PASS" } else { "FAIL" }
    Detail  = ""
})

# --- Assertion A5 : Footer -- pagination Page X / Y ---
# Ref VVS L_T1330_01 : grille 3 critere 3 (pagination)
$a5Pass = $pdfText -match "Page\s+\d+\s*/\s*\d+"
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A5"
    Grille  = "G3-Footer"
    Desc    = "Footer contient pagination 'Page X / Y'"
    RefVVS  = "L_T1330_01 G3-C3"
    Status  = if ($a5Pass) { "PASS" } else { "FAIL" }
    Detail  = ""
})

# --- Assertion A6 : Signature -- mention fin de diagnostic ---
# Ref VVS L_T1330_01 : grille 5 critere 1 (cloture document)
$a6Pass = $pdfText -match "(?i)(Fin\s+du\s+diagnostic|End\s+of\s+diagnostic)"
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A6"
    Grille  = "G5-Signature"
    Desc    = "Texte contient 'Fin du diagnostic' ou 'End of diagnostic'"
    RefVVS  = "L_T1330_01 G5-C1"
    Status  = if ($a6Pass) { "PASS" } else { "FAIL" }
    Detail  = ""
})

# --- Assertion A7 : Pas de jargon interne interdit (noms propres) ---
# Ref VVS L_T1330_01 : grille 4 critere 5 (proprete terminologique)
$jargonNoms = @("Pearl", "Simon", "Damasio", "Morin")
$jargonFound = @()
foreach ($nom in $jargonNoms) {
    if ($pdfText -match "\b$nom\b") {
        $jargonFound += $nom
    }
}
$a7Pass = $jargonFound.Count -eq 0
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A7"
    Grille  = "G4-Body"
    Desc    = "Aucune occurrence de jargon interne interdit (noms propres : Pearl, Simon, Damasio, Morin)"
    RefVVS  = "L_T1330_01 G4-C5"
    Status  = if ($a7Pass) { "PASS" } else { "FAIL" }
    Detail  = if (-not $a7Pass) { "Jargon trouve : $($jargonFound -join ', ')" } else { "" }
})

# --- Assertion A8 : Pas de jargon interne interdit (acronymes/termes) ---
# Ref VVS L_T1330_01 : grille 4 critere 6 (proprete terminologique)
$jargonTermes = @("SAAIBOM", "GCI", "EISaaS", "maieutique", "hermeneutique")
$termesFound = @()
foreach ($terme in $jargonTermes) {
    if ($pdfText -match "(?i)\b$terme\b") {
        $termesFound += $terme
    }
}
$a8Pass = $termesFound.Count -eq 0
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A8"
    Grille  = "G4-Body"
    Desc    = "Aucune occurrence de termes internes interdits (SAAIBOM, GCI, EISaaS, maieutique, hermeneutique)"
    RefVVS  = "L_T1330_01 G4-C6"
    Status  = if ($a8Pass) { "PASS" } else { "FAIL" }
    Detail  = if (-not $a8Pass) { "Termes trouves : $($termesFound -join ', ')" } else { "" }
})

# --- Assertion A9 : Nombre de pages coherent (minimum 8 pages pour un DIAGNOSTIC) ---
# Ref VVS L_T1330_01 : grille 1 critere 4 (completude document)
$a9Pass = $pdfPages -ge 8
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A9"
    Grille  = "G1-Cover"
    Desc    = "PDF contient au moins 8 pages (minimum attendu pour un DIAGNOSTIC complet)"
    RefVVS  = "L_T1330_01 G1-C4"
    Status  = if ($a9Pass) { "PASS" } else { "FAIL" }
    Detail  = "Pages=$pdfPages"
})

# --- Assertion A10 : Texte non vide (detection PDF scan sans OCR) ---
# Ref VVS L_T1330_01 : grille 2 critere 4 (lisibilite texte)
$a10Pass = $textLength -gt 1000
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A10"
    Grille  = "G2-TOC"
    Desc    = "Texte extrait depasse 1000 caracteres (PDF non-scan avec contenu textuel)"
    RefVVS  = "L_T1330_01 G2-C4"
    Status  = if ($a10Pass) { "PASS" } else { "FAIL" }
    Detail  = "Longueur=$textLength caracteres"
})

# --- Assertion A11 : Presence du nom client ou du secteur dans le corps ---
# Ref VVS L_T1330_01 : grille 4 critere 1 (personnalisation client)
# Note : cette assertion est permissive -- elle verifie seulement la presence
# de mots-cles generiques de personnalisation. La validation C7 (coherence
# business actionnable) reste 100% JP.
$personalPatterns = @("client", "secteur", "sector", "industrie", "industry", "produit", "product", "machine")
$personalFound = 0
foreach ($p in $personalPatterns) {
    if ($pdfText -match "(?i)\b$p\b") { $personalFound++ }
}
$a11Pass = $personalFound -ge 3
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A11"
    Grille  = "G4-Body"
    Desc    = "Texte contient au moins 3 mots-cles de personnalisation client (client, secteur, industrie, produit, machine)"
    RefVVS  = "L_T1330_01 G4-C1"
    Status  = if ($a11Pass) { "PASS" } else { "FAIL" }
    Detail  = "Mots-cles trouves : $personalFound / $($personalPatterns.Count)"
})

# --- Assertion A12 : Presence sections structurantes (risques, plan d'action) ---
# Ref VVS L_T1330_01 : grille 4 critere 2 (structure logique)
$sectionPatterns = @(
    "(?i)(risques?\s+(identifies?|principaux))|(?i)(identified\s+risks?|key\s+risks?)",
    "(?i)(plan\s+d.action)|(?i)(action\s+plan)",
    "(?i)(recommandations?)|(?i)(recommendations?)"
)
$sectionsFound = 0
foreach ($sp in $sectionPatterns) {
    if ($pdfText -match $sp) { $sectionsFound++ }
}
$a12Pass = $sectionsFound -ge 2
[void]$assertions.Add([PSCustomObject]@{
    Id      = "A12"
    Grille  = "G4-Body"
    Desc    = "Texte contient au moins 2 sections structurantes (risques, plan d'action, recommandations)"
    RefVVS  = "L_T1330_01 G4-C2"
    Status  = if ($a12Pass) { "PASS" } else { "FAIL" }
    Detail  = "Sections trouvees : $sectionsFound / $($sectionPatterns.Count)"
})

# ----------------------------------------------------------------------------
# 5. Calcul du score global
# ----------------------------------------------------------------------------
$passCount = ($assertions | Where-Object { $_.Status -eq "PASS" }).Count
$failCount = ($assertions | Where-Object { $_.Status -eq "FAIL" }).Count
$totalCount = $assertions.Count

if ($totalCount -gt 0) {
    $score = [math]::Round($passCount / $totalCount * 100, 1)
} else {
    $score = 0
}

# ----------------------------------------------------------------------------
# 6. Generation du rapport
# ----------------------------------------------------------------------------
$reportLines = [System.Collections.ArrayList]::new()

[void]$reportLines.Add("=== AEGIS VVS Auto -- Visual Verification & Validation ===")
[void]$reportLines.Add("Fichier source : $InputPdf")
[void]$reportLines.Add("Date execution : $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')")
[void]$reportLines.Add("Pages PDF      : $pdfPages")
[void]$reportLines.Add("Texte extrait  : $textLength caracteres")
[void]$reportLines.Add("")
[void]$reportLines.Add("HORS SCOPE : couches C6 (interpretation juridique), C7 (coherence business), C8 (signature)")
[void]$reportLines.Add("")
[void]$reportLines.Add("--- ASSERTIONS VVS AUTOMATISEES ($totalCount) ---")
[void]$reportLines.Add("")

foreach ($a in $assertions) {
    $statusTag = if ($a.Status -eq "PASS") { "[PASS]" } else { "[FAIL]" }
    [void]$reportLines.Add("$($a.Id) $statusTag $($a.Desc)")
    [void]$reportLines.Add("   Grille : $($a.Grille) | Ref : $($a.RefVVS)")
    if ($a.Detail) {
        [void]$reportLines.Add("   Detail : $($a.Detail)")
    }
    [void]$reportLines.Add("")
}

[void]$reportLines.Add("--- SYNTHESE ---")
[void]$reportLines.Add("SUMMARY: $totalCount assertions, $passCount PASS, $failCount FAIL")
[void]$reportLines.Add("SCORE: $passCount/$totalCount = ${score}%")

if ($failCount -gt 0) {
    [void]$reportLines.Add("")
    [void]$reportLines.Add("--- ASSERTIONS EN ECHEC ---")
    foreach ($a in ($assertions | Where-Object { $_.Status -eq "FAIL" })) {
        [void]$reportLines.Add("  $($a.Id) FAIL: $($a.Desc)")
        if ($a.Detail) {
            [void]$reportLines.Add("       Detail: $($a.Detail)")
        }
    }
}

$reportText = $reportLines -join "`n"

# Affichage console
Write-Host "`n--- RESULTATS VVS ---" -ForegroundColor Cyan
foreach ($a in $assertions) {
    $color = if ($a.Status -eq "PASS") { "Green" } else { "Red" }
    Write-Host "  $($a.Id) [$($a.Status)] $($a.Desc)" -ForegroundColor $color
    if ($a.Detail) {
        Write-Host "       $($a.Detail)" -ForegroundColor DarkGray
    }
}
Write-Host ""
Write-Host "SUMMARY: $totalCount assertions, $passCount PASS, $failCount FAIL" -ForegroundColor Cyan
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

# Nettoyage rasterisation temporaire
if ($rasterDir -and (Test-Path $rasterDir)) {
    Remove-Item -Path $rasterDir -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "Fichiers temporaires rasterisation nettoyes." -ForegroundColor DarkGray
}

# ----------------------------------------------------------------------------
# 7. Code retour
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
