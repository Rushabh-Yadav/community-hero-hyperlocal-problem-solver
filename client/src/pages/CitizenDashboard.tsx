import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  MapPin, 
  Filter, 
  Search, 
  ChevronRight, 
  ThumbsUp, 
  MessageCircle, 
  Sparkles, 
  Award,
  AlertTriangle,
  Layers,
  List,
  Compass,
  CheckCircle2
} from 'lucide-react';

interface CivicIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
    ward: string;
  };
  mediaUrl: string;
  upvotes: number;
  downvotes: number;
  department: string;
  trustScore: number;
}

export const CitizenDashboard: React.FC = () => {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [issues, setIssues] = useState<CivicIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [radiusFilter, setRadiusFilter] = useState(5); // Default 5 km
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [heatmapActive, setHeatmapActive] = useState(false);
  const [selectedPin, setSelectedPin] = useState<CivicIssue | null>(null);
  const [clusterActive, setClusterActive] = useState(true);

  // Group issues into geographical sectors to calculate clusters on the canvas map
  const getClusteredIssues = () => {
    if (!clusterActive) {
      return filteredIssues.map(issue => ({ type: 'single' as const, issue, list: [issue], count: 1, key: issue.id }));
    }

    const clusters: { [key: string]: CivicIssue[] } = {};
    const sectorSize = 0.02; // Grid cell size in coordinate space

    filteredIssues.forEach(issue => {
      const latGrid = Math.round(issue.location.latitude / sectorSize) * sectorSize;
      const lonGrid = Math.round(issue.location.longitude / sectorSize) * sectorSize;
      const key = `${latGrid.toFixed(3)}_${lonGrid.toFixed(3)}`;
      
      if (!clusters[key]) {
        clusters[key] = [];
      }
      clusters[key].push(issue);
    });

    return Object.entries(clusters).map(([key, list]) => {
      if (list.length === 1) {
        return { type: 'single' as const, issue: list[0], list, count: 1, key };
      }
      return { type: 'cluster' as const, issue: list[0], list, count: list.length, key };
    });
  };

  // Daily missions
  const [missions] = useState([
    { id: 'm1', text: 'Upvote 2 local reports to verify them', reward: '30 XP', completed: false },
    { id: 'm2', text: 'Submit verification photo proof in comment', reward: '50 XP', completed: true },
    { id: 'm3', text: 'Report a new civic hazard in your ward', reward: '40 XP', completed: false }
  ]);

  const fetchIssuesList = async () => {
    setLoading(true);
    try {
      const data = await api.getIssues({
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        status: selectedStatus === 'all' ? undefined : selectedStatus
      });
      setIssues(data);
    } catch (err: any) {
      setError('Failed to fetch civic issues list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuesList();
  }, [selectedCategory, selectedStatus]);

  const handleVote = async (id: string, type: 'up' | 'down') => {
    try {
      await api.voteIssue(id, type);
      fetchIssuesList();
      if (refreshProfile) refreshProfile();
    } catch (e) {
      console.error(e);
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'water_leakage': return 'bg-blue-500 text-white';
      case 'road_damage': case 'pothole': return 'bg-orange-500 text-white';
      case 'garbage_dumping': return 'bg-emerald-500 text-white';
      case 'broken_street_light': return 'bg-amber-500 text-neutral-900';
      case 'drain_blockage': return 'bg-purple-500 text-white';
      default: return 'bg-neutral-500 text-white';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'verified': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'assigned': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'in_progress': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      case 'resolved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default: return 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          issue.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="space-y-6 py-4">
      {/* Top dashboard header panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans">Citizen Hero Center</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Submit, verify, and track hyperlocal problems around Indiranagar.</p>
        </div>

        {/* View togglers */}
        <div className="flex gap-2 bg-white/40 dark:bg-neutral-900/40 p-1 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-sm">
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'map' ? 'bg-primary text-white shadow' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <Compass className="h-4 w-4" />
            Interactive Map
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-primary text-white shadow' : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            <List className="h-4 w-4" />
            Feed List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Feed list/map and filters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Filtering options */}
          <div className="glass p-4 rounded-2xl flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search issues, streets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-600 focus:outline-none"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none text-neutral-700 dark:text-neutral-300"
              >
                <option value="all">All Categories</option>
                <option value="pothole">Potholes</option>
                <option value="water_leakage">Water Leakage</option>
                <option value="garbage_dumping">Garbage Dumping</option>
                <option value="broken_street_light">Broken Light</option>
                <option value="drain_blockage">Drain Blockage</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl bg-white/50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 text-xs focus:outline-none text-neutral-700 dark:text-neutral-300"
              >
                <option value="all">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="verified">Verified</option>
                <option value="in_progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </div>

          {/* View Mode: Map rendering */}
          {viewMode === 'map' ? (
            <div className="glass-card h-[500px] relative overflow-hidden flex flex-col justify-end">
              {/* Toggle Heatmap Overlay & Clustering controls */}
              <div className="absolute top-4 left-4 z-10 flex gap-2">
                <button
                  type="button"
                  onClick={() => setHeatmapActive(!heatmapActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md border flex items-center gap-1.5 transition-all ${
                    heatmapActive 
                      ? 'bg-orange-500 text-white border-orange-500' 
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  {heatmapActive ? 'Disable Heatmap' : 'Enable Heatmap'}
                </button>
                <button
                  type="button"
                  onClick={() => setClusterActive(!clusterActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md border flex items-center gap-1.5 transition-all ${
                    clusterActive 
                      ? 'bg-primary text-white border-primary' 
                      : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  {clusterActive ? 'Disable Clusters' : 'Enable Clusters'}
                </button>
              </div>

              {/* Mock Street Map Background Canvas Visualizer */}
              <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
                {/* Styled dark grid showing streets */}
                <div className="relative w-full h-full opacity-60 dark:opacity-40">
                  <div className="absolute top-1/4 left-0 w-full h-4 bg-neutral-200 dark:bg-neutral-800 rotate-1"></div>
                  <div className="absolute top-2/3 left-0 w-full h-6 bg-neutral-200 dark:bg-neutral-800 -rotate-2"></div>
                  <div className="absolute top-0 left-1/3 w-8 h-full bg-neutral-200 dark:bg-neutral-800 rotate-3"></div>
                  <div className="absolute top-0 left-3/4 w-4 h-full bg-neutral-200 dark:bg-neutral-800 -rotate-1"></div>
                  <div className="absolute top-1/3 left-1/3 w-32 h-32 rounded-full border-4 border-neutral-200 dark:border-neutral-800"></div>
                </div>

                {/* Heatmap Layer simulation */}
                {heatmapActive && (
                  <div className="absolute inset-0 bg-gradient-radial-heatmap pointer-events-none opacity-40 animate-pulse">
                    <div className="absolute top-1/3 left-1/2 w-48 h-48 rounded-full bg-red-500 blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/3 w-32 h-32 rounded-full bg-yellow-500 blur-2xl"></div>
                  </div>
                )}

                {/* Clustered Pins drops */}
                {getClusteredIssues().map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setSelectedPin(item.issue)}
                    className="absolute p-2 hover:scale-125 transition-transform duration-200"
                    style={{
                      top: `${((item.issue.location.latitude - 12.9) * 2000) % 80 + 10}%`,
                      left: `${((item.issue.location.longitude - 77.5) * 2000) % 80 + 10}%`
                    }}
                  >
                    {item.type === 'cluster' ? (
                      <div className="w-8 h-8 rounded-full bg-tertiary text-white flex items-center justify-center font-sans font-bold text-xs shadow-lg border border-white animate-pulse">
                        {item.count}
                      </div>
                    ) : (
                      <div className={`p-2.5 rounded-full shadow-lg ${getCategoryColor(item.issue.category)} animate-pulse`}>
                        <MapPin className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Pin preview Card slider */}
              {selectedPin && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border border-neutral-200 dark:border-neutral-800 p-4 rounded-2xl shadow-2xl z-20 flex gap-4 items-center animate-slide-up">
                  <img src={selectedPin.mediaUrl} alt="Thumbnail" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-md ${getCategoryColor(selectedPin.category)}`}>
                        {selectedPin.category.replace('_', ' ')}
                      </span>
                      <span className="text-[10px] text-neutral-400">Trust Score: {selectedPin.trustScore}%</span>
                    </div>
                    <h4 className="font-bold text-sm truncate mt-1">{selectedPin.title}</h4>
                    <p className="text-xs text-neutral-400 truncate">{selectedPin.location.address}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => navigate(`/issue/${selectedPin.id}`)}
                      className="glass-btn-primary py-1 px-3 text-xs"
                    >
                      Inspect
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setSelectedPin(null)}
                      className="text-xs text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              )}

              {/* Map centering instructions overlay */}
              <div className="absolute bottom-4 right-4 z-10 bg-neutral-900/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-neutral-300 font-mono">
                Centered at Indiranagar (12.9716, 77.5946)
              </div>
            </div>
          ) : (
            /* View Mode: Feed List grid cards */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredIssues.map((issue) => (
                <div key={issue.id} className="glass-card overflow-hidden flex flex-col justify-between">
                  <div className="relative h-40 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                    <img src={issue.mediaUrl} alt={issue.title} className="w-full h-full object-cover" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadge(issue.status)}`}>
                        {issue.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex gap-2 items-center">
                        <span className={`text-[10px] px-2 py-0.5 font-bold uppercase rounded-md ${getCategoryColor(issue.category)}`}>
                          {issue.category.replace('_', ' ')}
                        </span>
                        <span className="text-xs font-mono text-neutral-400">Ward: {issue.location.ward}</span>
                      </div>
                      <h3 className="font-sans font-bold text-base mt-2 line-clamp-1">{issue.title}</h3>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 line-clamp-2">{issue.description}</p>
                    </div>

                    <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-3 flex items-center justify-between text-xs text-neutral-400">
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-primary" /> {issue.location.address.split(',')[0]}</span>
                      <span className="font-semibold text-primary">{issue.trustScore}% Trust</span>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleVote(issue.id, 'up')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                        >
                          <ThumbsUp className="h-4 w-4" />
                          <span>{issue.upvotes}</span>
                        </button>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/issue/${issue.id}`)}
                        className="glass-btn-secondary py-1.5 px-3 text-xs"
                      >
                        Details
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredIssues.length === 0 && (
                <div className="col-span-2 text-center py-12 text-neutral-400">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-neutral-500" />
                  No matching civic issues reported in this sector.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column: Gamification stats & Daily missions panel */}
        <div className="lg:col-span-4 space-y-6">
          {currentUser && (
            <div className="glass-card p-6 border-t-4 border-tertiary space-y-5">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-tertiary" />
                <h3 className="font-bold text-md font-sans">Citizen Rep</h3>
              </div>

              {/* Progress metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Reputation</span>
                  <p className="text-xl font-bold text-primary mt-1">{currentUser.reputationScore}</p>
                </div>
                <div className="bg-neutral-50 dark:bg-neutral-900/50 p-3 rounded-xl text-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Total XP</span>
                  <p className="text-xl font-bold text-tertiary mt-1">{currentUser.xp}</p>
                </div>
              </div>

              {/* Achievements Showcase */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Unlocked Badges</h4>
                <div className="flex flex-wrap gap-2">
                  {currentUser.badges?.length > 0 ? (
                    currentUser.badges.map((badge, idx) => (
                      <span 
                        key={idx} 
                        className="px-2.5 py-1 bg-tertiary/10 text-tertiary dark:text-tertiary-dark border border-tertiary/20 rounded-xl text-xs font-medium flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {badge.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-neutral-400 italic">No badges unlocked yet. Sync profile to begin.</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Daily Missions Panel */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-md font-sans flex items-center gap-2">
              <Compass className="h-5 w-5 text-secondary" />
              Daily Missions
            </h3>
            
            <div className="space-y-3">
              {missions.map((mission) => (
                <div 
                  key={mission.id}
                  className={`p-3 rounded-xl border transition-all ${
                    mission.completed 
                      ? 'bg-success/5 border-success/20 text-neutral-500' 
                      : 'bg-white dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start gap-2.5 justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className={`mt-0.5 p-0.5 rounded-full ${mission.completed ? 'bg-success text-white' : 'border border-neutral-300 dark:border-neutral-700'}`}>
                        {mission.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                      </div>
                      <p className={`text-xs ${mission.completed ? 'line-through text-neutral-400' : 'text-neutral-700 dark:text-neutral-300'}`}>
                        {mission.text}
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${mission.completed ? 'bg-neutral-100 text-neutral-400 dark:bg-neutral-800' : 'bg-secondary/15 text-secondary'}`}>
                      {mission.reward}
                    </span>
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
export default CitizenDashboard;
