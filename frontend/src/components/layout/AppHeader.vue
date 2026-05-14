<script setup lang="ts">
import { ref } from 'vue';
import type { User } from '../../types';

interface Props {
  user?: User | null;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  logout: []
}>();

const showUserMenu = ref(false);
</script>

<template>
  <header class="bg-primary-light border-b border-gray-700/30 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
    <div class="container mx-auto px-6 py-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="relative">
            <div class="absolute inset-0 bg-accent-gold blur-lg opacity-50"></div>
            <div class="relative bg-gradient-to-br from-accent-gold to-yellow-500 p-3 rounded-xl">
              <svg class="w-6 h-6 text-primary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          
          <div>
            <h1 class="text-2xl font-bold bg-gradient-to-r from-accent-gold to-yellow-400 bg-clip-text text-transparent">
              Research Report Agent
            </h1>
            <p class="text-sm text-gray-400 flex items-center gap-2">
              <span class="inline-block w-2 h-2 bg-accent-green rounded-full animate-pulse"></span>
              AI-Powered Research & Analysis
            </p>
          </div>
        </div>
        
        <div class="flex items-center gap-4">
          <div class="hidden md:flex items-center gap-2 px-4 py-2 bg-primary-dark rounded-lg">
            <svg class="w-5 h-5 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                    d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span class="text-sm font-semibold text-gray-300">Powered by LangGraph</span>
          </div>

          <!-- User Menu -->
          <div v-if="user" class="relative">
            <button
              @click="showUserMenu = !showUserMenu"
              class="flex items-center gap-3 px-4 py-2 bg-primary-dark hover:bg-gray-700 rounded-lg transition-colors duration-200"
            >
              <div class="w-8 h-8 bg-gradient-to-br from-accent-gold to-accent-purple rounded-full flex items-center justify-center">
                <span class="text-sm font-bold text-primary-dark">
                  {{ user.email?.charAt(0).toUpperCase() }}
                </span>
              </div>
              <span class="hidden md:block text-sm text-gray-300">{{ user.email }}</span>
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown Menu -->
            <div
              v-if="showUserMenu"
              @click="showUserMenu = false"
              class="absolute right-0 mt-2 w-48 bg-primary-light border border-gray-700 rounded-xl shadow-xl"
            >
              <div class="p-3 border-b border-gray-700">
                <p class="text-sm text-gray-400">Signed in as</p>
                <p class="text-sm font-medium text-gray-200 truncate">{{ user.email }}</p>
              </div>
              
              <button
                @click="emit('logout')"
                class="w-full px-4 py-3 text-left hover:bg-primary-dark transition-colors duration-200 rounded-b-xl flex items-center gap-3 text-accent-red"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>