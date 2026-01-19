
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';

const envPathLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPathLocal)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPathLocal));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.error("No API Key");
    process.exit(1);
}

async function testConnection() {
    console.log("--- Testing @google/generative-ai (Standard SDK) ---");
    const genAI = new GoogleGenerativeAI(apiKey);

    // Test gemini-2.0-flash (if available) and 1.5-flash
    const models = ['gemini-2.0-flash', 'gemini-1.5-flash'];

    for (const modelName of models) {
        console.log(`\n👉 Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello, exist?");
            const response = await result.response;
            console.log(`✅ SUCCESS: ${response.text()}`);
        } catch (e) {
            console.error(`❌ FAILED ${modelName}:`, e.message);
        }
    }
}

testConnection();
