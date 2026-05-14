<template>
  <div class="w-full">
    <div class="card">
      <h2 class="text-2xl md:text-3xl font-bold text-primary mb-8 text-center">Login</h2>
      
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="input-field"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-2">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="input-field"
            placeholder="Enter your password"
          />
        </div>

        <div v-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="btn-primary w-full"
        >
          <span v-if="loading" class="flex items-center justify-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
          <span v-else>Login</span>
        </button>
      </form>

      <div class="mt-6 text-center">
        <button
          @click="$emit('switch-mode')"
          class="text-primary text-sm font-medium hover:underline"
        >
          Don't have an account? <span class="font-bold">Sign up</span>
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

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';
    
    await authStore.login(email.value, password.value);
    router.push('/research');
  } catch (err: any) {
    error.value = err.message || 'Login failed';
  } finally {
    loading.value = false;
  }
}
</script>