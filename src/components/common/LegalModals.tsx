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

/* Header notice EN — clause de prééminence linguistique (FR prevails) */
const BindingNoticeEN: React.FC<{ context: 'GTS' | 'Privacy' }> = ({ context }) => (
    <div
        style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: 8,
            padding: 12,
            fontSize: 11,
            color: '#78350f',
            lineHeight: 1.6,
            margin: '12px 0 16px',
        }}
        role="note"
        aria-label="Binding language notice"
    >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>
            Official Translation — French version prevails
        </div>
        {context === 'GTS' ? (
            <>
                The original French version of these General Terms of Sale (Conditions G&eacute;n&eacute;rales de Vente) constitutes the sole binding legal document.
                This English translation is provided for the convenience and understanding of non-French-speaking professional clients. In case of any discrepancy, ambiguity,
                or contradiction between the French and English versions, the French version shall prevail in all legal proceedings before French courts.
                <br />
                For any legal question regarding these terms, please contact:{' '}
                <a href="mailto:contact@jeanpierrecharles.com" style={{ color: '#92400e', fontWeight: 600 }}>contact@jeanpierrecharles.com</a>
            </>
        ) : (
            <>
                The original French version of this Privacy Policy is the sole binding legal document. This English translation is provided for the understanding
                of non-French-speaking data subjects, in accordance with the GDPR transparency principle (Art. 12.1 Regulation (EU) 2016/679). In case of discrepancy,
                the French version prevails.
                <br />
                Contact:{' '}
                <a href="mailto:contact@jeanpierrecharles.com" style={{ color: '#92400e', fontWeight: 600 }}>contact@jeanpierrecharles.com</a>
            </>
        )}
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
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12 }}>
                    Version 1.2 — Effective from 29 April 2026
                </div>
                <BindingNoticeEN context="GTS" />
                {renderCGVContent_EN()}
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
                Version 1.2 — En vigueur &agrave; compter du 29 avril 2026
            </div>
            {renderCGVContent_FR()}
            <CloseBtn label="Fermer" onClick={onClose} />
        </Overlay>
    );
}

function renderCGVContent_FR() {
    return (
        <>
            <SectionTitle>Article 1 — Objet et champ d'application</SectionTitle>
            <P>
                Les pr&eacute;sentes Conditions G&eacute;n&eacute;rales de Vente (&laquo; CGV &raquo;) r&eacute;gissent les relations contractuelles entre Jean-Pierre Charles, Entrepreneur Individuel exer&ccedil;ant sous l'enseigne &laquo; AEGIS Intelligence &raquo; (ci-apr&egrave;s &laquo; le Prestataire &raquo;), et tout client professionnel au sens du Code de commerce, agissant dans le cadre de son activit&eacute; industrielle, commerciale ou de prestation de services (ci-apr&egrave;s &laquo; le Client &raquo;), souhaitant b&eacute;n&eacute;ficier des services propos&eacute;s via le site jeanpierrecharles.com.
            </P>
            <P>
                Les services propos&eacute;s sont destin&eacute;s exclusivement aux entreprises priv&eacute;es (B2B). Ils ne sont pas destin&eacute;s aux consommateurs au sens du Code de la consommation. Toute commande &eacute;manant d'un consommateur sera refus&eacute;e et int&eacute;gralement rembours&eacute;e. L'extension aux Collectivit&eacute;s Territoriales (B2G) et aux particuliers (B2C) est pr&eacute;vue dans des conditions g&eacute;n&eacute;rales d&eacute;di&eacute;es publi&eacute;es ult&eacute;rieurement.
            </P>
            <P>
                Toute commande pass&eacute;e implique l'acceptation sans r&eacute;serve des pr&eacute;sentes CGV. Le Client reconna&icirc;t en avoir pris connaissance pr&eacute;alablement &agrave; sa commande, conform&eacute;ment &agrave; l'article 1119 du Code civil.
            </P>

            <SectionTitle>Article 2 — Services propos&eacute;s</SectionTitle>
            <P>Le Prestataire propose une gamme de services d'expertise et d'intelligence r&eacute;glementaire industrielle &agrave; destination des PME et ETI industrielles europ&eacute;ennes :</P>
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
            <P>Paiement en ligne par carte bancaire (CB, Visa, Mastercard, AMEX) ou virement SEPA via Mollie. Conform&eacute;ment &agrave; l'article L441-10 du Code de commerce, <strong>transposant la Directive 2011/7/UE du 16 f&eacute;vrier 2011 concernant la lutte contre le retard de paiement dans les transactions commerciales</strong>, sauf stipulation contraire n&eacute;goci&eacute;e entre les Parties et accept&eacute;e par &eacute;crit, le paiement est exigible imm&eacute;diatement &agrave; la commande. Aucun escompte n'est accord&eacute; pour paiement anticip&eacute;.</P>
            <P>En cas de retard ou de d&eacute;faut de paiement : p&eacute;nalit&eacute;s au taux d'int&eacute;r&ecirc;t l&eacute;gal major&eacute; de 5 points + indemnit&eacute; forfaitaire pour frais de recouvrement de 40,00 EUR (art. L441-10 Code de commerce ; art. 6 Directive 2011/7/UE).</P>

            <SectionTitle>Article 6 — Livraison du service DIAGNOSTIC</SectionTitle>
            <P>Rapport PDF livr&eacute; par email. Paiement avant 17h CET jour ouvr&eacute; : livraison le jour m&ecirc;me avant 19h CET. Apr&egrave;s 17h / week-end / jours f&eacute;ri&eacute;s : livraison avant 12h CET le jour ouvr&eacute; suivant.</P>

            <SectionTitle>Article 7 — Droit de r&eacute;tractation</SectionTitle>
            <P>
                Le pr&eacute;sent contrat &eacute;tant conclu entre professionnels, le droit de r&eacute;tractation pr&eacute;vu par les articles L221-18 et suivants du Code de la consommation n'est pas applicable, conform&eacute;ment &agrave; l'article L221-3 du m&ecirc;me code.
            </P>

            <SectionTitle>Article 8 — Obligation de moyen et responsabilit&eacute;</SectionTitle>
            <P>
                Le Prestataire s'engage &agrave; fournir un service d'expertise r&eacute;glementaire de qualit&eacute; professionnelle, fond&eacute; sur 32 ann&eacute;es d'exp&eacute;rience industrielle. Cette obligation est une obligation de moyen, non de r&eacute;sultat. Le rapport DIAGNOSTIC ne se substitue pas &agrave; une consultation juridique formelle ni &agrave; un avis officiel d'une autorit&eacute; de r&eacute;gulation.
            </P>
            <P>
                La responsabilit&eacute; du Prestataire est plafonn&eacute;e au montant total vers&eacute; par le Client pour la prestation concern&eacute;e. Conform&eacute;ment &agrave; l'article 1170 du Code civil, la pr&eacute;sente clause limitative ne s'applique pas en cas de faute lourde ou dolosive du Prestataire ni en cas de manquement &agrave; une obligation essentielle du contrat.
            </P>

            <SectionTitle>Article 9 — Propri&eacute;t&eacute; intellectuelle</SectionTitle>
            <P>Le rapport DIAGNOSTIC reste la propri&eacute;t&eacute; intellectuelle du Prestataire. Le Client b&eacute;n&eacute;ficie d'un droit d'usage interne. La diffusion publique, reproduction commerciale ou revente est interdite sans accord &eacute;crit.</P>

            <SectionTitle>Article 10 — Donn&eacute;es personnelles</SectionTitle>
            <P>Le traitement des donn&eacute;es personnelles est r&eacute;gi par la Politique de Confidentialit&eacute; du Prestataire, accessible sur le site.</P>

            <SectionTitle>Article 11 — R&egrave;glement des litiges</SectionTitle>
            <P>
                Avant toute action contentieuse, les Parties s'engagent &agrave; rechercher une solution amiable par voie de n&eacute;gociation directe. &Agrave; d&eacute;faut d'accord amiable dans un d&eacute;lai de trente (30) jours &agrave; compter de la notification du diff&eacute;rend, tout litige relatif &agrave; la formation, l'ex&eacute;cution ou l'interpr&eacute;tation des pr&eacute;sentes CGV rel&egrave;ve de la <strong>comp&eacute;tence exclusive des tribunaux fran&ccedil;ais</strong> du ressort du si&egrave;ge du Prestataire, conform&eacute;ment &agrave; <strong>l'article 25 du R&egrave;glement (UE) n&deg; 1215/2012 du 12 d&eacute;cembre 2012 (Bruxelles I bis refonte)</strong> concernant la comp&eacute;tence judiciaire, la reconnaissance et l'ex&eacute;cution des d&eacute;cisions en mati&egrave;re civile et commerciale.
            </P>
            <P>
                La loi applicable est la <strong>loi fran&ccedil;aise</strong>, conform&eacute;ment &agrave; <strong>l'article 3 du R&egrave;glement (CE) n&deg; 593/2008 du 17 juin 2008 (Rome I)</strong> sur la loi applicable aux obligations contractuelles, les Parties choisissant express&eacute;ment la loi fran&ccedil;aise comme loi r&eacute;gissant le pr&eacute;sent contrat.
            </P>

            <SectionTitle>Article 12 — Modifications</SectionTitle>
            <P>Le Prestataire se r&eacute;serve le droit de modifier les CGV. Les CGV applicables sont celles en vigueur &agrave; la date de la commande.</P>

            <SectionTitle>Article 13 — Transparence IA (conformit&eacute; R&egrave;glement IA Act EU)</SectionTitle>
            <P>
                Conform&eacute;ment &agrave; <strong>l'article 50 du R&egrave;glement (UE) 2024/1689 du 13 juin 2024 (R&egrave;glement IA Act)</strong> &eacute;tablissant des r&egrave;gles harmonis&eacute;es concernant l'intelligence artificielle (entr&eacute;e en vigueur le 2 ao&ucirc;t 2026, application anticip&eacute;e &agrave; compter d'avril 2026 par le Prestataire), le Client est express&eacute;ment inform&eacute; que :
            </P>
            <ol style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, paddingLeft: 20, margin: '6px 0' }}>
                <li>Le rapport DIAGNOSTIC est <strong>g&eacute;n&eacute;r&eacute; avec l'assistance d'un syst&egrave;me d'intelligence artificielle</strong> (Claude Opus 4.6, d&eacute;velopp&eacute; par Anthropic PBC), sous la supervision qualifi&eacute;e et le contr&ocirc;le &eacute;ditorial de Jean-Pierre Charles.</li>
                <li>Le pr&eacute;-diagnostic PULSE et l'AEGIS Intelligence Brain sont des <strong>syst&egrave;mes d'IA conversationnels</strong> bas&eacute;s sur Gemini Flash (d&eacute;velopp&eacute; par Google LLC) et Claude Opus.</li>
                <li>Le contenu g&eacute;n&eacute;r&eacute; par IA refl&egrave;te une analyse r&eacute;glementaire fond&eacute;e sur les donn&eacute;es d'entra&icirc;nement et les prompts de configuration &eacute;tablis par le Prestataire ; il ne se substitue pas &agrave; une consultation juridique formelle ni &agrave; un avis officiel d'une autorit&eacute; de r&eacute;gulation (cf. Article 8).</li>
                <li>Le Client conserve le droit de demander une revue humaine exclusive de tout rapport DIAGNOSTIC au tarif standard EXPERTISE TERRAIN (350,00 EUR/heure).</li>
            </ol>
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
                <div style={{ fontSize: 10, color: '#94a3b8', marginBottom: 12 }}>
                    Version 1.1 — Controller: Jean-Pierre Charles — contact@jeanpierrecharles.com — Effective from 15 April 2026
                </div>
                <BindingNoticeEN context="Privacy" />
                {renderPrivacyContent_EN()}
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
                Version 1.1 — Responsable : Jean-Pierre Charles — contact@jeanpierrecharles.com — En vigueur &agrave; compter du 15 avril 2026
            </div>
            {renderPrivacyContent_FR()}
            <CloseBtn label="Fermer" onClick={onClose} />
        </Overlay>
    );
}

function renderPrivacyContent_FR() {
    return (
        <>
            <SectionTitle>1. Engagement RGPD</SectionTitle>
            <P>Le Prestataire s'engage &agrave; respecter le R&egrave;glement (UE) 2016/679 du Parlement europ&eacute;en et du Conseil du 27 avril 2016 relatif &agrave; la protection des personnes physiques &agrave; l'&eacute;gard du traitement des donn&eacute;es &agrave; caract&egrave;re personnel et &agrave; la libre circulation de ces donn&eacute;es (RGPD), ainsi que la loi n&deg; 78-17 du 6 janvier 1978 modifi&eacute;e relative &agrave; l'informatique, aux fichiers et aux libert&eacute;s.</P>

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
            <P>Conform&eacute;ment aux articles 13.1.e et 28 du R&egrave;glement (UE) 2016/679 (RGPD), sont identifi&eacute;s ci-apr&egrave;s les sous-traitants techniques agissant pour le compte du Prestataire. Chacun est li&eacute; par un Contrat de Sous-Traitance (Data Processing Agreement, DPA) au sens de l'article 28 RGPD.</P>
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
                            <td style={{ padding: '6px' }}>H&eacute;bergement</td><td style={{ padding: '6px' }}>CCT (UE 2021/914) + DPA art. 28 RGPD</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Mollie B.V.</td><td style={{ padding: '6px' }}>Pays-Bas (UE)</td>
                            <td style={{ padding: '6px' }}>Paiements</td><td style={{ padding: '6px' }}>Conformit&eacute; UE native + DPA art. 28 RGPD</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Anthropic PBC</td><td style={{ padding: '6px' }}>USA</td>
                            <td style={{ padding: '6px' }}>DIAGNOSTIC (Opus)</td><td style={{ padding: '6px' }}>CCT (UE 2021/914) + DPA + opt-out training (zero retention)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Google LLC</td><td style={{ padding: '6px' }}>USA</td>
                            <td style={{ padding: '6px' }}>Brain (Gemini)</td><td style={{ padding: '6px' }}>CCT (UE 2021/914) + DPA art. 28 RGPD</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px' }}>Gandi SAS</td><td style={{ padding: '6px' }}>France</td>
                            <td style={{ padding: '6px' }}>DNS &amp; email</td><td style={{ padding: '6px' }}>Conformit&eacute; UE native + DPA art. 28 RGPD</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <P>Transferts de donn&eacute;es vers les pays tiers (&Eacute;tats-Unis pour Vercel, Anthropic et Google) encadr&eacute;s par les Clauses Contractuelles Types (CCT) adopt&eacute;es par la Commission europ&eacute;enne via la D&eacute;cision d'ex&eacute;cution (UE) 2021/914 du 4 juin 2021, conform&eacute;ment aux articles 44 &agrave; 49 du R&egrave;glement (UE) 2016/679 (RGPD).</P>

            <SectionTitle>5. Vos droits</SectionTitle>
            <P>
                Conform&eacute;ment aux articles 15 &agrave; 22 du R&egrave;glement (UE) 2016/679 (RGPD) : droit d'acc&egrave;s, droit de rectification, droit &agrave; l'effacement (droit &agrave; l'oubli), droit &agrave; la limitation du traitement, droit &agrave; la portabilit&eacute; des donn&eacute;es, droit d'opposition, droit de retirer le consentement &agrave; tout moment, et droit d'introduire une r&eacute;clamation aupr&egrave;s de la Commission Nationale de l'Informatique et des Libert&eacute;s (CNIL), autorit&eacute; de contr&ocirc;le fran&ccedil;aise d&eacute;sign&eacute;e au sens de l'article 51 RGPD (https://www.cnil.fr). Contact pour exercer vos droits : contact@jeanpierrecharles.com. R&eacute;ponse sous trente (30) jours conform&eacute;ment &agrave; l'article 12.3 RGPD.
            </P>

            <SectionTitle>6. Cookies</SectionTitle>
            <P>Cookie unique : cookie_consent (choix IA, 12 mois). Aucun cookie publicitaire, marketing ou de profilage. Aucun cookie tiers.</P>

            <SectionTitle>7. S&eacute;curit&eacute;</SectionTitle>
            <P>Chiffrement TLS 1.3, cl&eacute;s API en variables d'environnement chiffr&eacute;es, acc&egrave;s limit&eacute;, notification CNIL sous 72h en cas de violation (art. 33-34 RGPD).</P>

            <SectionTitle>8. Modifications</SectionTitle>
            <P>Politique mise &agrave; jour selon &eacute;volutions r&eacute;glementaires. Version applicable : celle en vigueur &agrave; la date de votre commande.</P>

            <SectionTitle>9. Contact</SectionTitle>
            <P>Email : contact@jeanpierrecharles.com — Courrier : Jean-Pierre Charles, 10 La Bertini&egrave;re, 86800 Terc&eacute;, FRANCE</P>
        </>
    );
}

/* ──────────────────────────────────────────────────────────
 * CGV EN v1.2 — Official translation (French version prevails)
 * ────────────────────────────────────────────────────────── */

function renderCGVContent_EN() {
    return (
        <>
            <SectionTitle>Article 1 — Purpose and scope</SectionTitle>
            <P>
                These General Terms of Sale (hereinafter &laquo;&nbsp;GTS&nbsp;&raquo;) govern the contractual relationship between Jean-Pierre Charles, sole proprietor operating under the trade name &laquo;&nbsp;AEGIS Intelligence&nbsp;&raquo; (hereinafter &laquo;&nbsp;the Service Provider&nbsp;&raquo;), and any professional client within the meaning of the French Commercial Code, acting in the course of its industrial, commercial or service-providing activity (hereinafter &laquo;&nbsp;the Client&nbsp;&raquo;), wishing to benefit from the services offered through the website jeanpierrecharles.com.
            </P>
            <P>
                The services offered are intended <strong>exclusively for private enterprises (B2B)</strong>. They are not intended for consumers within the meaning of the French Consumer Code. Any order from a consumer shall be refused and fully refunded. Extension to public bodies (B2G) and consumers (B2C) is planned under dedicated terms to be published later.
            </P>
            <P>
                Any order placed implies unreserved acceptance of these GTS. The Client acknowledges having read them prior to the order, in accordance with article 1119 of the French Civil Code.
            </P>

            <SectionTitle>Article 2 — Services offered</SectionTitle>
            <P>The Service Provider offers a range of regulatory expertise and intelligence services for European industrial SMEs and mid-cap companies:</P>
            <ul style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, paddingLeft: 20, margin: '6px 0' }}>
                <li><strong>PULSE</strong>: free AI pre-diagnostic</li>
                <li><strong>DIAGNOSTIC</strong>: premium PDF report with regulatory causal analysis (EUR 250.00 per report)</li>
                <li><strong>WATCH</strong>: monthly subscription for continuous regulatory intelligence (EUR 150.00/month — not available at the effective date)</li>
                <li><strong>FIELD EXPERTISE</strong>: tailored interventions (EUR 350.00/hour or EUR 2,500.00/month)</li>
            </ul>

            <SectionTitle>Article 3 — Pricing and VAT regime</SectionTitle>
            <P>Prices are stated in euros (EUR). The Service Provider operates under the French VAT franchise scheme.</P>
            <div style={{ background: '#f0f9ff', borderRadius: 8, padding: '10px 14px', border: '1px solid #bae6fd', margin: '8px 0', fontSize: 11, fontWeight: 600, color: '#0369a1' }}>
                VAT not applicable — Article 293 B of the French General Tax Code (CGI).
            </div>
            <P>The Service Provider reserves the right to modify its prices at any time. Services are invoiced at the rates in force on the date of the order.</P>

            <SectionTitle>Article 4 — Order</SectionTitle>
            <P>Orders are placed exclusively online. The process includes: service selection, identification information entry, diagnostic information entry, express acceptance of the GTS and Privacy Policy, payment via Mollie. The order is firm and final upon receipt of payment.</P>

            <SectionTitle>Article 5 — Payment terms</SectionTitle>
            <P>
                Online payment by bank card (CB, Visa, Mastercard, AMEX) or SEPA transfer via Mollie. In accordance with article L441-10 of the French Commercial Code, <strong>transposing Directive 2011/7/EU of 16 February 2011 on combating late payment in commercial transactions</strong>, and unless otherwise agreed in writing between the Parties, payment is due immediately upon order. No discount is granted for early payment.
            </P>
            <P>
                In case of late or default payment: penalties at the legal interest rate increased by 5 percentage points + a fixed indemnity for recovery costs of EUR 40.00 (art. L441-10 French Commercial Code; art. 6 Directive 2011/7/EU).
            </P>

            <SectionTitle>Article 6 — Delivery of the DIAGNOSTIC service</SectionTitle>
            <P>PDF report delivered by email. Payment received before 5:00 PM CET on a business day: same-day delivery before 7:00 PM CET. After 5:00 PM CET / weekends / public holidays: delivery before 12:00 PM CET on the next business day.</P>

            <SectionTitle>Article 7 — Right of withdrawal</SectionTitle>
            <P>
                This contract being concluded between professionals, the right of withdrawal provided for in articles L221-18 and following of the French Consumer Code does not apply, in accordance with article L221-3 of the same code.
            </P>

            <SectionTitle>Article 8 — Best-efforts obligation and liability</SectionTitle>
            <P>
                The Service Provider undertakes to provide a professional-quality regulatory expertise service, based on 32 years of industrial experience. This is a <strong>best-efforts obligation, not a result-based obligation</strong>. The DIAGNOSTIC report does not substitute for formal legal advice or an official opinion from a regulatory authority.
            </P>
            <P>
                The Service Provider's liability is <strong>capped at the total amount paid by the Client</strong> for the relevant service. In accordance with article 1170 of the French Civil Code, this limitation of liability does not apply in case of gross negligence or wilful misconduct by the Service Provider, nor in case of breach of an essential obligation of the contract.
            </P>

            <SectionTitle>Article 9 — Intellectual property</SectionTitle>
            <P>The DIAGNOSTIC report remains the intellectual property of the Service Provider. The Client benefits from a right of internal use. Public distribution, commercial reproduction or resale is prohibited without written consent.</P>

            <SectionTitle>Article 10 — Personal data</SectionTitle>
            <P>Personal data processing is governed by the Service Provider's Privacy Policy, available on the website.</P>

            <SectionTitle>Article 11 — Dispute resolution</SectionTitle>
            <P>
                Before any litigation, the Parties undertake to seek an amicable solution through direct negotiation. Failing an amicable agreement within thirty (30) days from notification of the dispute, any dispute relating to the formation, performance or interpretation of these GTS shall fall under the <strong>exclusive jurisdiction of the French courts</strong> in the Service Provider's place of business, in accordance with <strong>article 25 of Regulation (EU) No 1215/2012 of 12 December 2012 (Brussels I bis Recast)</strong> on jurisdiction and the recognition and enforcement of judgments in civil and commercial matters.
            </P>
            <P>
                The applicable law is <strong>French law</strong>, in accordance with <strong>article 3 of Regulation (EC) No 593/2008 of 17 June 2008 (Rome I)</strong> on the law applicable to contractual obligations, the Parties expressly choosing French law as the law governing this contract.
            </P>
            <P>
                Contact for legal questions: <a href="mailto:contact@jeanpierrecharles.com" style={{ color: C.accent }}>contact@jeanpierrecharles.com</a>
            </P>

            <SectionTitle>Article 12 — Modifications</SectionTitle>
            <P>The Service Provider reserves the right to modify the GTS. The applicable GTS are those in force on the date of the order.</P>

            <SectionTitle>Article 13 — AI transparency (EU AI Act compliance)</SectionTitle>
            <P>
                In accordance with <strong>article 50 of Regulation (EU) 2024/1689 of 13 June 2024 (EU AI Act)</strong> on harmonised rules concerning artificial intelligence (entry into force 2 August 2026, anticipated application from April 2026 by the Service Provider), the Client is expressly informed that:
            </P>
            <ol style={{ fontSize: 11, color: '#475569', lineHeight: 1.7, paddingLeft: 20, margin: '6px 0' }}>
                <li>The DIAGNOSTIC report is <strong>generated with the assistance of an artificial intelligence system</strong> (Claude Opus 4.6, developed by Anthropic PBC), under the qualified supervision and editorial control of Jean-Pierre Charles.</li>
                <li>The PULSE pre-diagnostic and the AEGIS Intelligence Brain are <strong>conversational AI systems</strong> based on Gemini Flash (developed by Google LLC) and Claude Opus.</li>
                <li>The AI-generated content reflects regulatory analysis based on training data and configuration prompts established by the Service Provider; it does not substitute for formal legal advice or an official opinion from a regulatory authority (cross-reference Article 8).</li>
                <li>The Client retains the right to request human-only review of any DIAGNOSTIC report at the standard FIELD EXPERTISE rate (EUR 350.00/hour).</li>
            </ol>
        </>
    );
}

/* ──────────────────────────────────────────────────────────
 * Privacy EN — Official translation (French version prevails)
 * ────────────────────────────────────────────────────────── */

function renderPrivacyContent_EN() {
    return (
        <>
            <SectionTitle>1. GDPR commitment</SectionTitle>
            <P>The Service Provider commits to comply with Regulation (EU) 2016/679 of the European Parliament and Council of 27 April 2016 on the protection of natural persons with regard to the processing of personal data and on the free movement of such data (GDPR), as well as French Law n&deg; 78-17 of 6 January 1978 (as amended) on data protection and freedoms.</P>

            <SectionTitle>2. Data collected</SectionTitle>
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Category</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Data</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Legal basis</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Retention</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Identification</td>
                            <td style={{ padding: '6px' }}>Email, name, company, country, city</td>
                            <td style={{ padding: '6px' }}>Contract performance (Art. 6.1.b)</td>
                            <td style={{ padding: '6px' }}>10 years (accounting)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Diagnostic</td>
                            <td style={{ padding: '6px' }}>Sector, product, regulations, context</td>
                            <td style={{ padding: '6px' }}>Contract performance (Art. 6.1.b)</td>
                            <td style={{ padding: '6px' }}>10 years</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Brain conversations</td>
                            <td style={{ padding: '6px' }}>AI messages</td>
                            <td style={{ padding: '6px' }}>Consent (Art. 6.1.a)</td>
                            <td style={{ padding: '6px' }}>Session only</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Payment</td>
                            <td style={{ padding: '6px' }}>Banking data</td>
                            <td style={{ padding: '6px' }}>Contract performance</td>
                            <td style={{ padding: '6px' }}>Managed by Mollie</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px' }}>Connection</td>
                            <td style={{ padding: '6px' }}>IP, browser data</td>
                            <td style={{ padding: '6px' }}>Legitimate interest (Art. 6.1.f)</td>
                            <td style={{ padding: '6px' }}>12 months</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <SectionTitle>3. Purposes</SectionTitle>
            <P>Contract performance, invoicing, support, legal obligations, service improvement (anonymised statistics). Your data is <strong>never</strong> used for third-party commercial prospecting, sold, rented or transferred.</P>

            <SectionTitle>4. Data processors and transfers</SectionTitle>
            <P>In accordance with articles 13.1.e and 28 of GDPR, the following technical processors act on behalf of the Service Provider. Each is bound by a Data Processing Agreement (DPA) within the meaning of GDPR article 28.</P>
            <div style={{ overflowX: 'auto', margin: '8px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 10 }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Processor</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Location</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Role</th>
                            <th style={{ textAlign: 'left', padding: '8px 6px', fontWeight: 700, color: '#64748b' }}>Safeguards</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Vercel Inc.</td><td style={{ padding: '6px' }}>USA / EU edges</td>
                            <td style={{ padding: '6px' }}>Hosting</td><td style={{ padding: '6px' }}>SCCs (EU 2021/914) + DPA Art. 28 GDPR</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Mollie B.V.</td><td style={{ padding: '6px' }}>Netherlands (EU)</td>
                            <td style={{ padding: '6px' }}>Payments</td><td style={{ padding: '6px' }}>Native EU compliance + DPA Art. 28 GDPR</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Anthropic PBC</td><td style={{ padding: '6px' }}>USA</td>
                            <td style={{ padding: '6px' }}>DIAGNOSTIC (Opus)</td><td style={{ padding: '6px' }}>SCCs (EU 2021/914) + DPA + opt-out training (zero retention)</td>
                        </tr>
                        <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '6px' }}>Google LLC</td><td style={{ padding: '6px' }}>USA</td>
                            <td style={{ padding: '6px' }}>Brain (Gemini)</td><td style={{ padding: '6px' }}>SCCs (EU 2021/914) + DPA Art. 28 GDPR</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px' }}>Gandi SAS</td><td style={{ padding: '6px' }}>France</td>
                            <td style={{ padding: '6px' }}>DNS &amp; email</td><td style={{ padding: '6px' }}>Native EU compliance + DPA Art. 28 GDPR</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <P>Data transfers to third countries (USA for Vercel, Anthropic, Google) are framed by Standard Contractual Clauses (SCCs) adopted by the European Commission via Implementing Decision (EU) 2021/914 of 4 June 2021, in accordance with articles 44-49 of GDPR.</P>

            <SectionTitle>5. Your rights</SectionTitle>
            <P>
                In accordance with articles 15 to 22 of GDPR: right of access, right of rectification, right to erasure (right to be forgotten), right to restriction of processing, right to data portability, right to object, right to withdraw consent at any time, and right to lodge a complaint with the CNIL (French data protection authority designated under GDPR article 51, https://www.cnil.fr). Contact to exercise your rights: <a href="mailto:contact@jeanpierrecharles.com" style={{ color: C.accent }}>contact@jeanpierrecharles.com</a>. Response within thirty (30) days in accordance with GDPR article 12.3.
            </P>

            <SectionTitle>6. Cookies</SectionTitle>
            <P>Single cookie: cookie_consent (AI choice, 12 months). No advertising, marketing or profiling cookies. No third-party cookies.</P>

            <SectionTitle>7. Security</SectionTitle>
            <P>TLS 1.3 encryption, API keys in encrypted environment variables, restricted access, CNIL notification within 72 hours in case of breach (GDPR Art. 33-34).</P>

            <SectionTitle>8. Modifications</SectionTitle>
            <P>Policy updated according to regulatory changes. Applicable version: the one in force on the date of your order.</P>

            <SectionTitle>9. Contact</SectionTitle>
            <P>Email: contact@jeanpierrecharles.com — Postal: Jean-Pierre Charles, 10 La Bertini&egrave;re, 86800 Terc&eacute;, FRANCE</P>
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
                        {isFR ? 'Contact : par email uniquement (r\u00e9ponse sous 24h ouvr\u00e9es)' : 'Contact: by email only (response within 24 business hours)'}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 4, fontStyle: 'italic' }}>
                        {isFR ? 'Cible commerciale : entreprises priv\u00e9es (B2B exclusivement)' : 'Commercial scope: private enterprises (B2B exclusively)'}
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
            <div style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic', marginBottom: 8, lineHeight: 1.6 }}>
                {isFR
                    ? 'Information obligatoire en application de l\'article 6.III.1 de la Loi pour la Confiance dans l\'\u00c9conomie Num\u00e9rique (LCEN) n\u00b0 2004-575 du 21 juin 2004.'
                    : 'Mandatory information pursuant to Article 6.III.1 of the French Law for Confidence in the Digital Economy (LCEN) n\u00b0 2004-575 of 21 June 2004.'}
            </div>
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
