export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface ResearchQuery {
  topic: string;
  researchType: 'academic' | 'political' | 'technical' | 'business' | 'general';
  depth: 'basic' | 'intermediate' | 'advanced';
  requirements: {
    includeDiagrams: boolean;
    includeStatistics: boolean;
    includeReferences: boolean;
    maxSources: number;
  };
}

export interface ResearchSession {
  sessionId: string;
  status: 'pending' | 'researching' | 'extracting' | 'summarizing' | 'generating' | 'completed' | 'failed';
  progress: number;
  hasReport: boolean;
}

export interface Report {
  title: string;
  abstract: string;
  tableOfContents: TableOfContent[];
  sections: ReportSection[];
  references: Reference[];
  metadata: ReportMetadata;
}

export interface TableOfContent {
  title: string;
  level: number;
}

export interface ReportSection {
  title: string;
  content: string;
  subsections?: ReportSection[];
  images?: ImageData[];
  diagrams?: DiagramData[];
  statistics?: Statistic[];
}

export interface ImageData {
  url: string;
  caption: string;
  source: string;
}

export interface DiagramData {
  url: string;
  description: string;
  source: string;
}

export interface Statistic {
  value: string;
  context: string;
  source: string;
}

export interface Reference {
  authors: string[];
  title: string;
  source: string;
  year: string;
  url?: string;
  accessDate: string;
  type: string;
}

export interface ReportMetadata {
  generatedDate: Date;
  researchType: string;
  sourceCount: number;
  wordCount: number;
}

export interface HistoryItem {
  id: string;
  query: ResearchQuery;
  status: string;
  createdAt: Date;
  completedAt?: Date;
}