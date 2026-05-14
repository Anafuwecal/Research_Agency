import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ResearchGraph } from '../graph/research-graph.js';
import { firebaseService } from '../services/firebase.service.js';
import { documentService } from '../services/document.service.js';
import { ResearchQuerySchema, AgentState } from '../types/index.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();
const researchGraph = new ResearchGraph();

router.post('/start', authMiddleware, async (req, res) => {
  try {
    console.log('Research request received from user:', req.user!.uid);
    console.log('Request body:', JSON.stringify(req.body, null, 2));

    const userId = req.user!.uid;
    const query = ResearchQuerySchema.parse(req.body);

    console.log('Query validated successfully');

    const sessionId = uuidv4();
    console.log('Session ID created:', sessionId);

    const initialState: AgentState = {
      sessionId,
      userId,
      query,
      status: 'pending',
      progress: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    console.log('Creating session in Firestore...');
    await firebaseService.createSession(initialState);
    console.log('Session created successfully');

    // Execute research asynchronously
    console.log('Starting research graph execution...');
    researchGraph.execute(initialState).catch(error => {
      console.error('Research execution error:', error);
      console.error('Error stack:', error.stack);
    });

    res.json({
      success: true,
      sessionId,
    });
  } catch (error: any) {
    console.error('Start research error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(400).json({
      success: false,
      error: error.message || 'Failed to start research',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

router.get('/status/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    console.log('Status check for session:', sessionId);

    const session = await firebaseService.getSession(sessionId);

    if (!session) {
      console.log('Session not found:', sessionId);
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.userId !== req.user!.uid) {
      console.log('Unauthorized access attempt:', { sessionUserId: session.userId, requestUserId: req.user!.uid });
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    console.log('Session status:', session.status, 'Progress:', session.progress);

    res.json({
      success: true,
      session: {
        status: session.status,
        progress: session.progress,
        hasReport: !!session.finalReport,
        errors: session.errors,
      },
    });
  } catch (error: any) {
    console.error('Status check error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.get('/result/:sessionId', authMiddleware, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await firebaseService.getSession(sessionId);

    if (!session || session.userId !== req.user!.uid) {
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    res.json({
      success: true,
      report: session.finalReport,
    });
  } catch (error: any) {
    console.error('Get result error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});


router.get('/download/:sessionId/:format', authMiddleware, async (req, res) => {
  try {
    const { sessionId, format } = req.params;
    
    console.log(`Download request - Session: ${sessionId}, Format: ${format}`);
    
    const session = await firebaseService.getSession(sessionId);

    if (!session) {
      console.error('Session not found:', sessionId);
      return res.status(404).json({
        success: false,
        error: 'Session not found',
      });
    }

    if (session.userId !== req.user!.uid) {
      console.error('Unauthorized download attempt');
      return res.status(403).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    if (!session.finalReport) {
      console.error('Report not ready');
      return res.status(404).json({
        success: false,
        error: 'Report not available yet',
      });
    }

    console.log('Generating document...');

    let buffer: Buffer;
    let contentType: string;
    let filename: string;

    if (format === 'docx') {
      buffer = await documentService.generateDOCX(session.finalReport);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      filename = `${session.finalReport.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.docx`;
    } else if (format === 'pdf') {
      buffer = await documentService.generatePDF(session.finalReport);
      contentType = 'application/pdf';
      filename = `${session.finalReport.title.replace(/[^a-z0-9]/gi, '_').substring(0, 50)}.pdf`;
    } else {
      return res.status(400).json({
        success: false,
        error: 'Invalid format. Use "pdf" or "docx"',
      });
    }

    console.log(`Document generated successfully: ${filename}`);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    res.send(buffer);
  } catch (error: any) {
    console.error('Download error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate document',
    });
  }
});

export default router;