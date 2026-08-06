import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileUploadDropzone } from '../components/FileUploadDropzone';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { Sparkles, FileText, Database, ShieldCheck, Trash2, ArrowUpRight, Cpu, Layers } from 'lucide-react';

interface UploadedFileItem {
  id: string;
  originalName: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<UploadedFileItem[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);

  const fetchFiles = async () => {
    try {
      const response = await api.get('/files');
      setFiles(response.data.files || []);
    } catch (err) {
      console.warn('Could not load user files');
    } finally {
      setLoadingFiles(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleDeleteFile = async (id: string) => {
    try {
      await api.delete(`/files/${id}`);
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      alert('Failed to delete file');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome Header */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 p-6 sm:p-10 shadow-2xl">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>JWT Authenticated Session</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
              Welcome back, {user?.name || 'Developer'}!
            </h1>
            <p className="text-sm text-slate-300">
              Your production full-stack environment is operational. Express API server, Prisma PostgreSQL database, and backend-secured Google Gemini AI are connected.
            </p>
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20">
            <Cpu className="h-64 w-64 text-indigo-400" />
          </div>
        </div>

        {/* Feature Overview Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: AI Playground */}
          <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-purple-500/40 hover:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <Link to="/ai-hub" className="text-slate-400 hover:text-purple-400">
                <ArrowUpRight className="h-5 w-5" />
              </Link>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-100">AI Document Hub</h3>
            <p className="mt-2 text-xs text-slate-400">
              Interact with Google Gemini API to analyze files, generate structured text, and run AI prompts safely.
            </p>
            <Link
              to="/ai-hub"
              className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              <span>Launch Playground</span>
              <span>&rarr;</span>
            </Link>
          </div>

          {/* Card 2: Multer File Storage */}
          <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-indigo-500/40 hover:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full">
                {files.length} Files
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-100">File Storage</h3>
            <p className="mt-2 text-xs text-slate-400">
              Upload local documents via Multer middleware with size validation and Prisma DB metadata mapping.
            </p>
          </div>

          {/* Card 3: Prisma & PostgreSQL */}
          <div className="group relative rounded-2xl border border-slate-800 bg-slate-900/60 p-6 transition-all hover:border-emerald-500/40 hover:bg-slate-900">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                Prisma ORM
              </span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-100">PostgreSQL Relational DB</h3>
            <p className="mt-2 text-xs text-slate-400">
              Schema models for Users, UploadedFiles, and AiQueries configured with relational integrity.
            </p>
          </div>
        </div>

        {/* File Upload Section & Recent Files */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* File Upload Dropzone */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              <span>Quick Upload</span>
            </h2>
            <FileUploadDropzone onUploadSuccess={() => fetchFiles()} />
          </div>

          {/* Files List Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-100">Your Uploaded Files</h2>
              <button
                onClick={fetchFiles}
                className="text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
              >
                Refresh List
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
              {loadingFiles ? (
                <div className="p-8 text-center text-xs text-slate-400">Loading files...</div>
              ) : files.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No files uploaded yet. Drag & drop a file in the uploader to get started.
                </div>
              ) : (
                <div className="divide-y divide-slate-800">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-4 hover:bg-slate-800/40 transition-colors">
                      <div className="flex items-center space-x-3 truncate">
                        <FileText className="h-5 w-5 text-indigo-400 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-slate-200 truncate">{file.originalName}</p>
                          <p className="text-[10px] text-slate-400">
                            {(file.size / 1024).toFixed(1)} KB • {new Date(file.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
