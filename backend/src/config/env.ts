import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs'; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '..', '.env');

// 1. SAFELY LOAD FILE: Only attempt to load if the file exists physically
if (fs.existsSync(envPath)) {
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.warn(` Warning: Could not parse .env file: ${result.error.message}`);
  } else {
    console.log(` Environment variables loaded from: ${envPath}`);
  }
} else {
  console.log(' No physical .env file found. Relying on host-injected environment variables (e.g., Render Dashboard).');
}

const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'GROQ_API_KEY',
  'TAVILY_API_KEY', 
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(' Missing required environment variables:', missingVars.join(', '));
  console.error(' Make sure you have added these to your Render Environment Dashboard!');
  process.exit(1); 
}

console.log(' All required environment variables are set');
console.log(' AI Provider: Groq ✓');
console.log(' Search Provider: Tavily ✓');

export {};