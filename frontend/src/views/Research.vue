<!-- src/views/Research.vue -->
<template>
  <div class="min-h-screen bg-white">
    <div class="container mx-auto px-4 py-8">
      <div class="max-w-4xl mx-auto">
        <ResearchForm
          v-if="!researchStore.currentSession"
          @research-started="handleResearchStarted"
        />

        <ResearchProgress
          v-else-if="researchStore.currentSession && !researchStore.currentReport"
          :session="researchStore.currentSession"
        />

        <div v-else-if="researchStore.currentReport">
          <!-- REMOVED sessionId prop - ReportViewer gets it from store -->
          <ReportViewer :report="researchStore.currentReport" />
          
          <div class="mt-6 text-center">
            <button
              @click="startNewResearch"
              class="px-6 py-3 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-all"
            >
              Start New Research
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useResearchStore } from '@/stores/research.store';
import ResearchForm from '@/components/research/ResearchForm.vue';
import ResearchProgress from '@/components/research/ResearchProgress.vue';
import ReportViewer from '@/components/research/ReportViewer.vue';

const route = useRoute();
const researchStore = useResearchStore();

onMounted(async () => {
  const sessionId = route.query.session as string;
  if (sessionId) {
    researchStore.currentSessionId = sessionId; // Set the session ID
    await researchStore.loadReport(sessionId);
  }
});

onUnmounted(() => {
  researchStore.clearSession();
});

function handleResearchStarted() {
  console.log('Research started');
}

function startNewResearch() {
  researchStore.clearSession();
}
</script>