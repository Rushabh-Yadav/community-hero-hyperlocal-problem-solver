import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { 
  Award, 
  Trophy, 
  TrendingUp, 
  Sparkles, 
  CheckCircle,
  HelpCircle,
  ShieldAlert
} from 'lucide-react';

interface LeaderboardUser {
  uid: string;
  name: string;
  level: number;
  xp: number;
  reputationScore: number;
  badgesCount: number;
}

export const Leaderboard: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  // Available badges in the community gamification economy
  const [badgeMuseum] = useState([
    { id: 'first_report', name: 'First Responder', desc: 'Successfully filed your first municipal report.', points: '+100 XP' },
    { id: 'helpful_citizen', name: 'Helpful Citizen', desc: 'Contributed 2 comments or verification checks.', points: '+150 XP' },
    { id: 'community_protector', name: 'Community Protector', desc: 'Earned level 3 by verifying local hazards.', points: '+200 XP' },
    { id: 'civic_guardian', name: 'Civic Guardian', desc: 'Earned level 5 by resolving 3 community cases.', points: '+350 XP' },
    { id: 'community_legend', name: 'Civic Legend', desc: 'Reached level 10 through massive active reports.', points: '+500 XP' }
  ]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await api.getLeaderboard();
        setLeaderboard(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="h-10 w-10 text-tertiary animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Loading civic leaderboard rankings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans flex items-center gap-2">
          <Trophy className="h-7 w-7 text-warning" />
          Community Hero Rankings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Top performing citizen volunteers ranked by Experience Points (XP) earned from reports and validations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Rankings Table list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass p-5 rounded-2xl flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            <span>Citizen Hero rankings</span>
            <span>Reputation / XP</span>
          </div>

          <div className="space-y-4">
            {leaderboard.map((user, idx) => (
              <div 
                key={user.uid}
                className="glass-card p-5 flex items-center justify-between hover:border-tertiary/20 transition-all duration-300"
              >
                <div className="flex items-center gap-4 min-w-0">
                  {/* Rank indicator badge */}
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    idx === 0 
                      ? 'bg-warning text-neutral-900 shadow-md' 
                      : idx === 1 
                        ? 'bg-neutral-300 text-neutral-900' 
                        : idx === 2 
                          ? 'bg-amber-700 text-white' 
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'
                  }`}>
                    {idx + 1}
                  </span>
                  
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-bold text-white text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100 truncate">{user.name}</h3>
                    <span className="inline-block text-[10px] font-bold bg-primary/10 text-primary dark:text-primary-dark rounded-full px-2 py-0.2 mt-0.5">
                      Level {user.level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-8 text-right font-mono">
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Reputation</span>
                    <span className="text-xs font-bold text-primary">{user.reputationScore}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 block font-sans">Total XP</span>
                    <span className="text-xs font-bold text-tertiary">{user.xp} XP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Badges Museum Showcase list */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-bold text-md font-sans border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Award className="h-5.5 w-5.5 text-tertiary" />
              Badges Museum
            </h3>

            <div className="space-y-4">
              {badgeMuseum.map((badge) => (
                <div key={badge.id} className="flex gap-3 items-start border-b border-neutral-100 dark:border-neutral-800/80 pb-3 last:border-none last:pb-0">
                  <div className="p-2 bg-tertiary/10 text-tertiary dark:text-tertiary-dark rounded-xl flex-shrink-0 mt-0.5">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex justify-between items-center gap-2">
                      <h4 className="text-xs font-bold truncate">{badge.name}</h4>
                      <span className="text-[9px] font-bold text-secondary font-mono bg-secondary/10 px-1.5 py-0.2 rounded-full flex-shrink-0">
                        {badge.points}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-normal font-light">
                      {badge.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
export default Leaderboard;
