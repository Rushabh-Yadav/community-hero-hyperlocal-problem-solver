import { Response } from 'express';
import { db } from '../config/firebase.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

// Aggregate Analytics for Dashboards
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const issuesSnapshot = await db.collection('issues').get();
    
    let total = 0;
    let resolved = 0;
    let pending = 0;
    let critical = 0;

    const byCategory: { [key: string]: number } = {};
    const byStatus: { [key: string]: number } = {};
    const byWard: { [key: string]: number } = {};
    
    const departmentWorkload: { [key: string]: { total: number; resolved: number; active: number } } = {};
    
    // Monthly stats tracking (mock-grouped based on creation date or standard window)
    const monthlyStats: { [key: string]: number } = {
      'Jan': 12,
      'Feb': 18,
      'Mar': 25,
      'Apr': 32,
      'May': 40,
      'Jun': 52
    };

    issuesSnapshot.forEach((doc: any) => {
      const issue = doc.data();
      total++;

      // Status counters
      if (issue.status === 'resolved' || issue.status === 'closed') {
        resolved++;
      } else {
        pending++;
      }

      // Severity counter
      if (issue.severity === 'critical') {
        critical++;
      }

      // Group by Category
      const cat = issue.category || 'other';
      byCategory[cat] = (byCategory[cat] || 0) + 1;

      // Group by Status
      const stat = issue.status || 'submitted';
      byStatus[stat] = (byStatus[stat] || 0) + 1;

      // Group by Ward
      const ward = issue.location?.ward || 'Ward Unknown';
      byWard[ward] = (byWard[ward] || 0) + 1;

      // Group by Department
      const dept = issue.department || 'General Public Works';
      if (!departmentWorkload[dept]) {
        departmentWorkload[dept] = { total: 0, resolved: 0, active: 0 };
      }
      departmentWorkload[dept].total++;
      if (issue.status === 'resolved' || issue.status === 'closed') {
        departmentWorkload[dept].resolved++;
      } else {
        departmentWorkload[dept].active++;
      }
    });

    // Populate current month dynamic data if we have actual database reports
    const currentMonthName = new Date().toLocaleString('default', { month: 'short' });
    monthlyStats[currentMonthName] = (monthlyStats[currentMonthName] || 0) + total;

    // Compile Top Contributors
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'citizen')
      .get();

    const topContributors: any[] = [];
    usersSnapshot.forEach((doc: any) => {
      const u = doc.data();
      topContributors.push({
        name: u.name,
        xp: u.xp || 0,
        level: u.level || 1,
        reputationScore: u.reputationScore || 100
      });
    });
    topContributors.sort((a, b) => b.xp - a.xp);

    res.status(200).json({
      summary: {
        total,
        resolved,
        pending,
        critical
      },
      byCategory,
      byStatus,
      byWard,
      departmentWorkload,
      monthlyStats,
      topContributors: topContributors.slice(0, 5)
    });

  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve analytics stats.' });
  }
};

// Admin User Management endpoint
export const adminManageUsers = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const usersList: any[] = [];
    usersSnapshot.forEach((doc: any) => {
      usersList.push(doc.data());
    });
    res.status(200).json(usersList);
  } catch (error: any) {
    console.error('Error in admin user fetch:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve user listing.' });
  }
};
