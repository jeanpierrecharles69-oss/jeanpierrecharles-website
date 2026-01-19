
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';

// Load env
const envPathLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPathLocal)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPathLocal));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API KEY");
    process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
    console.log(`\n🧪 Testing Model: ${modelName} ...`);
    try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        console.log(`✅ AVAILABLE. Response: ${response.text().substring(0, 30)}...`);
    } catch (e) {
        console.log(`❌ UNAVAILABLE (${modelName}). Error: ${e.message.substring(0, 100)}...`);
    }
}

async function runTests() {
    console.log("--- Gemini Model Availability Test (Updated) ---");

    // User requested tests
    await testModel('gemini-2.5-flash');
    await testModel('gemini-3-flash');

    // Standard baseline
    await testModel('gemini-2.0-flash');
}

runTests();
