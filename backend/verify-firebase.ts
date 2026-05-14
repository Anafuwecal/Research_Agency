import './src/config/env.js';
import admin from 'firebase-admin';

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

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

async function verifyFirebase() {
  console.log('Testing Firebase services...\n');

  try {
    // Test Firestore
    console.log('1. Testing Firestore...');
    const db = admin.firestore();
    const testDoc = db.collection('_test').doc('verification');
    await testDoc.set({ test: true, timestamp: new Date() });
    await testDoc.delete();
    console.log('   ✓ Firestore is working\n');

    // Test Authentication
    console.log('2. Testing Authentication...');
    const auth = admin.auth();
    const users = await auth.listUsers(1);
    console.log('   ✓ Authentication is working');
    console.log(`   Found ${users.users.length} user(s)\n`);

    // Test Storage
    console.log('3. Testing Storage...');
    const storage = admin.storage();
    const bucket = storage.bucket();
    const [exists] = await bucket.exists();
    console.log('   ✓ Storage is working');
    console.log(`   Bucket exists: ${exists}\n`);

    console.log('All Firebase services are working correctly! ✓');
    process.exit(0);

  } catch (error: any) {
    console.error('Error:', error.message);
    console.error('\nIf you see PERMISSION_DENIED errors, make sure to:');
    console.error('1. Enable Cloud Firestore API');
    console.error('2. Enable Identity Toolkit API');
    console.error('3. Enable Cloud Storage API');
    console.error('4. Wait 2-3 minutes after enabling for changes to propagate');
    process.exit(1);
  }
}

verifyFirebase();