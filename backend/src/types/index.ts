import { z } from 'zod';

export const ResearchQuerySchema = z.object({
  topic: z.string().min(3),
  researchType: z.enum(['academic', 'political', 'technical', 'business', 'general']),
  depth: z.enum(['basic', 'intermediate', 'advanced']),
  requirements: z.object({
    includeDiagrams: z.boolean().default(true),
    includeStatistics: z.boolean().default(true),
    includeReferences: z.boolean().default(true),
    maxSources: z.number().min(5).max(50).default(20),
  }),
});

export type ResearchQuery = z.infer<typeof ResearchQuerySchema>;


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
  agents?: AgentType[];
}

export interface ProgressUpdate {
  status: ResearchStatus;
  currentStep: string;
  progress: number;
}

export interface AgentState {
  sessionId: string;
  userId: string;
  query: ResearchQuery;
  
  // Manager Agent
  researchPlan?: ResearchPlan;
  
  // Research Agent
  rawResearchData?: RawResearchData[];
  images?: ImageData[];
  diagrams?: DiagramData[];
  
  // Data Extractor Agent
  extractedData?: ExtractedData;
  
  // Summary Agent
  summary?: ResearchSummary;
  
  // Report Agent
  finalReport?: Report;
  
  // Metadata
  status: 'pending' | 'researching' | 'extracting' | 'summarizing' | 'generating' | 'completed' | 'failed';
  progress: number;
  errors?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ResearchPlan {
  mainTopics: string[];
  subTopics: string[];
  searchQueries: string[];
  estimatedSources: number;
  researchStrategy: string;
}

export interface RawResearchData {
  source: string;
  url: string;
  title: string;
  content: string;
  publishDate?: string | null; // Allow null
  author?: string | null; // Allow null
  credibilityScore: number;
  relevanceScore: number;
}

export interface ImageData {
  url: string;
  caption: string;
  source: string;
  relevance: number;
}

export interface DiagramData {
  type: 'flowchart' | 'graph' | 'chart' | 'infographic';
  url: string;
  description: string;
  source: string;
}

export interface ExtractedData {
  keyFindings: Finding[];
  statistics: Statistic[];
  quotes: Quote[];
  concepts: Concept[];
  relationships: Relationship[];
}

export interface Finding {
  text: string;
  importance: number;
  sources: string[];
  category: string;
}

export interface Statistic {
  value: string;
  context: string;
  source: string;
  year?: string;
}

export interface Quote {
  text: string;
  author: string;
  source: string;
  relevance: number;
}

export interface Concept {
  name: string;
  definition: string;
  importance: number;
  relatedConcepts: string[];
}

export interface Relationship {
  from: string;
  to: string;
  type: string;
  description: string;
}

export interface ResearchSummary {
  executiveSummary: string;
  keyPoints: string[];
  mainFindings: string[];
  conclusions: string[];
  recommendations?: string[];
}

export interface Report {
  title: string;
  abstract: string;
  tableOfContents: TableOfContent[];
  sections: ReportSection[];
  references: Reference[];
  appendices?: Appendix[];
  metadata: ReportMetadata;
}

export interface TableOfContent {
  title: string;
  level: number;
  pageNumber?: number;
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
  images?: ImageData[];
  diagrams?: DiagramData[];
  statistics?: Statistic[];
}

export interface Reference {
  authors: string[];
  title: string;
  source: string;
  year: string;
  url?: string;
  accessDate: string;
  type: 'article' | 'book' | 'website' | 'journal' | 'other';
}

export interface Appendix {
  title: string;
  content: string;
}

export interface ReportMetadata {
  generatedDate: Date;
  researchType: string;
  sourceCount: number;
  wordCount: number;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
}

export interface ResearchHistory {
  id: string;
  userId: string;
  query: ResearchQuery;
  status: AgentState['status'];
  createdAt: Date;
  completedAt?: Date;
  reportUrl?: string;
}