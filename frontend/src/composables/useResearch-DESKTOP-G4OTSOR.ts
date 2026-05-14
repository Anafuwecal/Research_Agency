import { ref } from 'vue';
import { startResearch, getResearchStatus, subscribeToProgress, deleteResearch } from '../api/research';
import type { ResearchState, AgentType } from '../types';

export function useResearch() {
  const state = ref<ResearchState | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const currentResearchId = ref<string | null>(null);
  const unsubscribe = ref<(() => void) | null>(null);

  async function start(topic: string, agents: AgentType[]) {
    try {
      loading.value = true;
      error.value = null;

      const { id } = await startResearch(topic, agents);
      currentResearchId.value = id;

      state.value = {
        id,
        topic,
        status: 'planning',
        currentStep: 'Starting research...',
        progress: 0,
        plan: [],
        searchResults: [],
        extractedData: [],
        summary: '',
        report: '',
        startTime: Date.now(),
        userId: '',
        agents
      };

      unsubscribe.value = subscribeToProgress(
        id,
        (update) => {
          if (state.value) {
            state.value.status = update.status;
            state.value.currentStep = update.currentStep;
            state.value.progress = update.progress;
          }

          if (update.status === 'completed') {
            fetchFullState(id);
          }
        },
        (err) => {
          error.value = err.message;
          loading.value = false;
        }
      );

      loading.value = false;
    } catch (err: any) {
      error.value = err.message || 'Failed to start research';
      loading.value = false;
      state.value = null;
    }
  }

  async function fetchFullState(id: string) {
    try {
      const fullState = await getResearchStatus(id);
      state.value = fullState;
    } catch (err: any) {
      console.error('Failed to fetch full state:', err);
    }
  }

  async function loadResearch(id: string) {
    try {
      loading.value = true;
      error.value = null;
      const research = await getResearchStatus(id);
      state.value = research;
      currentResearchId.value = id;
    } catch (err: any) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  }

  async function reset() {
    if (unsubscribe.value) {
      unsubscribe.value();
      unsubscribe.value = null;
    }

    if (currentResearchId.value) {
      try {
        await deleteResearch(currentResearchId.value);
      } catch (err) {
        console.error('Failed to delete research:', err);
      }
    }

    state.value = null;
    loading.value = false;
    error.value = null;
    currentResearchId.value = null;
  }

  return {
    state,
    loading,
    error,
    start,
    loadResearch,
    reset,
  };
}