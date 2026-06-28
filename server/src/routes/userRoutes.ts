import { Router } from 'express';
import { syncUser, getLeaderboard, getUserProfile } from '../controllers/userController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';

const router = Router();

// Synchronize Firebase Auth user with DB
router.post('/sync', authenticateUser, syncUser);

// Retrieve Gamification Leaderboard
router.get('/leaderboard', authenticateUser, getLeaderboard);

// Retrieve profile of another user
router.get('/profile/:uid', authenticateUser, getUserProfile);

export default router;
