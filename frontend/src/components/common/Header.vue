<template>
  <header class="bg-primary text-white shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-16 md:h-20">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-3 group">
          <div class="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
            <svg class="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <span class="text-xl md:text-2xl font-bold hidden sm:block">Research Agent</span>
        </router-link>

        <!-- Desktop Navigation -->
        <nav v-if="authStore.user" class="hidden md:flex items-center space-x-8">
          <router-link
            to="/research"
            class="text-sm font-medium hover:text-gray-300 transition-colors relative group"
            active-class="text-white"
          >
            New Research
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </router-link>
          <router-link
            to="/history"
            class="text-sm font-medium hover:text-gray-300 transition-colors relative group"
            active-class="text-white"
          >
            History
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-white group-hover:w-full transition-all duration-300"></span>
          </router-link>
          
          <div class="flex items-center space-x-4 pl-4 border-l border-gray-600">
            <div class="hidden lg:flex flex-col items-end">
              <span class="text-xs text-gray-300">Welcome back</span>
              <span class="text-sm font-medium">{{ authStore.user.displayName || authStore.user.email }}</span>
            </div>
            <button
              @click="handleLogout"
              class="px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all font-medium text-sm"
            >
              Logout
            </button>
          </div>
        </nav>

        <!-- Mobile Menu Button -->
        <button
          v-if="authStore.user"
          @click="mobileMenuOpen = !mobileMenuOpen"
          class="md:hidden p-2 rounded-lg hover:bg-primary-light transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile Navigation -->
      <div
        v-if="authStore.user && mobileMenuOpen"
        class="md:hidden py-4 border-t border-gray-600 animate-fade-in"
      >
        <router-link
          to="/research"
          @click="mobileMenuOpen = false"
          class="block px-4 py-3 hover:bg-primary-light rounded-lg transition-colors"
          active-class="bg-primary-light"
        >
          New Research
        </router-link>
        <router-link
          to="/history"
          @click="mobileMenuOpen = false"
          class="block px-4 py-3 hover:bg-primary-light rounded-lg transition-colors"
          active-class="bg-primary-light"
        >
          History
        </router-link>
        <div class="px-4 py-3 border-t border-gray-600 mt-2">
          <p class="text-sm text-gray-300 mb-2">{{ authStore.user.email }}</p>
          <button
            @click="handleLogout"
            class="w-full px-4 py-2 bg-white text-primary rounded-lg hover:bg-gray-100 transition-all font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);

async function handleLogout() {
  await authStore.logout();
  mobileMenuOpen.value = false;
  router.push('/');
}
</script>