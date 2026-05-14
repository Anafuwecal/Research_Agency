<template>
  <div class="bg-white rounded-lg shadow-lg p-8">
    <h2 class="text-2xl font-bold text-primary mb-6">Research in Progress</h2>

    <div class="mb-6">
      <div class="flex justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">{{ statusText }}</span>
        <span class="text-sm font-medium text-primary">{{ session.progress }}%</span>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-3">
        <div
          class="bg-primary h-3 rounded-full transition-all duration-500"
          :style="{ width: `${session.progress}%` }"
        ></div>
      </div>
    </div>

    <div class="space-y-4">
      <div
        v-for="stage in stages"
        :key="stage.key"
        class="flex items-center space-x-3"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center"
          :class="getStageClass(stage.key)"
        >
          <svg
            v-if="isStageComplete(stage.key)"
            class="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            ></path>
          </svg>
          <div
            v-else-if="isStageActive(stage.key)"
            class="w-3 h-3 bg-white rounded-full animate-pulse"
          ></div>
          <div v-else class="w-3 h-3 bg-gray-400 rounded-full"></div>
        </div>
        <span
          class="text-sm font-medium"
          :class="isStageActive(stage.key) || isStageComplete(stage.key) ? 'text-primary' : 'text-gray-500'"
        >
          {{ stage.label }}
        </span>
      </div>
    </div>

    <div v-if="session.status === 'failed'" class="mt-6 p-4 bg-red-100 text-red-700 rounded-lg">
      Research failed. Please try again.
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
  { key: 'pending', label: 'Initializing research' },
  { key: 'researching', label: 'Gathering information' },
  { key: 'extracting', label: 'Extracting data' },
  { key: 'summarizing', label: 'Creating summary' },
  { key: 'visualizing', label: 'Generating visuals' },
  { key: 'generating', label: 'Generating report' },
  { key: 'completed', label: 'Research complete' },
];

const statusText = computed(() => {
  const stage = stages.find(s => s.key === props.session.status);
  return stage ? stage.label : 'Processing...';
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
    return 'bg-primary';
  } else if (isStageActive(stageKey)) {
    return 'bg-primary';
  } else {
    return 'bg-gray-300';
  }
}
</script>