// i18n-patch-v334.mjs — Node.js patch for Z1 heroSub + heroLinkedInCta
// Usage: cd C:\Projects\jeanpierrecharles && node i18n-patch-v334.mjs
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/components/homepage/i18n.ts';
let content = readFileSync(file, 'utf-8');

// === PATCH FR heroSub ===
const frOld = content.indexOf('heroSub: "Des volants airbag Toyota');
if (frOld === -1) { console.error('FAIL: FR heroSub not found'); process.exit(1); }
const frEnd = content.indexOf('",', frOld) + 2;
const frReplacement = `heroSub: "32 ans d\u2019expertise R&D industrielle \u2014 de la conception \u00e0 la production commerciale en s\u00e9rie. AEGIS Intelligence transforme ce capital terrain en intelligence r\u00e9glementaire actionnable pour piloter votre conformit\u00e9 EU.",\n        heroLinkedInCta: "D\u00e9couvrir le parcours terrain sur LinkedIn \u2192",`;
content = content.slice(0, frOld) + frReplacement + content.slice(frEnd);

// === PATCH EN heroSub ===
const enOld = content.indexOf('heroSub: "From Toyota airbag steering wheels');
if (enOld === -1) { console.error('FAIL: EN heroSub not found'); process.exit(1); }
const enEnd = content.indexOf('",', enOld) + 2;
const enReplacement = `heroSub: "32 years of industrial R&D expertise \u2014 from design to commercial series production. AEGIS Intelligence transforms this field capital into actionable regulatory intelligence to pilot your EU compliance.",\n        heroLinkedInCta: "Discover the field experience on LinkedIn \u2192",`;
content = content.slice(0, enOld) + enReplacement + content.slice(enEnd);

// === WRITE with BOM ===
writeFileSync(file, '\uFEFF' + content.replace(/^\uFEFF/, ''), 'utf-8');

// === VERIFY ===
const check = readFileSync(file, 'utf-8');
const ok = check.includes('capital terrain') && check.includes('field capital') && check.includes('heroLinkedInCta');
console.log(ok ? 'PASS — i18n.ts patched (heroSub FR+EN + heroLinkedInCta FR+EN)' : 'FAIL — verify manually');
process.exit(ok ? 0 : 1);
