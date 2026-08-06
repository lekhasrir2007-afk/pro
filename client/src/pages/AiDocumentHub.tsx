import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Sparkles, Send, Clock, Copy, Check, Loader2, AlertCircle, Bot, Search } from 'lucide-react';

interface AiQueryHistory {
  id: string;
  prompt: string;
  response: string;
  model: string;
  createdAt: string;
}

export const AiDocumentHub: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [documentContext, setDocumentContext] = useState('');
  const [activeTab, setActiveTab] = useState<'prompt' | 'document'>('document');
  const [isGenerating, setIsGenerating] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<AiQueryHistory[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/ai/history');
      setHistory(res.data.history || []);
    } catch (err) {
      console.warn('Could not load AI history');
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() && activeTab === 'prompt') return;
    if (!documentContext.trim() && activeTab === 'document') return;

    setIsGenerating(true);
    setError(null);
    setResponse(null);

    try {
      if (activeTab === 'prompt') {
        const res = await api.post('/ai/generate', { prompt });
        setResponse(res.data.response);
      } else {
        const res = await api.post('/ai/analyze-doc', {
          documentText: documentContext,
          instruction: prompt.trim() || 'Analyze this research document and answer key questions.',
        });
        setResponse(res.data.analysis);
      }
      fetchHistory();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to communicate with AI server.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 px-4 py-8 sm:px-6 lg:px-8 text-slate-100">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 border-b border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 text-xs font-semibold text-purple-300">
              <Search className="h-3.5 w-3.5" />
              <span>Research Help Agent</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">Document QA & Research Studio</h1>
            <p className="text-xs sm:text-sm text-slate-400">
              Submit document text or ask research questions to receive structured answers powered by Google Gemini AI.
            </p>
          </div>

          <div className="flex items-center space-x-2 rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('document')}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                activeTab === 'document'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Document QA & Analysis
            </button>
            <button
              onClick={() => setActiveTab('prompt')}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                activeTab === 'prompt'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Direct AI Query
            </button>
          </div>
        </div>

        {/* Main Grid: Input & Output */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleGenerate} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
              {activeTab === 'document' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Content / Research Text</label>
                  <textarea
                    rows={6}
                    value={documentContext}
                    onChange={(e) => setDocumentContext(e.target.value)}
                    placeholder="Paste full research text, paper excerpt, or document content here..."
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {activeTab === 'document' ? 'Research Question / Instruction' : 'Research Query / Prompt'}
                </label>
                <textarea
                  rows={4}
                  required={activeTab === 'prompt'}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    activeTab === 'document'
                      ? 'E.g., What are the key findings? What methodology was used? Summarize the main arguments...'
                      : 'Ask the Research Help Agent any question...'
                  }
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3.5 text-xs text-slate-200 placeholder-slate-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Bot className="h-3.5 w-3.5 text-purple-400" />
                  <span>Research Agent: gemini-2.5-flash</span>
                </span>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-600/30"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Analyzing Document...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Question</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Error Message */}
            {error && (
              <div className="flex items-center space-x-2 rounded-xl bg-rose-500/10 border border-rose-500/20 p-4 text-xs text-rose-300">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Output Box */}
            {response && (
              <div className="rounded-2xl border border-purple-500/30 bg-slate-900/90 p-6 shadow-2xl relative">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center space-x-2 text-xs font-bold text-purple-300">
                    <Sparkles className="h-4 w-4 text-purple-400" />
                    <span>Research Agent Answer</span>
                  </div>
                  <button
                    onClick={() => handleCopy(response)}
                    className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-mono">
                  {response}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Research Query History */}
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-lg font-bold text-slate-100 flex items-center space-x-2">
              <Clock className="h-5 w-5 text-purple-400" />
              <span>Research Query History</span>
            </h2>

            <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 max-h-[600px] overflow-y-auto">
              {loadingHistory ? (
                <div className="p-6 text-center text-xs text-slate-500">Loading history...</div>
              ) : history.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500">
                  No previous research queries. Submit a document to view AI answers.
                </div>
              ) : (
                <div className="divide-y divide-slate-800/80">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => {
                        setPrompt(item.prompt);
                        setResponse(item.response);
                      }}
                      className="p-4 hover:bg-slate-800/50 cursor-pointer transition-colors space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span className="font-semibold text-purple-400">{item.model}</span>
                        <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-xs font-medium text-slate-200 line-clamp-1">"{item.prompt}"</p>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{item.response}</p>
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

export default AiDocumentHub;
