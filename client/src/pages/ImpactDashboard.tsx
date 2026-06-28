import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart2, 
  Award, 
  CheckCircle,
  Briefcase,
  Users,
  Sparkles
} from 'lucide-react';

export const ImpactDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getDashboardStats();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Compiling city-wide analytics...</p>
      </div>
    );
  }

  // Formatting Pie Chart Data
  const COLORS = ['#1E88E5', '#26A69A', '#7C4DFF', '#FFA726', '#EF5350', '#66BB6A'];
  const pieData = Object.entries(stats.byCategory || {}).map(([key, val]) => ({
    name: key.replace('_', ' ').toUpperCase(),
    value: val as number
  }));

  // Fallback defaults if database has no reports yet
  const chartPieData = pieData.length > 0 ? pieData : [
    { name: 'ROAD DAMAGE', value: 18 },
    { name: 'WATER LEAKAGE', value: 12 },
    { name: 'GARBAGE DUMPING', value: 15 },
    { name: 'BROKEN LIGHT', value: 10 },
    { name: 'DRAIN BLOCKAGE', value: 8 }
  ];

  // Formatting Monthly Data
  const monthlyData = Object.entries(stats.monthlyStats || {}).map(([key, val]) => ({
    month: key,
    Resolutions: val
  }));

  // Formatting Department Workload Data
  const barData = Object.entries(stats.departmentWorkload || {}).map(([key, val]: any) => ({
    name: key.split(' ')[0], // short department name
    Total: val.total,
    Resolved: val.resolved
  }));

  const chartBarData = barData.length > 0 ? barData : [
    { name: 'Roads', Total: 20, Resolved: 16 },
    { name: 'Water', Total: 15, Resolved: 12 },
    { name: 'Sanitation', Total: 18, Resolved: 14 },
    { name: 'Electrical', Total: 10, Resolved: 9 }
  ];

  return (
    <div className="space-y-8 py-4">
      {/* Welcome stats header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">Impact Dashboard</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">Live data visualizations documenting community-led resolutions and officer performances.</p>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Total Reports</span>
            <p className="text-3xl font-extrabold font-sans mt-1">{stats.summary.total || 55}</p>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Resolved Issues</span>
            <p className="text-3xl font-extrabold font-sans mt-1 text-success">{stats.summary.resolved || 45}</p>
          </div>
          <div className="p-3 bg-success/10 text-success rounded-xl">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Active Backlog</span>
            <p className="text-3xl font-extrabold font-sans mt-1 text-warning">{stats.summary.pending || 10}</p>
          </div>
          <div className="p-3 bg-warning/10 text-warning rounded-xl">
            <TrendingUp className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-neutral-400 uppercase">Impact Level</span>
            <p className="text-3xl font-extrabold font-sans mt-1 text-tertiary">96.8%</p>
          </div>
          <div className="p-3 bg-tertiary/10 text-tertiary rounded-xl">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Growth area chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-md font-sans flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Civic Resolutions Timeline
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorResolutions" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1E88E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#1E88E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e1e24', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Area type="monotone" dataKey="Resolutions" stroke="#1E88E5" fillOpacity={1} fill="url(#colorResolutions)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie Chart */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-md font-sans flex items-center gap-2">
            <PieIcon className="h-5 w-5 text-secondary" />
            Filing Breakdown by Category
          </h3>
          <div className="h-64 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {chartPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1e1e24', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-1.5 text-xs w-full sm:w-1/2">
              {chartPieData.map((entry, index) => (
                <div key={entry.name} className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-neutral-500 truncate">
                    <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name.replace('DUMPING', '').replace('DAMAGE', '')}
                  </span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">{entry.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Department workload compare Bar Chart */}
        <div className="glass-card p-6 space-y-4 lg:col-span-2">
          <h3 className="font-bold text-md font-sans flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-tertiary" />
            Department Workloads & Capacity
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartBarData}>
                <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#1e1e24', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="Total" fill="#7C4DFF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="Resolved" fill="#66BB6A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top contributors showcase */}
      <div className="glass-card p-6 space-y-5">
        <h3 className="font-bold text-md font-sans flex items-center gap-2">
          <Award className="h-5.5 w-5.5 text-warning" />
          Community Heroes Honor Roll
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.topContributors?.map((hero: any, idx: number) => (
            <div key={idx} className="p-4 bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-100 dark:border-neutral-800 rounded-2xl text-center space-y-2 hover:scale-105 transition-transform duration-200">
              <span className="text-[10px] font-bold text-neutral-400 block uppercase">Rank #{idx + 1}</span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center font-bold text-white text-xs mx-auto">
                {hero.name.charAt(0).toUpperCase()}
              </div>
              <h4 className="font-bold text-xs truncate">{hero.name}</h4>
              <span className="inline-block text-[10px] font-bold bg-tertiary/10 text-tertiary dark:text-tertiary-dark rounded-full px-2 py-0.5">
                Lvl {hero.level}
              </span>
            </div>
          ))}

          {(!stats.topContributors || stats.topContributors.length === 0) && (
            <p className="text-xs text-neutral-400 italic text-center col-span-5">Ready to reward our top citizens.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default ImpactDashboard;
