import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { researchService } from '@/services/research.service';
import { ResearchQuery, ResearchSession, Report, HistoryItem } from '@/types';

export const useResearchStore = defineStore('research', () => {
  const currentSessionId = ref<string | null>(null); // ADDED: Track session ID separately
  const currentSession = ref<ResearchSession | null>(null);
  const currentReport = ref<Report | null>(null);
  const history = ref<HistoryItem[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed property to get session ID reliably
  const sessionId = computed(() => currentSessionId.value || currentSession.value?.sessionId);

  async function startResearch(query: ResearchQuery) {
    try {
      loading.value = true;
      error.value = null;

      console.log('Starting research with query:', query);

      const response = await researchService.startResearch(query);
      
      console.log('Research started, session ID:', response.sessionId);

      // Store session ID separately
      currentSessionId.value = response.sessionId;

      currentSession.value = {
        sessionId: response.sessionId,
        status: 'pending',
        progress: 0,
        hasReport: false,
      };

      pollStatus(response.sessionId);
    } catch (err: any) {
      console.error('Start research error:', err);
      error.value = err.response?.data?.error || err.message || 'Failed to start research';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function pollStatus(sessionId: string) {
    const interval = setInterval(async () => {
      try {
        const session = await researchService.getStatus(sessionId);
        
        currentSession.value = session;

        if (session.status === 'completed') {
          clearInterval(interval);
          console.log('Research completed, loading report...');
          await loadReport(sessionId);
        } else if (session.status === 'failed') {
          clearInterval(interval);
          error.value = session.errors?.join(', ') || 'Research failed';
          console.error('Research failed:', error.value);
        }
      } catch (err: any) {
        console.error('Poll status error:', err);
        clearInterval(interval);
        error.value = err.message;
      }
    }, 3000);
  }

  async function loadReport(sessionId: string) {
    try {
      console.log('Loading report for session:', sessionId);
      const report = await researchService.getReport(sessionId);
      currentReport.value = report;
      console.log('Report loaded successfully');
    } catch (err: any) {
      console.error('Load report error:', err);
      error.value = err.message || 'Failed to load report';
    }
  }

  async function downloadReport(format: 'pdf' | 'docx') {
    const activeSessionId = sessionId.value;
    
    if (!activeSessionId) {
      console.error('No session ID available');
      console.error('currentSessionId:', currentSessionId.value);
      console.error('currentSession:', currentSession.value);
      throw new Error('No active session');
    }

    try {
      console.log('Downloading report as', format);
      console.log('Using Session ID:', activeSessionId);
      
      const blob = await researchService.downloadReport(activeSessionId, format);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-report-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      console.log('Download completed');
    } catch (err: any) {
      console.error('Download error:', err);
      error.value = err.message || 'Download failed';
      throw err;
    }
  }

  async function loadHistory() {
    try {
      console.log('Loading research history...');
      history.value = await researchService.getHistory();
      console.log('History loaded:', history.value.length, 'items');
    } catch (err: any) {
      console.error('Load history error:', err);
      error.value = err.message || 'Failed to load history';
    }
  }

  async function deleteHistoryItem(historyId: string) {
    try {
      await researchService.deleteHistory(historyId);
      history.value = history.value.filter(item => item.id !== historyId);
    } catch (err: any) {
      error.value = err.message || 'Failed to delete history item';
    }
  }

  function clearSession() {
    currentSessionId.value = null;
    currentSession.value = null;
    currentReport.value = null;
    error.value = null;
  }

  return {
    currentSessionId,
    currentSession,
    currentReport,
    sessionId, // Export computed session ID
    history,
    loading,
    error,
    startResearch,
    loadReport,
    downloadReport,
    loadHistory,
    deleteHistoryItem,
    clearSession,
  };
});

