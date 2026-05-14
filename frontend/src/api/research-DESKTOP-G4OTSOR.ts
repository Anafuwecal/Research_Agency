import axios from 'axios';
import type { ResearchState, ResearchHistory, ProgressUpdate, AgentType } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Get auth token from Firebase
async function getAuthToken(): Promise<string | null> {
  const auth = (await import('../config/firebase')).auth;
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
}

// Add auth header to requests
async function getAuthHeaders() {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export interface StartResearchResponse {
  id: string;
  status: string;
}

// Start new research with selected agents
export async function startResearch(topic: string, agents: AgentType[]): Promise<StartResearchResponse> {
  const headers = await getAuthHeaders();
  const response = await axios.post(`${API_URL}/research`, { topic, agents }, { headers });
  return response.data;
}

// Get research status
export async function getResearchStatus(id: string): Promise<ResearchState> {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/research/${id}`, { headers });
  return response.data;
}

// Get research history
export async function getResearchHistory(): Promise<ResearchHistory[]> {
  const headers = await getAuthHeaders();
  const response = await axios.get(`${API_URL}/research/history`, { headers });
  return response.data;
}

// Delete research session
export async function deleteResearch(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  await axios.delete(`${API_URL}/research/${id}`, { headers });
}

// Subscribe to progress updates via SSE
export function subscribeToProgress(
  id: string,
  onUpdate: (update: ProgressUpdate) => void,
  onError?: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`${API_URL}/research/${id}/stream`);

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

  return () => {
    eventSource.close();
  };
}