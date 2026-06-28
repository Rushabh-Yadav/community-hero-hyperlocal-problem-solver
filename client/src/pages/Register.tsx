import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { ShieldAlert, User, Mail, Lock, UserPlus } from 'lucide-react';

export const Register: React.FC = () => {
  const { signupWithEmail } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('Please fill in all input fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signupWithEmail(email, name);
      navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.message || 'Account registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-tertiary/10 blur-[80px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 bg-tertiary/10 rounded-2xl flex items-center justify-center text-tertiary mb-3">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold font-sans">Join the Crusade</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Register to start earning XP and improving your city</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error/10 border border-error/20 text-error text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="glass-input pl-11"
                disabled={loading}
              />
            </div>
          </div>

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
                <UserPlus className="h-5 w-5" />
                Register Account
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-neutral-500 dark:text-neutral-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
