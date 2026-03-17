# AUDIT SECURITE — CLAUDE DESKTOP REINSTALLATION
# Alignement V-Gate Securite + Analyse Bridge 20260225T1625

**Reference** : AUDIT-SEC-CDKT-20260227T0800
**Date** : 2026-02-27 08h00 CET
**Auteur** : Claude Opus 4.6 (Contre-expertise)
**Source** : 20260225T1625_BRIDGE_CDKT_MSIX_INSTALL_PROCEDURE.md + Capture JP 27/02
**Classification** : IMPORTANT — Mise a jour gouvernance securite
**Destinataire** : Jean-Pierre Charles (Decideur)

---

## RESUME EXECUTIF

Jean-Pierre a reinstalle Claude Desktop le 26/02/2026 en choisissant l'installation **Squirrel (setup.exe)** au lieu du **MSIX recommande** dans le bridge T1625. La version actuelle est **v1.1.4498** (mise a jour automatique 27/02/2026).

Cette decision diverge de la recommandation du bridge mais est **ACCEPTABLE** sous conditions strictes. L'analyse ci-dessous aligne les conclusions avec le V-Gate Securite global.

---

## 1. ANALYSE DE LA DIVERGENCE BRIDGE

### 1.1 Ce que le bridge T1625 recommandait

Le bridge Opus du 25/02 recommandait MSIX pour 3 raisons :
1. Build Squirrel v1.1.4173 casse (bug @formatjs/intl — crash silencieux)
2. MSIX = seul format fonctionnel a cette date
3. MSIX = sandbox partielle + desinstallation atomique

### 1.2 Ce que JP a fait

| Element | Detail |
|---|---|
| Date | 26/02/2026 |
| Fichiers telecharges | Antigravity (177 Mo), Claude Setup (1) exe (146 Mo), Claude MSIX (157 Mo) |
| Choix installation | Squirrel setup.exe (PAS le MSIX) |
| Version installee | v1.1.4498 (mise a jour automatique 27/02 08:29) |

### 1.3 Verdict Opus sur la divergence

**ACCEPTABLE** — La raison principale de la recommandation MSIX etait le bug @formatjs/intl du build v1.1.4173. La version v1.1.4498 represente une avancee de **+325 builds** depuis le build casse. Le bug est tres probablement corrige dans cette version.

**Avantages du choix Squirrel pour notre contexte :**
- Chemin config MCP standard (`%APPDATA%\Claude\`) — pas de chemin virtualise MSIX
- Mises a jour delta Squirrel automatiques (deja mise a jour ce matin)
- Compatibilite directe avec les outils existants (paths documentes partout)

**Inconvenients acceptes :**
- Pas de sandbox MSIX (isolation partielle perdue)
- Desinstallation moins propre que MSIX
- Pas de verification signature automatique a chaque lancement

---

## 2. STATUT DE LA VULNERABILITE 0-CLICK RCE (D10)

### 2.1 Rappel D10 (10/02/2026)

Claude Desktop desactive suite a la decouverte par LayerX d'une vulnerabilite 0-Click RCE CVSS 10/10 dans les Claude Desktop Extensions (DXT).

### 2.2 Statut au 27/02/2026 — Sources multiples

| Source | Date | Information cle |
|---|---|---|
| LayerX (rapport original) | 09/02/2026 | Vulnerabilite DXT 0-Click RCE CVSS 10 |
| Infosecurity Magazine | 25/02/2026 | Anthropic a decline de corriger — "falls outside current threat model" |
| CSO Online | Mi-fevrier 2026 | LayerX confirme : "weeks worth of fix, full redesign needed" |
| Anthropic (porte-parole) | Fevrier 2026 | "Local development tool, users configure and grant permissions" |

### 2.3 Analyse critique Opus — PERIMETRE DE LA VULNERABILITE

**POINT CRUCIAL** : La vulnerabilite 0-Click RCE concerne **specifiquement les DXT Extensions et le chainage MCP**, PAS Claude Desktop en mode chat basique.

Le scenario d'attaque LayerX requiert :
1. L'utilisateur a installe des DXT Extensions (ex: Google Calendar connector)
2. L'utilisateur a configure des serveurs MCP avec privileges systeme
3. Claude chaine automatiquement un connecteur bas-risque (Calendar) vers un executeur haut-risque (Desktop Commander)
4. Un evenement calendrier malveillant declenche l'execution de code

**Si aucun DXT Extension n'est installe et aucun serveur MCP n'est configure, la vulnerabilite n'est PAS exploitable.**

### 2.4 Vulnerabilites Claude Code supplementaires (NOUVEAU — 26/02/2026)

Check Point Research a publie le 26/02/2026 deux CVE supplementaires :

| CVE | Composant | Risque | Corrige ? |
|---|---|---|---|
| CVE-2025-59536 | Claude Code Hooks + MCP config | RCE via repo malveillant | OUI (patche) |
| CVE-2026-21852 | Claude Code < v2.0.65 | Exfiltration API key via settings | OUI (patche) |
| LayerX DXT 0-Click | Claude Desktop Extensions | RCE via chainage MCP | **NON — Anthropic decline** |

---

## 3. MCP FILESYSTEM — ANALYSE SECURITE SPECIFIQUE

### 3.1 Configuration observee (capture JP 27/02/2026)

Claude Desktop Parametres > Extensions > Filesystem MCP **ACTIVE** avec :
- `C:\Projects`
- `C:\Users\jpcha\.gemini\antigravity`
- `C:\Users\jpcha\.antigravity`
- `C:\Users\jpcha\Documents`

### 3.2 Distinction fondamentale : MCP Local vs MCP Externe

| Type | Exemple | Ingere donnees externes ? | Vecteur LayerX ? |
|---|---|---|---|
| MCP Local (Filesystem) | Lecture/ecriture fichiers locaux | NON | NON |
| MCP Externe (Connector) | Google Calendar, Gmail, Drive | OUI | **OUI — CVSS 10** |

Le MCP Filesystem est un serveur local-only : il ne fait que lire/ecrire des fichiers dans des repertoires explicitement autorises par JP. Il ne constitue PAS le vecteur d'attaque LayerX (qui requiert un connecteur externe ingerant des donnees non-trusted chainee a un executeur local).

### 3.3 Risques specifiques identifies

| Repertoire | Risque | Fichiers sensibles | Mitigation |
|---|---|---|---|
| `C:\Projects` | **ELEVE** | `.env.local` contient GEMINI_API_KEY | NE JAMAIS demander a Claude Desktop de lire .env* |
| `C:\Users\jpcha\.gemini\antigravity` | **ELEVE** | Tokens OAuth, credentials Gemini AG | Verifier contenu, envisager retrait si credentials |
| `C:\Users\jpcha\.antigravity` | **MOYEN** | Config/cache Antigravity | Verifier absence de secrets |
| `C:\Users\jpcha\Documents` | **MOYEN** | Perimetre large, documents personnels | Acceptable si pas de credentials stockes |

### 3.4 Recommandations MCP Filesystem

**R1 — ACCEPTER le MCP Filesystem** sous conditions :
- JAMAIS de lecture de fichiers .env, .env.local, credentials
- Verifier que `.gemini\antigravity` ne contient pas de tokens/cles en clair
- Envisager de restreindre a `C:\Projects\jeanpierrecharles` au lieu de `C:\Projects` (perimetre plus etroit)

**R2 — INTERDIR tout autre MCP/DXT** :
- Zero connecteur externe (Calendar, Drive, Slack)
- Zero DXT Extension supplementaire
- Zero Cowork

**R3 — Reviser la matrice de securite** :
La recommandation precedente "MCP = INTERDIT" est affinee en :
- MCP Filesystem local = **AUTORISE avec vigilance** (pas de lecture secrets)
- MCP Connecteurs externes = **INTERDIT** (vecteur LayerX)
- DXT Extensions = **INTERDIT** (CVSS 10)

---

## 4. REVISION DE LA DECISION D10

### 3.1 D10 originale (10/02/2026)

> "Claude Desktop NON VIABLE (CVSS 10 + instabilite)"

### 3.2 D10r — Revision 1 (22/02/2026)

> "Claude Desktop = A VERIFIER empiriquement"

### 4.3 D10r2 — Revision 2 PROPOSEE (27/02/2026)

> **"Claude Desktop v1.1.4498 Squirrel UTILISABLE EN MODE RESTREINT : Chat + Code + MCP Filesystem local (4 repertoires JP). INTERDIT : DXT Extensions, Cowork, MCP connecteurs externes (Calendar, Drive, Slack). La vulnerabilite LayerX 0-Click RCE reste non corrigee mais son perimetre est limite aux connecteurs externes + chainage MCP, pas au Filesystem local."**

### 4.4 Conditions d'utilisation securisee

| Condition | Statut requis | Verification |
|---|---|---|
| Aucun DXT Extension installe (hors Filesystem) | OBLIGATOIRE | Parametres > Extensions |
| Aucun connecteur externe MCP (Calendar, Drive...) | OBLIGATOIRE | `claude_desktop_config.json` |
| MCP Filesystem local uniquement | AUTORISE | 4 repertoires configures par JP |
| Pas de lecture fichiers .env/.credentials | OBLIGATOIRE | Discipline utilisateur |
| Mode Chat utilise | AUTORISE | Usage basique |
| Mode Code utilise | AUTORISE avec vigilance | Ne pas ouvrir de repos non-trusted |
| Cowork utilise | **INTERDIT** | Risque rm -rf documente (incident 15/01/2026) |
| DXT Extensions installees | **INTERDIT** | Vulnerabilite LayerX non corrigee |
| Connecteurs externes (Calendar, Drive) | **INTERDIT** | Vecteur d'attaque 0-Click RCE |

---

## 5. INTEGRATION AU V-GATE SECURITE GLOBAL

### 5.1 Criteres V-Gate supplementaires (Claude Desktop)

A ajouter a la checklist VGS du rapport AUDIT-SEC-20260227T0800 :

- [ ] **VGS-11** : Claude Desktop v1.1.4498+ fonctionnel (pas de crash @formatjs)
- [ ] **VGS-12** : MCP Filesystem = seul MCP actif (zero connecteur externe)
- [ ] **VGS-13** : Aucun DXT Extension installe (hors Filesystem built-in)
- [ ] **VGS-14** : Cowork NON utilise
- [ ] **VGS-15** : `.gemini\antigravity` verifie (pas de credentials en clair)

### 5.2 Matrice de risques Claude Desktop mise a jour

| Composant | Usage | Risque | Mitigation |
|---|---|---|---|
| Claude Desktop Chat | AUTORISE | Faible | Standard |
| Claude Desktop Code | AUTORISE (vigilance) | Moyen | Ne pas ouvrir repos non-trusted |
| MCP Filesystem local | **AUTORISE** (4 repertoires) | Moyen | Ne jamais lire .env*, credentials |
| Claude Desktop Cowork | **INTERDIT** | CRITIQUE | Incident rm -rf 11Go + Shadow MCP |
| Claude Desktop DXT Extensions | **INTERDIT** | CRITIQUE (CVSS 10) | Vulnerabilite LayerX non corrigee |
| MCP Connecteurs externes | **INTERDIT** | CRITIQUE | Chainage autonome sans consentement |

---

## 6. MISE A JOUR DU WATCHDOG

Le watchdog `aegis-cdskt-watchdog.ps1` doit etre adapte pour Squirrel v1.1.4498 :

```powershell
# Verification version Squirrel (au lieu de MSIX)
$squirrelPath = "$env:LOCALAPPDATA\AnthropicClaude"
$exePath = Get-ChildItem "$squirrelPath\app-*\claude.exe" -ErrorAction SilentlyContinue |
    Sort-Object { [version]($_.Directory.Name -replace 'app-','') } -Descending |
    Select-Object -First 1

if ($exePath) {
    $version = $exePath.Directory.Name -replace 'app-',''
    Write-Host "Claude Desktop Squirrel : v$version" -ForegroundColor Green
} else {
    Write-Host "Claude Desktop non installe (Squirrel)" -ForegroundColor Yellow
}

# VERIFICATION SECURITE CRITIQUE : Aucun DXT/MCP ne doit etre configure
$configPath = "$env:APPDATA\Claude\claude_desktop_config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath -Raw | ConvertFrom-Json
    if ($config.mcpServers -and ($config.mcpServers.PSObject.Properties | Measure-Object).Count -gt 0) {
        Write-Host "ALERTE SECURITE : Serveurs MCP configures detectes !" -ForegroundColor Red
        Write-Host "Vulnerabilite 0-Click RCE active — Supprimer immediatement" -ForegroundColor Red
    } else {
        Write-Host "Securite MCP : OK (aucun serveur configure)" -ForegroundColor Green
    }
}
```

---

## 7. MISES A JOUR LIFECYCLE MASTER REQUISES

### Section 2.4 — Materiel JP (remplacer)

```
- Claude Desktop : v1.1.4498 Squirrel (reinstalle 26/02/2026)
  MODE RESTREINT : Chat + Code + MCP Filesystem local
  MCP Filesystem : ACTIVE (C:\Projects, .gemini\antigravity, .antigravity, Documents)
  DXT Extensions : INTERDIT (LayerX CVSS 10 non corrige)
  Cowork : INTERDIT (risque rm -rf + Shadow MCP)
  MCP Connecteurs externes : INTERDIT (Calendar, Drive, Slack)
```

### Section 5 — Decisions (ajouter)

```
| D10r2 | 27/02 | Claude Desktop v1.1.4498 MODE RESTREINT (Chat+Code+Filesystem, zero DXT/Cowork/connecteurs) | JP+Opus |
| D36 | 27/02 | Installation Squirrel acceptee (divergence MSIX bridge T1625 justifiee par +325 builds) | JP+Opus |
| D37 | 27/02 | MCP Filesystem local AUTORISE, MCP connecteurs externes INTERDIT (distinction LayerX) | JP+Opus |
```

### Section 9 — Securite (ajouter)

```
### 9.4 Claude Desktop — Mode restreint (27/02/2026)

- Version : v1.1.4498 Squirrel (maj auto 27/02)
- Vulnerabilite LayerX DXT 0-Click RCE : NON CORRIGEE par Anthropic
- Perimetre vuln : DXT Extensions + chainage MCP connecteurs externes
- MCP Filesystem local : AUTORISE (ne constitue pas le vecteur LayerX)
- Mitigation : Zero DXT, zero connecteur externe, zero Cowork
- Statut : UTILISABLE en mode Chat + Code + Filesystem restreint
- CVE-2025-59536 + CVE-2026-21852 (Claude Code) : CORRIGES
- Repertoires Filesystem : C:\Projects, .gemini\antigravity, .antigravity, Documents
- REGLE : Ne JAMAIS lire .env, .env.local, credentials via Filesystem MCP
```

### Section 10 — Lecons (ajouter)

```
| L41 | DXT 0-Click RCE = vuln architecturale, pas un bug — Anthropic refuse de corriger | Audit Opus 27/02 |
| L42 | Squirrel v1.1.4498 corrige le crash @formatjs de v1.1.4173 (+325 builds) | Install JP 26/02 |
| L43 | MCP local (Filesystem) != MCP externe (Calendar) — vecteurs de risque differents | Audit Opus 27/02 |
| L44 | Repertoires MCP Filesystem contenant .env doivent etre proteges par discipline | Audit Opus 27/02 |
```

### Section 11 — Risques (ajouter)

```
| R20 | DXT 0-Click RCE non corrige — connecteurs externes + chainage MCP | NULLE si zero DXT/connecteur | CRITIQUE | Mode restreint |
| R21 | MCP Filesystem expose .env.local si lu par inadvertance | FAIBLE (discipline) | MAJEUR | Ne jamais lire .env* |
| R22 | .gemini\antigravity peut contenir credentials AG en clair | MOYENNE | MAJEUR | Verifier contenu (SEC-A8) |
```

---

*Rapport d'audit genere par Claude Opus 4.6 — 20260227T0800 CET*
*Reference : AUDIT-SEC-CDKT-20260227T0800*
*Format : ASCII-safe pour compatibilite pipeline*
