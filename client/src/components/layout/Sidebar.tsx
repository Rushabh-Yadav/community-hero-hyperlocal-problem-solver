import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { 
  Home, 
  LayoutDashboard, 
  PlusCircle, 
  Map, 
  TrendingUp, 
  HelpCircle, 
  Award, 
  Sparkles, 
  Users, 
  Settings,
  MessageSquare
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!isOpen) return null;

  // Compile active class lists
  const linkClass = ({ isActive }: { isActive: boolean }) => 
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
      isActive 
        ? 'bg-primary/10 text-primary dark:text-primary-dark shadow-sm border-l-4 border-primary' 
        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'
    }`;

  // Helper to resolve the correct dashboard link
  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'officer') return '/dashboard/officer';
    if (currentUser.role === 'admin') return '/dashboard/admin';
    return '/dashboard/citizen';
  };

  return (
    <>
      {/* Mobile drawer backdrop */}
      <div 
        className="fixed inset-0 z-30 bg-neutral-950/20 backdrop-blur-xs lg:hidden"
        onClick={onClose}
      />
      
      <aside className="fixed bottom-0 top-16 left-0 z-30 w-64 glass border-r border-white/10 dark:border-neutral-800/40 p-4 overflow-y-auto flex flex-col justify-between">
        <div className="flex flex-col gap-1.5">
          <span className="px-4 text-[10px] font-bold text-neutral-400 tracking-widest uppercase mb-2">
            Explore
          </span>
          
          <NavLink to="/" onClick={onClose} className={linkClass} end>
            <Home className="h-5 w-5" />
            Home
          </NavLink>

          <NavLink to="/leaderboard" onClick={onClose} className={linkClass}>
            <Award className="h-5 w-5" />
            Leaderboard
          </NavLink>

          <NavLink to="/impact" onClick={onClose} className={linkClass}>
            <TrendingUp className="h-5 w-5" />
            Impact Dashboard
          </NavLink>

          {currentUser && (
            <>
              <span className="px-4 text-[10px] font-bold text-neutral-400 tracking-widest uppercase mt-4 mb-2">
                Civic Desk
              </span>
              
              <NavLink to={getDashboardPath()} onClick={onClose} className={linkClass}>
                <LayoutDashboard className="h-5 w-5" />
                My Dashboard
              </NavLink>

              {currentUser.role === 'citizen' && (
                <NavLink to="/report" onClick={onClose} className={linkClass}>
                  <PlusCircle className="h-5 w-5" />
                  Report Issue
                </NavLink>
              )}

              <NavLink to="/predictive" onClick={onClose} className={linkClass}>
                <Sparkles className="h-5 w-5" />
                Predictive AI Map
              </NavLink>

              <NavLink to="/chat" onClick={onClose} className={linkClass}>
                <MessageSquare className="h-5 w-5" />
                AI Assistant
              </NavLink>
            </>
          )}
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4 flex flex-col gap-1 text-[11px] text-neutral-400">
          <p>© 2026 Community Hero</p>
          <p>Hackathon Submission Vibe2Ship</p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;
