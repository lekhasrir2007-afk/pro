import React, { useState, useRef } from 'react';
import { UploadCloud, File, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import api from '../services/api';

interface FileUploadDropzoneProps {
  onUploadSuccess?: (uploadedFile: any) => void;
}

export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({ onUploadSuccess }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setError(null);
    setSuccess(null);

    // Limit size 10MB
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 10MB.');
      return;
    }

    setFile(selectedFile);
  };

  const uploadSelectedFile = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess('File uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(response.data.file);
      }
      setFile(null);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 sm:p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
            : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-900/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept=".pdf,.doc,.docx,.txt,.md,.png,.jpg,.jpeg,.json"
        />

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 mb-3">
          <UploadCloud className="h-6 w-6" />
        </div>

        <p className="text-sm font-semibold text-slate-200">
          <span className="text-indigo-400">Click to upload</span> or drag and drop
        </p>
        <p className="mt-1 text-xs text-slate-400">PDF, DOCX, TXT, MD, Images (max 10MB)</p>
      </div>

      {/* Selected File Preview & Upload Action */}
      {file && (
        <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900 p-3">
          <div className="flex items-center space-x-3 truncate">
            <File className="h-5 w-5 text-indigo-400 shrink-0" />
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">{file.name}</p>
              <p className="text-[10px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                uploadSelectedFile();
              }}
              disabled={isUploading}
              className="flex items-center space-x-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <span>Upload</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Messages */}
      {error && (
        <div className="mt-3 flex items-center space-x-2 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mt-3 flex items-center space-x-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};
