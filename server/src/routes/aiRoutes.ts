import { Router } from 'express';
import { chatAssistant, getAiPredictions } from '../controllers/aiController.js';
import { authenticateUser } from '../middlewares/authMiddleware.js';
import { rateLimiter } from '../middlewares/rateLimiter.js';

const router = Router();

// Chatbot assistant with local DB query context - AI rate limited
router.post('/chat', authenticateUser, rateLimiter(true), chatAssistant);

// Predictive analytics on infrastructure hotspot failures - AI rate limited
router.get('/predictions', authenticateUser, rateLimiter(true), getAiPredictions);

export default router;
