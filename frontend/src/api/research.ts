import apiClient from './client';
import type { ResearchState, ResearchHistory, ProgressUpdate, AgentType } from '../types';

export interface StartResearchResponse {
  id: string;
  status: string;
}

// Start new research with selected agents
export async function startResearch(topic: string, agents: AgentType[]): Promise<StartResearchResponse> {
  const response = await apiClient.post('/research', { topic, agents });
  return response.data;
}

// Get research status
export async function getResearchStatus(id: string): Promise<ResearchState> {
  const response = await apiClient.get(`/research/${id}`);
  return response.data;
}

// Get research history
export async function getResearchHistory(): Promise<ResearchHistory[]> {
  try {
    const response = await apiClient.get('/research/history');
    return response.data.data || response.data; // Handle both { success, data: [] } and direct array responses
  } catch (error: any) {
    console.error('Failed to get research history:', error);
    throw error; // Throw instead of returning empty array to handle auth errors properly
  }
}

// Delete research session
export async function deleteResearch(id: string): Promise<void> {
  await apiClient.delete(`/research/${id}`);
}

// Subscribe to progress updates via SSE
export function subscribeToProgress(
  id: string,
  onUpdate: (update: ProgressUpdate) => void,
  onError?: (error: Error) => void
): () => void {
  // Get the token from localStorage or wherever you store it
  const token = localStorage.getItem('token'); // Adjust based on your auth implementation
  
  // Build the SSE URL with auth token
  const baseURL = apiClient.defaults.baseURL || '/api';
  const sseUrl = new URL(`${baseURL}/research/${id}/stream`, window.location.origin);
  
  // Add token as query parameter (since EventSource doesn't support headers)
  if (token) {
    sseUrl.searchParams.append('token', token);
  }

  const eventSource = new EventSource(sseUrl.toString());

  eventSource.onmessage = (event) => {
    try {
      const update = JSON.parse(event.data) as ProgressUpdate;
      onUpdate(update);
    } catch (error) {
      console.error('Failed to parse SSE message:', error);
    }
  };

  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    if (onError) {
      onError(new Error('Connection to server lost'));
    }
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}