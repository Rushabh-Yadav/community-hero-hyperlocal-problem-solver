import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import { Sun, Moon, LogOut, Award, User, Menu, X, PlusCircle, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (e) {
      console.error(e);
    }
  };

  const getXpProgress = () => {
    if (!currentUser) return 0;
    const progress = (currentUser.xp % 500) / 5; // Convert 0-500 to 0-100%
    return progress;
  };

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-white/10 dark:border-neutral-800/40">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Section */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </button>
          
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-xl flex items-center justify-center shadow-m3-elevation-1">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <span className="font-sans font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-tertiary bg-clip-text text-transparent sm:block hidden">
              Community Hero
            </span>
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {currentUser && (
            /* Gamification Level Status */
            <div className="hidden md:flex items-center gap-3 bg-white/40 dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-full px-3 py-1.5 shadow-sm">
              <Award className="h-4 w-4 text-tertiary" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
                  Level {currentUser.level}
                </span>
                {/* Micro XP Progress Bar */}
                <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden mt-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-tertiary rounded-full transition-all duration-500" 
                    style={{ width: `${getXpProgress()}%` }}
                  />
                </div>
              </div>
              <span className="text-[10px] text-neutral-500 font-mono">
                {currentUser.xp % 500}/500 XP
              </span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-200 dark:hover:border-neutral-800"
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-warning" />
            ) : (
              <Moon className="h-5 w-5 text-neutral-700" />
            )}
          </button>

          {currentUser ? (
            /* Profile & Action Control */
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-neutral-200 dark:border-neutral-800 focus:outline-none hover:shadow-sm"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center text-white font-bold text-sm">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium mr-1 text-neutral-700 dark:text-neutral-300 hidden sm:inline">
                  {currentUser.name.split(' ')[0]}
                </span>
              </button>

              {profileDropdownOpen && (
                <>
                  {/* Backdrop Closer */}
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 glass border border-white/20 dark:border-neutral-800/80 rounded-2xl shadow-xl py-2 z-40 animate-scale-in">
                    <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-neutral-800">
                      <p className="text-sm font-semibold truncate text-neutral-900 dark:text-neutral-100">{currentUser.name}</p>
                      <p className="text-xs text-neutral-400 truncate mt-0.5">{currentUser.email}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary dark:text-primary-dark rounded-full">
                        {currentUser.role}
                      </span>
                    </div>

                    <Link
                      to={`/profile/${currentUser.uid}`}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                      onClick={() => setProfileDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      View Profile
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link to="/login" className="glass-btn-primary py-1.5 px-4 text-sm font-semibold rounded-xl">
              Get Started
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
export default Navbar;
