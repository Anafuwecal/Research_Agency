import { ref, onMounted, watch } from 'vue';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebase';
import type { User } from '../types';

export function useAuth() {
  const user = ref<User | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  onMounted(() => {
    onAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName
        };
        console.log(' User authenticated:', user.value.email);
      } else {
        user.value = null;
        console.log(' User not authenticated');
      }
      loading.value = false;
    });
  });

  // Debug: Watch for auth changes
  watch(user, (newUser) => {
    console.log('Auth state changed:', newUser ? newUser.email : 'Not logged in');
  });

  async function login(email: string, password: string) {
    try {
      error.value = null;
      loading.value = true;
      await signInWithEmailAndPassword(auth, email, password);
      console.log(' Login successful');
    } catch (err: any) {
      console.error(' Login failed:', err.message);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function signup(email: string, password: string) {
    try {
      error.value = null;
      loading.value = true;
      await createUserWithEmailAndPassword(auth, email, password);
      console.log(' Signup successful');
    } catch (err: any) {
      console.error(' Signup failed:', err.message);
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      error.value = null;
      await signOut(auth);
      console.log(' Logout successful');
    } catch (err: any) {
      console.error(' Logout failed:', err.message);
      error.value = err.message;
      throw err;
    }
  }

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout
  };
}