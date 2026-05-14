import { apiService } from './api.service';
import { ResearchQuery, ResearchSession, Report, HistoryItem } from '@/types';

class ResearchService {
  async startResearch(query: ResearchQuery): Promise<{ sessionId: string }> {
    return await apiService.post<{ success: boolean; sessionId: string }>(
      '/research/start',
      query
    );
  }

  async getStatus(sessionId: string): Promise<ResearchSession> {
    const response = await apiService.get<{ success: boolean; session: ResearchSession }>(
      `/research/status/${sessionId}`
    );
    return response.session;
  }

  async getReport(sessionId: string): Promise<Report> {
    const response = await apiService.get<{ success: boolean; report: Report }>(
      `/research/result/${sessionId}`
    );
    return response.report;
  }

  async downloadReport(sessionId: string, format: 'pdf' | 'docx'): Promise<Blob> {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/research/download/${sessionId}/${format}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Download failed');
    }

    return await response.blob();
  }

  async getHistory(limit: number = 50): Promise<HistoryItem[]> {
    const response = await apiService.get<{ success: boolean; history: HistoryItem[] }>(
      '/history',
      { limit }
    );
    return response.history;
  }

  async deleteHistory(historyId: string): Promise<void> {
    await apiService.delete(`/history/${historyId}`);
  }
}

export const researchService = new ResearchService();