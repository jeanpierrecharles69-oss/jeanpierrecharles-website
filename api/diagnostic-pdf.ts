import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * AEGIS Intelligence -- DIAGNOSTIC PDF pipeline (PLACEHOLDER)
 *
 * TODO v3.4.x : implementer la generation server-side du PDF DIAGNOSTIC
 * apres paiement Mollie confirme.
 *
 * Flux cible :
 *  1. Webhook Mollie -> /api/mollie-webhook confirme le paiement
 *  2. Declencheur -> /api/claude-proxy mode=diagnostic (Opus 4.6) sur le brief client
 *  3. Sortie markdown Opus -> convertie en PDF par /api/diagnostic-pdf (ce fichier)
 *  4. PDF uploade sur stockage (Vercel Blob ou S3 prive)
 *  5. Email au client avec lien de telechargement signe (24h validite)
 *
 * Design PDF (reference session 20260406T0900) :
 *  - Cover page AEGIS brandee (meme style que D1 : logo Ae, gradient bleu)
 *  - Table des matieres auto-generee depuis H2/H3
 *  - Identifiant {AEGIS-DIAG-YYYY-CODE} visible en cover + footer chaque page
 *  - QR code vers jeanpierrecharles.com?src=pdf-diag&ref={ID}
 *  - Typographie Poppins/Google Sans
 *  - Pas de ligne "Methodologie : Pearl x Simon x Damasio" (supprimee au niveau prompt v1.4.0)
 *  - Signature finale "Fin du diagnostic {ID} -- (c) AEGIS Intelligence"
 *
 * Stack technique a evaluer :
 *  - Option A : markdown -> HTML (marked) -> PDF (Puppeteer headless dans Vercel) -- lourd, depassera timeout 10s
 *  - Option B : markdown -> HTML -> PDF (wkhtmltopdf via binary) -- complexe a deployer sur Vercel
 *  - Option C : markdown -> PDF direct (pdfkit, pdf-lib) -- perte qualite visuelle
 *  - Option D : externaliser la conversion (service tiers type api2pdf.com) -- paiement tiers
 *  - Option recommandee : C avec template pdf-lib sophistique, OU externaliser via API Cloud (Cloudflare Workers + Puppeteer)
 *
 * Decision produit JP requise avant implementation.
 */

export default async function handler(req: VercelRequest, res: VercelResponse) {
    return res.status(501).json({
        error: 'NOT_IMPLEMENTED',
        message: 'DIAGNOSTIC PDF pipeline en attente de decision produit. Voir /api/diagnostic-pdf.ts pour specs.',
    });
}
