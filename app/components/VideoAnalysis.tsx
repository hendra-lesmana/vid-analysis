'use client';

import { useState } from 'react';
import AnalysisSkeleton from './AnalysisSkeleton';
import { useLanguage } from '../context/LanguageContext';

interface AnalysisData {
  topic: string;
  keyPoints: string[];
  summary: string;
}

interface VideoAnalysisProps {
  result: any;
  isLoading?: boolean;
}

export default function VideoAnalysis({ result, isLoading = false }: VideoAnalysisProps) {
  const { t } = useLanguage();
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Add state to track if this is the first render
  const [isFirstRender, setIsFirstRender] = useState(true);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ result }),
      });

      if (!response.ok) {
        throw new Error('Failed to save analysis');
      }

      setSaveStatus('success');
    } catch (error) {
      console.error('Error saving analysis:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Parse the result data safely
  const parseAnalysisData = (): { data: AnalysisData | null, error: boolean, errorDetails?: string } => {
    try {
      // If this is the first render, set it to false for subsequent renders
      if (isFirstRender) {
        setIsFirstRender(false);
        return { 
          data: null, 
          error: true, 
          errorDetails: 'First render - waiting for data' 
        };
      }

      // Handle different response formats
      let analysisData;
      
      if (typeof result === 'string') {
        try {
          // First, try to parse directly
          analysisData = JSON.parse(result);
        } catch (initialError) {
          // If direct parsing fails, try to clean and parse
          let cleanResult = result.trim();
          
          // Remove markdown code block markers
          cleanResult = cleanResult.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '');
          
          // Fix common JSON syntax issues
          cleanResult = cleanResult
            .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":') // Ensure property names are quoted
            .replace(/:\s*'([^']*)'\s*([,}])/g, ':"$1"$2') // Convert single quotes to double quotes
            .replace(/([\[,]\s*)'([^']*)'\s*([,\]])/g, '$1"$2"$3') // Convert single quotes in arrays
            .replace(/\\(?!["\\bfnrt\/])/g, '\\\\') // Double escape backslashes
            .replace(/[\u0000-\u001F]/g, '') // Remove control characters
            .replace(/\\'/g, "'") // Replace escaped single quotes
            .replace(/\\\\n/g, '\\n') // Fix double escaped newlines
            .replace(/\\\\r/g, '\\r') // Fix double escaped carriage returns
            .replace(/\\\\t/g, '\\t') // Fix double escaped tabs
            .replace(/,\s*([}\]])/g, '$1'); // Remove trailing commas
          
          try {
            analysisData = JSON.parse(cleanResult);
          } catch (parseError) {
            console.error('JSON parsing error after cleaning:', parseError);
            return { 
              data: null, 
              error: true, 
              errorDetails: `Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}` 
            };
          }
        }
      } else if (result && typeof result === 'object') {
        analysisData = result.analysis || result;
      } else {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Invalid response format' 
        };
      }
      
      // Validate the required fields
      if (!analysisData || typeof analysisData !== 'object') {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Analysis data is not an object' 
        };
      }
      
      if (!analysisData.topic || typeof analysisData.topic !== 'string') {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Missing or invalid field: topic' 
        };
      }
      
      if (!analysisData.keyPoints || !Array.isArray(analysisData.keyPoints)) {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Missing or invalid field: keyPoints (should be an array)' 
        };
      }
      
      if (!analysisData.summary || typeof analysisData.summary !== 'string') {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Missing or invalid field: summary' 
        };
      }
      
      return { data: analysisData as AnalysisData, error: false };
    } catch (error) {
      console.error('Error parsing analysis data:', error);
      return { 
        data: null, 
        error: true, 
        errorDetails: error instanceof Error ? error.message : 'Unknown parsing error' 
      };
    }
  };

  const { data: analysisData, error: parseError, errorDetails } = parseAnalysisData();

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex justify-center items-center w-full mt-8 mb-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-md text-white transition-colors mx-auto ${
            isSaving
              ? 'bg-gray-400 cursor-not-allowed'
              : saveStatus === 'success'
              ? 'bg-green-500 hover:bg-green-600'
              : saveStatus === 'error'
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSaving ? (
            t('analysis.button.saving')
          ) : saveStatus === 'success' ? (
            t('analysis.button.saved')
          ) : saveStatus === 'error' ? (
            t('analysis.button.error')
          ) : (
            t('analysis.button.save')
          )}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full">
        {isLoading ? (
          <AnalysisSkeleton />
        ) : parseError ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">{t('analysis.error.title')}</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{t('analysis.error.description')}</p>
            {errorDetails && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <p className="text-red-700 dark:text-red-400 font-medium">{t('analysis.error.details')} {errorDetails}</p>
              </div>
            )}
            <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-900 p-4 rounded-md overflow-auto max-h-96 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
              {typeof result === 'string' ? result : JSON.stringify(result, null, 2)}
            </pre>
          </div>
        ) : analysisData ? (
          <div className="space-y-8">
            {/* Topic Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('analysis.topic.title')}</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">{analysisData.topic}</p>
            </div>

            {/* Key Points Section */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('analysis.keyPoints.title')}</h3>
              <ul className="space-y-3">
                {analysisData.keyPoints.map((point: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-medium text-sm mr-3 mt-0.5">{index + 1}</span>
                    <span className="text-gray-700 dark:text-gray-300">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Summary Section */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('analysis.summary.title')}</h3>
              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {analysisData.summary}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">{t('analysis.noData')}</p>
          </div>
        )}
      </div>
    </div>
  );  
}