<template>
  <div class="card max-w-4xl mx-auto animate-fade-in">
    <div class="mb-8">
      <h2 class="text-2xl md:text-3xl font-bold text-primary mb-2">Start New Research</h2>
      <p class="text-gray-600">Tell us what you'd like to research and we'll handle the rest</p>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-8">
      <!-- Topic Input -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-3">
          Research Topic
          <span class="text-red-500">*</span>
        </label>
        <textarea
          v-model="query.topic"
          required
          rows="4"
          class="input-field resize-none"
          placeholder="e.g., The impact of artificial intelligence on modern healthcare systems"
        ></textarea>
        <p class="mt-2 text-xs text-gray-500">Be specific to get better results</p>
      </div>

      <!-- Type and Depth -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            Research Type
          </label>
          <select
            v-model="query.researchType"
            class="input-field cursor-pointer"
          >
            <option value="academic">Academic Research</option>
            <option value="political">Political Analysis</option>
            <option value="technical">Technical Documentation</option>
            <option value="business">Business Intelligence</option>
            <option value="general">General Research</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-3">
            Research Depth
          </label>
          <div class="flex space-x-2">
            <button
              v-for="depth in ['basic', 'intermediate', 'advanced']"
              :key="depth"
              type="button"
              @click="query.depth = depth"
              class="flex-1 px-4 py-3 rounded-lg border-2 font-medium text-sm capitalize transition-all"
              :class="query.depth === depth 
                ? 'border-primary bg-primary text-white' 
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary'"
            >
              {{ depth }}
            </button>
          </div>
        </div>
      </div>

      <!-- Requirements -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-4">
          Report Requirements
        </label>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all"
            :class="query.requirements.includeDiagrams ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'">
            <input
              v-model="query.requirements.includeDiagrams"
              type="checkbox"
              class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div class="ml-3">
              <span class="font-medium text-gray-900">Include Diagrams</span>
              <p class="text-xs text-gray-500 mt-1">Add visual representations and images</p>
            </div>
          </label>

          <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all"
            :class="query.requirements.includeStatistics ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'">
            <input
              v-model="query.requirements.includeStatistics"
              type="checkbox"
              class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div class="ml-3">
              <span class="font-medium text-gray-900">Include Statistics</span>
              <p class="text-xs text-gray-500 mt-1">Add data and statistical analysis</p>
            </div>
          </label>

          <label class="flex items-start p-4 rounded-lg border-2 cursor-pointer transition-all"
            :class="query.requirements.includeReferences ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'">
            <input
              v-model="query.requirements.includeReferences"
              type="checkbox"
              class="mt-1 w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <div class="ml-3">
              <span class="font-medium text-gray-900">Include References</span>
              <p class="text-xs text-gray-500 mt-1">Add citations and bibliography</p>
            </div>
          </label>
        </div>
      </div>

      <!-- Source Slider - FIXED: Convert to number -->
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-3">
          Maximum Sources: <span class="text-primary font-bold">{{ query.requirements.maxSources }}</span>
        </label>
        <div class="flex items-center space-x-4">
          <span class="text-sm text-gray-500">5</span>
          <input
            v-model.number="query.requirements.maxSources"
            type="range"
            min="5"
            max="50"
            step="1"
            class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
          />
          <span class="text-sm text-gray-500">50</span>
        </div>
        <p class="mt-2 text-xs text-gray-500">More sources provide comprehensive coverage but take longer</p>
      </div>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
        <div class="flex items-start">
          <svg class="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
          </svg>
          <div class="flex-1">
            <p class="font-semibold">Error</p>
            <p class="mt-1 text-sm">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        :disabled="loading"
        class="btn-primary w-full text-lg py-4"
      >
        <span v-if="loading" class="flex items-center justify-center">
          <svg class="animate-spin -ml-1 mr-3 h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Starting Research...
        </span>
        <span v-else class="flex items-center justify-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
          </svg>
          Start Research
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
  researchType: 'general',
  depth: 'intermediate',
  requirements: {
    includeDiagrams: true,
    includeStatistics: true,
    includeReferences: true,
    maxSources: 20, // Changed: Now a number, not a string
  },
});

const loading = ref(false);
const error = ref('');

async function handleSubmit() {
  try {
    loading.value = true;
    error.value = '';

    // Ensure maxSources is a number
    query.value.requirements.maxSources = Number(query.value.requirements.maxSources);

    console.log('Submitting research query:', query.value);

    await researchStore.startResearch(query.value);
    emit('research-started');
  } catch (err: any) {
    console.error('Form submit error:', err);
    error.value = err.response?.data?.error || err.message || 'Failed to start research';
  } finally {
    loading.value = false;
  }
}
</script>