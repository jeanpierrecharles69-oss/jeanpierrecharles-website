// i18n-patch-v334-fix.mjs — Robust string replace approach
// Usage: node i18n-patch-v334-fix.mjs
import { readFileSync, writeFileSync } from 'fs';

const file = 'src/components/homepage/i18n.ts';
let c = readFileSync(file, 'utf-8');
let changes = 0;

// FR heroSub — search by unique substring
if (c.includes('Des volants airbag Toyota aux batteries TGV 1500V')) {
  const lineStart = c.lastIndexOf('\n', c.indexOf('Des volants airbag Toyota')) + 1;
  const lineEnd = c.indexOf('\n', c.indexOf('Des volants airbag Toyota'));
  const oldLine = c.slice(lineStart, lineEnd);
  const newLines = '        heroSub: "32 ans d\u2019expertise R&D industrielle \u2014 de la conception \u00e0 la production commerciale en s\u00e9rie. AEGIS Intelligence transforme ce capital terrain en intelligence r\u00e9glementaire actionnable pour piloter votre conformit\u00e9 EU.",\n        heroLinkedInCta: "D\u00e9couvrir le parcours terrain sur LinkedIn \u2192",';
  c = c.replace(oldLine, newLines);
  changes++;
  console.log('OK: FR heroSub patched');
} else {
  console.log('SKIP: FR heroSub already patched or not found');
}

// EN heroSub — search by unique substring
if (c.includes('From Toyota airbag steering wheels to TGV 1500V batteries')) {
  const marker = 'From Toyota airbag steering wheels to TGV 1500V batteries';
  const lineStart = c.lastIndexOf('\n', c.indexOf(marker)) + 1;
  const lineEnd = c.indexOf('\n', c.indexOf(marker));
  const oldLine = c.slice(lineStart, lineEnd);
  const newLines = '        heroSub: "32 years of industrial R&D expertise \u2014 from design to commercial series production. AEGIS Intelligence transforms this field capital into actionable regulatory intelligence to pilot your EU compliance.",\n        heroLinkedInCta: "Discover the field experience on LinkedIn \u2192",';
  c = c.replace(oldLine, newLines);
  changes++;
  console.log('OK: EN heroSub patched');
} else {
  console.log('SKIP: EN heroSub already patched or not found');
}

if (changes > 0) {
  writeFileSync(file, c, 'utf-8');
  // Verify
  const v = readFileSync(file, 'utf-8');
  const ok = v.includes('capital terrain') && v.includes('field capital');
  console.log(ok ? `PASS: ${changes} patches applied` : 'WARN: written but verify failed');
} else {
  console.log('NO CHANGES');
}
