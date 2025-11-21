import React, { useState } from 'react';
import UploadZone from './components/UploadZone';
import ResultsView from './components/ResultsView';
import { MediaFile, AnalysisResult, MediaType } from './types';
import { fileToBase64, extractVideoFrames } from './utils/mediaHelpers';
import { analyzeMedia } from './services/geminiService';
import { ScanLine, Binary, Lock } from 'lucide-react';

enum AppState {
  IDLE,
  ANALYZING,
  RESULT,
  ERROR
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [currentMedia, setCurrentMedia] = useState<MediaFile | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleFileSelected = async (media: MediaFile) => {
    setCurrentMedia(media);
    setState(AppState.ANALYZING);
    setErrorMessage("");

    try {
      let base64Data: string[] = [];
      let mimeType = media.type === MediaType.IMAGE ? 'image/jpeg' : 'image/jpeg'; // We send video frames as jpeg

      if (media.type === MediaType.IMAGE) {
        const b64 = await fileToBase64(media.file);
        base64Data = [b64];
        mimeType = media.file.type;
      } else {
        // Extract 3 keyframes from the video
        base64Data = await extractVideoFrames(media.file, 3);
      }

      const result = await analyzeMedia(base64Data, mimeType);
      setAnalysisResult(result);
      setState(AppState.RESULT);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "An error occurred during analysis.");
      setState(AppState.ERROR);
    }
  };

  const resetApp = () => {
    setState(AppState.IDLE);
    setCurrentMedia(null);
    setAnalysisResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 selection:bg-cyan-500/30">
      
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
              <ScanLine className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                GEMINI FORENSICS
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-[10px] text-cyan-400 border border-cyan-500/20 font-mono">BETA</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Universal AI Media Detector</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
             <div className="flex items-center gap-1">
                <Binary className="w-4 h-4" />
                <span className="font-mono">v2.5.0</span>
             </div>
             <div className="flex items-center gap-1">
                <Lock className="w-4 h-4" />
                <span className="font-mono">SECURE</span>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        
        {state === AppState.IDLE && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in space-y-8">
            <div className="text-center space-y-4 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Verify Authenticity in Seconds.
              </h2>
              <p className="text-lg text-slate-400">
                Using Google's advanced Gemini Vision API, detect synthetic patterns, deepfakes, and AI-generated anomalies in images and videos.
              </p>
            </div>
            <UploadZone onFileSelected={handleFileSelected} isLoading={false} />
          </div>
        )}

        {state === AppState.ANALYZING && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
            <div className="relative w-64 h-64 rounded-full border-4 border-slate-800 flex items-center justify-center overflow-hidden bg-slate-900">
              {/* Scanning Effect */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent w-full h-full animate-scan z-10"></div>
              <div className="absolute inset-0 border-t-2 border-cyan-400/50 animate-scan z-10"></div>
              
              {currentMedia?.previewUrl && (
                currentMedia.type === MediaType.VIDEO ? (
                  <video src={currentMedia.previewUrl} className="w-full h-full object-cover opacity-50 grayscale" muted />
                ) : (
                  <img src={currentMedia.previewUrl} alt="scanning" className="w-full h-full object-cover opacity-50 grayscale" />
                )
              )}
              
              <div className="absolute z-20 bg-black/80 px-4 py-2 rounded-full border border-cyan-500/30 backdrop-blur-md">
                <span className="text-cyan-400 font-mono animate-pulse">ANALYZING PIXELS...</span>
              </div>
            </div>
            <p className="text-slate-400 text-center max-w-md">
              Extracting features and checking against generative models...<br/>
              <span className="text-xs text-slate-500 font-mono">Powered by Gemini 2.5 Flash</span>
            </p>
          </div>
        )}

        {state === AppState.RESULT && analysisResult && currentMedia && (
          <ResultsView 
            result={analysisResult} 
            mediaPreview={currentMedia.previewUrl} 
            mediaType={currentMedia.type}
            reset={resetApp}
          />
        )}

        {state === AppState.ERROR && (
           <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
              <div className="p-4 rounded-full bg-red-500/10 border border-red-500/30 text-red-500">
                <Lock className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-bold text-white">Analysis Failed</h3>
              <p className="text-slate-400">{errorMessage}</p>
              <button 
                onClick={resetApp}
                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white transition-colors"
              >
                Try Again
              </button>
           </div>
        )}

      </main>
      
      {/* Decorative Background Grid */}
      <div className="fixed inset-0 pointer-events-none z-[-1]" style={{
        backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }}></div>
    </div>
  );
};

export default App;
