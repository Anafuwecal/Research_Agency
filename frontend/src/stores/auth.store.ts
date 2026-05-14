import { defineStore } from 'pinia';
import { ref } from 'vue';
import { authService } from '@/services/auth.service';
import { User } from '@/types';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const loading = ref(true);

  async function signup(email: string, password: string, displayName?: string) {
    const firebaseUser = await authService.signup(email, password, displayName);
    user.value = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: displayName,
    };
  }

  async function login(email: string, password: string) {
    const firebaseUser = await authService.login(email, password);
    user.value = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      displayName: firebaseUser.displayName || undefined,
    };
  }

  async function logout() {
    await authService.logout();
    user.value = null;
  }

  function initAuth() {
    authService.onAuthStateChange((firebaseUser) => {
      if (firebaseUser) {
        user.value = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
        };
      } else {
        user.value = null;
      }
      loading.value = false;
    });
  }

  async function refreshToken() {
    try {
      const token = await authService.getCurrentToken();
      if (!token) {
        throw new Error('No authentication token available');
      }
      return token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await logout();
      throw error;
    }
  }

  return {
    user,
    loading,
    signup,
    login,
    logout,
    initAuth,
    refreshToken,
  };
});