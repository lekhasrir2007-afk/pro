import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axiosInstance';
import {
  Sparkles,
  Upload,
  FileText,
  X,
  LogOut,
  Send,
  Loader2,
  Bot,
  User,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!prompt.trim() && !file) {
      setError('Please provide a prompt message or upload a document to proceed.');
      return;
    }

    setError('');
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      if (prompt.trim()) formData.append('prompt', prompt);
      if (file) formData.append('file', file);

      const response = await axiosInstance.post('/ai/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = response.data.data;
      setAnalysisResult(data);

      // Append to history list
      setHistory((prev) => [
        {
          id: Date.now(),
          prompt: data.metadata.prompt,
          fileName: data.metadata.fileName,
          analysis: data.analysis,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
        ...prev,
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze content. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickPrompts = [
    'Analyze document key points and action items',
    'Summarize core findings into executive bullet points',
    'Evaluate potential security vulnerabilities or code issues',
    'Extract technical specifications and data metrics',
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-md shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">AI Intelligence Studio</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                Gemini Secured
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700/50 rounded-xl text-xs">
              <User className="w-4 h-4 text-indigo-400" />
              <span className="font-medium text-slate-200">{user?.name || user?.email}</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all border border-transparent hover:border-slate-700 flex items-center gap-1.5 text-xs font-medium"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form & Uploads (7 cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-indigo-900/30 via-slate-900/80 to-purple-900/20 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                Hello, {user?.name ? user.name.split(' ')[0] : 'Engineer'}! <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </h2>
              <p className="text-slate-300 text-sm mt-1">
                Upload technical documents, code files, or ask custom prompts. Direct AI requests are secured server-side.
              </p>
            </div>
          </div>

          {/* Prompt & File Analysis Form */}
          <form onSubmit={handleAnalyze} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>AI Analysis Request</span>
            </h3>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Text Prompt / Instructions
              </label>
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want Gemini to analyze or extract..."
                className="w-full p-4 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm resize-none"
              />
            </div>

            {/* Quick Prompt Chips */}
            <div>
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Quick Prompt Starters:
              </span>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(item)}
                    className="text-xs px-3 py-1.5 bg-slate-800/60 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/60 text-slate-300 hover:text-indigo-300 rounded-lg transition-all text-left"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Drag & Drop File Upload Area */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Attach Document / Image (Optional)
              </label>
              
              {!file ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950/40'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.csv,.json"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-indigo-400 hover:text-indigo-300">Click to upload</span> or drag and drop
                    </div>
                    <p className="text-xs text-slate-500">PDF, PNG, JPG, WEBP, TXT, MD, CSV, JSON (max 10MB)</p>
                  </label>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
                      <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isAnalyzing}
              className="py-3.5 px-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Server-Side AI Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Run AI Analysis</span>
                </>
              )}
            </button>
          </form>
        </section>

        {/* Right Column: AI Output Display & History (5 cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          {/* Active AI Output Box */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-xl min-h-[380px]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <h3 className="text-base font-semibold text-white">AI Analysis Output</h3>
              </div>
              {analysisResult && (
                <button
                  onClick={() => copyToClipboard(analysisResult.analysis)}
                  className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-all text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {isAnalyzing ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-3" />
                <p className="text-sm font-medium text-slate-200">Analyzing input payloads...</p>
                <p className="text-xs text-slate-500 mt-1">Communicating securely with Google Gemini via Node.js Express server</p>
              </div>
            ) : analysisResult ? (
              <div className="flex-1 flex flex-col gap-3">
                <div className="text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800/60">
                  <span className="font-semibold text-indigo-400">Target Prompt:</span> {analysisResult.metadata.prompt}
                  {analysisResult.metadata.fileName && (
                    <div className="mt-1 font-medium text-slate-300">
                      📎 Attachment: {analysisResult.metadata.fileName}
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 bg-slate-950/80 border border-slate-800 rounded-xl overflow-y-auto max-h-[420px] text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-mono">
                  {analysisResult.analysis}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
                <Bot className="w-12 h-12 text-slate-700 mb-3" />
                <p className="text-sm font-medium text-slate-400">No active analysis yet</p>
                <p className="text-xs text-slate-600 mt-1">Submit a prompt or document on the left panel to display structured Gemini outputs here.</p>
              </div>
            )}
          </div>

          {/* Analysis History Box */}
          {history.length > 0 && (
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4 shadow-xl">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Recent Analysis History ({history.length})</span>
              </h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setAnalysisResult({ analysis: item.analysis, metadata: { prompt: item.prompt, fileName: item.fileName } })}
                    className="p-3 bg-slate-950/60 hover:bg-slate-950 border border-slate-800/60 hover:border-indigo-500/40 rounded-xl cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div className="truncate max-w-[220px]">
                      <p className="font-medium text-slate-200 truncate">{item.prompt}</p>
                      {item.fileName && <p className="text-[10px] text-indigo-400 truncate">📎 {item.fileName}</p>}
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0">{item.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 py-4 text-center text-xs text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>AI Key Environment Encapsulation Verified</span>
          </div>
          <div>Vite + Express + PostgreSQL + Gemini AI</div>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
