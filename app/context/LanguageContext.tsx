'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'id';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation dictionaries
const translations = {
  en: {
    // Page content
    'app.title': 'Video Summary AI',
    'app.description': 'Get an instant AI-powered summary of any YouTube video',
    'app.input.placeholder': 'Paste YouTube URL here',
    'app.button.analyze': 'Analyze Video',
    'app.button.analyzing': 'Analyzing...',
    'app.error.url': 'Please enter a YouTube URL',
    'app.error.analysis': 'Failed to analyze video',
    
    // VideoAnalysis component
    'analysis.button.save': 'Save Analysis',
    'analysis.button.saving': 'Saving...',
    'analysis.button.saved': 'Saved!',
    'analysis.button.error': 'Error - Try Again',
    'analysis.title': 'Analysis Result',
    'analysis.topic.title': 'Topic',
    'analysis.keyPoints.title': 'Key Points',
    'analysis.summary.title': 'Summary',
    'analysis.error.title': 'Unable to Parse Analysis',
    'analysis.error.description': 'The analysis data couldn\'t be properly parsed. Here\'s the raw response:',
    'analysis.error.details': 'Error details:',
    'analysis.noData': 'No analysis data available',
    
    // Language toggle
    'language.en': 'English',
    'language.id': 'Indonesian'
  },
  id: {
    // Page content
    'app.title': 'AI Ringkasan Video',
    'app.description': 'Dapatkan ringkasan instan dari video YouTube dengan bantuan AI',
    'app.input.placeholder': 'Tempel URL YouTube di sini',
    'app.button.analyze': 'Analisis Video',
    'app.button.analyzing': 'Menganalisis...',
    'app.error.url': 'Silakan masukkan URL YouTube',
    'app.error.analysis': 'Gagal menganalisis video',
    
    // VideoAnalysis component
    'analysis.button.save': 'Simpan Analisis',
    'analysis.button.saving': 'Menyimpan...',
    'analysis.button.saved': 'Tersimpan!',
    'analysis.button.error': 'Error - Coba Lagi',
    'analysis.title': 'Hasil Analisis',
    'analysis.topic.title': 'Topik',
    'analysis.keyPoints.title': 'Poin Utama',
    'analysis.summary.title': 'Ringkasan',
    'analysis.error.title': 'Tidak Dapat Mengurai Analisis',
    'analysis.error.description': 'Data analisis tidak dapat diurai dengan benar. Berikut respons mentahnya:',
    'analysis.error.details': 'Detail error:',
    'analysis.noData': 'Tidak ada data analisis tersedia',
    
    // Language toggle
    'language.en': 'Bahasa Inggris',
    'language.id': 'Bahasa Indonesia'
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Initialize with Indonesian as default language
  const [language, setLanguage] = useState<Language>('id');

  useEffect(() => {
    // Check if language is stored in localStorage
    const storedLanguage = localStorage.getItem('language') as Language | null;
    
    if (storedLanguage && (storedLanguage === 'en' || storedLanguage === 'id')) {
      setLanguage(storedLanguage);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage when language changes
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prevLanguage => prevLanguage === 'en' ? 'id' : 'en');
  };

  // Translation function
  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}