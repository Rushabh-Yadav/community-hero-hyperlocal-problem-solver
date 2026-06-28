import { db, FieldValue } from '../config/firebase.js';

interface GamificationResult {
  xpGained: number;
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
  newBadges: string[];
}

const XP_PER_LEVEL = 500;

export const awardXp = async (userId: string, amount: number): Promise<GamificationResult | null> => {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) return null;

    const userData = userDoc.data();
    const currentXp = userData.xp || 0;
    const currentLevel = userData.level || 1;
    const currentBadges = userData.badges || [];

    const newXp = currentXp + amount;
    
    // Level Up Formula: Level = Math.floor(XP / 500) + 1
    const newLevel = Math.floor(newXp / XP_PER_LEVEL) + 1;
    const leveledUp = newLevel > currentLevel;

    const newBadges: string[] = [];
    
    // Badge Reward Logic
    if (newLevel >= 3 && !currentBadges.includes('community_protector')) {
      newBadges.push('community_protector');
    }
    if (newLevel >= 5 && !currentBadges.includes('civic_guardian')) {
      newBadges.push('civic_guardian');
    }
    if (newLevel >= 10 && !currentBadges.includes('community_legend')) {
      newBadges.push('community_legend');
    }
    
    const updates: any = {
      xp: newXp,
      level: newLevel,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (newBadges.length > 0) {
      updates.badges = FieldValue.arrayUnion(...newBadges);
    }

    await userRef.set(updates, { merge: true });

    return {
      xpGained: amount,
      newXp,
      newLevel,
      leveledUp,
      newBadges
    };
  } catch (error) {
    console.error(`[Gamification Error] Failed to award XP to user ${userId}:`, error);
    return null;
  }
};
