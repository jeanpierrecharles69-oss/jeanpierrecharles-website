import React, { useState } from 'react';
import { C } from './constants';
import { useLang } from './LangContext';
import { CGVModal, PrivacyModal } from '../common/LegalModals';

/* ──────────────────────────────────────────────────────────
 * AEGIS Intelligence — VEILLE Subscription Form (V360)
 * Calque DiagnosticCheckoutForm pattern (modal, validation, consentements).
 * Champs : firstName/lastName/email obligatoires + company optionnel
 *         + sectors[]>=1 + regulations[]>=1 + context optionnel <=2000
 *         + CGV + RGPD obligatoires
 * CTA : "S'abonner — 150 €/mois"
 * ────────────────────────────────────────────────────────── */

export interface VeilleFormData {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    sectors: string[];
    regulations: string[];
    context: string;
}

interface VeilleSubscriptionFormProps {
    onClose: () => void;
    onSubmit: (data: VeilleFormData) => void;
    isLoading: boolean;
}

const labels = {
    fr: {
        title: "S'abonner à la veille réglementaire",
        section1: '1. Identification',
        section2: '2. Périmètre de veille',
        section3: '3. Contexte (optionnel)',
        section4: '4. Acceptation',
        email: 'Email',
        firstName: 'Prénom',
        lastName: 'Nom',
        company: 'Entreprise',
        companyHint: '',
        sectors: 'Secteurs industriels',
        sectorsHint: 'Cochez au moins 1 secteur',
        regulations: 'Règlements à surveiller',
        regulationsHint: 'Cochez au moins 1 règlement',
        contextPlaceholder: 'Précisez vos enjeux, jalons produit, alertes prioritaires…',
        contextHint: '2000 caractères max.',
        acceptCGV: "J'accepte les ",
        cgvLink: 'Conditions Générales de Vente',
        acceptRGPD: "Je consens au traitement de mes données conformément à la ",
        privacyLink: 'Politique de Confidentialité',
        rgpdNotice: 'En vous abonnant, vous autorisez AEGIS Intelligence à vous envoyer des alertes réglementaires par email. Données traitées par Mollie (paiement) et AEGIS (intelligence). Désabonnement à tout moment.',
        vatNotice: 'Montant : 150,00 EUR/mois — TVA non applicable, art. 293 B du CGI',
        submit: "S'abonner — 150 €/mois",
        cancel: 'Annuler',
        required: 'Champ obligatoire',
        invalidEmail: 'Adresse email invalide',
        contextTooLong: 'Maximum 2000 caractères',
        sectorsRequired: 'Cochez au moins 1 secteur',
        regulationsRequired: 'Cochez au moins 1 règlement',
        cgvRequired: 'Acceptation des CGV requise',
        rgpdRequired: 'Consentement RGPD requis',
        submitting: 'Redirection vers le paiement…',
    },
    en: {
        title: 'Subscribe to regulatory watch',
        section1: '1. Identification',
        section2: '2. Watch scope',
        section3: '3. Context (optional)',
        section4: '4. Legal acceptance',
        email: 'Email',
        firstName: 'First name',
        lastName: 'Last name',
        company: 'Company',
        companyHint: '',
        sectors: 'Industrial sectors',
        sectorsHint: 'Select at least 1 sector',
        regulations: 'Regulations to monitor',
        regulationsHint: 'Select at least 1 regulation',
        contextPlaceholder: 'Describe your stakes, product milestones, priority alerts…',
        contextHint: '2000 characters max.',
        acceptCGV: 'I accept the ',
        cgvLink: 'General Terms of Sale',
        acceptRGPD: 'I consent to the processing of my data in accordance with the ',
        privacyLink: 'Privacy Policy',
        rgpdNotice: 'By subscribing, you authorise AEGIS Intelligence to send you regulatory alerts by email. Data processed by Mollie (payment) and AEGIS (intelligence). Unsubscribe at any time.',
        vatNotice: 'Amount: EUR 150.00/month — VAT not applicable, art. 293 B CGI (French tax code)',
        submit: 'Subscribe — €150/month',
        cancel: 'Cancel',
        required: 'Required field',
        invalidEmail: 'Invalid email address',
        contextTooLong: 'Maximum 2000 characters',
        sectorsRequired: 'Select at least 1 sector',
        regulationsRequired: 'Select at least 1 regulation',
        cgvRequired: 'Acceptance of Terms required',
        rgpdRequired: 'GDPR consent required',
        submitting: 'Redirecting to payment…',
    },
};

const SECTORS: { fr: string; en: string }[] = [
    { fr: 'Automobile', en: 'Automotive' },
    { fr: 'Aéronautique', en: 'Aeronautics' },
    { fr: 'Batteries / Énergie', en: 'Batteries / Energy' },
    { fr: 'Équipements industriels', en: 'Industrial equipment' },
    { fr: 'Robotique / Automatisation', en: 'Robotics / Automation' },
    { fr: 'Dispositifs médicaux', en: 'Medical devices' },
    { fr: 'Électronique / IoT', en: 'Electronics / IoT' },
    { fr: 'Ferroviaire', en: 'Railway' },
    { fr: 'Construction / BTP', en: 'Construction' },
    { fr: 'Chimie', en: 'Chemistry' },
    { fr: 'Métallurgie', en: 'Metallurgy' },
    { fr: 'Plasturgie', en: 'Plastics' },
    { fr: 'Textile technique', en: 'Technical textiles' },
    { fr: 'Défense', en: 'Defence' },
    { fr: 'Autre', en: 'Other' },
];

const REGULATIONS = [
    'AI Act',
    'CRA (Cyber Resilience Act)',
    'Règlement Machines 2023/1230',
    'ESPR / DPP',
    'Battery Regulation',
    'RGPD',
    'NIS2',
    'DORA',
    'Data Act',
    'CSRD',
    'REACH',
    'Autre',
];

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

type FieldErrors = Partial<Record<string, string>>;

export default function VeilleSubscriptionForm({ onClose, onSubmit, isLoading }: VeilleSubscriptionFormProps) {
    const { lang } = useLang();
    const t = labels[lang];

    const [email, setEmail] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [company, setCompany] = useState('');
    const [sectors, setSectors] = useState<string[]>([]);
    const [regulations, setRegulations] = useState<string[]>([]);
    const [context, setContext] = useState('');
    const [acceptCGV, setAcceptCGV] = useState(false);
    const [acceptRGPD, setAcceptRGPD] = useState(false);

    const [showCGV, setShowCGV] = useState(false);
    const [showPrivacy, setShowPrivacy] = useState(false);

    const [errors, setErrors] = useState<FieldErrors>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = (): FieldErrors => {
        const e: FieldErrors = {};
        if (!email.trim()) e.email = t.required;
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = t.invalidEmail;
        if (!firstName.trim()) e.firstName = t.required;
        if (!lastName.trim()) e.lastName = t.required;
        if (!company.trim()) e.company = t.required;
        if (sectors.length === 0) e.sectors = t.sectorsRequired;
        if (regulations.length === 0) e.regulations = t.regulationsRequired;
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
            sectors,
            regulations,
            context: context.trim(),
        });
    };

    const toggleSector = (s: string) => {
        setSectors(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
    };

    const toggleRegulation = (reg: string) => {
        setRegulations(prev => prev.includes(reg) ? prev.filter(r => r !== reg) : [...prev, reg]);
    };

    const revalidate = () => {
        if (submitted) {
            setTimeout(() => setErrors(validate()), 0);
        }
    };

    const err = (field: string) => submitted ? errors[field] : undefined;

    return (
        <>
            <div
                style={{
                    position: 'fixed', inset: 0, zIndex: 9998,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 16,
                }}
                onClick={onClose}
            >
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

                    <h2 style={{ fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 20 }}>
                        {t.title}
                    </h2>

                    <form onSubmit={handleSubmit}>

                        {/* Section 1 : Identification */}
                        <div style={sectionHeadingStyle}>{t.section1}</div>

                        <div style={{ marginBottom: 12 }}>
                            <label style={labelStyle}>{t.email} *</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => { setEmail(e.target.value); revalidate(); }}
                                style={err('email') ? inputErrorStyle : inputStyle}
                                placeholder="name@company.com"
                                required
                                aria-required="true"
                            />
                            {err('email') && <div style={errorTextStyle}>{err('email')}</div>}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                            <div>
                                <label style={labelStyle}>{t.firstName} *</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={e => { setFirstName(e.target.value); revalidate(); }}
                                    style={err('firstName') ? inputErrorStyle : inputStyle}
                                    required
                                    aria-required="true"
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
                                    required
                                    aria-required="true"
                                />
                                {err('lastName') && <div style={errorTextStyle}>{err('lastName')}</div>}
                            </div>
                        </div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>{t.company} *</label>
                            <input
                                type="text"
                                value={company}
                                onChange={e => { setCompany(e.target.value); revalidate(); }}
                                style={err('company') ? inputErrorStyle : inputStyle}
                                required
                                aria-required="true"
                            />
                            {err('company') && <div style={errorTextStyle}>{err('company')}</div>}
                        </div>

                        {/* Section 2 : Périmètre veille */}
                        <div style={sectionHeadingStyle}>{t.section2}</div>

                        <div style={{ marginBottom: 16 }}>
                            <label style={labelStyle}>{t.sectors} *</label>
                            <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 8 }}>{t.sectorsHint}</div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                                {SECTORS.map(s => (
                                    <label
                                        key={s.en}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: 8,
                                            fontSize: 12, color: C.textSecondary, cursor: 'pointer',
                                            padding: '4px 0',
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={sectors.includes(s.en)}
                                            onChange={() => { toggleSector(s.en); revalidate(); }}
                                            style={{ accentColor: C.accent, width: 15, height: 15, cursor: 'pointer' }}
                                        />
                                        {s[lang]}
                                    </label>
                                ))}
                            </div>
                            {err('sectors') && <div style={errorTextStyle}>{err('sectors')}</div>}
                        </div>

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

                        {/* Section 3 : Contexte */}
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

                        {/* Section 4 : Acceptation */}
                        <div style={sectionHeadingStyle}>{t.section4}</div>

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

                        {/* Notice RGPD */}
                        <div
                            style={{
                                background: '#fef3c7',
                                border: '1px solid #fbbf24',
                                borderRadius: 10,
                                padding: '10px 14px',
                                marginBottom: 12,
                                fontSize: 11,
                                color: '#92400e',
                                lineHeight: 1.5,
                            }}
                        >
                            {t.rgpdNotice}
                        </div>

                        {/* VAT mention */}
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

            {showCGV && <CGVModal onClose={() => setShowCGV(false)} lang={lang} />}
            {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} lang={lang} />}
        </>
    );
}
