<template>
  <div class="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
    
    <div class="max-w-5xl mx-auto mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <button 
        @click="router.back()" 
        class="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to History
      </button>

      <div class="flex space-x-3">
        <button
          @click="handleDownload('pdf')"
          :disabled="downloading !== null"
          class="px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <span v-if="downloading === 'pdf'" class="inline-block animate-spin h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full"></span>
          {{ downloading === 'pdf' ? 'Generating PDF...' : 'Export PDF' }}
        </button>
        <button
          @click="handleDownload('docx')"
          :disabled="downloading !== null"
          class="px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
        >
          <span v-if="downloading === 'docx'" class="inline-block animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
          {{ downloading === 'docx' ? 'Generating DOCX...' : 'Export DOCX' }}
        </button>
      </div>
    </div>

    <article class="max-w-5xl mx-auto bg-white shadow-xl border border-slate-200 rounded-xl overflow-hidden">
      
      <header class="border-b border-slate-200 bg-slate-50/50 px-8 py-12 md:px-16 md:py-16 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold tracking-wide uppercase mb-6">
          {{ report.metadata.researchType }} Research
        </div>
        
        <h1 class="text-3xl md:text-5xl font-serif font-bold text-slate-900 leading-tight mb-8">
          {{ report.title }}
        </h1>

        <div class="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-slate-600">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-900">Generated:</span>
            {{ formatDate(report.metadata.generatedDate) }}
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-900">Sources:</span>
            {{ report.metadata.sourceCount }}
          </div>
          <div class="flex items-center gap-2">
            <span class="font-semibold text-slate-900">Word Count:</span>
            {{ report.metadata.wordCount.toLocaleString() }}
          </div>
        </div>
      </header>

      <div class="px-8 py-12 md:px-16 md:py-16 prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-a:text-primary hover:prose-a:text-blue-700">
        
        <div v-if="report.abstract" class="mb-12 p-6 bg-slate-50 border-l-4 border-primary rounded-r-lg">
          <h2 class="text-xl font-bold mb-3 mt-0 text-slate-900">Abstract</h2>
          <p class="text-slate-700 m-0 leading-relaxed italic">{{ report.abstract }}</p>
        </div>

        <div v-if="report.tableOfContents?.length" class="mb-12 p-8 border border-slate-200 rounded-xl bg-white shadow-sm">
          <h2 class="text-2xl font-bold mb-4 mt-0 border-b border-slate-100 pb-4 text-slate-900">Table of Contents</h2>
          <ul class="list-none pl-0 space-y-2 m-0">
            <li
              v-for="item in report.tableOfContents"
              :key="item.title"
              :style="{ paddingLeft: `${(item.level - 1) * 1.5}rem` }"
              class="text-slate-700 hover:text-primary transition-colors cursor-pointer"
            >
              • {{ item.title }}
            </li>
          </ul>
        </div>

        <hr class="my-12 border-slate-200" />

        <div
          v-for="section in report.sections"
          :key="section.title"
          class="mb-16"
        >
          <h2 class="text-3xl font-bold mb-6 text-slate-900">{{ section.title }}</h2>
          <div class="text-slate-700 leading-relaxed whitespace-pre-wrap mb-8">
            {{ section.content }}
          </div>

          <div v-if="section.subsections?.length" class="space-y-8 mt-8">
            <div
              v-for="subsection in section.subsections"
              :key="subsection.title"
            >
              <h3 class="text-2xl font-semibold mb-4 text-slate-800">{{ subsection.title }}</h3>
              <div class="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {{ subsection.content }}
              </div>
            </div>
          </div>

          <div v-if="section.statistics?.length" class="my-10 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose">
            <div
              v-for="(stat, idx) in section.statistics"
              :key="idx"
              class="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div class="text-3xl font-bold text-primary mb-2">{{ stat.value }}</div>
              <div class="text-sm font-medium text-slate-700 mb-2">{{ stat.context }}</div>
              <div class="text-xs text-slate-500 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Source: {{ stat.source }}
              </div>
            </div>
          </div>

          <div v-if="section.images?.length" class="my-10 grid grid-cols-1 md:grid-cols-2 gap-8 not-prose">
            <figure
              v-for="(image, idx) in section.images"
              :key="idx"
              class="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div class="bg-slate-100 flex items-center justify-center p-2">
                <img 
                  :src="image.url" 
                  :alt="image.caption" 
                  class="w-full h-auto max-h-[400px] object-contain rounded" 
                  @error="handleImageError"
                />
              </div>
              <figcaption class="p-4 bg-white border-t border-slate-100">
                <div class="text-sm font-medium text-slate-800 mb-1">{{ image.caption }}</div>
                <div class="text-xs text-slate-500">Source: {{ image.source }}</div>
              </figcaption>
            </figure>
          </div>

          <div v-if="section.diagrams?.length" class="my-10 space-y-8 not-prose">
            <figure
              v-for="(diagram, idx) in section.diagrams"
              :key="idx"
              class="flex flex-col border border-slate-200 rounded-xl overflow-hidden shadow-sm"
            >
              <div class="bg-slate-50 flex items-center justify-center p-4">
                <img 
                  :src="diagram.url" 
                  :alt="diagram.description" 
                  class="w-full h-auto max-h-[500px] object-contain mix-blend-multiply" 
                  @error="handleImageError" 
                />
              </div>
              <figcaption class="p-4 bg-white border-t border-slate-100">
                <div class="text-sm font-medium text-slate-800 mb-1">{{ diagram.description }}</div>
                <div class="text-xs text-slate-500">Source: {{ diagram.source }}</div>
              </figcaption>
            </figure>
          </div>
        </div>

        <hr class="my-12 border-slate-200" />

        <div v-if="report.references?.length" class="mb-8">
          <h2 class="text-2xl font-bold mb-6 text-slate-900">References</h2>
          <ol class="space-y-4 text-slate-600 text-sm pl-5 marker:text-slate-400">
            <li
              v-for="(ref, idx) in report.references"
              :key="idx"
              class="pl-2 leading-relaxed"
            >
              <span class="font-semibold text-slate-800">{{ ref.authors.join(', ') }}</span> 
              ({{ ref.year }}). 
              <em class="text-slate-800">{{ ref.title }}</em>.
              {{ ref.source }}.
              <br/>
              <a
                v-if="ref.url"
                :href="ref.url"
                target="_blank"
                class="text-primary hover:text-blue-700 hover:underline break-all"
              >
                {{ ref.url }}
              </a>
              <span class="text-slate-400 ml-2">[Accessed: {{ ref.accessDate }}]</span>
            </li>
          </ol>
        </div>

      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router'; // Added router for the Back button
import { Report } from '@/types';
import { useResearchStore } from '@/stores/research.store';

const props = defineProps<{
  report: Report;
}>();

const router = useRouter(); // Initialize router
const researchStore = useResearchStore();
const downloading = ref<'pdf' | 'docx' | null>(null);

const sessionId = computed(() => researchStore.sessionId);

function formatDate(date: Date | string): string {
  if (!date) return 'Unknown Date';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

async function handleDownload(format: 'pdf' | 'docx') {
  if (!sessionId.value) {
    console.error('No session ID available');
    alert('Unable to download - session information missing. Please try starting a new research.');
    return;
  }

  try {
    downloading.value = format;
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
  // Instead of completely hiding it, show a fallback professional state
  img.style.display = 'none';
  img.parentElement?.classList.add('min-h-[200px]', 'bg-slate-100');
  img.insertAdjacentHTML('afterend', '<div class="text-slate-400 text-sm flex flex-col items-center justify-center h-full min-h-[200px] w-full"><svg class="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>Image unavailable</div>');
}
</script>