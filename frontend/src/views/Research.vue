<template>
  <div class="min-h-screen bg-slate-50">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto">
        
        <div class="mb-8 animate-fade-in">
          <h1 class="text-3xl font-serif font-bold text-slate-900">Research Workspace</h1>
          <p class="text-slate-500">Manage your autonomous agent research sessions</p>
        </div>

        <transition name="fade" mode="out-in">
          <div :key="currentView">
            
            <ResearchForm
              v-if="!researchStore.currentSession"
              @research-started="handleResearchStarted"
            />

            <ResearchProgress
              v-else-if="!researchStore.currentReport"
              :session="researchStore.currentSession"
            />

            <div v-else>
              <ReportViewer :report="researchStore.currentReport" />
              
              <div class="mt-10 flex justify-center">
                <button
                  @click="startNewResearch"
                  class="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-semibold rounded-xl shadow-sm hover:border-primary hover:text-primary transition-all duration-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
                  </svg>
                  Initiate New Research
                </button>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useResearchStore } from '@/stores/research.store';
import ResearchForm from '@/components/research/ResearchForm.vue';
import ResearchProgress from '@/components/research/ResearchProgress.vue';
import ReportViewer from '@/components/research/ReportViewer.vue';

const route = useRoute();
const researchStore = useResearchStore();

// Computed helper to determine the current view state for the transition
const currentView = computed(() => {
  if (!researchStore.currentSession) return 'form';
  if (!researchStore.currentReport) return 'progress';
  return 'report';
});

onMounted(async () => {
  const sessionId = route.query.session as string;
  if (sessionId) {
    researchStore.currentSessionId = sessionId;
    await researchStore.loadReport(sessionId);
  }
});

onUnmounted(() => {
  researchStore.clearSession();
});

function handleResearchStarted() {
  // Logic after initiation
}

function startNewResearch() {
  researchStore.clearSession();
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>