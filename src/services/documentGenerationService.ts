/**
 * Document Generation Service — AEGIS v3.1-alpha · Phase 4 F1
 *
 * Orchestre la génération de rapports de conformité via Claude API.
 * F1 : Rapport Écarts/Risques/Non-Conformités (tier STANDARD)
 *
 * Utilise runQuery (non-streaming) pour obtenir un rapport structuré,
 * puis parse les sections pour le rendu UI + export PDF.
 *
 * Migration : Gemini 2.0 Flash → Claude Haiku 4.5 (31/03/2026)
 */

import { runQuery } from './claudeService';
import { enrichPromptWithRegulation } from './regulationKnowledgeService';

// ── Types ──

export interface ReportInput {
    sector: string;
    productType: string;
    regulations: string[];
    additionalContext?: string;
    lang: 'fr' | 'en';
}

export interface ReportSection {
    title: string;
    items: Array<{
        id: string;
        severity: 'critical' | 'major' | 'minor';
        description: string;
        reference: string;
        recommendation: string;
    }>;
}

export interface GeneratedReport {
    title: string;
    date: string;
    input: ReportInput;
    summary: string;
    gaps: ReportSection;
    risks: ReportSection;
    nonConformities: ReportSection;
    recommendations: string[];
    rawMarkdown: string;
}

// ── System Instructions ──

const REPORT_SYSTEM_FR = `AEGIS Intelligence — Diagnostic conformité EU. Réponds en français, concis. Articles de loi réels uniquement. 2-3 items par section.

Format obligatoire :
## SYNTHÈSE
[3 lignes max]
## ÉCARTS RÉGLEMENTAIRES
- **[E-001]** [CRITIQUE/MAJEUR/MINEUR] : [desc] | Réf: [article] | Action: [reco]
## RISQUES IDENTIFIÉS
- **[R-001]** [CRITIQUE/MAJEUR/MINEUR] : [desc] | Réf: [article] | Action: [reco]
## NON-CONFORMITÉS
- **[NC-001]** [CRITIQUE/MAJEUR/MINEUR] : [desc] | Réf: [article] | Action: [reco]
## RECOMMANDATIONS PRIORITAIRES
1. [Action]
2. [Action]`;

const REPORT_SYSTEM_EN = `AEGIS Intelligence — EU compliance diagnostic. Respond in English, concise. Real legal articles only. 2-3 items per section.

Mandatory format:
## SUMMARY
[3 lines max]
## REGULATORY GAPS
- **[G-001]** [CRITICAL/MAJOR/MINOR]: [desc] | Ref: [article] | Action: [reco]
## IDENTIFIED RISKS
- **[R-001]** [CRITICAL/MAJOR/MINOR]: [desc] | Ref: [article] | Action: [reco]
## NON-CONFORMITIES
- **[NC-001]** [CRITICAL/MAJOR/MINOR]: [desc] | Ref: [article] | Action: [reco]
## PRIORITY RECOMMENDATIONS
1. [Action]
2. [Action]`;

// ── Génération ──

export async function generateGapRiskReport(input: ReportInput): Promise<GeneratedReport> {
    const { sector, productType, regulations, additionalContext, lang } = input;

    const regList = regulations.join(', ');
    const prompt = lang === 'fr'
        ? `Secteur: ${sector} | Produit: ${productType} | Règlements: ${regList}${additionalContext ? ` | Contexte: ${additionalContext}` : ''}
Diagnostic complet.`
        : `Sector: ${sector} | Product: ${productType} | Regulations: ${regList}${additionalContext ? ` | Context: ${additionalContext}` : ''}
Full diagnostic.`;

    // Enrichir avec le contexte réglementaire
    const { systemAddition } = enrichPromptWithRegulation(prompt);
    const baseSystem = lang === 'fr' ? REPORT_SYSTEM_FR : REPORT_SYSTEM_EN;
    const fullSystem = systemAddition
        ? `${baseSystem}\n\n--- REGULATORY CONTEXT ---\n${systemAddition}`
        : baseSystem;

    const rawMarkdown = await runQuery(prompt, fullSystem);

    return {
        title: lang === 'fr'
            ? `Diagnostic Technique de Conformité — ${productType} (${sector})`
            : `Technical Compliance Diagnostic — ${productType} (${sector})`,
        date: new Date().toISOString().split('T')[0],
        input,
        summary: extractSection(rawMarkdown, lang === 'fr' ? 'SYNTHÈSE' : 'SUMMARY'),
        gaps: parseItemSection(rawMarkdown, lang === 'fr' ? 'ÉCARTS RÉGLEMENTAIRES' : 'REGULATORY GAPS'),
        risks: parseItemSection(rawMarkdown, lang === 'fr' ? 'RISQUES IDENTIFIÉS' : 'IDENTIFIED RISKS'),
        nonConformities: parseItemSection(rawMarkdown, lang === 'fr' ? 'NON-CONFORMITÉS' : 'NON-CONFORMITIES'),
        recommendations: extractRecommendations(rawMarkdown, lang),
        rawMarkdown,
    };
}

// ── Parsing helpers ──

function extractSection(md: string, heading: string): string {
    const regex = new RegExp(`## ${heading}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    const match = md.match(regex);
    return match ? match[1].trim() : '';
}

function parseItemSection(md: string, heading: string): ReportSection {
    const content = extractSection(md, heading);
    const itemRegex = /\*\*\[([A-Z]+-\d+)\]\*\*\s*\[(CRITIQUE|MAJEUR|MINEUR|CRITICAL|MAJOR|MINOR)\]\s*:\s*(.+?)\s*\|\s*R[ée]f\s*:\s*(.+?)\s*\|\s*Action\s*:\s*(.+)/gi;

    const items: ReportSection['items'] = [];
    let match;
    while ((match = itemRegex.exec(content)) !== null) {
        const severityMap: Record<string, 'critical' | 'major' | 'minor'> = {
            'CRITIQUE': 'critical', 'CRITICAL': 'critical',
            'MAJEUR': 'major', 'MAJOR': 'major',
            'MINEUR': 'minor', 'MINOR': 'minor',
        };
        items.push({
            id: match[1],
            severity: severityMap[match[2].toUpperCase()] || 'minor',
            description: match[3].trim(),
            reference: match[4].trim(),
            recommendation: match[5].trim(),
        });
    }

    return { title: heading, items };
}

function extractRecommendations(md: string, lang: 'fr' | 'en'): string[] {
    const heading = lang === 'fr' ? 'RECOMMANDATIONS PRIORITAIRES' : 'PRIORITY RECOMMENDATIONS';
    const content = extractSection(md, heading);
    return content
        .split('\n')
        .map(line => line.replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 0);
}

// ── Available regulations for UI ──

export const AVAILABLE_REGULATIONS = [
    { id: 'ai_act', label: 'AI Act (2024/1689)', short: 'AI Act' },
    { id: 'machinery', label: 'Règlement Machines (2023/1230)', short: 'Machines' },
    { id: 'espr', label: 'ESPR (2024/1781)', short: 'ESPR' },
    { id: 'cra', label: 'CRA (2024/2847)', short: 'CRA' },
    { id: 'rgpd', label: 'RGPD (2016/679)', short: 'RGPD' },
    { id: 'batteries', label: 'Batteries (2023/1542)', short: 'Batteries' },
    { id: 'data_act', label: 'Data Act (2023/2854)', short: 'Data Act' },
    { id: 'cpr', label: 'CPR (305/2011)', short: 'CPR' },
    { id: 'nis2', label: 'NIS 2 (2022/2555)', short: 'NIS2' },
    { id: 'dora', label: 'DORA (2022/2554)', short: 'DORA' },
];
