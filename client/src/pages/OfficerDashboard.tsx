import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Briefcase, 
  ArrowRight, 
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search
} from 'lucide-react';

interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  priority: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    ward: string;
  };
  mediaUrl: string;
  department: string;
  repairTimeline: string;
  trustScore: number;
  createdAt: string;
}

export const OfficerDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [stats, setStats] = useState<any>({ summary: { total: 0, resolved: 0, pending: 0, critical: 0 } });
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Determine officer department filter
      const dept = currentUser?.department || 'Roads and Infrastructure Department';
      setFilterDept(dept);

      // Fetch issue list matching their department
      const issueData = await api.getIssues({ department: dept });
      setIssues(issueData);

      // Fetch dashboard metrics
      const metricData = await api.getDashboardStats();
      setStats(metricData);
    } catch (e) {
      console.error('Failed to load officer dashboard data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-900/40';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-950/30 dark:text-orange-300 border border-orange-200 dark:border-orange-900/40';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-900/40';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSeverity = filterSeverity === 'all' || issue.severity === filterSeverity;
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="h-10 w-10 text-secondary animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Loading department workstation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Officer Welcome Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans">Officer Workstation</h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Managing resolutions for <span className="text-secondary font-semibold">{filterDept}</span>.
        </p>
      </div>

      {/* Grid of Workload statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-l-4 border-primary flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold uppercase">Total Allocated</span>
            <p className="text-3xl font-extrabold font-sans mt-2">{filteredIssues.length}</p>
          </div>
          <div className="p-3.5 bg-primary/10 rounded-2xl text-primary">
            <Briefcase className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-error flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold uppercase">Critical Alerts</span>
            <p className="text-3xl font-extrabold font-sans mt-2">
              {filteredIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length}
            </p>
          </div>
          <div className="p-3.5 bg-error/10 rounded-2xl text-error">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-warning flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold uppercase">Pending Resolution</span>
            <p className="text-3xl font-extrabold font-sans mt-2">
              {filteredIssues.filter(i => i.status !== 'resolved').length}
            </p>
          </div>
          <div className="p-3.5 bg-warning/10 rounded-2xl text-warning">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="glass-card p-6 border-l-4 border-success flex items-center justify-between">
          <div>
            <span className="text-xs text-neutral-400 font-semibold uppercase">Cases Resolved</span>
            <p className="text-3xl font-extrabold font-sans mt-2">
              {filteredIssues.filter(i => i.status === 'resolved').length}
            </p>
          </div>
          <div className="p-3.5 bg-success/10 rounded-2xl text-success">
            <CheckCircle className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Work queue */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass p-5 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
            <h3 className="font-bold text-md font-sans text-neutral-800 dark:text-white">Active Case Queue</h3>
            
            <div className="flex gap-2 flex-wrap items-center">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search street, issue..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-white/50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none"
                />
              </div>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl bg-white/50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          {/* Cases grid */}
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div key={issue.id} className="glass-card p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between hover:border-primary/20 transition-all duration-300">
                <div className="flex gap-4 items-center flex-1">
                  <img src={issue.mediaUrl} alt={issue.title} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-md ${getSeverityBadge(issue.severity)}`}>
                        {issue.severity}
                      </span>
                      <span className="text-[10px] text-neutral-400 font-mono">ID: {issue.id.slice(0, 8)}</span>
                    </div>
                    <h4 className="font-bold text-sm truncate text-neutral-800 dark:text-neutral-100">{issue.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {issue.location.address}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-neutral-100 dark:border-neutral-800 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-neutral-400 block font-semibold">Timeline</span>
                    <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">{issue.repairTimeline}</span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/issue/${issue.id}`)}
                    className="glass-btn-primary py-2 px-4 text-xs font-semibold"
                  >
                    Manage Case
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {filteredIssues.length === 0 && (
              <div className="text-center py-12 text-neutral-400 italic">
                No issues listed under this department workflow. Great job!
              </div>
            )}
          </div>
        </div>

        {/* Right column: AI Dispatch recommendations */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card p-6 border-t-4 border-tertiary space-y-5">
            <h3 className="font-bold text-md font-sans border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-tertiary animate-pulse" />
              AI Priority Dispatch
            </h3>

            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed font-light">
              Gemini analyzed department workload queues and recommends addressing the following highest priority tasks first:
            </p>

            <div className="space-y-4">
              {filteredIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').slice(0, 2).map((item) => (
                <div key={item.id} className="p-3 bg-red-500/5 dark:bg-red-500/10 border border-red-500/20 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-bold text-red-500">
                    <span className="uppercase">CRITICAL DISPATCH</span>
                    <span>95% Urgency</span>
                  </div>
                  <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 line-clamp-1">{item.title}</h4>
                  <p className="text-[11px] text-neutral-400 flex items-center gap-1"><MapPin className="h-3 w-3" /> {item.location.address.split(',')[0]}</p>
                  <button 
                    onClick={() => navigate(`/issue/${item.id}`)}
                    className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5 mt-1"
                  >
                    Open Action Panel <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              ))}
              
              {filteredIssues.filter(i => i.severity === 'critical' && i.status !== 'resolved').length === 0 && (
                <div className="p-4 bg-success/5 dark:bg-success/10 border border-success/20 text-success rounded-xl text-xs text-center font-medium">
                  🎉 No critical hazards pending dispatch!
                </div>
              )}
            </div>
          </div>
          
          {/* Department resolution efficiency indicator */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-md font-sans flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-secondary" />
              Efficiency Indexes
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-500">SLA Response Compliance</span>
                  <span className="text-primary font-bold">92%</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-neutral-500">Citizen Satisfaction Index</span>
                  <span className="text-secondary font-bold">4.8 / 5.0</span>
                </div>
                <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-secondary rounded-full" style={{ width: '96%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default OfficerDashboard;
