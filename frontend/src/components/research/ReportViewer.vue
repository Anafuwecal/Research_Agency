<template>
  <div class="bg-white rounded-lg shadow-lg p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl md:text-3xl font-bold text-primary">Research Report</h2>
      <div class="flex space-x-3">
        <button
          @click="handleDownload('pdf')"
          :disabled="downloading"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
        >
          {{ downloading === 'pdf' ? 'Downloading...' : 'Download PDF' }}
        </button>
        <button
          @click="handleDownload('docx')"
          :disabled="downloading"
          class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
        >
          {{ downloading === 'docx' ? 'Downloading...' : 'Download DOCX' }}
        </button>
      </div>
    </div>

    <!-- Rest of your existing template -->
    <div class="prose max-w-none">
      <h1 class="text-3xl font-bold mb-4">{{ report.title }}</h1>

      <!-- Metadata -->
      <div class="mb-8 p-4 bg-gray-50 rounded-lg">
        <h3 class="text-lg font-semibold mb-2">Metadata</h3>
        <div class="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span class="font-medium">Generated:</span>
            {{ formatDate(report.metadata.generatedDate) }}
          </div>
          <div>
            <span class="font-medium">Type:</span>
            {{ report.metadata.researchType }}
          </div>
          <div>
            <span class="font-medium">Sources:</span>
            {{ report.metadata.sourceCount }}
          </div>
          <div>
            <span class="font-medium">Word Count:</span>
            {{ report.metadata.wordCount.toLocaleString() }}
          </div>
        </div>
      </div>

      <!-- Abstract -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-3">Abstract</h2>
        <p class="text-gray-700 leading-relaxed">{{ report.abstract }}</p>
      </div>

      <!-- Table of Contents -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-3">Table of Contents</h2>
        <ul class="space-y-1">
          <li
            v-for="item in report.tableOfContents"
            :key="item.title"
            :style="{ paddingLeft: `${item.level * 1.5}rem` }"
            class="text-gray-700"
          >
            {{ item.title }}
          </li>
        </ul>
      </div>

      <!-- Report Sections -->
      <div
        v-for="section in report.sections"
        :key="section.title"
        class="mb-8"
      >
        <h2 class="text-2xl font-bold mb-4">{{ section.title }}</h2>
        <div class="text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
          {{ section.content }}
        </div>

        <!-- Subsections -->
        <div v-if="section.subsections">
          <div
            v-for="subsection in section.subsections"
            :key="subsection.title"
            class="ml-6 mb-6"
          >
            <h3 class="text-xl font-semibold mb-3">{{ subsection.title }}</h3>
            <div class="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {{ subsection.content }}
            </div>
          </div>
        </div>

        <!-- Statistics -->
        <div v-if="section.statistics && section.statistics.length > 0" class="my-6">
          <h3 class="text-lg font-semibold mb-3">Key Statistics</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(stat, idx) in section.statistics"
              :key="idx"
              class="p-4 bg-gray-50 rounded-lg"
            >
              <div class="font-semibold text-primary mb-1">{{ stat.value }}</div>
              <div class="text-sm text-gray-600">{{ stat.context }}</div>
              <div class="text-xs text-gray-500 mt-1">Source: {{ stat.source }}</div>
            </div>
          </div>
        </div>

        <!-- Images -->
        <div v-if="section.images && section.images.length > 0" class="my-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(image, idx) in section.images"
              :key="idx"
              class="border rounded-lg overflow-hidden"
            >
              <img :src="image.url" :alt="image.caption" class="w-full h-auto" />
              <div class="p-3 bg-gray-50">
                <div class="text-sm font-medium">{{ image.caption }}</div>
                <div class="text-xs text-gray-500">Source: {{ image.source }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Diagrams -->
        <div v-if="section.diagrams && section.diagrams.length > 0" class="my-6">
          <div class="space-y-4">
            <div
              v-for="(diagram, idx) in section.diagrams"
              :key="idx"
              class="border rounded-lg overflow-hidden"
            >
              <img :src="diagram.url" :alt="diagram.description" class="w-full h-auto" @error="handleImageError" />
              <div class="p-3 bg-gray-50">
                <div class="text-sm font-medium">{{ diagram.description }}</div>
                <div class="text-xs text-gray-500">Source: {{ diagram.source }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- References -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold mb-4">References</h2>
        <ol class="space-y-3">
          <li
            v-for="(ref, idx) in report.references"
            :key="idx"
            class="text-sm text-gray-700"
          >
            [{{ idx + 1 }}] {{ ref.authors.join(', ') }} ({{ ref.year }}). <em>{{ ref.title }}</em>.
            {{ ref.source }}.
            <a
              v-if="ref.url"
              :href="ref.url"
              target="_blank"
              class="text-primary hover:underline"
            >
              {{ ref.url }}
            </a>
            [Accessed: {{ ref.accessDate }}]
          </li>
        </ol>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Report } from '@/types';
import { useResearchStore } from '@/stores/research.store';

const props = defineProps<{
  report: Report;
}>();

const researchStore = useResearchStore();
const downloading = ref<'pdf' | 'docx' | null>(null);

// Get session ID from store
const sessionId = computed(() => researchStore.sessionId);

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function handleDownload(format: 'pdf' | 'docx') {
  if (!sessionId.value) {
    console.error('No session ID available');
    console.error('Store state:', {
      currentSessionId: researchStore.currentSessionId,
      currentSession: researchStore.currentSession,
    });
    alert('Unable to download - session information missing. Please try starting a new research.');
    return;
  }

  try {
    downloading.value = format;
    console.log(`Downloading ${format} for session:`, sessionId.value);
    
    await researchStore.downloadReport(format);
  } catch (error) {
    console.error('Download failed:', error);
    alert(`Failed to download ${format.toUpperCase()}. Please try again.`);
  } finally {
    downloading.value = null;
  }
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = 'none';
  console.warn('Failed to load image:', img.src);
}
</script>