import React, { useRef, useState } from 'react';
import { Upload, FileVideo, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { MediaType, MediaFile } from '../types';

interface UploadZoneProps {
  onFileSelected: (media: MediaFile) => void;
  isLoading: boolean;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelected, isLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = (file: File) => {
    setError(null);
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      setError("Unsupported file format. Please upload JPG, PNG, or MP4.");
      return;
    }

    if (file.size > 20 * 1024 * 1024) { // 20MB limit
       setError("File too large. Please upload files under 20MB.");
       return;
    }

    const mediaType = isImage ? MediaType.IMAGE : MediaType.VIDEO;
    const previewUrl = URL.createObjectURL(file);
    onFileSelected({ file, previewUrl, type: mediaType });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ease-in-out
        ${dragActive 
          ? 'border-cyan-400 bg-cyan-900/20 scale-[1.01]' 
          : 'border-slate-700 bg-slate-900/50 hover:border-cyan-500/50 hover:bg-slate-800/50'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*,video/*"
          onChange={handleChange}
        />
        
        <div className="p-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="p-4 rounded-full bg-slate-800 group-hover:bg-slate-700 transition-colors border border-slate-700 group-hover:border-slate-600">
             <Upload className="w-8 h-8 text-cyan-400" />
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">
              Upload Media for Analysis
            </h3>
            <p className="text-slate-400 text-sm">
              Drag & drop or click to browse
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 font-mono mt-4 border-t border-slate-800 pt-4 w-full justify-center">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              JPG/PNG
            </span>
            <span className="flex items-center gap-1">
              <FileVideo className="w-3 h-3" />
              MP4/WEBM
            </span>
            <span>Max 20MB</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadZone;
