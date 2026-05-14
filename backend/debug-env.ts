import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Current directory:', __dirname);
console.log('Looking for .env in:', join(__dirname, '.env'));

const result = dotenv.config();

if (result.error) {
  console.error('Error loading .env:', result.error);
} else {
  console.log('.env loaded successfully');
}

console.log('\nEnvironment variables:');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID ? 'Set' : 'NOT SET');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? 'Set (length: ' + process.env.FIREBASE_PRIVATE_KEY.length + ')' : 'NOT SET');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? 'Set' : 'NOT SET');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Set' : 'NOT SET');
console.log('GOOGLE_SEARCH_API_KEY:', process.env.GOOGLE_SEARCH_API_KEY ? 'Set' : 'NOT SET');

console.log('\nAll env vars:', Object.keys(process.env).filter(k => k.startsWith('FIREBASE') || k.startsWith('GROQ') || k.startsWith('GOOGLE')));