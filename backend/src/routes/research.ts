import express, { Response } from 'express';
import { authenticate, AuthRequest, verifyTokenFromString } from '../middleware/auth.js';
import { plannerAgent } from '../agents/planner.js';
import { ResearchAgent } from '../agents/research.agent.js';
import { DataExtractorAgent } from '../agents/data-extractor.agent.js';
import { SummaryAgent } from '../agents/summary.agent.js';
import { ReportAgent } from '../agents/report.agent.js';
import { db, isFirebaseEnabled } from '../config/firebase.js';
import type { ResearchQuery } from '../types/index.js';

const router = express.Router();

// In-memory storage for sessions when Firebase is not available
const researchSessions = new Map<string, ResearchQuery>();

// In-memory SSE clients
const sseClients = new Map<string, Response>();

// Helper functions
function generateId(): string {
  return `research_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function sendProgress(id: string, update: Partial<ResearchQuery>) {
  const client = sseClients.get(id);
  if (client) {
    client.write(`data: ${JSON.stringify(update)}\n\n`);
  }
}

async function saveSession(id: string, data: ResearchQuery): Promise<void> {
  if (isFirebaseEnabled) {
    try {
      await db.collection('research').doc(id).set(data);
    } catch (error) {
      console.error('Firestore save error:', error);
      researchSessions.set(id, data);
    }
  } else {
    researchSessions.set(id, data);
  }
}

async function getSession(id: string): Promise<ResearchQuery | null> {
  if (isFirebaseEnabled) {
    try {
      const doc = await db.collection('research').doc(id).get();
      if (doc.exists) {
        return doc.data() as ResearchQuery;
      }
    } catch (error) {
      console.error('Firestore get error:', error);
      return researchSessions.get(id) || null;
    }
  }
  return researchSessions.get(id) || null;
}

async function updateSession(id: string, updates: Partial<ResearchQuery>): Promise<void> {
  if (isFirebaseEnabled) {
    try {
      await db.collection('research').doc(id).update(updates);
    } catch (error) {
      console.error('Firestore update error:', error);
      const session = researchSessions.get(id);
      if (session) {
        researchSessions.set(id, { ...session, ...updates });
      }
    }
  } else {
    const session = researchSessions.get(id);
    if (session) {
      researchSessions.set(id, { ...session, ...updates });
    }
  }
}

async function deleteSession(id: string): Promise<void> {
  if (isFirebaseEnabled) {
    try {
      await db.collection('research').doc(id).delete();
    } catch (error) {
      console.error('Firestore delete error:', error);
    }
  }
  researchSessions.delete(id);
  sseClients.delete(id);
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// IMPORTANT: /history must come BEFORE /:id to avoid route conflicts
// GET /api/research/history - Get user's research history
router.get('/history', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    if (!isFirebaseEnabled) {
      const userSessions = Array.from(researchSessions.values())
        .filter(session => session.userId === userId)
        .map(session => ({
          id: session.id,
          topic: session.topic,
          status: session.status,
          createdAt: session.startTime,
          completedAt: session.endTime,
          agents: session.agents
        }))
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, 20);

      return res.json(userSessions);
    }

    // Simplified query without orderBy to avoid index requirement
    const snapshot = await db.collection('research')
      .where('userId', '==', userId)
      .limit(50)
      .get();

    const history = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          topic: data.topic,
          status: data.status,
          createdAt: data.startTime,
          completedAt: data.endTime,
          agents: data.agents || []
        };
      })
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 20);

    res.json(history);
  } catch (error: any) {
    console.error('Error fetching history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch research history',
      details: error.message 
    });
  }
});

// POST /api/research - Start new research
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { topic, agents = ['planner', 'researcher', 'extractor', 'summarizer', 'reporter'] } = req.body as ResearchQuery;
    const userId = req.userId!;

    if (!topic || topic.trim() === '') {
      return res.status(400).json({ error: 'Topic is required' });
    }

    if (!Array.isArray(agents) || agents.length === 0) {
      return res.status(400).json({ error: 'At least one agent must be selected' });
    }

    const id = generateId();
    const sessionData: ResearchQuery = {
      id,
      topic: topic.trim(),
      status: 'planning',
      currentStep: 'Initializing research...',
      progress: 0,
      plan: [],
      searchResults: [],
      extractedData: [],
      summary: '',
      report: '',
      startTime: Date.now(),
      userId,
      agents
    };

    await saveSession(id, sessionData);

    // Start research in background
    runResearch(id, topic.trim(), userId, agents).catch(error => {
      console.error('Research error:', error);
      updateSession(id, {
        status: 'error',
        error: error.message
      }).catch(err => console.error('Failed to update error status:', err));
      
      sendProgress(id, {
        status: 'error',
        currentStep: `Error: ${error.message}`,
        progress: 0
      });
    });

    res.json({ id, status: 'started' });
  } catch (error: any) {
    console.error('Error starting research:', error);
    res.status(500).json({ 
      error: 'Failed to start research',
      details: error.message 
    });
  }
});

// GET /api/research/:id - Get research status
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const data = await getSession(id);
    
    if (!data) {
      return res.status(404).json({ error: 'Research session not found' });
    }

    if (data.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json(data);
  } catch (error: any) {
    console.error('Error getting research:', error);
    res.status(500).json({ 
      error: 'Failed to get research session',
      details: error.message 
    });
  }
});

// GET /api/research/:id/stream - SSE endpoint with token authentication
router.get('/:id/stream', async (req: express.Request, res: Response) => {
  const { id } = req.params;

  try {
    // Get token from query parameter (EventSource doesn't support headers)
    const token = req.query.token as string;

    if (!token) {
      return res.status(401).json({ error: 'Authentication token required' });
    }

    // Verify token
    let userId: string;
    try {
      userId = await verifyTokenFromString(token);
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Verify user has access to this research
    const data = await getSession(id);
    if (data && data.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden: Access denied to this research session' });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    // Store client
    sseClients.set(id, res);

    // Send current state
    if (data) {
      res.write(`data: ${JSON.stringify({
        status: data.status,
        currentStep: data.currentStep,
        progress: data.progress
      })}\n\n`);
    } else {
      res.write(`data: ${JSON.stringify({
        status: 'initializing',
        currentStep: 'Setting up research...',
        progress: 0
      })}\n\n`);
    }

    // Send heartbeat every 30 seconds to keep connection alive
    const heartbeat = setInterval(() => {
      res.write(`:heartbeat\n\n`);
    }, 30000);

    // Clean up on close
    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(id);
      console.log(`SSE connection closed for research ${id}`);
    });

  } catch (error: any) {
    console.error('SSE error:', error);
    res.status(500).json({ error: 'Failed to establish SSE connection' });
  }
});

// DELETE /api/research/:id - Delete research
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.userId!;

    const data = await getSession(id);
    
    if (data && data.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    await deleteSession(id);
    
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting research:', error);
    res.status(500).json({ 
      error: 'Failed to delete research session',
      details: error.message 
    });
  }
});

// Run research workflow with selective agents
async function runResearch(id: string, topic: string, userId: string, agents: string[]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`STARTING RESEARCH: "${topic}"`);
  console.log(` User: ${userId}`);
  console.log(` Agents: ${agents.join(', ')}`);
  console.log('='.repeat(60));

  let state: any = {
    topic,
    plan: [],
    searchResults: [],
    extractedData: [],
    summary: '',
    report: '',
    messages: []
  };

  const totalSteps = agents.length;
  let currentStepNum = 0;

  try {
    // Step 1: Planning (if selected)
    if (agents.includes('planner')) {
      currentStepNum++;
      const progress = Math.floor((currentStepNum / totalSteps) * 100);
      
      sendProgress(id, { status: 'planning', currentStep: 'Creating research plan...', progress });
      await updateSession(id, { status: 'planning', currentStep: 'Creating research plan...', progress });

      // Assuming plannerAgent is a function based on how it was imported
      const planResult = await plannerAgent(state);
      state = { ...state, ...planResult };
      await updateSession(id, { plan: state.plan });
      await delay(500);
    }

    // Step 2: Research (if selected)
    if (agents.includes('researcher')) {
      currentStepNum++;
      const progress = Math.floor((currentStepNum / totalSteps) * 100);
      
      sendProgress(id, { status: 'researching', currentStep: 'Searching web sources...', progress });
      await updateSession(id, { status: 'researching', currentStep: 'Searching web sources...', progress });

      const researcher = new ResearchAgent();
      const researchResult = await researcher.execute(state); // Change .execute() if your class method is named differently
      state = { ...state, ...researchResult };
      await updateSession(id, { searchResults: state.searchResults });
      await delay(500);
    }

    // Step 3: Extract (if selected)
    if (agents.includes('extractor')) {
      currentStepNum++;
      const progress = Math.floor((currentStepNum / totalSteps) * 100);
      
      sendProgress(id, { status: 'extracting', currentStep: 'Extracting key insights...', progress });
      await updateSession(id, { status: 'extracting', currentStep: 'Extracting key insights...', progress });

      const extractor = new DataExtractorAgent();
      const extractResult = await extractor.execute(state); // Change .execute() if your class method is named differently
      state = { ...state, ...extractResult };
      await updateSession(id, { extractedData: state.extractedData });
      await delay(500);
    }

    // Step 4: Summarize (if selected)
    if (agents.includes('summarizer')) {
      currentStepNum++;
      const progress = Math.floor((currentStepNum / totalSteps) * 100);
      
      sendProgress(id, { status: 'summarizing', currentStep: 'Synthesizing findings...', progress });
      await updateSession(id, { status: 'summarizing', currentStep: 'Synthesizing findings...', progress });

      const summarizer = new SummaryAgent();
      const summaryResult = await summarizer.execute(state); // Change .execute() if your class method is named differently
      state = { ...state, ...summaryResult };
      await updateSession(id, { summary: state.summary });
      await delay(500);
    }

    // Step 5: Generate Report (if selected)
    if (agents.includes('reporter')) {
      currentStepNum++;
      const progress = Math.floor((currentStepNum / totalSteps) * 100);
      
      sendProgress(id, { status: 'generating', currentStep: 'Generating final report...', progress });
      await updateSession(id, { status: 'generating', currentStep: 'Generating final report...', progress });

      const reporter = new ReportAgent();
      const reportResult = await reporter.generateReport(state);
      state = { ...state, ...reportResult };
      await updateSession(id, { report: state.report });
    }

    // Complete
    await updateSession(id, {
      status: 'completed',
      currentStep: 'Research completed successfully!',
      progress: 100,
      endTime: Date.now()
    });

    sendProgress(id, {
      status: 'completed',
      currentStep: 'Research completed successfully!',
      progress: 100
    });

    console.log('\n Research completed successfully!');
    console.log('='.repeat(60));

  } catch (error: any) {
    console.error(' Research error:', error);
    
    await updateSession(id, {
      status: 'error',
      error: error.message
    });

    sendProgress(id, {
      status: 'error',
      currentStep: `Error: ${error.message}`,
      progress: 0
    });
  }
} 

export default router;