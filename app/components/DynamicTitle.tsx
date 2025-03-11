'use client';

import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { env } from 'process';

export default function DynamicTitle() {
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // Get the site name from environment variable or use default
    const siteName = env.SITE_NAME || 'Video Summary AI';
    
    // Update document title based on current language
    document.title = t('app.title');
  }, [t, language]);

  // This component doesn't render anything visible
  return null;
}