import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { ResearchState, ResearchStatus } from '../types';

export const useResearchStore = defineStore('research', () => {
  const state = ref<ResearchState>({
    topic: '',
    status: 'idle',
    currentStep: '',
    progress: 0,
    plan: null,
    searchResults: [],
    extractedData: [],
    summary: '',
    report: '',
    error: null,
    startTime: null,
    endTime: null,
  });

  const isResearching = computed(() => 
    state.value.status !== 'idle' && 
    state.value.status !== 'completed' && 
    state.value.status !== 'error'
  );

  const duration = computed(() => {
    if (!state.value.startTime) return 0;
    const end = state.value.endTime || Date.now();
    return Math.floor((end - state.value.startTime) / 1000);
  });

  function setStatus(status: ResearchStatus, step: string, progress: number) {
    state.value.status = status;
    state.value.currentStep = step;
    state.value.progress = progress;
  }

  function setError(error: string) {
    state.value.status = 'error';
    state.value.error = error;
  }

  function reset() {
    state.value = {
      topic: '',
      status: 'idle',
      currentStep: '',
      progress: 0,
      plan: null,
      searchResults: [],
      extractedData: [],
      summary: '',
      report: '',
      error: null,
      startTime: null,
      endTime: null,
    };
  }

  return {
    state,
    isResearching,
    duration,
    setStatus,
    setError,
    reset,
  };
});