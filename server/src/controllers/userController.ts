import { Response } from 'express';
import { db, FieldValue } from '../config/firebase.js';
import { AuthenticatedRequest } from '../middlewares/authMiddleware.js';

// Sync User Auth profile to Firestore
export const syncUser = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { uid, email, role, name } = req.user!;
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    let userData: any;

    if (!userDoc.exists) {
      // Create new profile with gamification defaults
      userData = {
        uid,
        name: name || 'Civic Hero',
        email,
        role: role || 'citizen',
        reputationScore: 100,
        xp: 0,
        level: 1,
        badges: [],
        completedMissions: [],
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      };
      await userRef.set(userData);
      console.log(`👤 Created new user profile for UID: ${uid}`);
    } else {
      userData = userDoc.data();
      // Ensure name and role are synced if they changed
      const updates: any = {};
      if (name && name !== userData.name) updates.name = name;
      
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = FieldValue.serverTimestamp();
        await userRef.set(updates, { merge: true });
        userData = { ...userData, ...updates };
      }
    }

    res.status(200).json(userData);
  } catch (error: any) {
    console.error('Error syncing user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user profile' });
  }
};

// Retrieve Leaderboard (Top Citizens by XP)
export const getLeaderboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'citizen')
      .get();
      
    const leaderboard: any[] = [];
    usersSnapshot.forEach((doc: any) => {
      const u = doc.data();
      leaderboard.push({
        uid: u.uid,
        name: u.name,
        level: u.level,
        xp: u.xp,
        reputationScore: u.reputationScore,
        badgesCount: u.badges?.length || 0,
      });
    });

    // Sort in-memory to handle mock DB constraints and complex indexing
    leaderboard.sort((a, b) => b.xp - a.xp);

    res.status(200).json(leaderboard.slice(0, 10));
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: error.message || 'Failed to retrieve leaderboard data' });
  }
};

// Get User Profile by UID
export const getUserProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      res.status(404).json({ error: 'User profile not found.' });
      return;
    }

    res.status(200).json(userDoc.data());
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch user profile' });
  }
};
