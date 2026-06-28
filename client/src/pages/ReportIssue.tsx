import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { 
  Camera, 
  Mic, 
  MicOff, 
  MapPin, 
  Sparkles, 
  Upload, 
  X, 
  Check, 
  AlertCircle,
  Clock,
  Briefcase
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ReportIssue: React.FC = () => {
  const { currentUser, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [ward, setWard] = useState('');
  
  // Media uploads
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string>('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'voice' | 'none'>('none');

  // Audio Recorder State
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const [aiReport, setAiReport] = useState<any>(null); // For displaying Gemini results

  // 1. GPS Auto-Detect
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setLocating(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat.toFixed(6));
        setLongitude(lon.toFixed(6));
        
        // Mock reverse geocode for hackathon visual complete status
        setAddress(`Indiranagar, Metro Pillar ${Math.floor(Math.random() * 80 + 10)}, Bengaluru`);
        setWard(`Ward ${Math.floor(Math.random() * 5 + 80)}`);
        setLocating(false);
      },
      (err) => {
        console.error(err);
        // Fallback demo coordinates
        setLatitude('12.9716');
        setLongitude('77.5946');
        setAddress('MG Road Metro Station, Bengaluru');
        setWard('Ward 82');
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  // 2. Drag & Drop Media Upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    processSelectedFile(file);
  };

  const processSelectedFile = (file: File) => {
    setError('');
    const type = file.type.startsWith('image/') 
      ? 'image' 
      : file.type.startsWith('video/') 
        ? 'video' 
        : 'none';
        
    if (type === 'none') {
      setError('Unsupported file type. Please upload an image or video.');
      return;
    }

    setMediaFile(file);
    setMediaType(type as any);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 3. Audio Recording workflows
  const startRecording = async () => {
    setError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Package as file for API
        const audioFile = new File([audioBlob], 'voicenote.wav', { type: 'audio/wav' });
        setMediaFile(audioFile);
        setMediaType('voice');
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error(e);
      setError('Microphone access denied or unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      // Stop all tracks in stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  // 4. Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !latitude || !longitude) {
      setError('Please provide a Title, Description, and GPS Coordinates.');
      return;
    }

    setLoading(true);
    setError('');
    setAiReport(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('address', address);
      formData.append('ward', ward);
      formData.append('mediaType', mediaType);
      
      if (mediaFile) {
        formData.append('mediaFile', mediaFile);
      }

      const result = await api.reportIssue(formData);
      setAiReport(result.issue);

      // Trigger Confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      // Update XP in navbar
      await refreshProfile();

    } catch (err: any) {
      setError(err.message || 'Failed to submit issue report.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearMedia = () => {
    setMediaFile(null);
    setMediaPreview('');
    setMediaType('none');
    setAudioUrl('');
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight font-sans">Report Civic Issue</h1>
          <p className="text-neutral-500 dark:text-neutral-400 mt-1">Submit hyperlocal details. Gemini AI will analyze and route to matching departments.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-error/10 border border-error/20 text-error text-sm font-medium flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Main reporting form grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-8 space-y-6">
            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Deep pothole blocking traffic lane"
                className="glass-input"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Provide specific details. Specify if there are flooding issues, public safety hazards, or vehicle damage concerns..."
                className="glass-input resize-none"
                disabled={loading}
              />
            </div>

            {/* GPS coordinates panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="e.g., 12.9716"
                  className="glass-input"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="e.g., 77.5946"
                  className="glass-input"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <button
                type="button"
                onClick={detectLocation}
                disabled={locating || loading}
                className="glass-btn-secondary w-full py-2.5"
              >
                <MapPin className={`h-4 w-4 ${locating ? 'animate-bounce text-primary' : ''}`} />
                {locating ? 'Detecting GPS...' : 'Auto-Detect Coordinates'}
              </button>
              
              <div className="flex-1 w-full">
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street Address Details"
                  className="glass-input text-sm py-2.5"
                  disabled={loading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="glass-btn-primary w-full py-3.5"
            >
              {loading ? (
                <>
                  <Sparkles className="h-5 w-5 animate-spin" />
                  Gemini analyzing report...
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  Submit Report & Generate AI Checklists
                </>
              )}
            </button>
          </form>
        </div>

        {/* Media attachments desk */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card p-6 space-y-6">
            <h3 className="font-semibold text-md font-sans border-b border-neutral-100 dark:border-neutral-800 pb-3 flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Multimodal Proof
            </h3>

            {/* Drop / Selector file frame */}
            {mediaType === 'none' && (
              <div className="border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl p-8 text-center hover:border-primary/50 transition-all duration-300 relative group cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  disabled={loading}
                />
                <Upload className="h-10 w-10 text-neutral-400 mx-auto group-hover:text-primary transition-colors" />
                <p className="mt-3 text-sm font-medium">Drag photo/video here or browse</p>
                <p className="text-xs text-neutral-400 mt-1">PNG, JPG or MP4 up to 10MB</p>
              </div>
            )}

            {/* Previews display */}
            {mediaPreview && (mediaType === 'image' || mediaType === 'video') && (
              <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-950/20 max-h-64 flex items-center justify-center">
                {mediaType === 'image' ? (
                  <img src={mediaPreview} alt="Preview Attachment" className="object-contain max-h-60" />
                ) : (
                  <video src={mediaPreview} controls className="max-h-60" />
                )}
                <button
                  type="button"
                  onClick={handleClearMedia}
                  className="absolute top-3 right-3 p-2 bg-neutral-900/60 backdrop-blur-sm text-white rounded-full hover:bg-neutral-900"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Voice record interface */}
            <div className="border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex flex-col items-center gap-4">
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
                Voice Note Reporting
              </span>
              
              {isRecording ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="flex gap-1 h-6 items-center">
                    <span className="w-1 bg-primary h-2 rounded animate-pulse" />
                    <span className="w-1 bg-primary h-4 rounded animate-pulse delay-75" />
                    <span className="w-1 bg-primary h-6 rounded animate-pulse delay-150" />
                    <span className="w-1 bg-primary h-3 rounded animate-pulse delay-100" />
                    <span className="w-1 bg-primary h-1 rounded animate-pulse" />
                  </div>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="p-4 bg-error text-white rounded-full shadow-lg hover:bg-error-light active:scale-95 transition-all duration-200 flex items-center justify-center"
                  >
                    <MicOff className="h-6 w-6 animate-pulse" />
                  </button>
                  <span className="text-xs text-error font-medium">Recording active...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  {audioUrl && (
                    <div className="flex items-center gap-2 w-full">
                      <audio src={audioUrl} controls className="w-full h-10" />
                      <button
                        type="button"
                        onClick={handleClearMedia}
                        className="p-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 rounded-xl"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  
                  {!audioUrl && (
                    <button
                      type="button"
                      onClick={startRecording}
                      disabled={loading}
                      className="p-4 bg-primary/10 hover:bg-primary/20 text-primary rounded-full hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <Mic className="h-6 w-6" />
                    </button>
                  )}
                  <span className="text-xs text-neutral-400">Record a voice memo explaining the issue</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Result Card */}
          {aiReport && (
            <div className="glass-card p-6 border-l-4 border-primary animate-slide-up space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-md font-sans">Gemini AI Analysis</h3>
                </div>
                <span className="text-xs px-2.5 py-0.5 font-semibold bg-success/10 text-success rounded-full flex items-center gap-1">
                  <Check className="h-3 w-3" />
                  Submitted
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <span className="text-neutral-400 flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> Department</span>
                  <span className="font-semibold">{aiReport.department}</span>
                </div>
                <div className="flex justify-between items-center text-xs border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <span className="text-neutral-400 flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Predicted Timeline</span>
                  <span className="font-semibold">{aiReport.repairTimeline}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Trust Credibility</span>
                  <span className="font-bold text-primary">{aiReport.trustScore}%</span>
                </div>
              </div>

              <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-1">AI Executive Summary</h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">{aiReport.aiSummary}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">Resolution Checklist</h4>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {aiReport.resolutionChecklist?.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded border border-neutral-300 dark:border-neutral-700 flex items-center justify-center text-[10px]">
                        {item.completed && <Check className="h-3 w-3 text-success" />}
                      </div>
                      <span className="text-neutral-600 dark:text-neutral-300 truncate">{item.task}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => navigate(`/issue/${aiReport.id}`)}
                className="glass-btn-primary w-full text-xs py-2"
              >
                Track Live Issue Timeline
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default ReportIssue;
