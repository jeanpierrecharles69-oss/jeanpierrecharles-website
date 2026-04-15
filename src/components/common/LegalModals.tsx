import React from 'react';
import { C } from '../homepage/constants';

/* ──────────────────────────────────────────────────────────
 * Shared helpers
 * ────────────────────────────────────────────────────────── */

const Overlay: React.FC<{ onClose: () => void; children: React.ReactNode }> = ({ onClose, children }) => (
    <div
        style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
        }}
        onClick={onClose}
    >
        <div
            style={{
                background: '#fff', borderRadius: 16, maxWidth: 700,
                width: '100%', maxHeight: '85vh', overflowY: 'auto',
                padding: '32px 28px', position: 'relative',
                boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'none', border: 'none', fontSize: 20,
                    cursor: 'pointer', color: '#64748b', lineHeight: 1,
                }}
                aria-label="Close"
            >
                &times;
            </button>
            {children}
        </div>
    </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', margin: '18px 0 8px' }}>{children}</h3>
);

const P: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <p style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, margin: '6px 0' }}>{children}</p>
);

const CloseBtn: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button
            onClick={onClick}
            style={{
                fontSize: 13, fontWeight: 600, padding: '10px 32px',
                borderRadius: 10, background: '#1e293b', color: '#fff',
                border: 'none', cursor: 'pointer',
            }}
        >
            {label}
        </button>
    </div>
);

/* ──────────────────────────────────────────────────────────
 * CGV Modal
 * ────────────────────────────────────────────────────────── */

export function CGVModal({ onClose, lang }: { onClose: () => void; lang: string }) {
    const isFR = lang === 'fr';

    if (!isFR) {
        return (
            <Overlay onClose={onClose}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                    General Terms of Sale
                </h2>
                <P>English version available upon request — please contact <a href="mailto:contact@jeanpierrecharles.com" style={{ color: C.accent }}>contact@jeanpierrecharles.com</a></P>
                <P>The French version below is the legally binding version.</P>
                <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                {renderCGVContent()}
                <CloseBtn label="Close" onClick={onClose} />
            </Overlay>
        );
    }

    return (
        <Overlay onClose={onClose}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                Conditions G&eacute;n&eacute;rales de Vente
            </h2>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12 }}>
                Version 1.0 — [V1 DRAFT — RELECTURE JP REQUISE]
            </div>
            {renderCGVContent()}
            <CloseBtn label="Fermer" onClick={onClose} />
        </Overlay>
    );
}

function renderCGVContent() {
    return (
        <>
            <SectionTitle>Article 1 — Objet et champ d'application</SectionTitle>
            <P>
                Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales de Vente (&laquo; CGV &raquo;) r&eacute;gissent les relations contractuelles entre Jean-Pierre Charles, Entrepreneur Individuel exer&ccedil;ant sous l'enseigne &laquo; AEGIS Intelligence &raquo; (ci-apr&egrave;s &laquo; le Prestataire &raquo;), et tout client professionnel ou particulier (ci-apr&egrave;s &laquo; le Client &raquo;) souhaitant b&eacute;n&eacute;ficier des services propos&eacute;s via le site jeanpierrecharles.com.
            </P>
            <P>
                Toute commande pass&eacute;e implique l'acceptation sans r&eacute;serve des pr&eacute;sentes CGV. Le Client reconna&icirc;t en avoir pris connaissance pr&eacute;alablement &agrave; sa commande, conform&eacute;ment &agrave; l'article 1119 du Code civil.
            </P>

            <SectionTitle>Article 2 — Services propos&eacute;s</SectionTitle>
            <P>Le Prestataire propose une gamme de services d'expertise et d'intelligence r&eacute;glementaire industrielle pour les march&eacute;s europ&eacute;ens :</P>
            <ul style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, paddingLeft: 20, margin: '6px 0' }}>
                <li><strong>PULSE</strong> : pr&eacute;-diagnostic IA gratuit</li>
                <li><strong>DIAGNOSTIC</strong> : rapport PDF premium d'analyse causale r&eacute;glementaire (250,00 EUR par rapport)</li>
                <li><strong>VEILLE</strong> : abonnement mensuel d'intelligence r&eacute;glementaire continue (150,00 EUR/mois — non disponible &agrave; la date d'effet)</li>
                <li><strong>EXPERTISE TERRAIN</strong> : interventions sur mesure (350,00 EUR/h ou 2 500,00 EUR/mois)</li>
            </ul>

            <SectionTitle>Article 3 — Prix et r&eacute;gime de TVA</SectionTitle>
            <P>Les prix sont indiqu&eacute;s en euros (EUR). Le Prestataire rel&egrave;ve du r&eacute;gime de la franchise en base de TVA.</P>
            <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bae6fd', margin: '8px 0', fontSize: 11, fontWeight: 600, color: '#0369a1' }}>
                TVA non applicable, article 293 B du Code g&eacute;n&eacute;ral des imp&ocirc;ts.
            </div>
            <P>Le Prestataire se r&eacute;serve le droit de modifier ses prix &agrave; tout moment. Les services sont factur&eacute;s sur la base des tarifs en vigueur &agrave; la date de la commande.</P>

            <SectionTitle>Article 4 — Commande</SectionTitle>
            <P>La commande s'effectue exclusivement en ligne. Le processus comprend : s&eacute;lection du service, saisie des informations d'identification, saisie des informations du diagnostic souhait&eacute;, acceptation expresse des CGV et de la Politique de Confidentialit&eacute;, paiement via Mollie. La commande est ferme et d&eacute;finitive &agrave; r&eacute;ception du paiement.</P>

            <SectionTitle>Article 5 — Modalit&eacute;s de paiement</SectionTitle>
            <P>Paiement en ligne par carte bancaire (CB, Visa, Mastercard, AMEX) ou virement SEPA via Mollie. Paiement exigible imm&eacute;diatement. En cas de retard : p&eacute;nalit&eacute;s au taux d'int&eacute;r&ecirc;t l&eacute;gal major&eacute; de 5 points + indemnit&eacute; forfaitaire 40,00 EUR (art. L441-10 Code de commerce).</P>

            <SectionTitle>Article 6 — Livraison du service DIAGNOSTIC</SectionTitle>
            <P>Rapport PDF livr&eacute; par email. Paiement avant 17h CET jour ouvr&eacute; : livraison le jour m&ecirc;me avant 19h CET. Apr&egrave;s 17h / week-end / jours f&eacute;ri&eacute;s : livraison avant 12h CET le jour ouvr&eacute; suivant.</P>

            <SectionTitle>Article 7 — Droit de r&eacute;tractation (B2C)</SectionTitle>
            <P>
                Le Client particulier (B2C) dispose d'un d&eacute;lai de 14 jours (art. L221-18 Code consommation). Attention : conform&eacute;ment &agrave; l'article L221-28-13, le droit de r&eacute;tractation ne peut &ecirc;tre exerc&eacute; pour les contenus num&eacute;riques dont l'ex&eacute;cution a commenc&eacute; apr&egrave;s accord expr&egrave;s et renoncement expr&egrave;s du consommateur. Pour les clients B2B, le droit de r&eacute;tractation l&eacute;gal n'est pas applicable (art. L221-3).
            </P>

            <SectionTitle>Article 8 — Obligation de moyen et responsabilit&eacute;</SectionTitle>
            <P>
                Le Prestataire s'engage &agrave; fournir un service de qualit&eacute; professionnelle. Cette obligation est une obligation de moyen. Le rapport ne se substitue pas &agrave; une consultation juridique formelle. Responsabilit&eacute; plafonn&eacute;e au montant vers&eacute; pour la prestation concern&eacute;e.
            </P>

            <SectionTitle>Article 9 — Propri&eacute;t&eacute; intellectuelle</SectionTitle>
            <P>Le rapport DIAGNOSTIC reste la propri&eacute;t&eacute; intellectuelle du Prestataire. Le Client b&eacute;n&eacute;ficie d'un droit d'usage interne. La diffusion publique, reproduction commerciale ou revente est interdite sans accord &eacute;crit.</P>

            <SectionTitle>Article 10 — Donn&eacute;es personnelles</SectionTitle>
            <P>Le traitement des donn&eacute;es personnelles est r&eacute;gi par la Politique de Confidentialit&eacute; du Prestataire, accessible sur le site.</P>

            <SectionTitle>Article 11 — M&eacute;diation et litiges</SectionTitle>
            <P>
                Client B2C : recours gratuit au service de m&eacute;diation ([MEDIATEUR_A_DESIGNER]) ou plateforme europ&eacute;enne RLL (https://ec.europa.eu/consumers/odr). Tous clients : &agrave; d&eacute;faut d'accord amiable, tribunaux fran&ccedil;ais comp&eacute;tents, loi fran&ccedil;aise applicable.
            </P>

            <SectionTitle>Article 12 — Modifications</SectionTitle>
            <P>Le Prestataire se r&eacute;serve le droit de modifier les CGV. Les CGV applicables sont celles en vigueur &agrave; la date de la commande.</P>
        </>
    );
}

/* ──────────────────────────────────────────────────────────
 * Privacy Modal
 * ────────────────────────────────────────────────────────── */

export function PrivacyModal({ onClose, lang }: { onClose: () => void; lang: string }) {
    const isFR = lang === 'fr';

    if (!isFR) {
        return (
            <Overlay onClose={onClose}>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                    Privacy Policy (GDPR)
                </h2>
                <P>English version available upon request — please contact <a href="mailto:contact@jeanpierrecharles.com" style={{ color: C.accent }}>contact@jeanpierrecharles.com</a></P>
                <P>The French version below is the legally binding version.</P>
                <hr style={{ margin: '16px 0', border: 'none', borderTop: '1px solid #e2e8f0' }} />
                {renderPrivacyContent()}
                <CloseBtn label="Close" onClick={onClose} />
            </Overlay>
        );
    }

    return (
        <Overlay onClose={onClose}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 12 }}>
                Politique de Confidentialit&eacute;
            </h2>
            <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12 }}>
                Version 1.0 — Responsable : Jean-Pierre Charles — contact@jeanpierrecharles.com — [V1 DRAFT]
            </div>
            {renderPrivacyContent()}
            <CloseBtn label="Fermer" onClick={onClose} />
        </Overlay>
    );
}

function renderPrivacyContent() {
    return (
        <>
            <SectionTitle>1. Engagement RGPD</SectionTitle>
            <P>Le Prestataire s'engage &agrave; respecter le R&egrave;glement (UE) 2016/679 (RGPD) ainsi que la loi Informatique et Libert&eacute;s du 6 janvier 1978 modifi&eacute;e.</P>

            <SectionTitle>2. Donn&eacute;es collect&eacute;es</SectionTitle>
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Cat&eacute;gorie</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Donn&eacute;es</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Base l&eacute;gale</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Conservation</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Identification</td>
                            <td style={{ padding: '6px' }}>Email, nom, soci&eacute;t&eacute;, pays, ville</td>
                            <td style={{ padding: '6px' }}>Ex&eacute;cution contrat (6.1.b)</td>
                            <td style={{ padding: '6px' }}>10 ans (comptable)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Diagnostic</td>
                            <td style={{ padding: '6px' }}>Secteur, produit, r&egrave;glements, contexte</td>
                            <td style={{ padding: '6px' }}>Ex&eacute;cution contrat (6.1.b)</td>
                            <td style={{ padding: '6px' }}>10 ans</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Conversations Brain</td>
                            <td style={{ padding: '6px' }}>Messages IA</td>
                            <td style={{ padding: '6px' }}>Consentement (6.1.a)</td>
                            <td style={{ padding: '6px' }}>Session uniquement</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Paiement</td>
                            <td style={{ padding: '6px' }}>Donn&eacute;es bancaires</td>
                            <td style={{ padding: '6px' }}>Ex&eacute;cution contrat</td>
                            <td style={{ padding: '6px' }}>G&eacute;r&eacute; par Mollie</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px' }}>Connexion</td>
                            <td style={{ padding: '6px' }}>IP, donn&eacute;es navigateur</td>
                            <td style={{ padding: '6px' }}>Int&eacute;r&ecirc;t l&eacute;gitime (6.1.f)</td>
                            <td style={{ padding: '6px' }}>12 mois</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <SectionTitle>3. Finalit&eacute;s</SectionTitle>
            <P>Ex&eacute;cution du contrat, facturation, support, obligations l&eacute;gales, am&eacute;lioration des services (statistiques anonymis&eacute;es). Vos donn&eacute;es ne sont jamais utilis&eacute;es pour de la prospection commerciale tierce, vendues, lou&eacute;es ou c&eacute;d&eacute;es.</P>

            <SectionTitle>4. Sous-traitants et transferts</SectionTitle>
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Sous-traitant</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Localisation</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>R&ocirc;le</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Garanties</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Vercel Inc.</td><td style={{ padding: '6px' }}>USA / edges EU</td>
                            <td style={{ padding: '6px' }}>H&eacute;bergement</td><td style={{ padding: '6px' }}>CCT</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Mollie B.V.</td><td style={{ padding: '6px' }}>Pays-Bas (UE)</td>
                            <td style={{ padding: '6px' }}>Paiements</td><td style={{ padding: '6px' }}>UE native, DPA</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Anthropic PBC</td><td style={{ padding: '6px' }}>USA</td>
                            <td style={{ padding: '6px' }}>DIAGNOSTIC (Opus)</td><td style={{ padding: '6px' }}>CCT, 0 training</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Google LLC</td><td style={{ padding: '6px' }}>USA</td>
                            <td style={{ padding: '6px' }}>Brain (Gemini)</td><td style={{ padding: '6px' }}>CCT</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px' }}>Gandi SAS</td><td style={{ padding: '6px' }}>France</td>
                            <td style={{ padding: '6px' }}>DNS &amp; email</td><td style={{ padding: '6px' }}>UE native</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <P>Transferts hors UE encadr&eacute;s par les clauses contractuelles types (CCT, d&eacute;cision 2021/914), art. 44-49 RGPD.</P>

            <SectionTitle>5. Vos droits</SectionTitle>
            <P>
                Conform&eacute;ment aux articles 15 &agrave; 22 RGPD : droit d'acc&egrave;s, rectification, effacement, limitation, portabilit&eacute;, opposition, retrait du consentement, r&eacute;clamation CNIL (https://www.cnil.fr). Contact : contact@jeanpierrecharles.com. R&eacute;ponse sous 30 jours.
            </P>

            <SectionTitle>6. Cookies</SectionTitle>
            <P>Cookie unique : cookie_consent (choix IA, 12 mois). Aucun cookie publicitaire, marketing ou de profilage. Aucun cookie tiers.</P>

            <SectionTitle>7. S&eacute;curit&eacute;</SectionTitle>
            <P>Chiffrement TLS 1.3, cl&eacute;s API en variables d'environnement chiffr&eacute;es, acc&egrave;s limit&eacute;, notification CNIL sous 72h en cas de violation (art. 33-34 RGPD).</P>

            <SectionTitle>8. Modifications</SectionTitle>
            <P>Politique mise &agrave; jour selon &eacute;volutions r&eacute;glementaires. Version applicable : celle en vigueur &agrave; la date de votre commande.</P>

            <SectionTitle>9. Contact</SectionTitle>
            <P>Email : contact@jeanpierrecharles.com — Courrier : Jean-Pierre Charles — [ADRESSE_PRO_A_INSERER]</P>
        </>
    );
}

/* ──────────────────────────────────────────────────────────
 * Mentions Legales V2 (enriched)
 * ────────────────────────────────────────────────────────── */

export function MentionsLegalesModalV2({ onClose, lang }: { onClose: () => void; lang: string }) {
    const isFR = lang === 'fr';

    return (
        <Overlay onClose={onClose}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1e293b', marginBottom: 20 }}>
                {isFR ? 'Mentions L\u00e9gales' : 'Legal Notice'}
            </h2>

            {/* Editeur */}
            <SectionTitle>{isFR ? '1. \u00c9diteur du site' : '1. Site publisher'}</SectionTitle>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                        {isFR ? 'Identit\u00e9 : CHARLES Jean-Pierre' : 'Identity: CHARLES Jean-Pierre'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                        {isFR ? 'Enseigne : AEGIS Intelligence' : 'Trade name: AEGIS Intelligence'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>
                        {isFR ? 'Forme juridique : Entrepreneur individuel (micro-entrepreneur)' : 'Legal form: Sole proprietor (micro-entrepreneur)'}
                    </div>
                </div>
                <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                        {isFR ? 'Directeur de la publication' : 'Publication director'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>Jean-Pierre Charles</div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                        {isFR ? 'T\u00e9l\u00e9phone' : 'Phone'} : [TELEPHONE_A_INSERER]
                    </div>
                </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>Identification</div>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.8 }}>
                    SIREN : 522 794 700<br />
                    SIRET : 522 794 700 00032<br />
                    Code APE : 7112B - Ing&eacute;nierie, &eacute;tudes techniques<br />
                    TVA : Non applicable — art. 293 B du CGI
                </div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 10, padding: '12px 16px', border: '1px solid #e2e8f0', marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', marginBottom: 6 }}>
                    {isFR ? 'Coordonn\u00e9es' : 'Address'}
                </div>
                <div style={{ fontSize: 11, color: '#475569' }}>
                    {isFR ? 'Si\u00e8ge social' : 'Registered office'} : 10 La Bertini&egrave;re, 86800 Terc&eacute;, FRANCE<br />
                    Email : contact@jeanpierrecharles.com
                </div>
            </div>

            {/* Hebergeur */}
            <SectionTitle>{isFR ? '2. H\u00e9bergement' : '2. Hosting'}</SectionTitle>
            <div style={{ background: '#f0f9ff', borderRadius: 10, padding: '12px 16px', border: '1px solid #bae6fd', marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#475569', lineHeight: 1.8 }}>
                    <strong>{isFR ? 'H\u00e9bergeur principal' : 'Main host'} :</strong> Vercel Inc.<br />
                    440 N Barranca Ave #4133, Covina, CA 91723, USA<br />
                    https://vercel.com<br /><br />
                    <strong>{isFR ? 'DNS et email' : 'DNS and email'} :</strong> Gandi SAS<br />
                    63-65 Boulevard Mass&eacute;na, 75013 Paris, France<br />
                    https://www.gandi.net
                </div>
            </div>

            {/* Activite */}
            <SectionTitle>{isFR ? '3. Activit\u00e9' : '3. Activity'}</SectionTitle>
            <P>
                {isFR
                    ? 'Ing\u00e9nierie, expertise technique industrielle, planification strat\u00e9gique, transformation digitale, d\u00e9carbonation, \u00e9coconception produits, syst\u00e8mes cyberphysiques, int\u00e9gration IA, agents copilotes, gestion compliance et risques.'
                    : 'Engineering, industrial technical expertise, strategic planning, digital transformation, decarbonisation, product ecodesign, cyberphysical systems, AI integration, copilot agents, compliance and risk management.'}
            </P>

            {/* PI + liens + juridiction */}
            <SectionTitle>{isFR ? '4. Propri\u00e9t\u00e9 intellectuelle' : '4. Intellectual property'}</SectionTitle>
            <P>
                {isFR
                    ? "L'ensemble du site est prot\u00e9g\u00e9 par le droit de la propri\u00e9t\u00e9 intellectuelle. Toute reproduction sans autorisation \u00e9crite est interdite (art. L335-2 CPI)."
                    : 'The entire site is protected by intellectual property law. Any reproduction without written consent is prohibited.'}
            </P>

            <SectionTitle>{isFR ? '5. Droit applicable' : '5. Governing law'}</SectionTitle>
            <P>
                {isFR
                    ? 'Loi fran\u00e7aise applicable. Tribunaux fran\u00e7ais comp\u00e9tents en cas de litige.'
                    : 'French law applies. French courts have jurisdiction.'}
            </P>

            <CloseBtn label={isFR ? 'Fermer' : 'Close'} onClick={onClose} />
        </Overlay>
    );
}
