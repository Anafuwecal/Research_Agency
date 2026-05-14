import { Router } from 'express';
import { firebaseService } from '../services/firebase.service.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.uid;
    const limit = parseInt(req.query.limit as string) || 50;

    const history = await firebaseService.getUserHistory(userId, limit);

    res.json({
      success: true,
      history,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

router.delete('/:historyId', authMiddleware, async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user!.uid;

    await firebaseService.deleteHistory(historyId, userId);

    res.json({
      success: true,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;