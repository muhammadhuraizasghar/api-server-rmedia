'use client';

import { useState } from 'react';
import { Search, List, Shield, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp3');
  const [apiKey, setApiKey] = useState('default-secret-key');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/v1/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ url, format }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Something went wrong');
      
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Power-API <span className="text-blue-600">Media Hub</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Extract and convert media from LinkedIn, YouTube, Instagram, and 100+ formats with our secure API.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Secure API</h3>
            <p className="text-sm text-slate-500">Built-in API key validation and IP logging for every request.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mb-4">
              <Download size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">100+ Formats</h3>
            <p className="text-sm text-slate-500">Convert to MP3, OGG, FLAC, PDF, and dozens of other formats.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
              <List size={24} />
            </div>
            <h3 className="font-bold text-slate-900 mb-2">Multiple Platforms</h3>
            <p className="text-sm text-slate-500">Supports LinkedIn, YouTube, TikTok, Snapchat, and Instagram.</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleConvert} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="Enter your API Key"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Target Format</label>
                  <select
                    value={format}
                    onChange={(e) => setFormat(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="mp3">MP3 Audio</option>
                    <option value="ogg">OGG Audio</option>
                    <option value="flac">FLAC Audio</option>
                    <option value="mp4">MP4 Video</option>
                    <option value="pdf">PDF Document</option>
                    <option value="jpg">JPG Image</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Media URL</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Search size={20} />
                  </div>
                  <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-inner bg-slate-50"
                    placeholder="Paste link from LinkedIn, YT, Instagram..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98] disabled:opacity-70 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Process Request</span>
                    <CheckCircle2 size={20} />
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start space-x-3 text-red-600 animate-in fade-in slide-in-from-top-4 duration-300">
                <AlertCircle size={20} className="shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 p-6 bg-slate-900 rounded-2xl text-white overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold flex items-center space-x-2">
                    <CheckCircle2 className="text-green-400" size={20} />
                    <span>Extraction Successful</span>
                  </h3>
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30">
                    {result.platform.toUpperCase()}
                  </span>
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-black/30 rounded-xl">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>Powered by Next.js & Vercel • Secure API Architecture</p>
        </footer>
      </div>
    </main>
  );
}
