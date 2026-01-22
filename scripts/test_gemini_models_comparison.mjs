import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';

// Load environment
dotenv.config({ path: '.env.local' });

const API_KEY = process.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
    console.error('❌ VITE_GEMINI_API_KEY not found in .env.local');
    process.exit(1);
}

console.log('✅ API Key loaded');
console.log('\n═══════════════════════════════════════════════════════════');
console.log('   COMPARATIVE TEST: Gemini Models for Aegis Assistant');
console.log('═══════════════════════════════════════════════════════════\n');

const genAI = new GoogleGenerativeAI(API_KEY);

// Question de test pour évaluer la pertinence (conformité européenne)
const TEST_PROMPT = `Explique en 3 points clés ce qu'est le RGPD et son importance pour une PME française.`;

// Modèles à tester
const modelsToTest = [
    'models/gemini-2.0-flash',
    'models/gemini-2.5-flash',
    'models/gemini-3.0-flash',
    'models/gemini-3-flash',
    'models/gemini-1.5-flash',
    'models/gemini-1.5-pro',
    'models/gemini-2.0-pro',
    'models/gemini-2.5-pro'
];

const results = [];

for (const modelName of modelsToTest) {
    console.log(`\n📌 Testing: ${modelName}`);
    console.log('─'.repeat(60));

    try {
        const model = genAI.getGenerativeModel({
            model: modelName,
            generationConfig: {
                temperature: 0.1,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024,
            }
        });

        const startTime = Date.now();
        const result = await model.generateContent(TEST_PROMPT);
        const endTime = Date.now();

        const response = await result.response;
        const text = response.text();
        const responseTime = endTime - startTime;

        // Analyse de la qualité de la réponse
        const wordCount = text.split(/\s+/).length;
        const hasStructure = /[1-3]\./.test(text) || /\*\*/.test(text) || /•/.test(text);
        const mentionsRGPD = /RGPD|règlement général|protection des données|GDPR/i.test(text);
        const mentionsPME = /PME|petite|moyenne|entreprise/i.test(text);

        results.push({
            model: modelName,
            success: true,
            responseTime,
            wordCount,
            hasStructure,
            mentionsRGPD,
            mentionsPME,
            response: text
        });

        console.log(`✅ SUCCESS`);
        console.log(`   ⏱️  Response Time: ${responseTime}ms`);
        console.log(`   📝 Word Count: ${wordCount} words`);
        console.log(`   📊 Structured: ${hasStructure ? 'Yes' : 'No'}`);
        console.log(`   🎯 Mentions RGPD: ${mentionsRGPD ? 'Yes' : 'No'}`);
        console.log(`   🏢 Mentions PME: ${mentionsPME ? 'Yes' : 'No'}`);
        console.log(`\n   Response Preview:\n   ${text.substring(0, 200)}...`);

    } catch (error) {
        results.push({
            model: modelName,
            success: false,
            error: error.message
        });

        const statusMatch = error.message.match(/\[(\d+)\]/);
        const status = statusMatch ? statusMatch[1] : 'Unknown';
        console.log(`❌ FAILED - Status: ${status}`);
        console.log(`   Error: ${error.message.substring(0, 100)}...`);
    }
}

// Synthèse comparative
console.log('\n\n═══════════════════════════════════════════════════════════');
console.log('                    COMPARATIVE SUMMARY');
console.log('═══════════════════════════════════════════════════════════\n');

const successfulModels = results.filter(r => r.success);

if (successfulModels.length === 0) {
    console.log('❌ No models were successful. Cannot generate comparison.');
} else {
    console.log('✅ Working Models:\n');

    // Tableau comparatif
    console.log('┌─────────────────────────┬──────────┬────────┬───────────┬──────┐');
    console.log('│ Model                   │ Time(ms) │ Words  │ Structure │ RGPD │');
    console.log('├─────────────────────────┼──────────┼────────┼───────────┼──────┤');

    successfulModels.forEach(r => {
        const modelName = r.model.padEnd(23);
        const time = String(r.responseTime).padStart(8);
        const words = String(r.wordCount).padStart(6);
        const structure = (r.hasStructure ? '✓' : '✗').padStart(9);
        const rgpd = (r.mentionsRGPD ? '✓' : '✗').padStart(4);

        console.log(`│ ${modelName} │ ${time} │ ${words} │ ${structure} │ ${rgpd} │`);
    });

    console.log('└─────────────────────────┴──────────┴────────┴───────────┴──────┘');

    // Recommandations
    console.log('\n\n📊 PERFORMANCE ANALYSIS:\n');

    // Modèle le plus rapide
    const fastest = successfulModels.reduce((prev, current) =>
        current.responseTime < prev.responseTime ? current : prev
    );
    console.log(`⚡ Fastest Model: ${fastest.model} (${fastest.responseTime}ms)`);

    // Modèle avec la meilleure réponse (structure + mentions)
    const scored = successfulModels.map(r => ({
        ...r,
        score: (r.hasStructure ? 2 : 0) + (r.mentionsRGPD ? 2 : 0) + (r.mentionsPME ? 1 : 0) + (r.wordCount > 50 ? 1 : 0)
    }));
    const bestQuality = scored.reduce((prev, current) =>
        current.score > prev.score ? current : prev
    );
    console.log(`🎯 Best Quality: ${bestQuality.model} (Score: ${bestQuality.score}/6)`);

    // Recommandation finale
    console.log('\n\n🏆 RECOMMENDATION FOR AEGIS ASSISTANT:\n');

    // Calcul du meilleur ratio qualité/performance
    const balanced = scored.map(r => ({
        ...r,
        balanceScore: r.score * (1000 / r.responseTime) // Score pondéré par vitesse
    }));
    const recommended = balanced.reduce((prev, current) =>
        current.balanceScore > prev.balanceScore ? current : prev
    );

    console.log(`✅ RECOMMENDED: ${recommended.model}`);
    console.log(`\n   Justification:`);
    console.log(`   • Response Time: ${recommended.responseTime}ms`);
    console.log(`   • Quality Score: ${recommended.score}/6`);
    console.log(`   • Structure: ${recommended.hasStructure ? '✓' : '✗'}`);
    console.log(`   • RGPD Knowledge: ${recommended.mentionsRGPD ? '✓' : '✗'}`);
    console.log(`   • PME Context: ${recommended.mentionsPME ? '✓' : '✗'}`);
    console.log(`   • Balance Score: ${recommended.balanceScore.toFixed(2)}`);

    console.log(`\n   💡 Benefits for Aegis:`);
    if (recommended.responseTime < 2000) {
        console.log(`   ✓ Excellent user experience (response < 2s)`);
    }
    if (recommended.hasStructure) {
        console.log(`   ✓ Well-structured responses (easier to read)`);
    }
    if (recommended.mentionsRGPD && recommended.mentionsPME) {
        console.log(`   ✓ Domain-specific knowledge (EU compliance)`);
    }
}

console.log('\n═══════════════════════════════════════════════════════════');
console.log('                    TEST COMPLETE');
console.log('═══════════════════════════════════════════════════════════\n');
