import React, { useState, useEffect } from 'react';
import { C } from './constants';
import { useLang } from './LangContext';
import { CGVModal, PrivacyModal } from '../common/LegalModals';

// FIX P0 v348 : mapping shortcuts Brain (AegisIntelligence) → REGULATIONS REGULATIONS DiagnosticCheckoutForm
const BRAIN_REG_MAP: Record<string, string> = {
    'AI Act': 'AI Act',
    'Machines': 'Règlement Machines 2023/1230',
    'ESPR': 'ESPR / DPP',
    'CRA': 'CRA (Cyber Resilience Act)',
    'RGPD': 'RGPD',
    'Batteries': 'Battery Regulation',
    'Data Act': 'Data Act',
    'NIS2': 'NIS2',
    'DORA': 'DORA',
    'CPR': 'Autre',
};

/* ──────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────── */

export interface DiagnosticFormData {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    country: string;
    city: string;
    sector: string;
    product: string;
    regulations: string[];
    context: string;
}

interface DiagnosticCheckoutFormProps {
    onClose: () => void;
    onSubmit: (data: DiagnosticFormData) => void;
    isLoading: boolean;
}

/* ──────────────────────────────────────────────────────────
 * i18n labels
 * ────────────────────────────────────────────────────────── */

const labels = {
    fr: {
        title: 'Commander un diagnostic',
        section1: '1. Identification',
        section2: '2. Diagnostic',
        section3: '3. Contexte (optionnel)',
        section4: '4. Acceptation',
        section5: 'Tarif',
        email: 'Email',
        firstName: 'Pr\u00e9nom',
        lastName: 'Nom',
        company: 'Raison sociale',
        country: 'Pays',
        city: 'Ville',
        sector: 'Secteur',
        sectorPlaceholder: 'S\u00e9lectionnez un secteur',
        product: 'Produit ou syst\u00e8me \u00e0 analyser',
        productHint: '100 \u00e0 500 caract\u00e8res',
        regulations: 'R\u00e8glements concern\u00e9s',
        regulationsHint: 'Cochez au moins 1 r\u00e8glement',
        contextPlaceholder: 'Informations compl\u00e9mentaires, d\u00e9lais, contraintes particuli\u00e8res\u2026',
        contextHint: '2000 caract\u00e8res max.',
        acceptCGV: "J'accepte les ",
        cgvLink: 'Conditions G\u00e9n\u00e9rales de Vente',
        acceptRGPD: "Je consens au traitement de mes donn\u00e9es conform\u00e9ment \u00e0 la ",
        privacyLink: 'Politique de Confidentialit\u00e9',
        vatNotice: 'Montant\u00a0: 250,00\u00a0EUR \u2014 TVA non applicable, art.\u00a0293\u00a0B du CGI',
        submit: 'Proc\u00e9der au paiement (250,00\u00a0EUR)',
        cancel: 'Annuler',
        required: 'Champ obligatoire',
        invalidEmail: 'Adresse email invalide',
        productTooShort: 'Minimum 100 caract\u00e8res',
        productTooLong: 'Maximum 500 caract\u00e8res',
        contextTooLong: 'Maximum 2000 caract\u00e8res',
        regulationRequired: 'Cochez au moins 1 r\u00e8glement',
        cgvRequired: 'Acceptation des CGV requise',
        rgpdRequired: 'Consentement RGPD requis',
        submitting: 'Traitement en cours\u2026',
    },
    en: {
        title: 'Order a diagnostic',
        section1: '1. Identification',
        section2: '2. Diagnostic',
        section3: '3. Context (optional)',
        section4: '4. Legal acceptance',
        section5: 'Pricing',
        email: 'Email',
        firstName: 'First name',
        lastName: 'Last name',
        company: 'Company',
        country: 'Country',
        city: 'City',
        sector: 'Sector',
        sectorPlaceholder: 'Select a sector',
        product: 'Product or system to analyse',
        productHint: '100 to 500 characters',
        regulations: 'Applicable regulations',
        regulationsHint: 'Select at least 1 regulation',
        contextPlaceholder: 'Additional information, deadlines, specific constraints\u2026',
        contextHint: '2000 characters max.',
        acceptCGV: 'I accept the ',
        cgvLink: 'General Terms of Sale',
        acceptRGPD: 'I consent to the processing of my data in accordance with the ',
        privacyLink: 'Privacy Policy',
        vatNotice: 'Amount: EUR\u00a0250.00 \u2014 VAT not applicable, art.\u00a0293\u00a0B CGI (French tax code)',
        submit: 'Proceed to payment (EUR\u00a0250.00)',
        cancel: 'Cancel',
        required: 'Required field',
        invalidEmail: 'Invalid email address',
        productTooShort: 'Minimum 100 characters',
        productTooLong: 'Maximum 500 characters',
        contextTooLong: 'Maximum 2000 characters',
        regulationRequired: 'Select at least 1 regulation',
        cgvRequired: 'Acceptance of Terms required',
        rgpdRequired: 'GDPR consent required',
        submitting: 'Processing\u2026',
    },
};

/* ──────────────────────────────────────────────────────────
 * Static data
 * ────────────────────────────────────────────────────────── */

const EU_COUNTRIES: { code: string; fr: string; en: string }[] = [
    { code: 'FR', fr: 'France', en: 'France' },
    { code: 'DE', fr: 'Allemagne', en: 'Germany' },
    { code: 'AT', fr: 'Autriche', en: 'Austria' },
    { code: 'BE', fr: 'Belgique', en: 'Belgium' },
    { code: 'BG', fr: 'Bulgarie', en: 'Bulgaria' },
    { code: 'HR', fr: 'Croatie', en: 'Croatia' },
    { code: 'CY', fr: 'Chypre', en: 'Cyprus' },
    { code: 'CZ', fr: 'Tch\u00e9quie', en: 'Czech Republic' },
    { code: 'DK', fr: 'Danemark', en: 'Denmark' },
    { code: 'EE', fr: 'Estonie', en: 'Estonia' },
    { code: 'FI', fr: 'Finlande', en: 'Finland' },
    { code: 'GR', fr: 'Gr\u00e8ce', en: 'Greece' },
    { code: 'HU', fr: 'Hongrie', en: 'Hungary' },
    { code: 'IE', fr: 'Irlande', en: 'Ireland' },
    { code: 'IT', fr: 'Italie', en: 'Italy' },
    { code: 'LV', fr: 'Lettonie', en: 'Latvia' },
    { code: 'LT', fr: 'Lituanie', en: 'Lithuania' },
    { code: 'LU', fr: 'Luxembourg', en: 'Luxembourg' },
    { code: 'MT', fr: 'Malte', en: 'Malta' },
    { code: 'NL', fr: 'Pays-Bas', en: 'Netherlands' },
    { code: 'PL', fr: 'Pologne', en: 'Poland' },
    { code: 'PT', fr: 'Portugal', en: 'Portugal' },
    { code: 'RO', fr: 'Roumanie', en: 'Romania' },
    { code: 'SK', fr: 'Slovaquie', en: 'Slovakia' },
    { code: 'SI', fr: 'Slov\u00e9nie', en: 'Slovenia' },
    { code: 'ES', fr: 'Espagne', en: 'Spain' },
    { code: 'SE', fr: 'Su\u00e8de', en: 'Sweden' },
];

const SECTORS: { fr: string; en: string }[] = [
    { fr: 'Automobile', en: 'Automotive' },
    { fr: 'A\u00e9ronautique', en: 'Aeronautics' },
    { fr: 'Batteries / \u00c9nergie', en: 'Batteries / Energy' },
    { fr: '\u00c9quipements industriels', en: 'Industrial equipment' },
    { fr: 'Robotique / Automatisation', en: 'Robotics / Automation' },
    { fr: 'Dispositifs m\u00e9dicaux', en: 'Medical devices' },
    { fr: '\u00c9lectronique / IoT', en: 'Electronics / IoT' },
    { fr: 'Ferroviaire', en: 'Railway' },
    { fr: 'Construction / BTP', en: 'Construction' },
    { fr: 'Chimie', en: 'Chemistry' },
    { fr: 'M\u00e9tallurgie', en: 'Metallurgy' },
    { fr: 'Plasturgie', en: 'Plastics' },
    { fr: 'Textile technique', en: 'Technical textiles' },
    { fr: 'D\u00e9fense', en: 'Defence' },
    { fr: 'Autre', en: 'Other' },
];

const REGULATIONS = [
    'AI Act',
    'CRA (Cyber Resilience Act)',
    'R\u00e8glement Machines 2023/1230',
    'ESPR / DPP',
    'Battery Regulation',
    'RGPD',
    'NIS2',
    'DORA',
    'Data Act',
    'Autre',
];

/* ──────────────────────────────────────────────────────────
 * Shared inline styles
 * ────────────────────────────────────────────────────────── */

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    fontSize: 13,
    borderRadius: 10,
    border: `1px solid ${C.borderStrong}`,
    background: C.surface,
    color: C.text,
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
};

const inputErrorStyle: React.CSSProperties = {
    ...inputStyle,
    border: `1px solid ${C.rose}`,
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: C.text,
    marginBottom: 4,
};

const errorTextStyle: React.CSSProperties = {
    fontSize: 11,
    color: C.rose,
    marginTop: 3,
};

const sectionHeadingStyle: React.CSSProperties = {
    fontSize: 14,
    fontWeight: 700,
    color: C.text,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: `1px solid ${C.border}`,
};

/* ──────────────────────────────────────────────────────────
 * Component
 * ────────────────────────────────────────────────────────── */

type FieldErrors = Partial<Record<string, string>>;

export default function DiagnosticCheckoutForm({ onClose, onSubmit, isLoading }: DiagnosticCheckoutFormProps) {
    const { lang } = useLang();
    const t = labels[lang];

    /* ── Form state ────────────────────────────────── */
    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [country, setCountry] = useState('FR');
    const [city, setCity] = useState('');
    const [sector, setSector] = useState('');
    const [product, setProduct] = useState('');
    const [regulations, setRegulations] = useState<string[]>([]);
    const [context, setContext] = useState('');
    const [acceptCGV, setAcceptCGV] = useState(false);
    const [acceptRGPD, setAcceptRGPD] = useState(false);

    /* ── Sub-modal state ───────────────────────────── */
    const [showCGV, setShowCGV] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    /* ── Validation ────────────────────────────────── */
    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitted, setSubmitted] = useState(false);

    /* ── Prefill depuis Brain (FIX P0 v348) ─────────── */
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('aegis_brain_prefill');
            if (!raw) return;
            const data = JSON.parse(raw) as { sector?: string; product?: string; regs?: string[]; context?: string };
            // Match secteur sur fr OU en (Brain stocke selon lang courante)
            if (data.sector) {
                const matched = SECTORS.find(s => s.fr === data.sector || s.en === data.sector);
                if (matched) setSector(matched.en);
            }
            if (data.product) setProduct(data.product);
            if (data.context) setContext(data.context);
            if (Array.isArray(data.regs) && data.regs.length > 0) {
                const mapped = data.regs
                    .map(r => BRAIN_REG_MAP[r] || (REGULATIONS.includes(r) ? r : null))
                    .filter((r): r is string => !!r && REGULATIONS.includes(r));
                if (mapped.length > 0) setRegulations([...new Set(mapped)]);
            }
            sessionStorage.removeItem('aegis_brain_prefill');
        } catch { /* sessionStorage indisponible ou JSON corrompu */ }
    }, []);

    const validate = (): FieldErrors => {
        const e: FieldErrors = {};
        if (!email.trim()) e.email = t.required;
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t.invalidEmail;
        if (!firstName.trim()) e.firstName = t.required;
        if (!lastName.trim()) e.lastName = t.required;
        if (!company.trim()) e.company = t.required;
        if (!country) e.country = t.required;
        if (!city.trim()) e.city = t.required;
        if (!sector) e.sector = t.required;
        if (product.trim().length < 100) e.product = t.productTooShort;
        if (product.trim().length > 500) e.product = t.productTooLong;
        if (regulations.length === 0) e.regulations = t.regulationRequired;
        if (context.length > 2000) e.context = t.contextTooLong;
        if (!acceptCGV) e.acceptCGV = t.cgvRequired;
        if (!acceptRGPD) e.acceptRGPD = t.rgpdRequired;
        return e;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        const errs = validate();
        setErrors(errs);
        if (Object.keys(errs).length > 0) return;
        onSubmit({
            email: email.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            company: company.trim(),
            country,
            city: city.trim(),
            sector,
            product: product.trim(),
            regulations,
            context: context.trim(),
        });
    };

    const toggleRegulation = (reg: string) => {
        setRegulations(prev =>
            prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]
        );
    };

    /* Re-validate on change after first submission attempt */
    const revalidate = () => {
        if (submitted) {
            // Defer so state updates have flushed
            setTimeout(() => setErrors(validate()), 0);
        }
    };

    const err = (field: string) => submitted ? errors[field] : undefined;

    /* ── Country list sorted by current language ──── */
    const sortedCountries = [...EU_COUNTRIES].sort((a, b) => {
        if (a.code === 'FR') return -1;
        if (b.code === 'FR') return 1;
        return a[lang].localeCompare(b[lang]);
    });

    /* ── Render ────────────────────────────────────── */
    return (
        <>
            {/* Overlay */}
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16,
                }}
                onClick={onClose}
            >
                {/* Modal panel */}
                <div
                    style={{
                        background: C.surface,
                        borderRadius: 16,
                        maxWidth: 640,
                        width: '100%',
                        maxHeight: '90vh',
                        overflowY: 'auto',
                        padding: '28px 24px',
                        position: 'relative',
                        boxShadow: C.shadowLg,
                        border: `1px solid ${C.border}`,
                    }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Close X */}
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute', top: 14, right: 14,
                            background: 'none', border: 'none', fontSize: 22,
                            cursor: 'pointer', color: C.textMuted, lineHeight: 1,
                        }}
                        aria-label="Close"
                    >
                        &times;
                    </button>

                    {/* Title */}
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 20 }}>
                        {t.title}
                    </h2>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ── Section 1: Identification ───────── */}
                        <div style={sectionHeadingStyle}>{t.section1}</div>

                        {/* Email */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>{t.email} *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); revalidate(); }}
                                style={err('email') ? inputErrorStyle : inputStyle}
                                placeholder="name@company.com"
                            />
                            {err('email') && <div style={errorTextStyle}>{err('email')}</div>}
                        </div>

                        {/* First + Last name row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={labelStyle}>{t.firstName} *</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={e => { setFirstName(e.target.value); revalidate(); }}
                                    style={err('firstName') ? inputErrorStyle : inputStyle}
                                />
                                {err('firstName') && <div style={errorTextStyle}>{err('firstName')}</div>}
                            </div>
                            <div>
                                <label style={labelStyle}>{t.lastName} *</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={e => { setLastName(e.target.value); revalidate(); }}
                                    style={err('lastName') ? inputErrorStyle : inputStyle}
                                />
                                {err('lastName') && <div style={errorTextStyle}>{err('lastName')}</div>}
                            </div>
                        </div>

                        {/* Company */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>{t.company} *</label>
                            <input
                                type="text"
                                value={company}
                                onChange={e => { setCompany(e.target.value); revalidate(); }}
                                style={err('company') ? inputErrorStyle : inputStyle}
                            />
                            {err('company') && <div style={errorTextStyle}>{err('company')}</div>}
                        </div>

                        {/* Country + City row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                            <div>
                                <label style={labelStyle}>{t.country} *</label>
                                <select
                                    value={country}
                                    onChange={e => { setCountry(e.target.value); revalidate(); }}
                                    style={err('country') ? inputErrorStyle : inputStyle}
                                >
                                    {sortedCountries.map(c => (
                                        <option key={c.code} value={c.code}>{c[lang]}</option>
                                    ))}
                                </select>
                                {err('country') && <div style={errorTextStyle}>{err('country')}</div>}
                            </div>
                            <div>
                                <label style={labelStyle}>{t.city} *</label>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={e => { setCity(e.target.value); revalidate(); }}
                                    style={err('city') ? inputErrorStyle : inputStyle}
                                />
                                {err('city') && <div style={errorTextStyle}>{err('city')}</div>}
                            </div>
                        </div>

                        {/* ── Section 2: Diagnostic ───────────── */}
                        <div style={sectionHeadingStyle}>{t.section2}</div>

                        {/* Sector */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>{t.sector} *</label>
                            <select
                                value={sector}
                                onChange={e => { setSector(e.target.value); revalidate(); }}
                                style={err('sector') ? inputErrorStyle : inputStyle}
                            >
                                <option value="">{t.sectorPlaceholder}</option>
                                {SECTORS.map(s => (
                                    <option key={s.en} value={s.en}>{s[lang]}</option>
                                ))}
                            </select>
                            {err('sector') && <div style={errorTextStyle}>{err('sector')}</div>}
                        </div>

                        {/* Product */}
                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>{t.product} *</label>
                            <textarea
                                value={product}
                                onChange={e => { setProduct(e.target.value); revalidate(); }}
                                rows={4}
                                style={{
                                    ...(err('product') ? inputErrorStyle : inputStyle),
                                    resize: 'vertical',
                                    minHeight: 80,
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                <div style={err('product') ? errorTextStyle : { fontSize: 11, color: C.textMuted }}>
                                    {err('product') || t.productHint}
                                </div>
                                <div style={{ fontSize: 11, color: product.trim().length < 100 || product.trim().length > 500 ? C.rose : C.textMuted }}>
                                    {product.trim().length}/500
                                </div>
                            </div>
                        </div>

                        {/* Regulations checkboxes */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>{t.regulations} *</label>
                            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{t.regulationsHint}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                {REGULATIONS.map(reg => (
                                    <label
                                        key={reg}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            fontSize: 12, color: C.textSecondary, cursor: 'pointer',
                                            padding: '4px 0',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={regulations.includes(reg)}
                                            onChange={() => { toggleRegulation(reg); revalidate(); }}
                                            style={{ accentColor: C.accent, width: 15, height: 15, cursor: 'pointer' }}
                                        />
                                        {reg}
                                    </label>
                                ))}
                            </div>
                            {err('regulations') && <div style={errorTextStyle}>{err('regulations')}</div>}
                        </div>

                        {/* ── Section 3: Context ──────────────── */}
                        <div style={sectionHeadingStyle}>{t.section3}</div>

                        <div style={{ marginBottom: 16 }}>
                            <textarea
                                value={context}
                                onChange={e => { setContext(e.target.value); revalidate(); }}
                                rows={4}
                                placeholder={t.contextPlaceholder}
                                style={{
                                    ...(err('context') ? inputErrorStyle : inputStyle),
                                    resize: 'vertical',
                                    minHeight: 70,
                                }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 3 }}>
                                <div style={err('context') ? errorTextStyle : { fontSize: 11, color: C.textMuted }}>
                                    {err('context') || t.contextHint}
                                </div>
                                <div style={{ fontSize: 11, color: context.length > 2000 ? C.rose : C.textMuted }}>
                                    {context.length}/2000
                                </div>
                            </div>
                        </div>

                        {/* ── Section 4: Legal acceptance ─────── */}
                        <div style={sectionHeadingStyle}>{t.section4}</div>

                        {/* CGV checkbox */}
                        <div style={{ marginBottom: 8 }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: C.textSecondary, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={acceptCGV}
                                    onChange={() => { setAcceptCGV(!acceptCGV); revalidate(); }}
                                    style={{ accentColor: C.accent, width: 15, height: 15, marginTop: 1, cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span>
                                    {t.acceptCGV}
                                    <button
                                        type="button"
                                        onClick={e => { e.preventDefault(); setShowCGV(true); }}
                                        style={{
                                            background: 'none', border: 'none', padding: 0,
                                            color: C.accent, cursor: 'pointer', fontSize: 12,
                                            textDecoration: 'underline', fontFamily: 'inherit',
                                        }}
                                    >
                                        {t.cgvLink}
                                    </button>
                                    {' *'}
                                </span>
                            </label>
                            {err('acceptCGV') && <div style={{ ...errorTextStyle, marginLeft: 23 }}>{err('acceptCGV')}</div>}
                        </div>

                        {/* RGPD checkbox */}
                        <div style={{ marginBottom: 16 }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12, color: C.textSecondary, cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={acceptRGPD}
                                    onChange={() => { setAcceptRGPD(!acceptRGPD); revalidate(); }}
                                    style={{ accentColor: C.accent, width: 15, height: 15, marginTop: 1, cursor: 'pointer', flexShrink: 0 }}
                                />
                                <span>
                                    {t.acceptRGPD}
                                    <button
                                        type="button"
                                        onClick={e => { e.preventDefault(); setShowPrivacy(true); }}
                                        style={{
                                            background: 'none', border: 'none', padding: 0,
                                            color: C.accent, cursor: 'pointer', fontSize: 12,
                                            textDecoration: 'underline', fontFamily: 'inherit',
                                        }}
                                    >
                                        {t.privacyLink}
                                    </button>
                                    {' *'}
                                </span>
                            </label>
                            {err('acceptRGPD') && <div style={{ ...errorTextStyle, marginLeft: 23 }}>{err('acceptRGPD')}</div>}
                        </div>

                        {/* ── Section 5: VAT mention ──────────── */}
                        <div
                            style={{
                                background: '#f0f9ff',
                                border: '1px solid #bae6fd',
                                borderRadius: 10,
                                padding: '12px 16px',
                                marginBottom: 20,
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#0369a1',
                            }}
                        >
                            {t.vatNotice}
                        </div>

                        {/* ── Buttons ─────────────────────────── */}
                        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isLoading}
                                style={{
                                    padding: '10px 24px',
                                    fontSize: 13,
                                    fontWeight: 600,
                                    borderRadius: 10,
                                    border: `1px solid ${C.borderStrong}`,
                                    background: C.surface,
                                    color: C.textSecondary,
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                }}
                            >
                                {t.cancel}
                            </button>
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    padding: '10px 28px',
                                    fontSize: 13,
                                    fontWeight: 700,
                                    borderRadius: 10,
                                    border: 'none',
                                    background: isLoading ? C.textMuted : C.gradientBlue,
                                    color: '#fff',
                                    cursor: isLoading ? 'wait' : 'pointer',
                                    fontFamily: 'Inter, sans-serif',
                                    opacity: isLoading ? 0.7 : 1,
                                }}
                            >
                                {isLoading ? t.submitting : t.submit}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ── Sub-modals (rendered above overlay) ── */}
            {showCGV && <CGVModal onClose={() => setShowCGV(false)} lang={lang} />}
            {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} lang={lang} />}
        </>
    );
}
