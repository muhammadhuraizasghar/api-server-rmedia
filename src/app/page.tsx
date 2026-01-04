'use client';

import { useState } from 'react';
import { Search, List, Shield, Download, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState('mp3');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<{ [key: string]: number }>({});
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const downloadFile = async (fileUrl: string, fileName: string, id: string) => {
    try {
      setDownloading(prev => ({ ...prev, [id]: 0 }));
      
      // Use our server-side proxy to avoid CORS and force download
      const proxyUrl = `/api/v1/download?url=${encodeURIComponent(fileUrl)}&filename=${encodeURIComponent(fileName)}`;
      const response = await fetch(proxyUrl);
      if (!response.body) throw new Error('ReadableStream not supported');

      const contentLength = response.headers.get('content-length');
      const total = contentLength ? parseInt(contentLength, 10) : 0;
      let loaded = 0;

      const reader = response.body.getReader();
      const chunks = [];

      while(true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        loaded += value.length;
        
        if (total > 0) {
          const progress = Math.round((loaded / total) * 100);
          setDownloading(prev => ({ ...prev, [id]: progress }));
        } else {
          // If no content-length, just show activity
          setDownloading(prev => ({ ...prev, [id]: -1 }));
        }
      }

      const blob = new Blob(chunks);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      // Clear progress after success
      setTimeout(() => {
        setDownloading(prev => {
          const newState = { ...prev };
          delete newState[id];
          return newState;
        });
      }, 2000);

    } catch (err) {
      console.error('Download failed:', err);
      window.open(fileUrl, '_blank');
      setDownloading(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

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
          'x-api-key': 'default-secret-key', // Dashboard internal key
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Target Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                >
                  <optgroup label="Popular Audio">
                    <option value="mp3">MP3 - Standard Audio</option>
                    <option value="m4a">M4A - Apple Audio</option>
                    <option value="wav">WAV - High Quality</option>
                    <option value="aac">AAC - Advanced Audio</option>
                    <option value="flac">FLAC - Lossless</option>
                  </optgroup>
                  <optgroup label="Professional Audio">
                    <option value="ogg">OGG Vorbis</option>
                    <option value="opus">Opus Audio</option>
                    <option value="wma">Windows Media Audio</option>
                    <option value="aiff">AIFF - Studio Quality</option>
                    <option value="amr">AMR - Voice Record</option>
                  </optgroup>
                  <optgroup label="Popular Video">
                    <option value="mp4">MP4 - 720p HD</option>
                    <option value="mp4-1080">MP4 - 1080p Full HD</option>
                    <option value="mp4-2k">MP4 - 2K Quality</option>
                    <option value="mp4-4k">MP4 - 4K Ultra HD</option>
                    <option value="webm">WebM - High Quality</option>
                  </optgroup>
                  <optgroup label="Professional Video">
                    <option value="mkv">MKV - Matroska Video</option>
                    <option value="mov">MOV - QuickTime</option>
                    <option value="avi">AVI - Standard Video</option>
                    <option value="flv">FLV - Flash Video</option>
                    <option value="wmv">WMV - Windows Media</option>
                    <option value="3gp">3GP - Mobile Video</option>
                  </optgroup>
                  <optgroup label="Images & Graphics">
                    <option value="jpg">JPG - Standard Image</option>
                    <option value="png">PNG - Transparent</option>
                    <option value="gif">GIF - Animated</option>
                    <option value="webp">WebP - Modern Image</option>
                    <option value="bmp">BMP - Bitmap</option>
                    <option value="tiff">TIFF - Pro Image</option>
                    <option value="svg">SVG - Vector</option>
                    <option value="ico">ICO - Icon File</option>
                  </optgroup>
                  <optgroup label="Documents & Data">
                    <option value="pdf">PDF - Document</option>
                    <option value="txt">TXT - Plain Text</option>
                    <option value="docx">DOCX - MS Word</option>
                    <option value="doc">DOC - Legacy Word</option>
                    <option value="xlsx">XLSX - MS Excel</option>
                    <option value="xls">XLS - Legacy Excel</option>
                    <option value="pptx">PPTX - Powerpoint</option>
                    <option value="ppt">PPT - Legacy Powerpoint</option>
                    <option value="csv">CSV - Data File</option>
                    <option value="json">JSON - API Data</option>
                    <option value="xml">XML - Structured Data</option>
                    <option value="epub">EPUB - Ebook</option>
                    <option value="rtf">RTF - Rich Text</option>
                    <option value="odt">ODT - OpenDoc Text</option>
                    <option value="ods">ODS - OpenDoc Sheet</option>
                  </optgroup>
                  <optgroup label="Archives">
                    <option value="zip">ZIP - Compressed</option>
                    <option value="rar">RAR - Archive</option>
                    <option value="7z">7Z - 7-Zip Archive</option>
                    <option value="tar">TAR - Unix Tape</option>
                    <option value="gz">GZ - Gzip</option>
                    <option value="bz2">BZ2 - Bzip2</option>
                    <option value="xz">XZ - XZ Archive</option>
                    <option value="iso">ISO - Disc Image</option>
                  </optgroup>
                  <optgroup label="Coding & Web">
                    <option value="html">HTML - Web Page</option>
                    <option value="css">CSS - Stylesheet</option>
                    <option value="js">JS - Javascript</option>
                    <option value="ts">TS - Typescript</option>
                    <option value="py">PY - Python</option>
                    <option value="java">Java Source</option>
                    <option value="cpp">C++ Source</option>
                    <option value="php">PHP Script</option>
                    <option value="sql">SQL Database</option>
                    <option value="yaml">YAML Config</option>
                    <option value="md">MD - Markdown</option>
                  </optgroup>
                  <optgroup label="Pro Formats">
                    <option value="mxf">MXF - Broadcast</option>
                    <option value="dpx">DPX - Digital Picture</option>
                    <option value="exr">EXR - OpenEXR</option>
                    <option value="tga">TGA - Targa</option>
                    <option value="dds">DDS - DirectDraw</option>
                    <option value="psd">PSD - Photoshop</option>
                    <option value="ai">AI - Illustrator</option>
                    <option value="eps">EPS - PostScript</option>
                  </optgroup>
                </select>
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
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-md border border-green-500/30 font-bold uppercase tracking-widest">
                      Perfect Media
                    </span>
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/30 font-semibold">
                      {result.platform.toUpperCase()}
                    </span>
                  </div>
                </div>
                <pre className="text-xs font-mono text-slate-300 overflow-x-auto p-4 bg-black/30 rounded-xl mb-6">
                  {JSON.stringify(result, null, 2)}
                </pre>

                <div className="space-y-3">
                  {result.results.map((media: any, index: number) => {
                    const progress = downloading[index.toString()];
                    const isDownloading = progress !== undefined;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <button
                          disabled={isDownloading}
                          onClick={() => downloadFile(media.url, `${media.title || 'media'}.${media.format}`, index.toString())}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all group relative overflow-hidden ${
                            isDownloading 
                            ? 'bg-blue-500/5 border-blue-500/20 cursor-wait' 
                            : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'
                          }`}
                        >
                          {/* Progress Background */}
                          {isDownloading && progress > 0 && (
                            <div 
                              className="absolute inset-0 bg-blue-500/10 transition-all duration-300" 
                              style={{ width: `${progress}%` }}
                            />
                          )}

                          <div className="flex items-center space-x-3 relative z-10">
                            <div className={`p-2 rounded-lg ${isDownloading ? 'bg-blue-400 animate-pulse' : 'bg-blue-500'}`}>
                              <Download size={18} className="text-white" />
                            </div>
                            <div className="text-left">
                              <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                                {isDownloading ? 'Downloading...' : `Download ${media.type.toUpperCase()}`}
                              </p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-wider">
                                Format: {media.format}
                              </p>
                            </div>
                          </div>
                          <div className="text-xs font-mono text-blue-400 relative z-10">
                            {isDownloading 
                              ? (progress === -1 ? 'PROCESSING...' : `${progress}%`) 
                              : 'CLICK TO SAVE'
                            }
                          </div>
                        </button>
                        
                        {isDownloading && (
                          <div className="w-full bg-slate-800 rounded-full h-1 overflow-hidden">
                            <div 
                              className={`h-full bg-blue-500 transition-all duration-300 ${progress === -1 ? 'animate-shimmer w-full' : ''}`}
                              style={{ width: progress === -1 ? '100%' : `${progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
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
