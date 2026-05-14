export type ResearchStatus = 
  | 'idle' 
  | 'planning' 
  | 'researching' 
  | 'extracting' 
  | 'summarizing' 
  | 'generating' 
  | 'completed' 
  | 'error';

export type AgentType = 'planner' | 'researcher' | 'extractor' | 'summarizer' | 'reporter';

export interface ResearchState {
  id: string;
  topic: string;
  status: ResearchStatus;
  currentStep: string;
  progress: number;
  plan: string[];
  searchResults: any[];
  extractedData: any[];
  summary: string;
  report: string;
  error?: string;
  startTime: number;
  endTime?: number;
  userId: string;
  agents: AgentType[];
}

export interface ResearchRequest {
  topic: string;
  agents: AgentType[];
}

export interface ProgressUpdate {
  status: ResearchStatus;
  currentStep: string;
  progress: number;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export interface ResearchHistory {
  id: string;
  topic: string;
  status: ResearchStatus;
  createdAt: number;
  completedAt?: number;
  agents: AgentType[];
}