<template>
  <div class="bg-white rounded-lg shadow-lg p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-bold text-primary">Research History</h2>
      <button
        @click="refreshHistory"
        :disabled="loading"
        class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
      >
        {{ loading ? 'Refreshing...' : 'Refresh' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <p class="mt-2 text-gray-600">Loading history...</p>
    </div>

    <div v-else-if="researchStore.history.length === 0" class="text-center py-8 text-gray-500">
      <p class="text-lg">No research history found</p>
      <router-link to="/research" class="text-primary hover:underline mt-2 inline-block">
        Start your first research
      </router-link>
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="item in researchStore.history"
        :key="item.id"
        class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-semibold text-lg text-primary mb-2">
              {{ item.query.topic }}
            </h3>
            <div class="flex flex-wrap gap-2 mb-2">
              <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {{ item.query.researchType }}
              </span>
              <span class="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {{ item.query.depth }}
              </span>
              <span
                class="px-3 py-1 text-xs rounded-full"
                :class="getStatusClass(item.status)"
              >
                {{ item.status }}
              </span>
            </div>
            <div class="text-sm text-gray-600">
              Created: {{ formatDate(item.createdAt) }}
              <span v-if="item.completedAt">
                | Completed: {{ formatDate(item.completedAt) }}
              </span>
            </div>
          </div>

          <div class="flex space-x-2">
            <button
              v-if="item.status === 'completed'"
              @click="viewReport(item.id)"
              class="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-opacity-90 transition-all"
            >
              View
            </button>
            <button
              @click="deleteItem(item.id)"
              class="px-4 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-opacity-90 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useResearchStore } from '@/stores/research.store';
import { useRouter } from 'vue-router';

const researchStore = useResearchStore();
const router = useRouter();
const loading = ref(false);

onMounted(async () => {
  await refreshHistory();
});

async function refreshHistory() {
  loading.value = true;
  try {
    await researchStore.loadHistory();
  } catch (error) {
    console.error('Failed to load history:', error);
  } finally {
    loading.value = false;
  }
}

async function deleteItem(id: string) {
  if (confirm('Are you sure you want to delete this research?')) {
    await researchStore.deleteHistoryItem(id);
  }
}

function viewReport(sessionId: string) {
  router.push({ name: 'Research', query: { session: sessionId } });
}

function formatDate(date: Date | any): string {
  const dateObj = date instanceof Date ? date : new Date(date);
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getStatusClass(status: string): string {
  const classes: Record<string, string> = {
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    pending: 'bg-yellow-100 text-yellow-700',
    researching: 'bg-blue-100 text-blue-700',
    extracting: 'bg-blue-100 text-blue-700',
    summarizing: 'bg-blue-100 text-blue-700',
    generating: 'bg-blue-100 text-blue-700',
  };
  return classes[status] || 'bg-gray-100 text-gray-700';
}
</script>