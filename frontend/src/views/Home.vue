<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <!-- Hero Section -->
    <div v-if="!authStore.user" class="container mx-auto px-4 py-12 md:py-20">
      <div class="max-w-6xl mx-auto">
        <!-- Header -->
        <div class="text-center mb-16 animate-fade-in">
          <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight">
            AI-Powered<br class="sm:hidden"/> Research Agent
          </h1>
          <p class="text-lg md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto">
            Conduct comprehensive research on any topic with our advanced multi-agent system
          </p>
        </div>

        <!-- Features Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          <div class="card text-center transform hover:scale-105 transition-transform animate-fade-in" style="animation-delay: 0.1s">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary mb-3">Enter Your Topic</h3>
            <p class="text-gray-600">
              Provide your research topic and customize the depth and requirements
            </p>
          </div>

          <div class="card text-center transform hover:scale-105 transition-transform animate-fade-in" style="animation-delay: 0.2s">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary mb-3">AI Agents Research</h3>
            <p class="text-gray-600">
              Our multi-agent system gathers, analyzes, and synthesizes information
            </p>
          </div>

          <div class="card text-center transform hover:scale-105 transition-transform animate-fade-in" style="animation-delay: 0.3s">
            <div class="w-16 h-16 bg-gradient-to-br from-primary to-primary-light text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h3 class="text-xl font-bold text-primary mb-3">Download Report</h3>
            <p class="text-gray-600">
              Receive a comprehensive, well-structured report in PDF or DOCX format
            </p>
          </div>
        </div>

        <!-- Auth Forms -->
        <div class="max-w-md mx-auto animate-fade-in" style="animation-delay: 0.4s">
          <LoginForm v-if="showLogin" @switch-mode="showLogin = false" />
          <SignupForm v-else @switch-mode="showLogin = true" />
        </div>
      </div>
    </div>

    <!-- Logged In State -->
    <div v-else class="container mx-auto px-4 py-20">
      <div class="max-w-2xl mx-auto text-center animate-fade-in">
        <div class="card">
          <div class="w-20 h-20 bg-gradient-to-br from-primary to-primary-light text-white rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 class="text-3xl md:text-4xl font-bold text-primary mb-4">
            Welcome back!
          </h1>
          <p class="text-lg text-gray-600 mb-8">
            {{ authStore.user.displayName || authStore.user.email }}
          </p>
          <router-link
            to="/research"
            class="btn-primary inline-block"
          >
            Start New Research
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import LoginForm from '@/components/auth/LoginForm.vue';
import SignupForm from '@/components/auth/SignupForm.vue';

const authStore = useAuthStore();
const showLogin = ref(true);
</script>