// V&V V346 --- Render deliveryConfirmationHtml to static HTML files for inspection.
// Usage : node vv-screenshots-v346/render-delivery-email.mjs
//
// Outputs :
//   vv-screenshots-v346/delivery-fr-full.html   (avec signature complète + SHA-256)
//   vv-screenshots-v346/delivery-fr-nosha.html  (signature sans SHA-256 --- variante pipeline mono-pass)
//   vv-screenshots-v346/delivery-en-full.html   (variante anglaise)

import { deliveryConfirmationHtml } from '../api/_lib/email-templates.ts';
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'vv-screenshots-v346';

const base = {
    payment_id: 'delivery-vv-test',
    email: 'aegis-vv-test@example.com',
    lang: 'fr',
    invoice_number: 'AEGIS-20260417-1030',
    download_url: 'https://example.com/test-report.pdf',
    customer_name: 'AEGIS VV SYNTHETIQUE',
    customer_company: 'Test compliance - ne pas livrer',
    approved_by: 'Jean-Pierre CHARLES',
    approved_at: '2026-04-17T10:30:00+02:00',
    pdf_sha256: 'a'.repeat(64),
    signature_note: 'Rapport DIAGNOSTIC livré sous 24h ouvrées post-paiement.',
};

fs.writeFileSync(path.join(OUT, 'delivery-fr-full.html'), deliveryConfirmationHtml(base, 'fr'));
fs.writeFileSync(path.join(OUT, 'delivery-fr-nosha.html'), deliveryConfirmationHtml({ ...base, pdf_sha256: undefined, signature_note: undefined }, 'fr'));
fs.writeFileSync(path.join(OUT, 'delivery-en-full.html'), deliveryConfirmationHtml(base, 'en'));

console.log('Rendus écrits dans', OUT);
