import { Router } from 'express';
import { getDashboardStats, adminManageUsers } from '../controllers/dashboardController.js';
import { authenticateUser, requireRole } from '../middlewares/authMiddleware.js';

const router = Router();

// Retrieve aggregated stats for dashboards (accessible to all authenticated users)
router.get('/stats', authenticateUser, getDashboardStats);

// Administrative user list retrieval (restricted to Admin role)
router.get('/users', authenticateUser, requireRole(['admin']), adminManageUsers);

export default router;
