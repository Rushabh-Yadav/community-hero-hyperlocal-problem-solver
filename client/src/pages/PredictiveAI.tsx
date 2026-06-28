import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { 
  Sparkles, 
  MapPin, 
  AlertTriangle, 
  Layers, 
  ShieldAlert, 
  Compass,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

interface Prediction {
  id: string;
  type: 'road_failure' | 'garbage_hotspot' | 'water_leakage_hotspot' | 'flood_risk';
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  confidence: number;
  reasoning: string;
  suggestedAction: string;
}

export const PredictiveAI: React.FC = () => {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const data = await api.getAiPredictions();
      setPredictions(data);
      if (data.length > 0) {
        setSelectedPrediction(data[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPredictions();
  }, []);

  const getPredictionLabel = (type: string) => {
    switch (type) {
      case 'road_failure': return 'Asphalt Crack / Pavement Failure';
      case 'garbage_hotspot': return 'Illegal Trash Dumping Hotspot';
      case 'water_leakage_hotspot': return 'Main Sewer Leak / Rupture';
      default: return 'Hyperlocal Monsoon Flood Risk';
    }
  };

  const getConfidenceBadge = (confidence: number) => {
    const pct = Math.floor(confidence * 100);
    if (pct >= 85) return 'text-error bg-error/10 border-error/20';
    if (pct >= 75) return 'text-warning bg-warning/10 border-warning/20';
    return 'text-primary bg-primary/10 border-primary/20';
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Sparkles className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
        <p className="text-neutral-500">Generating predictive infrastructure risk matrices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight font-sans flex items-center gap-2">
          <Sparkles className="h-7 w-7 text-primary animate-pulse" />
          Predictive AI Hotspots
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
          Gemini predicts future infrastructure stresses based on traffic load increases, monsoon runoffs, and repeat reporting coordinates.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Predictions List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass p-4 rounded-2xl flex items-center justify-between text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            <span>Forecast Alerts</span>
            <span>Confidence Index</span>
          </div>

          <div className="space-y-4">
            {predictions.map((pred) => (
              <button
                key={pred.id}
                onClick={() => setSelectedPrediction(pred)}
                className={`w-full text-left p-5 glass-card border transition-all ${
                  selectedPrediction?.id === pred.id 
                    ? 'border-primary ring-2 ring-primary/15' 
                    : 'border-transparent'
                }`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      {pred.type.replace('_', ' ')}
                    </span>
                    <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-100">
                      {getPredictionLabel(pred.type)}
                    </h3>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-primary" />
                      {pred.location.address}
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getConfidenceBadge(pred.confidence)}`}>
                    {Math.floor(pred.confidence * 100)}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Interactive map overlay & AI reasoning details card */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Map canvas visualizer */}
          <div className="glass-card h-[320px] relative overflow-hidden flex flex-col justify-end">
            <div className="absolute inset-0 bg-neutral-100 dark:bg-neutral-950 flex items-center justify-center p-4">
              <div className="relative w-full h-full opacity-40 dark:opacity-30">
                <div className="absolute top-1/3 left-0 w-full h-4 bg-neutral-200 dark:bg-neutral-800 rotate-1"></div>
                <div className="absolute top-2/3 left-0 w-full h-6 bg-neutral-200 dark:bg-neutral-800 -rotate-2"></div>
                <div className="absolute top-0 left-1/4 w-8 h-full bg-neutral-200 dark:bg-neutral-800 rotate-3"></div>
                <div className="absolute top-0 left-2/3 w-4 h-full bg-neutral-200 dark:bg-neutral-800 -rotate-1"></div>
              </div>

              {/* Glowing red prediction hotspot circles */}
              {predictions.map((pred) => (
                <div
                  key={pred.id}
                  className={`absolute rounded-full pointer-events-none transition-all duration-300 ${
                    selectedPrediction?.id === pred.id ? 'opacity-90 scale-125' : 'opacity-30 scale-100'
                  }`}
                  style={{
                    top: `${((pred.location.latitude - 12.9) * 2000) % 70 + 15}%`,
                    left: `${((pred.location.longitude - 77.5) * 2000) % 70 + 15}%`,
                  }}
                >
                  <div className="w-12 h-12 rounded-full bg-red-500 blur-md animate-ping absolute"></div>
                  <div className="w-8 h-8 rounded-full bg-red-500 border border-white flex items-center justify-center text-white font-bold text-xs relative z-10 shadow-lg">
                    ⚠️
                  </div>
                </div>
              ))}
            </div>

            <div className="absolute bottom-4 right-4 z-10 bg-neutral-950/70 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-neutral-300 font-mono">
              Live Sensor Ingestion Map
            </div>
          </div>

          {/* AI Reasoning details panel */}
          {selectedPrediction && (
            <div className="glass-card p-6 border-l-4 border-primary space-y-4 animate-slide-up">
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5.5 w-5.5 text-primary" />
                <h3 className="font-bold text-md font-sans">AI Reasoning Analysis</h3>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-neutral-400 uppercase">Warning Model Explanation</span>
                <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-light">
                  {selectedPrediction.reasoning}
                </p>
              </div>

              <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl space-y-1.5">
                <span className="text-[10px] font-bold text-primary uppercase flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Preventative SLA Recommendation
                </span>
                <p className="text-xs text-neutral-700 dark:text-neutral-200 leading-relaxed font-semibold">
                  {selectedPrediction.suggestedAction}
                </p>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
export default PredictiveAI;
