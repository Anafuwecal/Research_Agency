import admin from 'firebase-admin';
import { User, ResearchHistory, AgentState } from '../types/index.js';

// Firebase config should already be loaded by env.ts
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID!,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL!,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
  token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
  universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN || 'googleapis.com',
};

// Initialize Firebase with ignoreUndefinedProperties
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

// Configure Firestore to ignore undefined properties
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

console.log('Firebase initialized ✓');
console.log('  Project:', serviceAccount.project_id);
console.log('  Storage:', process.env.FIREBASE_STORAGE_BUCKET);
console.log('  Firestore: ignoreUndefinedProperties enabled');


export const auth = admin.auth();
export { db };
export const storage = admin.storage();

// Helper function to clean undefined values
function cleanUndefined<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item)) as any;
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefined(value);
      }
    }
    return cleaned as T;
  }

  return obj;
}

export class FirebaseService {
  async createUser(email: string, password: string, displayName?: string): Promise<User> {
    const userRecord = await auth.createUser({
      email,
      password,
      displayName,
    });

    const user: User = {
      uid: userRecord.uid,
      email: email,
      displayName,
      createdAt: new Date(),
    };

    await db.collection('users').doc(userRecord.uid).set(cleanUndefined(user));
    return user;
  }

  async getUser(uid: string): Promise<User | null> {
    const doc = await db.collection('users').doc(uid).get();
    return doc.exists ? (doc.data() as User) : null;
  }

  async createSession(state: AgentState): Promise<string> {
    const sessionRef = db.collection('sessions').doc(state.sessionId);
    const cleanedState = cleanUndefined(state);
    
    await sessionRef.set({
      ...cleanedState,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return state.sessionId;
  }

  async updateSession(sessionId: string, updates: Partial<AgentState>): Promise<void> {
    const cleanedUpdates = cleanUndefined(updates);
    
    await db.collection('sessions').doc(sessionId).update({
      ...cleanedUpdates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getSession(sessionId: string): Promise<AgentState | null> {
    const doc = await db.collection('sessions').doc(sessionId).get();
    return doc.exists ? (doc.data() as AgentState) : null;
  }

  async saveToHistory(history: ResearchHistory): Promise<void> {
    const cleanedHistory = cleanUndefined(history);
    
    await db.collection('history').doc(history.id).set({
      ...cleanedHistory,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async getUserHistory(userId: string, limit: number = 50): Promise<ResearchHistory[]> {
    const snapshot = await db
      .collection('history')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => doc.data() as ResearchHistory);
  }

  async deleteHistory(historyId: string, userId: string): Promise<void> {
    const doc = await db.collection('history').doc(historyId).get();
    if (doc.exists && doc.data()?.userId === userId) {
      await doc.ref.delete();
    }
  }

  async uploadFile(buffer: Buffer, path: string, contentType: string): Promise<string> {
    const bucket = storage.bucket();
    const file = bucket.file(path);

    await file.save(buffer, {
      contentType,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });

    await file.makePublic();
    return file.publicUrl();
  }

  async deleteFile(path: string): Promise<void> {
    const bucket = storage.bucket();
    await bucket.file(path).delete();
  }
}

export const firebaseService = new FirebaseService();