# Node.js Cloud Sync Issue - Definitive Solution

## Problem Summary
TypeScript error: `Cannot find type definition file for 'node'` in `aegis---ai-compliance-platform` project located in Google Drive.

## Root Cause
**npm cannot work reliably in cloud-synced folders** (Google Drive, OneDrive, Dropbox, iCloud) because:
- npm writes thousands of small files rapidly during `npm install`
- Cloud sync daemons try to upload files simultaneously
- Results in file descriptor conflicts: `EBADF`, `EPERM`, `ENOTEMPTY`

## Definitive Solution Applied

### ✅ What Was Done

1. **Created setup script**: `setup-aegis-local.ps1` in Google Drive
   - Automates copying project to `C:\Projects\`
   - Excludes `node_modules/` and build folders
   - Installs dependencies locally
   - Verifies TypeScript types installation

2. **Updated AFRS Master Document** (Phase 14)
   - Added CAUTION alert about cloud-synced folders
   - Documented definitive workflow
   - Added to best practices

3. **Updated journal-de-bord-specifications.md**
   - Replaced "recommended solution" with "definitive solution"
   - Added comparison table (Cloud ❌ vs Local ✅)
   - Documented sync strategies (Git vs robocopy)

### 📋 User Action Required

**Run this ONE time** (in PowerShell):

```powershell
# Navigate to Google Drive
cd "g:\Mon Drive\Google AI Studio"

# Run the setup script
.\setup-aegis-local.ps1
```

The script will:
1. Create `C:\Projects\` directory
2. Copy Aegis project to `C:\Projects\aegis---ai-compliance-platform`
3. Run `npm install` (will succeed)
4. Verify `@types/node` installation
5. Display next steps

### ⚡ Immediate Next Steps After Script

1. **Open VS Code in LOCAL directory**:
   ```powershell
   code C:\Projects\aegis---ai-compliance-platform
   ```

2. **TypeScript error will be GONE** (IDE will find `node_modules/@types/node`)

3. **Start dev server**:
   ```powershell
   cd C:\Projects\aegis---ai-compliance-platform
   npm run dev
   ```

### 🔄 Daily Workflow Going Forward

**Rule**: Always work in `C:\Projects\aegis---ai-compliance-platform`

**Sync strategy (choose ONE)**:

#### Option A: Git (Recommended)
```powershell
# In C:\Projects\aegis---ai-compliance-platform
git init
git add .
git commit -m "Your changes"
git push origin main

# Google Drive becomes read-only backup
```

#### Option B: Manual sync to Google Drive
```powershell
# After making changes, run:
robocopy "C:\Projects\aegis---ai-compliance-platform" "g:\Mon Drive\Google AI Studio\aegis---ai-compliance-platform" /MIR /XD node_modules .next dist build
```

## Why This Is Definitive

| Aspect | Google Drive Dev | Local Dev (C:\Projects\) |
|--------|-----------------|-------------------------|
| **npm install** | ❌ Fails (EBADF errors) | ✅ Perfect |
| **TypeScript** | ❌ Can't find types | ✅ Works |
| **Performance** | ❌ Slow (network I/O) | ✅ Fast (SSD) |
| **Hot reload** | ❌ Delayed | ✅ Instant |
| **Reliability** | ❌ Sync conflicts | ✅ No issues |

## Memorization Points

1. **Never run `npm install` in cloud-synced folders** - Industry standard rule
2. **Code source → Cloud backup** (for versioning/backup)
3. **Active development → Local disk** (for performance/reliability)
4. **Sync via Git** (best) or robocopy (fallback)
5. **Script created**: `setup-aegis-local.ps1` automates this

## Documentation Updated

✅ `Google_AFRS-Master-Document-v2_Part3-Final.md` - Phase 14 (CAUTION alert added)
✅ `journal-de-bord-specifications.md` - Section 1.2 (definitive solution)
✅ `setup-aegis-local.ps1` - Automated setup script created

## Status
🟢 **READY TO EXECUTE** - User just needs to run `.\setup-aegis-local.ps1`

---

**Created**: 2026-01-15T16:21  
**Issue**: TypeScript types error in cloud-synced project  
**Solution**: Local development in C:\Projects\ with cloud backup
