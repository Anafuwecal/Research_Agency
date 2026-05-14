import { Router } from 'express';
import { firebaseService, auth } from '../services/firebase.service.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    const user = await firebaseService.createUser(email, password, displayName);

    res.json({
      success: true,
      user: {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
      },
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await firebaseService.getUser(decodedToken.uid);

    res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;