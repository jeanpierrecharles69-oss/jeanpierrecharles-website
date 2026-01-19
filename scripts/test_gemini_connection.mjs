
import { GoogleGenAI } from "@google/genai";
import * as dotenv from 'dotenv';
import * as path from 'path';
import fs from 'fs';

const envPathLocal = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPathLocal)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPathLocal));
    for (const k in envConfig) process.env[k] = envConfig[k];
}

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

async function testConnection() {
    console.log("--- Testing Diagnostic V3 ---");
    const ai = new GoogleGenAI({ apiKey });

    // Try explicit model prefix
    const modelName = 'models/gemini-1.5-flash';
    console.log(`Testing with prefix: ${modelName}`);

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: "Hello" }] }]
        });
        console.log("✅ Success!");
        console.log(response.text);
    } catch (e) {
        console.error("❌ Failed with prefix:");
        console.error(JSON.stringify(e, null, 2));
    }
}

testConnection();
