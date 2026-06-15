<template>
  <div class="min-h-screen bg-slate-50">
    <main class="container mx-auto px-6 py-16 md:py-24">
      
      <div v-if="!authStore.user" class="max-w-6xl mx-auto">
        
        <div class="text-center mb-24 animate-fade-in">
          <h1 class="text-5xl md:text-7xl font-serif font-bold text-slate-900 mb-8 tracking-tight">
            Advanced Intelligence.<br />
            <span class="text-primary">Research Accelerated.</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Harness the power of autonomous agents to gather, analyze, and synthesize complex information into publication-ready reports.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div 
            v-for="(feature, index) in features" 
            :key="index"
            class="group bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:border-primary/20"
          >
            <div 
              class="w-14 h-14 bg-primary/5 text-primary rounded-xl flex items-center justify-center mb-6 transition-colors group-hover:bg-primary group-hover:text-white"
              v-html="feature.icon"
            >
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-3">{{ feature.title }}</h3>
            <p class="text-slate-500 leading-relaxed">{{ feature.description }}</p>
          </div>
        </div>

        <div class="max-w-md mx-auto">
          <div class="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            <LoginForm v-if="showLogin" @switch-mode="showLogin = false" />
            <SignupForm v-else @switch-mode="showLogin = true" />
          </div>
        </div>
      </div>

      <div v-else class="max-w-2xl mx-auto text-center animate-fade-in pt-10">
        <div class="bg-white p-12 rounded-3xl shadow-xl border border-slate-100">
          <div class="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h2 class="text-3xl font-serif font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p class="text-slate-500 mb-8 font-medium">
            {{ authStore.user.displayName || authStore.user.email }}
          </p>
          <router-link
            to="/research"
            class="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-opacity-90 transition-all transform hover:-translate-y-1"
          >
            Launch Research Protocol
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'; 
import { useAuthStore } from '@/stores/auth.store';
import LoginForm from '@/components/auth/LoginForm.vue';
import SignupForm from '@/components/auth/SignupForm.vue';

// Define as standard strings with the "w-7 h-7" classes baked in
const DocumentIcon = '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>';

const BrainIcon = '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>';

const DownloadIcon = '<svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>';

const features = [
  { title: 'Define Parameters', description: 'Input your topic and configure depth, type, and source requirements for precision results.', icon: DocumentIcon },
  { title: 'Autonomous Agents', description: 'Our multi-agent architecture executes systematic research, data extraction, and synthesis.', icon: BrainIcon },
  { title: 'Instant Export', description: 'Generate formatted, publication-ready reports in PDF or DOCX format with full citations.', icon: DownloadIcon },
];

const authStore = useAuthStore();
const showLogin = ref(true);
</script>