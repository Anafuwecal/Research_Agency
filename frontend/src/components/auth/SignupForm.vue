<template>
  <div class="w-full max-w-md mx-auto">
    <div class="bg-white rounded-lg shadow-lg p-8">
      <h2 class="text-2xl font-bold text-primary mb-6">Sign Up</h2>
      
      <form @submit.prevent="handleSubmit">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Display Name
          </label>
          <input
            v-model="displayName"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="John Doe"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="your@email.com"
          />
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Confirm Password
          </label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="••••••••"
          />
        </div>

        <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 transition-all"
        >
          {{ loading ? 'Creating Account...' : 'Sign Up' }}
        </button>
      </form>

      <div class="mt-4 text-center">
        <button
          @click="$emit('switch-mode')"
          class="text-primary text-sm hover:underline"
        >
          Already have an account? Login
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

const emit = defineEmits(['switch-mode']);

const authStore = useAuthStore();
const router = useRouter();

const displayName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  try {
    error.value = '';

    if (password.value !== confirmPassword.value) {
      error.value = 'Passwords do not match';
      return;
    }

    loading.value = true;
    
    await authStore.signup(email.value, password.value, displayName.value);
    router.push('/research');
  } catch (err: any) {
    error.value = err.message || 'Signup failed';
  } finally {
    loading.value = false;
  }
}
</script>