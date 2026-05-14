<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getResearchHistory } from '../../api/research';
import type { ResearchHistory } from '../../types';

const emit = defineEmits<{
  load: [id: string]
}>();

const history = ref<ResearchHistory[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    error.value = null;
    history.value = await getResearchHistory();
  } catch (err: any) {
    console.error('Failed to load history:', err);
    error.value = 'Failed to load research history';
  } finally {
    loading.value = false;
  }
});

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    completed: 'text-accent-green',
    error: 'text-accent-red',
    idle: 'text-gray-500'
  };
  return colors[status] || 'text-accent-blue';
};

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    completed: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    error: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
    idle: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
  };
  return icons[status] || icons.idle;
};
</script>

<template>
  <div class="card">
    <div class="flex items-center gap-3 mb-4">
      <svg class="w-6 h-6 text-accent-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-100">Research History</h3>
    </div>

    <div v-if="loading" class="text-center py-8">
      <svg class="w-8 h-8 animate-spin mx-auto text-accent-gold" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <svg class="w-16 h-16 mx-auto text-accent-red mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p class="text-accent-red text-sm">{{ error }}</p>
    </div>

    <div v-else-if="history.length === 0" class="text-center py-8">
      <svg class="w-16 h-16 mx-auto text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
      <p class="text-gray-500 text-sm">No research history yet</p>
    </div>

    <div v-else class="space-y-3 max-h-96 overflow-y-auto">
      <button
        v-for="item in history"
        :key="item.id"
        @click="emit('load', item.id)"
        class="w-full p-4 bg-primary-dark hover:bg-gray-700 rounded-xl transition-colors duration-200 text-left"
      >
        <div class="flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <p class="font-medium text-gray-200 truncate mb-1">{{ item.topic }}</p>
            <div class="flex items-center gap-3 text-xs text-gray-500">
              <span>{{ formatDate(item.createdAt) }}</span>
              <span>•</span>
              <span>{{ item.agents?.length || 0 }} agents</span>
            </div>
          </div>
          <div :class="['flex-shrink-0', getStatusColor(item.status)]">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getStatusIcon(item.status)" />
            </svg>
          </div>
        </div>
      </button>
    </div>
  </div>
</template>