import { initializeApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { apiService } from './api.service';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

class AuthService {
  private tokenRefreshInterval: any = null;

  constructor() {
    // Auto-refresh token every 50 minutes (before 60-minute expiry)
    this.startTokenRefresh();
  }

  async signup(email: string, password: string, displayName?: string) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      apiService.setAuthToken(token);

      await apiService.post('/auth/signup', {
        email,
        password,
        displayName,
      });

      return userCredential.user;
    } catch (error: any) {
      console.error('Signup error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('This email is already registered');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('Password should be at least 6 characters');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      
      throw new Error(error.message || 'Failed to create account');
    }
  }

  async login(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const token = await userCredential.user.getIdToken();
      
      apiService.setAuthToken(token);

      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        throw new Error('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Invalid email address');
      }
      
      throw new Error(error.message || 'Failed to login');
    }
  }

  async logout() {
    this.stopTokenRefresh();
    await signOut(auth);
    apiService.clearAuthToken();
  }

  onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get fresh token when auth state changes
        const token = await user.getIdToken();
        apiService.setAuthToken(token);
      }
      callback(user);
    });
  }

  async getCurrentToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (user) {
      // Force refresh to get a fresh token
      return await user.getIdToken(true);
    }
    return null;
  }

  // Auto-refresh token before it expires
  private startTokenRefresh() {
    // Refresh token every 50 minutes (tokens expire after 60 minutes)
    this.tokenRefreshInterval = setInterval(async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          console.log('Refreshing authentication token...');
          const token = await user.getIdToken(true); // Force refresh
          apiService.setAuthToken(token);
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error('Failed to refresh token:', error);
        }
      }
    }, 50 * 60 * 1000); // 50 minutes
  }

  private stopTokenRefresh() {
    if (this.tokenRefreshInterval) {
      clearInterval(this.tokenRefreshInterval);
      this.tokenRefreshInterval = null;
    }
  }
}

export const authService = new AuthService();