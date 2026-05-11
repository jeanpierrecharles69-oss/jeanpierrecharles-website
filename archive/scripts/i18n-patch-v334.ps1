# i18n-patch-v334.ps1 — Patch ciblé Z1 heroSub + heroLinkedInCta
# Usage: cd C:\Projects\jeanpierrecharles ; .\i18n-patch-v334.ps1

$file = "src\components\homepage\i18n.ts"
$content = Get-Content $file -Raw -Encoding UTF8

# === PATCH 1: FR heroSub ===
$oldFR = 'heroSub: "Des volants airbag Toyota aux batteries TGV 1500V — combinés à l''intelligence artificielle réglementaire pour accompagner vos ETI industrielles de la veille normative à la mise en conformité opérationnelle.",'
$newFR = @"
heroSub: "32 ans d'expertise R&D industrielle — de la conception à la production commerciale en série. AEGIS Intelligence transforme ce capital terrain en intelligence réglementaire actionnable pour piloter votre conformité EU.",
        heroLinkedInCta: "Découvrir le parcours terrain sur LinkedIn →",
"@
$content = $content.Replace($oldFR, $newFR)

# === PATCH 2: EN heroSub ===
$oldEN = 'heroSub: "From Toyota airbag steering wheels to TGV 1500V batteries — mechatronic product development combined with regulatory AI to support your industrial mid-market companies from regulatory watch to operational compliance.",'
$newEN = @"
heroSub: "32 years of industrial R&D expertise — from design to commercial series production. AEGIS Intelligence transforms this field capital into actionable regulatory intelligence to pilot your EU compliance.",
        heroLinkedInCta: "Discover the field experience on LinkedIn →",
"@
$content = $content.Replace($oldEN, $newEN)

# === WRITE ===
$utf8BOM = New-Object System.Text.UTF8Encoding $true
[System.IO.File]::WriteAllText((Resolve-Path $file), $content, $utf8BOM)

# === VERIFY ===
$check = Get-Content $file -Raw -Encoding UTF8
if ($check -match "capital terrain" -and $check -match "field capital" -and $check -match "heroLinkedInCta") {
    Write-Host "PASS — i18n.ts patched (heroSub FR+EN + heroLinkedInCta FR+EN)" -ForegroundColor Green
} else {
    Write-Host "FAIL — Patch incomplete, vérifier manuellement" -ForegroundColor Red
}
