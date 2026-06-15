<template>
  <div class="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in my-8">
    
    <div class="bg-slate-50/80 px-8 py-10 md:px-12 md:py-12 border-b border-slate-100 text-center">
      <h2 class="text-3xl md:text-4xl font-serif font-bold text-slate-900 mb-3">Initiate Research</h2>
      <p class="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
        Define your research parameters below. Our intelligent agents will gather, analyze, and synthesize the information into a comprehensive, publication-ready report.
      </p>
    </div>

    <form @submit.prevent="handleSubmit" class="p-8 md:p-12">
      
      <div class="mb-10">
        <label class="block text-sm font-bold text-slate-800 mb-2">
          Research Topic <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="query.topic"
          required
          rows="3"
          class="w-full px-5 py-4 bg-slate-50 rounded-xl border border-slate-200 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none shadow-sm text-slate-900 placeholder-slate-400 text-lg"
          placeholder="e.g., The economic impact of artificial intelligence on modern healthcare systems"
        ></textarea>
        <p class="mt-2 text-sm text-slate-500 flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Be as specific as possible to yield highly targeted results.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
        <div>
          <label class="block text-sm font-bold text-slate-800 mb-3">
            Research Category
          </label>
          <div class="relative">
            <select
              v-model="query.researchType"
              class="w-full appearance-none px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-700 font-medium transition-all cursor-pointer shadow-sm"
            >
              <option value="academic">Academic Research</option>
              <option value="political">Political Analysis</option>
              <option value="technical">Technical Documentation</option>
              <option value="business">Business Intelligence</option>
              <option value="general">General Inquiry</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-800 mb-3">
            Analysis Depth
          </label>
          <div class="flex p-1 bg-slate-100 rounded-xl">
            <button
              v-for="depth in ['basic', 'intermediate', 'advanced']"
              :key="depth"
              type="button"
              @click="query.depth = depth"
              class="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold capitalize transition-all duration-200"
              :class="query.depth === depth 
                ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200/50' 
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'"
            >
              {{ depth }}
            </button>
          </div>
        </div>
      </div>

      <hr class="border-slate-100 mb-10" />

      <div class="mb-10">
        <label class="block text-sm font-bold text-slate-800 mb-4">
          Report Inclusions
        </label>
        
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label 
            class="relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md"
            :class="query.requirements.includeDiagrams ? 'border-primary bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <input v-model="query.requirements.includeDiagrams" type="checkbox" class="sr-only" />
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-lg" :class="query.requirements.includeDiagrams ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <div v-if="query.requirements.includeDiagrams" class="text-primary">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              </div>
            </div>
            <span class="font-bold text-slate-800 text-sm mb-1">Diagrams</span>
            <p class="text-xs text-slate-500 leading-relaxed">Visual representations and contextual images</p>
          </label>

          <label 
            class="relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md"
            :class="query.requirements.includeStatistics ? 'border-primary bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <input v-model="query.requirements.includeStatistics" type="checkbox" class="sr-only" />
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-lg" :class="query.requirements.includeStatistics ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              </div>
              <div v-if="query.requirements.includeStatistics" class="text-primary">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              </div>
            </div>
            <span class="font-bold text-slate-800 text-sm mb-1">Statistics</span>
            <p class="text-xs text-slate-500 leading-relaxed">Data points and formal statistical analysis</p>
          </label>

          <label 
            class="relative flex flex-col p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md"
            :class="query.requirements.includeReferences ? 'border-primary bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'"
          >
            <input v-model="query.requirements.includeReferences" type="checkbox" class="sr-only" />
            <div class="flex items-center justify-between mb-3">
              <div class="p-2 rounded-lg" :class="query.requirements.includeReferences ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              </div>
              <div v-if="query.requirements.includeReferences" class="text-primary">
                <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
              </div>
            </div>
            <span class="font-bold text-slate-800 text-sm mb-1">References</span>
            <p class="text-xs text-slate-500 leading-relaxed">Inline citations and academic bibliography</p>
          </label>
        </div>
      </div>

      <div class="mb-12 bg-slate-50 p-6 rounded-xl border border-slate-100">
        <div class="flex justify-between items-center mb-4">
          <label class="block text-sm font-bold text-slate-800">
            Source Scope
          </label>
          <div class="px-3 py-1 bg-white border border-slate-200 rounded-md shadow-sm text-primary font-bold text-sm">
            {{ query.requirements.maxSources }} Sources Max
          </div>
        </div>
        <div class="flex items-center space-x-4">
          <span class="text-xs font-semibold text-slate-400">5</span>
          <input
            v-model.number="query.requirements.maxSources"
            type="range"
            min="5"
            max="50"
            step="1"
            class="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span class="text-xs font-semibold text-slate-400">50</span>
        </div>
        <p class="mt-4 text-xs text-slate-500 text-center">
          Note: Processing a higher volume of sources provides comprehensive coverage but extends generation time.
        </p>
      </div>

      <div v-if="error" class="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm animate-fade-in">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-3 mt-0.5 flex-shrink-0 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <p class="font-bold text-sm">Research Initialization Failed</p>
            <p class="mt-1 text-sm opacity-90">{{ error }}</p>
          </div>
        </div>
      </div>

      <button
        type="submit"
        :disabled="loading"
        class="w-full py-4 px-6 bg-primary text-white text-lg font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center group"
      >
        <span v-if="loading" class="flex items-center">
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Compiling Research Protocol...
        </span>
        <span v-else class="flex items-center">
          Execute Research
          <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/>
          </svg>
        </span>
      </button>
      
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useResearchStore } from '@/stores/research.store';
import { ResearchQuery } from '@/types';

const emit = defineEmits(['research-started']);
const researchStore = useResearchStore();

const query = ref<ResearchQuery>({
  topic: '',
  researchType: 'academic', // Defaulted to academic for the premium feel
  depth: 'intermediate',
  requirements: {
    includeDiagrams: true,
    includeStatistics: true,
    includeReferences: true,
    maxSources: 20, 
  },
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';

    query.value.requirements.maxSources = Number(query.value.requirements.maxSources);
    
    await researchStore.startResearch(query.value);
    emit('research-started');
  } catch (err: any) {
    console.error('Form submit error:', err);
    error.value = err.response?.data?.error || err.message || 'Failed to initialize the research sequence.';
  } finally {
    loading.value = false;
  }
}
</script>