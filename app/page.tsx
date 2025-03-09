'use client';

import { useState, useEffect } from 'react';
import { extractVideoId } from '@/app/utils/youtube';
import ThemeToggle from './components/ThemeToggle';

type AnalysisState = {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  videoId: string | null;
};

export default function Home() {
  const [url, setUrl] = useState('');
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isLoading: false,
    error: null,
    result: null,
    videoId: null
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setAnalysis(prev => ({ ...prev, error: 'Please enter a YouTube URL' }));
      return;
    }

    try {
      setAnalysis(prev => ({ ...prev, isLoading: true, error: null }));
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze video');
      }

      const data = await response.json();
      const videoId = extractVideoId(url);
      setAnalysis(prev => ({ 
        ...prev, 
        result: data.analysis, 
        isLoading: false,
        videoId: videoId
      }));
    } catch (error) {
      setAnalysis(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'An error occurred',
        isLoading: false
      }));
    }
  };

  const handleReset = () => {
    setUrl('');
    setAnalysis({ isLoading: false, error: null, result: null, videoId: null });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-800 dark:text-gray-200">Video Summary AI</h2>
          <ThemeToggle />
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            Video Summary AI
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            Get an instant AI-powered summary of any YouTube video
          </p>
        </div>

        {!analysis.result && (
          <form onSubmit={handleSubmit} className="space-y-6 transition-all duration-300 ease-in-out">
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-6 h-6" fill="red" viewBox="0 0 24 24">
                  <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                </svg>
              </div>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Paste YouTube URL here"
                className="w-full pl-14 pr-12 py-5 text-lg font-medium rounded-xl border border-gray-200 dark:border-gray-700
                  focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200 
                  shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-gray-50 dark:bg-gray-800 focus:bg-white dark:focus:bg-gray-900 text-gray-800 dark:text-gray-200"
                disabled={analysis.isLoading}
              />
              {url && (
                <button
                  type="button"
                  onClick={() => setUrl('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={analysis.isLoading}
                className="px-8 py-4 text-lg font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {analysis.isLoading ? 'Analyzing...' : 'Generate Summary'}
              </button>
            </div>
          </form>
        )}

        {analysis.isLoading && (
          <div className="text-center py-16 transition-all duration-300 ease-in-out">
            <div className="w-16 h-16 border-4 border-blue-100 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin mx-auto"></div>
            <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 font-light">Analyzing video content...</p>
          </div>
        )}

        {analysis.error && (
          <div className="max-w-2xl mx-auto mt-8 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 rounded-xl p-6 shadow-sm">
            <p className="text-red-600 dark:text-red-400 text-center">{analysis.error}</p>
          </div>
        )}

        {analysis.result && (
          <div className="mt-8 transition-all duration-300 ease-in-out">
            {analysis.videoId && (
              <div className="mb-8 rounded-xl overflow-hidden shadow-md">
                <iframe 
                  className="w-full aspect-video" 
                  src={`https://www.youtube.com/embed/${analysis.videoId}`} 
                  title="YouTube video player" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-8 md:p-10 shadow-lg max-w-4xl mx-auto">
              {/* Blog header section */}
              <div className="mb-10 pb-6 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(analysis.result || '')
                          .then(() => alert('Analysis copied to clipboard!'))
                          .catch(() => alert('Failed to copy'));
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors border border-blue-100 dark:border-blue-800 shadow-sm"
                      title="Copy to clipboard"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                      </svg>
                      <span className="text-sm font-medium">Copy</span>
                    </button>
                  </div>
                  <div className="ml-auto flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span>{Math.ceil(analysis.result.length / 1500)} min read</span>
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">Video Analysis Summary</h1>
              </div>
              
              <div className="prose max-w-none space-y-6 text-gray-800 dark:text-gray-300 leading-relaxed">
                {analysis.result.split('\n').map((line, index) => {
                  // Handle headings (lines starting with # or ##)
                  if (line.trim().startsWith('# ')) {
                    return (
                      <h1 key={index} className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-10 mb-6 tracking-tight">
                        {line.trim().substring(2)}
                      </h1>
                    );
                  }
                  
                  if (line.trim().startsWith('## ')) {
                    return (
                      <h2 key={index} className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-4 tracking-tight">
                        {line.trim().substring(3)}
                      </h2>
                    );
                  }

                  // Handle numbered points (lines starting with a number followed by a dot or space)
                  const numberedPointMatch = line.trim().match(/^(\d+)[.\s]\s*(.+)$/);
                  if (numberedPointMatch) {
                    const [_, number, content] = numberedPointMatch;
                    return (
                      <div key={index} className="flex items-start gap-4 my-5 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center border border-blue-100 dark:border-blue-800 shadow-sm">
                          <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{number}</span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-0.5 font-medium">{content}</p>
                      </div>
                    );
                  }
                  
                  // Handle bullet points (lines starting with *) - without bullet visualization
                  if (line.trim().startsWith('*')) {
                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed pl-5 my-4 flex items-center before:content-['•'] before:text-blue-500 dark:before:text-blue-400 before:mr-3 before:text-lg">
                        {line.trim().substring(1).trim()}
                      </p>
                    );
                  }

                  // Handle bold text (text between *)
                  const boldPattern = /\*(.*?)\*/g;
                  if (boldPattern.test(line)) {
                    // Replace *text* with properly styled bold text
                    const formattedText = line.replace(boldPattern, (match, text) => {
                      return `<strong class="font-semibold text-gray-900 dark:text-gray-100">${text}</strong>`;
                    });
                    
                    return (
                      <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg"
                         dangerouslySetInnerHTML={{ __html: formattedText }}>
                      </p>
                    );
                  }

                  // Handle horizontal rule
                  if (line.trim() === '---') {
                    return <hr key={index} className="my-8 border-t-2 border-gray-100 dark:border-gray-700 max-w-md mx-auto" />;
                  }

                  // Handle blockquotes
                  if (line.trim().startsWith('> ')) {
                    return (
                      <blockquote key={index} className="pl-5 border-l-4 border-blue-300 dark:border-blue-500 italic text-gray-600 dark:text-gray-400 my-6 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg pr-4">
                        {line.trim().substring(2)}
                      </blockquote>
                    );
                  }

                  // Skip empty lines but add proper spacing
                  if (line.trim() === '') {
                    return <div key={index} className="h-5"></div>;
                  }

                  // Regular text with improved typography
                  return (
                    <p key={index} className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                      {line}
                    </p>
                  );
                })}
              </div>
              
              {/* Blog footer section */}
              <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex justify-end items-center">

                  <button
                    onClick={handleReset}
                    className="px-6 py-3 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm"
                  >
                    Analyze Another Video
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
