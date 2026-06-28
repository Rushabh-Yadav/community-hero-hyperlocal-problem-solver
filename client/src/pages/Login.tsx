import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShieldAlert, LogIn, Lock, Mail, Sparkles, UserCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const { loginWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginWithEmail(email, password);
      // Navigate based on email tags for convenience
      if (email.includes('officer')) {
        navigate('/dashboard/officer');
      } else if (email.includes('admin')) {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/citizen');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGoogle();
      navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  // Quick action demo login for hackathon judges
  const triggerDemoLogin = async (role: 'citizen' | 'officer' | 'admin') => {
    setLoading(true);
    setError('');
    
    let demoEmail = 'citizen@hero.com';
    let demoPassword = 'password';

    if (role === 'officer') {
      demoEmail = 'officer@gov.in';
    } else if (role === 'admin') {
      demoEmail = 'admin@hero.com';
    }

    try {
      await loginWithEmail(demoEmail, demoPassword);
      if (role === 'officer') navigate('/dashboard/officer');
      else if (role === 'admin') navigate('/dashboard/admin');
      else navigate('/dashboard/citizen');
    } catch (err: any) {
      setError('Failed to trigger mock demo sign-in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-primary/10 blur-[80px] rounded-full pointer-events-none" />
      
      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold font-sans">Welcome Back</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Sign in to manage hyperlocal resolutions</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@hero.com"
                className="glass-input pl-11"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input pl-11"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="glass-btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="shimmer h-5 w-24 rounded"></span>
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
          <span className="flex-shrink mx-4 text-xs text-neutral-400 uppercase tracking-widest font-semibold">Or</span>
          <div className="flex-grow border-t border-neutral-200 dark:border-neutral-800"></div>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="glass-btn-secondary w-full"
        >
          <img 
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
            alt="Google Logo" 
            className="h-5 w-5 mr-1"
          />
          Sign in with Google
        </button>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary hover:underline font-semibold">
            Create account
          </Link>
        </p>

        {/* Hackathon Fast-Track login Panel */}
        <div className="mt-8 border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <div className="flex items-center gap-1.5 justify-center text-xs font-semibold text-tertiary mb-3 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Hackathon Fast-Track Login
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => triggerDemoLogin('citizen')}
              className="px-2.5 py-2 text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary dark:text-primary-dark rounded-xl transition-all duration-200 border border-primary/20 flex flex-col items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Citizen
            </button>
            
            <button
              onClick={() => triggerDemoLogin('officer')}
              className="px-2.5 py-2 text-xs font-medium bg-secondary/10 hover:bg-secondary/20 text-secondary dark:text-secondary-dark rounded-xl transition-all duration-200 border border-secondary/20 flex flex-col items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Officer
            </button>
            
            <button
              onClick={() => triggerDemoLogin('admin')}
              className="px-2.5 py-2 text-xs font-medium bg-tertiary/10 hover:bg-tertiary/20 text-tertiary dark:text-tertiary-dark rounded-xl transition-all duration-200 border border-tertiary/20 flex flex-col items-center gap-1"
            >
              <UserCheck className="h-4 w-4" />
              Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
