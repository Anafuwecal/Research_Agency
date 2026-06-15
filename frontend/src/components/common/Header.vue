<template>
  <header class="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
    <div class="container mx-auto px-4 h-16 md:h-20 flex items-center justify-between">
      
      <router-link to="/" class="flex items-center gap-3 group">
        <div class="w-9 h-9 bg-primary text-white rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
          </svg>
        </div>
        <span class="text-lg font-serif font-bold text-slate-900 tracking-tight hidden sm:block">ResearchAgent</span>
      </router-link>

      <nav v-if="authStore.user" class="hidden md:flex items-center gap-8">
        <router-link
          to="/research"
          class="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          active-class="text-primary font-semibold"
        >
          Research
        </router-link>
        <router-link
          to="/history"
          class="text-sm font-medium text-slate-600 transition-colors hover:text-primary"
          active-class="text-primary font-semibold"
        >
          History
        </router-link>
        
        <div class="flex items-center gap-4 pl-6 border-l border-slate-200">
          <div class="text-right">
            <p class="text-xs font-medium text-slate-700 truncate max-w-[120px]">
              {{ authStore.user.displayName || authStore.user.email }}
            </p>
          </div>
          <button
            @click="handleLogout"
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-all"
          >
            Logout
          </button>
        </div>
      </nav>

      <button
        v-if="authStore.user"
        @click="mobileMenuOpen = !mobileMenuOpen"
        class="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="!mobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>

    <div
      v-if="authStore.user && mobileMenuOpen"
      class="md:hidden bg-white border-b border-slate-200 animate-fade-in"
    >
      <div class="container mx-auto px-4 py-4 space-y-2">
        <router-link
          to="/research"
          @click="mobileMenuOpen = false"
          class="block px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          active-class="bg-primary/5 text-primary"
        >
          New Research
        </router-link>
        <router-link
          to="/history"
          @click="mobileMenuOpen = false"
          class="block px-4 py-3 rounded-lg hover:bg-slate-50 transition-colors"
          active-class="bg-primary/5 text-primary"
        >
          History
        </router-link>
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
        >
          Logout
        </button>
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