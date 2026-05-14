import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = join(__dirname, '..', '..', '.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('Failed to load .env file from:', envPath);
  console.error('Error:', result.error.message);
  process.exit(1);
}

console.log('Environment variables loaded from:', envPath);

// Validate required environment variables
const requiredEnvVars = [
  'FIREBASE_PROJECT_ID',
  'FIREBASE_PRIVATE_KEY',
  'FIREBASE_CLIENT_EMAIL',
  'GROQ_API_KEY',
  'TAVILY_API_KEY', // Added Tavily
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  console.error('\nFound environment variables:', Object.keys(process.env).filter(k => 
    k.startsWith('FIREBASE') || k.startsWith('GROQ') || k.startsWith('TAVILY')
  ));
  process.exit(1);
}

console.log('All required environment variables are set ✓');
console.log('AI Provider: Groq ✓');
console.log('Search Provider: Tavily ✓');

export {};