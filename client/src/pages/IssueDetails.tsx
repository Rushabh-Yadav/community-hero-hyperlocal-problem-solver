import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Shield, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  MessageSquare,
  Upload,
  CheckCircle,
  FileText,
  User,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TimelineItem {
  status: string;
  timestamp: string;
  note: string;
  updatedBy: string;
}

interface ChecklistItem {
  task: string;
  completed: boolean;
}

interface CommentItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  text: string;
  proofUrl?: string;
  isVerificationProof: boolean;
  verificationDecision?: 'verify' | 'dispute';
  createdAt: string;
}

interface IssueDetailsData {
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
  reportedBy: string;
  reportedByName: string;
  assignedTo?: string;
  assignedToName?: string;
  department: string;
  upvotes: number;
  downvotes: number;
  votes: { [uid: string]: string };
  aiSummary: string;
  officerReport?: string;
  resolutionChecklist: ChecklistItem[];
  repairTimeline: string;
  trustScore: number;
  isDuplicate: boolean;
  duplicateOf?: string;
  timeline: TimelineItem[];
  createdAt: string;
  comments?: CommentItem[];
}

export const IssueDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, refreshProfile } = useAuth();

  const [issue, setIssue] = useState<IssueDetailsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Comment Form State
  const [commentText, setCommentText] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState('');
  const [isVerificationProof, setIsVerificationProof] = useState(false);
  const [verificationDecision, setVerificationDecision] = useState<'verify' | 'dispute'>('verify');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Officer Actions State
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [officerReportText, setOfficerReportText] = useState('');

  const fetchIssueDetails = async () => {
    if (!id) return;
    try {
      const data = await api.getIssueById(id);
      setIssue(data);
      if (data.officerReport) {
        setOfficerReportText(data.officerReport);
      }
    } catch (err: any) {
      setError('Failed to load issue details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssueDetails();
  }, [id]);

  // Vote handler
  const handleVote = async (type: 'up' | 'down') => {
    if (!issue) return;
    try {
      const res = await api.voteIssue(issue.id, type);
      setIssue(prev => prev ? { 
        ...prev, 
        upvotes: res.upvotes, 
        downvotes: res.downvotes,
        status: res.status 
      } : null);
      if (refreshProfile) refreshProfile();
      fetchIssueDetails(); // Refresh full details to sync timeline changes
    } catch (e) {
      console.error(e);
    }
  };

  // Submit comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText || !issue) return;

    setSubmittingComment(true);
    try {
      const formData = new FormData();
      formData.append('text', commentText);
      formData.append('isVerificationProof', isVerificationProof.toString());
      if (isVerificationProof) {
        formData.append('verificationDecision', verificationDecision);
      }
      if (proofFile) {
        formData.append('proofFile', proofFile);
      }

      await api.addComment(issue.id, formData);
      setCommentText('');
      setProofFile(null);
      setProofPreview('');
      setIsVerificationProof(false);
      
      // Reload comments & issue
      await fetchIssueDetails();
      if (refreshProfile) refreshProfile();
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle proof file attachment
  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Toggle checklist item (Officer/Admin only)
  const handleChecklistToggle = async (index: number) => {
    if (!issue) return;
    
    const updatedChecklist = [...issue.resolutionChecklist];
    updatedChecklist[index].completed = !updatedChecklist[index].completed;

    try {
      await api.updateIssueStatus(issue.id, {
        resolutionChecklist: updatedChecklist
      });
      setIssue(prev => prev ? { ...prev, resolutionChecklist: updatedChecklist } : null);
    } catch (e) {
      console.error('Failed to update checklist item', e);
    }
  };

  // Update Status / Solve issue (Officer/Admin only)
  const handleStatusTransition = async (newStatus: string) => {
    if (!issue) return;
    setUpdatingStatus(true);
    try {
      const res = await api.updateIssueStatus(issue.id, {
        status: newStatus,
        officerReport: officerReportText
      });

      if (newStatus === 'resolved') {
        confetti({ particleCount: 200, spread: 90 });
      }

      setIssue(prev => prev ? { 
        ...prev, 
        status: newStatus, 
        officerReport: officerReportText 
      } : null);
      
      await fetchIssueDetails();
      if (refreshProfile) refreshProfile();
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Loading issue timelines...</p>
      </div>
    );
  }

  if (error || !issue) {
    return (
      <div className="py-20 text-center">
        <div className="p-4 rounded-xl bg-error/10 text-error inline-block mb-4">
          Failed to fetch detailed issue information.
        </div>
        <button onClick={() => navigate(-1)} className="glass-btn-secondary mx-auto">
          Go Back
        </button>
      </div>
    );
  }

  const userVoted = issue.votes?.[currentUser?.uid || ''] || '';

  return (
    <div className="space-y-8 py-4">
      {/* Header controls */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => navigate(-1)}
          className="p-2.5 rounded-xl hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <span className="text-xs text-neutral-400">Back to Feed</span>
          <h1 className="text-2xl font-bold font-sans mt-0.5">{issue.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Section: Details, AI, Comments */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Visual Image Card */}
          <div className="glass-card overflow-hidden">
            <div className="h-[300px] sm:h-[400px] bg-neutral-900 flex items-center justify-center relative">
              <img src={issue.mediaUrl} alt={issue.title} className="w-full h-full object-cover" />
              <div className="absolute top-4 right-4 bg-neutral-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold text-white">
                Status: {issue.status.toUpperCase()}
              </div>
            </div>
            
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500 border-b border-neutral-100 dark:border-neutral-800/80 pb-4">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" /> {issue.location.address}</span>
                <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> Reported {new Date(issue.createdAt).toLocaleDateString()}</span>
                <span className="font-semibold text-primary">Trust Level: {issue.trustScore}%</span>
              </div>

              <div>
                <h3 className="font-bold text-md font-sans text-neutral-800 dark:text-neutral-200">Description</h3>
                <p className="text-sm font-light text-neutral-600 dark:text-neutral-400 mt-2 leading-relaxed">{issue.description}</p>
              </div>

              {/* Voting validation deck */}
              <div className="flex items-center gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-4">
                <span className="text-xs text-neutral-400">Validate report:</span>
                <button
                  onClick={() => handleVote('up')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    userVoted === 'up' 
                      ? 'bg-success/15 border-success text-success' 
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <ThumbsUp className="h-4 w-4" />
                  Upvote ({issue.upvotes})
                </button>
                <button
                  onClick={() => handleVote('down')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
                    userVoted === 'down' 
                      ? 'bg-error/15 border-error text-error' 
                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <ThumbsDown className="h-4 w-4" />
                  Downvote ({issue.downvotes})
                </button>
              </div>
            </div>
          </div>

          {/* Gemini AI Intelligence Section */}
          <div className="glass-card p-6 sm:p-8 border-l-4 border-primary space-y-6">
            <h3 className="font-bold text-lg font-sans flex items-center gap-2">
              <Sparkles className="h-5.5 w-5.5 text-primary" />
              AI Agent Insights
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl flex items-center gap-3">
                <Briefcase className="h-6 w-6 text-primary" />
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Department</span>
                  <span className="text-xs font-bold">{issue.department}</span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl flex items-center gap-3">
                <Clock className="h-6 w-6 text-tertiary" />
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Timeline</span>
                  <span className="text-xs font-bold">{issue.repairTimeline}</span>
                </div>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl flex items-center gap-3">
                <Shield className="h-6 w-6 text-secondary" />
                <div>
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Confidence</span>
                  <span className="text-xs font-bold text-success">{issue.trustScore}%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-1.5">AI Citizen Summary</h4>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">{issue.aiSummary}</p>
            </div>
          </div>

          {/* Verification Dialog / Comments */}
          <div className="glass-card p-6 sm:p-8 space-y-6">
            <h3 className="font-bold text-lg font-sans flex items-center gap-2">
              <MessageSquare className="h-5.5 w-5.5 text-secondary" />
              Community Verification Feed
            </h3>

            {/* Comments List */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {issue.comments?.map((comment) => (
                <div key={comment.id} className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-tertiary flex items-center justify-center text-white font-bold text-xs">
                        {comment.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-bold">{comment.userName}</span>
                      <span className="text-[9px] px-1.5 py-0.2 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-md uppercase">
                        {comment.userRole}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>

                  {comment.isVerificationProof && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success">
                      <CheckCircle className="h-3 w-3" />
                      Verification Proof: {comment.verificationDecision?.toUpperCase()}
                    </div>
                  )}

                  <p className="text-xs text-neutral-600 dark:text-neutral-300 font-light leading-relaxed">{comment.text}</p>
                  
                  {comment.proofUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden max-w-sm border border-neutral-200 dark:border-neutral-800">
                      <img src={comment.proofUrl} alt="Attached Proof" className="max-h-40 w-full object-cover" />
                    </div>
                  )}
                </div>
              ))}

              {(!issue.comments || issue.comments.length === 0) && (
                <p className="text-xs text-neutral-400 italic text-center py-4">No comments or proofs posted yet. Be the first to verify!</p>
              )}
            </div>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-4 border-t border-neutral-200 dark:border-neutral-800 pt-6">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-1.5 uppercase">Post comment or validation proof</label>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  placeholder="Ask questions or add validation details..."
                  className="glass-input text-xs resize-none"
                  disabled={submittingComment}
                />
              </div>

              {/* Toggle to submit verification photo proof */}
              <div className="flex flex-col sm:flex-row justify-between gap-4 items-start sm:items-center bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isProof"
                    checked={isVerificationProof}
                    onChange={(e) => setIsVerificationProof(e.target.checked)}
                    className="w-4 h-4 rounded text-primary focus:ring-primary focus:ring-opacity-20"
                  />
                  <label htmlFor="isProof" className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer">
                    This is official verification proof
                  </label>
                </div>

                {isVerificationProof && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setVerificationDecision('verify')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        verificationDecision === 'verify' 
                          ? 'bg-success text-white' 
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => setVerificationDecision('dispute')}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                        verificationDecision === 'dispute' 
                          ? 'bg-error text-white' 
                          : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-500'
                      }`}
                    >
                      Dispute (Fake)
                    </button>
                  </div>
                )}
              </div>

              {isVerificationProof && (
                <div className="flex items-center gap-4">
                  <div className="relative group cursor-pointer border border-dashed border-neutral-300 dark:border-neutral-800 rounded-xl px-4 py-2 hover:border-primary/50 text-xs">
                    <input
                      type="file"
                      onChange={handleProofChange}
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <span className="flex items-center gap-1.5"><Upload className="h-4 w-4" /> Attach Proof Image</span>
                  </div>
                  {proofPreview && (
                    <img src={proofPreview} alt="Attached Preview" className="w-10 h-10 object-cover rounded-md border" />
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingComment || !commentText}
                className="glass-btn-primary py-2 px-6 text-xs ml-auto block"
              >
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Section: Lifecyle Timeline, Officer Dashboard Actions */}
        <div className="lg:col-span-4 space-y-6">
          {/* Timeline View */}
          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold text-md font-sans border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Lifecycle Progress
            </h3>

            {/* Vertical timeline stepper */}
            <div className="relative border-l border-neutral-200 dark:border-neutral-800 ml-3.5 pl-5 space-y-6 text-xs">
              {issue.timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  {/* Stepper node */}
                  <span className="absolute -left-[27px] top-0 bg-primary text-white p-1 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-3 w-3" />
                  </span>
                  <div className="space-y-0.5">
                    <h4 className="font-bold capitalize text-neutral-800 dark:text-neutral-200">{step.status}</h4>
                    <p className="text-[10px] text-neutral-400">{new Date(step.timestamp).toLocaleString()}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 font-light mt-1 text-[11px] leading-relaxed">{step.note}</p>
                    <p className="text-[10px] font-medium text-neutral-400 mt-1">— updated by {step.updatedBy}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Officer Dashboard checklist & updates (Officers & Admins only) */}
          {currentUser && ['officer', 'admin'].includes(currentUser.role) && (
            <div className="glass-card p-6 border-t-4 border-secondary space-y-5">
              <h3 className="font-bold text-md font-sans border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                Officer Intervention Desk
              </h3>

              {/* Checklist progress */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Resolution Checklist</h4>
                <div className="space-y-2">
                  {issue.resolutionChecklist?.map((item, idx) => (
                    <label 
                      key={idx} 
                      className="flex items-start gap-2.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleChecklistToggle(idx)}
                        className="mt-0.5 w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className={item.completed ? 'line-through text-neutral-400' : ''}>
                        {item.task}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status progression triggers */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Transition Status</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {issue.status !== 'assigned' && issue.status !== 'in_progress' && issue.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusTransition('assigned')}
                      disabled={updatingStatus}
                      className="px-2.5 py-1.5 bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold rounded-lg hover:bg-neutral-200"
                    >
                      Assign Dept
                    </button>
                  )}
                  {issue.status !== 'in_progress' && issue.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusTransition('in_progress')}
                      disabled={updatingStatus}
                      className="px-2.5 py-1.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[11px] font-semibold rounded-lg hover:bg-indigo-100"
                    >
                      In Progress
                    </button>
                  )}
                  {issue.status !== 'resolved' && (
                    <button
                      onClick={() => handleStatusTransition('resolved')}
                      disabled={updatingStatus}
                      className="px-2.5 py-1.5 bg-green-50 dark:bg-green-950/20 text-green-600 dark:text-green-400 text-[11px] font-semibold rounded-lg hover:bg-green-100 col-span-2"
                    >
                      Resolve & Award XP
                    </button>
                  )}
                </div>
              </div>

              {/* Officer Report Notes */}
              <div className="space-y-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400">Officer Report Memo</label>
                <textarea
                  value={officerReportText}
                  onChange={(e) => setOfficerReportText(e.target.value)}
                  rows={4}
                  placeholder="Enter structural details, excavation depth, asphalt mixes used..."
                  className="glass-input text-xs resize-none"
                />
                <button
                  onClick={() => handleStatusTransition(issue.status)}
                  className="glass-btn-secondary w-full py-1.5 text-xs font-semibold"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default IssueDetails;
