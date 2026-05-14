import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let app: admin.app.App | null = null;
let authInstance: admin.auth.Auth | null = null;
let dbInstance: admin.firestore.Firestore | null = null;
let firebaseEnabled = false;

try {
  const serviceAccountPath = join(__dirname, '../../serviceAccountKey.json');
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  
  authInstance = admin.auth();
  dbInstance = admin.firestore();
  firebaseEnabled = true;
  
  console.log(' Firebase initialized successfully');
  console.log(`   Project ID: ${serviceAccount.project_id}`);
} catch (error: any) {
  console.warn('\n  Firebase not configured - running in limited mode\n');
  console.log('To enable authentication and database:');
  console.log('1. Download your Firebase service account key');
  console.log('2. Save it as: backend/serviceAccountKey.json');
  console.log('3. Restart the server\n');
  
  if (error.code !== 'ENOENT') {
    console.error('Firebase initialization error:', error.message);
  }
}

// Safe exports with null checks
export const auth = authInstance as admin.auth.Auth;
export const db = dbInstance as admin.firestore.Firestore;
export const isFirebaseEnabled = firebaseEnabled;
export { app };

// Helper function to check if Firebase is ready
export function requireFirebase(feature: string = 'This feature') {
  if (!firebaseEnabled) {
    throw new Error(`${feature} requires Firebase to be configured. Please add serviceAccountKey.json`);
  }
}