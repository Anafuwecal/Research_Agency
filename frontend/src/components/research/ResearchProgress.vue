<template>
  <div class="max-w-xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-fade-in my-8">
    
    <div class="px-8 pt-8 pb-6">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-xl font-bold text-slate-900">Research Sequence</h2>
        <span class="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-full">
          {{ session.status }}
        </span>
      </div>
      <p class="text-sm text-slate-500">
        {{ statusText }} - {{ session.progress }}% Complete
      </p>
    </div>

    <div class="px-8 pb-8">
      <div class="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          class="bg-primary h-2 rounded-full transition-all duration-700 ease-out"
          :style="{ width: `${session.progress}%` }"
        ></div>
      </div>
    </div>

    <div class="px-8 pb-10">
      <div class="relative space-y-8">
        <div class="absolute left-4 top-2 bottom-8 w-0.5 bg-slate-100"></div>

        <div
          v-for="(stage, index) in stages"
          :key="stage.key"
          class="relative flex items-start gap-4"
        >
          <div 
            class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-4 border-white transition-colors duration-300"
            :class="getStageClass(stage.key)"
          >
            <transition name="fade" mode="out-in">
              <svg
                v-if="isStageComplete(stage.key)"
                class="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path>
              </svg>
              
              <div
                v-else-if="isStageActive(stage.key)"
                class="w-2 h-2 bg-white rounded-full animate-ping"
              ></div>
              
              <div v-else class="w-2 h-2 bg-slate-300 rounded-full"></div>
            </transition>
          </div>

          <div class="pt-0.5">
            <p 
              class="text-sm font-semibold transition-colors duration-300"
              :class="isStageActive(stage.key) ? 'text-slate-900' : (isStageComplete(stage.key) ? 'text-slate-700' : 'text-slate-400')"
            >
              {{ stage.label }}
            </p>
            <p v-if="isStageActive(stage.key)" class="text-xs text-primary animate-pulse mt-0.5">
              Processing...
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="session.status === 'failed'" class="px-8 pb-8">
      <div class="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
        <svg class="w-5 h-5 text-red-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 class="text-sm font-bold text-red-800">Process Interrupted</h4>
          <p class="text-xs text-red-600 mt-1">The research sequence encountered an error. Please try again.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ResearchSession } from '@/types';

const props = defineProps<{
  session: ResearchSession;
}>();

const stages = [
  { key: 'pending', label: 'Initializing protocol' },
  { key: 'researching', label: 'Querying knowledge bases' },
  { key: 'extracting', label: 'Extracting data points' },
  { key: 'summarizing', label: 'Synthesizing insights' },
  { key: 'visualizing', label: 'Rendering diagrams' },
  { key: 'generating', label: 'Drafting report' },
  { key: 'completed', label: 'Research finalized' },
];

const statusText = computed(() => {
  const stage = stages.find(s => s.key === props.session.status);
  return stage ? stage.label : 'Waiting to start...';
});

function isStageComplete(stageKey: string) {
  const stageIndex = stages.findIndex(s => s.key === stageKey);
  const currentIndex = stages.findIndex(s => s.key === props.session.status);
  return stageIndex < currentIndex || props.session.status === 'completed';
}

function isStageActive(stageKey: string) {
  return stageKey === props.session.status;
}

function getStageClass(stageKey: string) {
  if (isStageComplete(stageKey)) {
    return 'bg-green-500 border-green-100'; // Green for completion
  } else if (isStageActive(stageKey)) {
    return 'bg-primary border-blue-100 shadow-lg'; // Primary for active
  } else {
    return 'bg-slate-200 border-slate-50'; // Grey for pending
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>