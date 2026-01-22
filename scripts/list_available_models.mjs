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
console.log('\n--- Listing Available Gemini Models ---\n');

const genAI = new GoogleGenerativeAI(API_KEY);

try {
    // Test différents noms de modèles suggérés par la documentation
    const modelNamesToTest = [
        'models/gemini-1.5-flash',
        'models/gemini-1.5-pro',
        'models/gemini-pro',
        'models/gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-2.0-flash'
    ];

    for (const modelName of modelNamesToTest) {
        console.log(`\n📌 Testing: ${modelName}`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Hello');
            const response = await result.response;
            const text = response.text();
            console.log(`   ✅ SUCCESS - Response: ${text.substring(0, 50)}...`);
            break; // Si un modèle fonctionne, on s'arrête
        } catch (error) {
            console.log(`   ❌ FAILED - ${error.message}`);
        }
    }

    console.log('\n--- Test Complete ---');
} catch (error) {
    console.error('❌ Error:', error.message);
}
