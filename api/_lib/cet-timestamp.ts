/**
 * AEGIS Intelligence -- CET (Europe/Paris) timestamp helpers (N12.A DT-01)
 *
 * Vercel Lambda runtime forces TZ=UTC : `new Date().getHours()` returns the
 * UTC hour, not the AEGIS HQ wall-clock hour. This module exposes
 * Intl.DateTimeFormat-based helpers so every client-facing identifier
 * (invoice_number, archive paths, signature timestamp) reads as
 * Europe/Paris CET/CEST, regardless of the Lambda region.
 *
 * Brief : 20260518T1000_BRIEF_ACDC-CODE-N12A-SPRINT-FINAL-CHROME-VV.md sec A1
 * Cause racine forensique : 20260516T0855_BRIDGE_FORENSIQUE-ALIGNEMENT-DETTES-TECHNIQUES.
 *
 * Version : 1.0.1 -- 20260819 -- HB-1 : doc format invoice_number (suffixe 4 hex cote appelant)
 * Version : 1.0.0 -- 20260518T1010 -- N12.A creation DT-01
 */

const CET_LOCALE = 'fr-FR';
const CET_TIMEZONE = 'Europe/Paris';

function getPart(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes, fallback: string): string {
    return parts.find(p => p.type === type)?.value || fallback;
}

/**
 * Returns the HH:MM components of `now` in Europe/Paris timezone.
 * Used by invoice_number generators on Vercel (Lambda TZ=UTC).
 */
export function getCetHHMM(now: Date = new Date()): { hh: string; mm: string } {
    const parts = new Intl.DateTimeFormat(CET_LOCALE, {
        timeZone: CET_TIMEZONE,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(now);
    return {
        hh: getPart(parts, 'hour', '00'),
        mm: getPart(parts, 'minute', '00'),
    };
}

/**
 * Returns the YYYY/MM/DD/HH/MM components of `now` in Europe/Paris timezone.
 * Used to build invoice_number = AEGIS-YYYYMMDD-HHMM-xxxx (CET, suffixe HB-1 cote appelant).
 */
export function getCetDateParts(now: Date = new Date()): {
    yyyy: string; MM: string; dd: string; hh: string; mm: string;
} {
    const parts = new Intl.DateTimeFormat(CET_LOCALE, {
        timeZone: CET_TIMEZONE,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
    }).formatToParts(now);
    return {
        yyyy: getPart(parts, 'year', '0000'),
        MM: getPart(parts, 'month', '01'),
        dd: getPart(parts, 'day', '01'),
        hh: getPart(parts, 'hour', '00'),
        mm: getPart(parts, 'minute', '00'),
    };
}
