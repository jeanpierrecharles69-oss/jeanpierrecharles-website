# Script de Renommage Batch - Conformité AFRS v2.1

# Liste des fichiers à renommer (ajout préfixe AFRS)
$files = @(
    "jeanpierrecharles_AJUSTEMENTS-TECHNIQUES-FINALISES.md",
    "jeanpierrecharles_ANALYSE-SOLUTIONS-MESSAGING-RGPD.md",
    "jeanpierrecharles_AUDIT-SITE-PRODUCTION.md",
    "jeanpierrecharles_CHECKLIST-CONFIGURATION.md",
    "jeanpierrecharles_CHECKLIST-PRE-DEPLOIEMENT.md",
    "jeanpierrecharles_CONTENU-LINKEDIN-PRET.md",
    "jeanpierrecharles_GLOSSAIRE-TECHNIQUE-EU-REGULATIONS.md",
    "jeanpierrecharles_GUIDE-ALIMENTER-BASE-REGLEMENTS.md",
    "jeanpierrecharles_GUIDE-AUTOMATISATION-GOOGLE-DRIVE.md",
    "jeanpierrecharles_GUIDE-CONFIGURATION-GEMINI-API.md",
    "jeanpierrecharles_GUIDE-DEMARRAGE.md",
    "jeanpierrecharles_GUIDE-GANDI-VERCEL-DNS.md",
    "jeanpierrecharles_GUIDE-GITHUB-VERCEL.md",
    "jeanpierrecharles_GUIDE-GOOGLE-CLOUD-CONSOLE.md",
    "jeanpierrecharles_GUIDE-GOOGLE-SEARCH-GROUNDING.md",
    "jeanpierrecharles_GUIDE-OAUTH-2.0-COMPLET.md",
    "jeanpierrecharles_GUIDE-TEST-EXPRESS.md",
    "jeanpierrecharles_JOURNAL-SESSION-16-JANVIER-2026.md",
    "jeanpierrecharles_OPTIMISATIONS-UX-ASSISTANT.md",
    "jeanpierrecharles_PLAN-TRADUCTION-AEGIS-EN.md",
    "jeanpierrecharles_POINT-DE-REPRISE-17JAN2026.md",
    "jeanpierrecharles_QUICK-START.md",
    "jeanpierrecharles_RAPPORT-DIAGNOSTIC-PLATEFORME.md",
    "jeanpierrecharles_README.md",
    "jeanpierrecharles_RECAPITULATIF-OAUTH-ET-API-KEY.md",
    "jeanpierrecharles_RECAPITULATIF-PHASE-1.md",
    "jeanpierrecharles_RECAPITULATIF-PHASE-2.md",
    "jeanpierrecharles_SESSION-RECAP-17JAN2026.md",
    "jeanpierrecharles_STRATEGIE-COMMUNICATION-RESEAUX.md",
    "jeanpierrecharles_STRATEGIE-CONTENU-MONETISATION.md",
    "jeanpierrecharles_STRATEGIE-OUTREMERS.md",
    "jeanpierrecharles_STRATEGIE-SECTEUR-CONSTRUCTION.md",
    "jeanpierrecharles_VALIDATION-TEMPLATE-AI-ACT-EN.md",
    "jeanpierrecharles_VERIFICATION-FINALE-LANCEMENT.md",
    "jeanpierrecharles_WORKFLOW-PARALLELE-VALIDATION.md"
)

# Renommer chaque fichier
foreach ($file in $files) {
    if (Test-Path $file) {
        $newName = $file -replace "jeanpierrecharles_", "jeanpierrecharles_AFRS_"
        git mv $file $newName
        Write-Host "✅ Renommé: $file → $newName"
    }
}

Write-Host "`n✅ Renommage terminé. Total: $($files.Count) fichiers"
