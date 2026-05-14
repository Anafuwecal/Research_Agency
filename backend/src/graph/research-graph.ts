import { AgentState } from '../types/index.js';
import { ManagerAgent } from '../agents/manager.agent.js';
import { ResearchAgent } from '../agents/research.agent.js';
import { DataExtractorAgent } from '../agents/data-extractor.agent.js';
import { SummaryAgent } from '../agents/summary.agent.js';
import { VisualAgent } from '../agents/visual.agent.js';
import { ReportAgent } from '../agents/report.agent.js';
import { firebaseService } from '../services/firebase.service.js';

export class ResearchGraph {
  private managerAgent: ManagerAgent;
  private researchAgent: ResearchAgent;
  private dataExtractorAgent: DataExtractorAgent;
  private summaryAgent: SummaryAgent;
  private visualAgent: VisualAgent; // NEW
  private reportAgent: ReportAgent;

  constructor() {
    this.managerAgent = new ManagerAgent();
    this.researchAgent = new ResearchAgent();
    this.dataExtractorAgent = new DataExtractorAgent();
    this.summaryAgent = new SummaryAgent();
    this.visualAgent = new VisualAgent(); // NEW
    this.reportAgent = new ReportAgent();
  }

  async execute(initialState: AgentState): Promise<AgentState> {
    let state = { ...initialState };

    try {
      console.log('Starting Research Graph Execution');
      console.log('Session ID:', state.sessionId);
      console.log('Topic:', state.query.topic);

      // Step 1: Manager
      console.log('Step 1/6: Manager Agent - Creating research plan...');
      try {
        const managerResult = await this.managerAgent.createResearchPlan(state);
        state = { ...state, ...managerResult };
        await firebaseService.updateSession(state.sessionId, managerResult);
        console.log('Manager Agent completed successfully\n');
      } catch (error: any) {
        console.error('Manager Agent failed:', error.message);
        throw new Error(`Manager Agent failed: ${error.message}`);
      }

      // Step 2: Research
      console.log('Step 2/6: Research Agent - Conducting research...');
      try {
        const researchResult = await this.researchAgent.conductResearch(state);
        state = { ...state, ...researchResult };
        await firebaseService.updateSession(state.sessionId, researchResult);
        console.log('Research Agent completed successfully\n');
      } catch (error: any) {
        console.error('Research Agent failed:', error.message);
        throw new Error(`Research Agent failed: ${error.message}`);
      }

      // Step 3: Data Extraction
      console.log('Step 3/6: Data Extractor Agent - Extracting data...');
      try {
        const extractorResult = await this.dataExtractorAgent.extractData(state);
        state = { ...state, ...extractorResult };
        await firebaseService.updateSession(state.sessionId, extractorResult);
        console.log('Data Extractor Agent completed successfully\n');
      } catch (error: any) {
        console.error('Data Extractor Agent failed:', error.message);
        throw new Error(`Data Extractor failed: ${error.message}`);
      }

      // Step 4: Summary
      console.log('Step 4/6: Summary Agent - Generating summary...');
      try {
        const summaryResult = await this.summaryAgent.generateSummary(state);
        state = { ...state, ...summaryResult };
        await firebaseService.updateSession(state.sessionId, summaryResult);
        console.log('Summary Agent completed successfully\n');
      } catch (error: any) {
        console.error('Summary Agent failed:', error.message);
        throw new Error(`Summary Agent failed: ${error.message}`);
      }

      // Step 5: Visual Generation (NEW)
      console.log('Step 5/6: Visual Agent - Generating diagrams and charts...');
      try {
        const visualResult = await this.visualAgent.generateVisuals(state);
        state = { ...state, ...visualResult };
        // Update progress to 85%
        await firebaseService.updateSession(state.sessionId, {
          ...visualResult,
          progress: 85,
          updatedAt: new Date(),
        });
        console.log('Visual Agent completed successfully\n');
      } catch (error: any) {
        console.error('Visual Agent failed (non-critical):', error.message);
        // Visual generation failure is non-critical, continue
      }

      // Step 6: Report Generation
      console.log('Step 6/6: Report Agent - Creating final report...');
      try {
        const reportResult = await this.reportAgent.generateReport(state);
        state = { ...state, ...reportResult };
        await firebaseService.updateSession(state.sessionId, reportResult);
        console.log('Report Agent completed successfully\n');
      } catch (error: any) {
        console.error('Report Agent failed:', error.message);
        throw new Error(`Report Agent failed: ${error.message}`);
      }

      console.log('========================================');
      console.log('Research completed successfully!');
      console.log('========================================\n');

       // ADDED: Save to history when completed
    try {
      await firebaseService.saveToHistory({
        id: state.sessionId,
        userId: state.userId,
        query: state.query,
        status: 'completed',
        createdAt: state.createdAt,
        completedAt: new Date(),
      });
      console.log('Saved to history successfully');
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
      // Non-critical error, don't fail the whole process
    }
      
      return state;

    } catch (error: any) {
      console.error('\n========================================');
      console.error('Research Graph Execution FAILED');
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
      console.error('========================================\n');
      
      const errorUpdate = {
        status: 'failed' as const,
        errors: [error.message],
        updatedAt: new Date(),
      };
      
      await firebaseService.updateSession(initialState.sessionId, errorUpdate);

      // ADDED: Save failed research to history too
    try {
      await firebaseService.saveToHistory({
        id: initialState.sessionId,
        userId: initialState.userId,
        query: initialState.query,
        status: 'failed',
        createdAt: initialState.createdAt,
      });
    } catch (historyError) {
      console.error('Failed to save failed research to history:', historyError);
    }
      
      throw error;
    }
  }
}