import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { 
  ShieldAlert, 
  MapPin, 
  CheckCircle, 
  Users, 
  TrendingUp, 
  ArrowRight, 
  Award,
  Sparkles,
  Zap,
  Globe
} from 'lucide-react';

export const Landing: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-neutral-900 dark:text-neutral-50 font-sans transition-colors duration-300">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 lg:pt-32 lg:pb-24">
        {/* Background glow effects */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-r from-primary/20 via-tertiary/20 to-secondary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 dark:bg-primary/20 border border-primary/20 rounded-full px-4 py-1.5 text-sm font-semibold text-primary dark:text-primary-dark mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Empowering Hyperlocal Action with Gemini AI
          </div>
          
          <h1 className="font-sans font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-neutral-900 dark:text-white max-w-4xl mx-auto leading-tight">
            Be the Hero Your <span className="bg-gradient-to-r from-primary via-tertiary to-secondary bg-clip-text text-transparent">Neighborhood</span> Needs
          </h1>
          
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
            Report potholes, broken lights, and water leaks. Watch Gemini AI categorize, prioritize, and dispatch tasks to city municipal departments in real time.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {currentUser ? (
              <Link 
                to={currentUser.role === 'officer' ? '/dashboard/officer' : '/dashboard/citizen'} 
                className="glass-btn-primary w-full sm:w-auto px-8 py-3.5 text-base font-semibold"
              >
                Go to Dashboard
                <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link to="/register" className="glass-btn-primary w-full sm:w-auto px-8 py-3.5 text-base font-semibold">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/login" className="glass-btn-secondary w-full sm:w-auto px-8 py-3.5 text-base font-semibold">
                  Officer Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Cards */}
      <section className="py-12 bg-neutral-50/50 dark:bg-neutral-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-4">
                <ShieldAlert className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-sans">4,820+</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Issues Solved</p>
            </div>
            
            <div className="glass-card p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-4">
                <CheckCircle className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-sans">98.4%</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Resolution Rate</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-sans">15K+</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Active Heroes</p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="mx-auto w-12 h-12 bg-warning/10 rounded-2xl flex items-center justify-center text-warning mb-4">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold font-sans">32 Mins</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">Average Dispatch Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Feature Flow Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">How Community Hero Works</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4 leading-relaxed">
              We leverage Google Cloud, Firebase, and Gemini Multimodal models to bridge the gap between citizens and local governance.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
            <div className="glass-card p-8 flex flex-col justify-between">
              <div>
                <span className="text-6xl font-extrabold text-primary/10">01</span>
                <h3 className="text-xl font-bold font-sans mt-4">Snap & Record</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 leading-relaxed">
                  Take a photo of a pothole or record a voice note detailing a leak. Our mobile-first interface detects coordinates automatically.
                </p>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-sm mt-6">
                Supports Image, Video & Voice
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col justify-between border-t-4 border-tertiary">
              <div>
                <span className="text-6xl font-extrabold text-tertiary/10">02</span>
                <h3 className="text-xl font-bold font-sans mt-4">AI Agent Reasoning</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 leading-relaxed">
                  Gemini analyzes reports instantly. It flags duplicate nearby filings, predicts department allocation, generates resolution checklists, and calculates a trust score.
                </p>
              </div>
              <div className="flex items-center gap-2 text-tertiary font-medium text-sm mt-6">
                Powered by Gemini 1.5 Flash
              </div>
            </div>

            <div className="glass-card p-8 flex flex-col justify-between">
              <div>
                <span className="text-6xl font-extrabold text-secondary/10">03</span>
                <h3 className="text-xl font-bold font-sans mt-4">Earn Rewards & Resolve</h3>
                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3 leading-relaxed">
                  Citizens upvote reports to verify them. Officers manage tasks via checklists. Complete daily missions, earn XP, level up, and unlock achievements!
                </p>
              </div>
              <div className="flex items-center gap-2 text-secondary font-medium text-sm mt-6">
                XP & Badge Gamification System
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Citizen Testimonial Section */}
      <section className="py-20 bg-neutral-50/50 dark:bg-neutral-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">Citizen Testimonials</h2>
            <p className="text-neutral-600 dark:text-neutral-400 mt-4">
              Real impact stories from community members and municipal leaders.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-6">
              <p className="text-neutral-600 dark:text-neutral-400 italic text-sm">
                "There was an open drainage block flooding our street every evening. I took a photo, reported it here, and the Water department fixed it within 36 hours. The automated checklist updates kept me fully reassured!"
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center font-bold text-white text-xs">
                  AM
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Aman Mehta</h4>
                  <p className="text-xs text-neutral-400">Citizen Hero, Level 5</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <p className="text-neutral-600 dark:text-neutral-400 italic text-sm">
                "As a municipal manager, sorting duplicate reports was a huge bottleneck. The Gemini duplication detection clusters issues geographically and semantically, helping our division allocate manpower efficiently."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-white text-xs">
                  RS
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Rajiv Sen</h4>
                  <p className="text-xs text-neutral-400">Municipal Officer, Roads</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6">
              <p className="text-neutral-600 dark:text-neutral-400 italic text-sm">
                "The daily mission to verify nearby reports brings a fun gamified element to civic duty. I've earned three badges so far and feel actively connected to the maintenance of my local community."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 rounded-full bg-tertiary flex items-center justify-center font-bold text-white text-xs">
                  PL
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Priya Luthra</h4>
                  <p className="text-xs text-neutral-400">Citizen Hero, Level 9</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action banner */}
      <section className="py-20 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold font-sans">Ready to Transform Your City?</h2>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-xl mx-auto font-light">
            Join the collective effort to digitize civic issue resolutions and build a safer, cleaner infrastructure.
          </p>
          <div className="mt-8 flex justify-center">
            <Link to="/register" className="glass-btn-primary px-8 py-3.5 font-semibold text-base shadow-xl">
              Create Free Account
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
export default Landing;
