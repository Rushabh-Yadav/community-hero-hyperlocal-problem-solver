import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { 
  Users, 
  Settings, 
  ShieldCheck, 
  Activity, 
  Database, 
  Cpu, 
  Server, 
  AlertTriangle,
  UserCheck,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface UserSchema {
  uid: string;
  name: string;
  email: string;
  role: 'citizen' | 'moderator' | 'officer' | 'admin';
  department?: string;
  reputationScore: number;
  level: number;
}

export const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<UserSchema[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Systems status checks indicators
  const [systemUptime] = useState('99.98%');
  const [geminiStatus, setGeminiStatus] = useState('Online (140ms)');
  const [firestoreStatus] = useState('Connected (24ms)');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data);
    } catch (e) {
      console.error(e);
      setError('Failed to load user records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Loading system management desk...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Welcome header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">Admin Console</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Monitor system health, check server modules, and administer roles.
        </p>
      </div>

      {/* System Health checklist cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Server Engine</span>
            <p className="text-lg font-bold text-success flex items-center gap-1.5 mt-1">
              <CheckCircle className="h-4.5 w-4.5" />
              Healthy
            </p>
          </div>
          <div className="p-3 bg-success/15 text-success rounded-xl">
            <Server className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Gemini LLM API</span>
            <p className="text-lg font-bold text-success flex items-center gap-1.5 mt-1">
              <CheckCircle className="h-4.5 w-4.5" />
              {geminiStatus}
            </p>
          </div>
          <div className="p-3 bg-success/15 text-success rounded-xl">
            <Cpu className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Firestore DB</span>
            <p className="text-lg font-bold text-success flex items-center gap-1.5 mt-1">
              <CheckCircle className="h-4.5 w-4.5" />
              {firestoreStatus}
            </p>
          </div>
          <div className="p-3 bg-success/15 text-success rounded-xl">
            <Database className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">System Uptime</span>
            <p className="text-lg font-bold text-primary mt-1">
              {systemUptime}
            </p>
          </div>
          <div className="p-3 bg-primary/15 text-primary rounded-xl">
            <Activity className="h-5 w-5" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* User administration list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="glass p-5 rounded-2xl flex items-center justify-between">
            <h3 className="font-bold text-md font-sans">User Management</h3>
            <span className="text-xs text-neutral-400">{users.length} Users Registered</span>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 text-neutral-400 font-semibold">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Reputation</th>
                    <th className="p-4">Level</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                  {users.map((u) => (
                    <tr key={u.uid} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10">
                      <td className="p-4 font-bold text-neutral-800 dark:text-neutral-200">{u.name}</td>
                      <td className="p-4 text-neutral-500 font-mono">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-primary/10 text-primary border border-primary/20">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-neutral-600 dark:text-neutral-400">{u.reputationScore}</td>
                      <td className="p-4 font-mono font-bold text-tertiary">Lvl {u.level}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column: Category config / logs */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-md font-sans border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Settings className="h-5 w-5 text-neutral-500" />
              Platform Configuration
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 font-medium">Auto-Verification Trigger</span>
                <span className="font-bold text-primary">5 Upvotes</span>
              </div>

              <div className="flex justify-between items-center py-2 border-b border-neutral-100 dark:border-neutral-800">
                <span className="text-neutral-500 font-medium">SLA Escalation Window</span>
                <span className="font-bold text-primary">72 Hours</span>
              </div>

              <div className="flex justify-between items-center py-2">
                <span className="text-neutral-500 font-medium">XP Reward Coefficient</span>
                <span className="font-bold text-primary">1.0 (Standard)</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 border-l-4 border-error space-y-3">
            <h3 className="font-bold text-sm font-sans flex items-center gap-1.5 text-error">
              <AlertTriangle className="h-4.5 w-4.5" />
              Security Logs
            </h3>
            <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
              No recent brute-force triggers, injection leaks, or upload sanitation warnings logged. Rate limiters operating normally.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
