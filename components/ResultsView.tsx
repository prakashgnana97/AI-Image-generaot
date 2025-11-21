import React from 'react';
import { AnalysisResult, MediaType } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Search, FileText, Fingerprint, ScanLine } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ResultsViewProps {
  result: AnalysisResult;
  mediaPreview: string;
  mediaType: MediaType;
  reset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, mediaPreview, mediaType, reset }) => {
  
  const getStatusColor = () => {
    switch (result.verdict) {
      case 'REAL': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'SUSPICIOUS': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'LIKELY_AI': return 'text-red-400 border-red-500/30 bg-red-500/10';
      default: return 'text-slate-400';
    }
  };

  const getIcon = () => {
    switch (result.verdict) {
      case 'REAL': return <ShieldCheck className="w-12 h-12 text-emerald-400" />;
      case 'SUSPICIOUS': return <AlertTriangle className="w-12 h-12 text-amber-400" />;
      case 'LIKELY_AI': return <ShieldAlert className="w-12 h-12 text-red-400" />;
    }
  };

  const chartData = [
    { name: 'AI', value: result.confidence_score },
    { name: 'Real', value: 100 - result.confidence_score },
  ];
  
  const chartColors = result.verdict === 'REAL' ? ['#34d399', '#0f172a'] : ['#ef4444', '#0f172a'];

  return (
    <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
      
      {/* Left Column: Media & Quick Stats */}
      <div className="space-y-6">
        <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
          <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-3 py-1 rounded text-xs font-mono text-white border border-white/10 z-10">
            SOURCE MEDIA
          </div>
          {mediaType === MediaType.VIDEO ? (
             <video src={mediaPreview} controls className="w-full h-auto max-h-[400px] object-contain" />
          ) : (
             <img src={mediaPreview} alt="Analyzed Media" className="w-full h-auto max-h-[400px] object-contain" />
          )}
        </div>

        {/* Watermark Warning Banner */}
        {result.watermark_detected && (
          <div className="p-4 rounded-lg bg-red-500/20 border border-red-500/50 flex items-center gap-4 text-red-200 animate-pulse-slow">
            <ScanLine className="w-8 h-8 text-red-400 shrink-0" />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider text-red-400">Digital Watermark Detected</h4>
              <p className="text-xs opacity-80">Forensics identified a specific visual signature or text watermark associated with AI generation tools (e.g., "nanobanana").</p>
            </div>
          </div>
        )}

        <div className={`p-6 rounded-xl border ${getStatusColor()} flex flex-col items-center text-center`}>
          <div className="mb-4">{getIcon()}</div>
          <h2 className="text-2xl font-bold mb-1">Verdict: {result.verdict.replace('_', ' ')}</h2>
          <p className="text-sm opacity-80">
             {result.verdict === 'REAL' 
               ? "No significant artifacts of synthesis detected." 
               : "Pattern analysis indicates high probability of artificial generation."}
          </p>
        </div>

        {/* Confidence Gauge */}
        <div className="p-6 rounded-xl border border-slate-700 bg-slate-900 flex items-center justify-between">
          <div>
            <h3 className="text-slate-400 text-sm font-mono uppercase mb-1">AI Probability</h3>
            <div className="text-3xl font-bold text-white">{result.confidence_score}%</div>
          </div>
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  innerRadius={30}
                  outerRadius={40}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? (result.verdict === 'REAL' ? '#10b981' : '#ef4444') : '#1e293b'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Right Column: Detailed Report */}
      <div className="space-y-6">
        
        {/* Main Analysis */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
            <Search className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Forensic Analysis</h3>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm">
            {result.reasoning}
          </p>
        </div>

        {/* Artifacts Detected */}
        {result.artifacts_detected.length > 0 && (
           <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
             <div className="flex items-center gap-2 mb-4">
               <Fingerprint className="w-5 h-5 text-cyan-400" />
               <h3 className="font-semibold text-white">Detected Artifacts</h3>
             </div>
             <div className="flex flex-wrap gap-2">
               {result.artifacts_detected.map((artifact, i) => (
                 <span key={i} className="px-3 py-1 rounded-full bg-slate-800 border border-slate-600 text-xs text-cyan-100">
                   {artifact}
                 </span>
               ))}
             </div>
           </div>
        )}

        {/* Technical Breakdown */}
        <div className="bg-slate-900 rounded-xl p-6 border border-slate-700">
           <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-800">
            <FileText className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-white">Technical Breakdown</h3>
          </div>
          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase">Lighting & Shadows</span>
              <p className="text-slate-300 text-sm mt-1">{result.technical_details.lighting_consistency}</p>
            </div>
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase">Geometry & Anatomy</span>
              <p className="text-slate-300 text-sm mt-1">{result.technical_details.anatomy_geometry}</p>
            </div>
             <div>
              <span className="text-xs font-mono text-slate-500 uppercase">Texture Analysis</span>
              <p className="text-slate-300 text-sm mt-1">{result.technical_details.texture_quality}</p>
            </div>
          </div>
        </div>

        <button 
          onClick={reset}
          className="w-full py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors border border-slate-600"
        >
          Analyze Another File
        </button>

      </div>
    </div>
  );
};

export default ResultsView;