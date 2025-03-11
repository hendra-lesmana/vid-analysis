'use client';

import { useState, useEffect } from 'react';
import { extractVideoId } from '@/app/utils/youtube';
import ThemeToggle from './components/ThemeToggle';
import LanguageToggle from './components/LanguageToggle';
import SaveButton from './components/SaveButton';
import VideoAnalysis from './components/VideoAnalysis';
import DynamicTitle from './components/DynamicTitle';
import { useLanguage } from './context/LanguageContext';

type AnalysisState = {
  isLoading: boolean;
  error: string | null;
  result: string | null;
  videoId: string | null;
};

export default function Home() {
  const { t } = useLanguage();
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
      setAnalysis(prev => ({ ...prev, error: t('app.error.url') }));
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
        throw new Error(t('app.error.analysis'));
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

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <DynamicTitle />
      <header className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex gap-2">
            <ThemeToggle />
            <LanguageToggle />
          </div>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-12 sm:py-16">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
            {t('app.title')}
          </h1>
          <div className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-light">
            {t('app.description')}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
            </div>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('app.input.placeholder')}
              className="w-full pl-14 pr-12 py-5 text-lg font-medium rounded-xl border border-gray-200 dark:border-gray-700
                focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all duration-200"
            />
          </div>
          <button
            type="submit"
            disabled={analysis.isLoading}
            className="mt-6 w-full px-8 py-4 text-lg font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {analysis.isLoading ? t('app.button.analyzing') : t('app.button.analyze')}
          </button>
        </form>

        {analysis.error && (
          <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-center">
            {analysis.error}
          </div>
        )}

        {analysis.result && analysis.videoId && (
          <div className="mt-12 space-y-8">
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${analysis.videoId}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="prose dark:prose-invert max-w-none">
              <h2 className="text-2xl font-bold mb-4">{t('analysis.title')}</h2>
              {/* Use VideoAnalysis component instead of raw JSON display */}
              <VideoAnalysis result={analysis.result} isLoading={analysis.isLoading} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
