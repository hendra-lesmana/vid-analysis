'use client';

import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface AnalysisData {
  topic: string;
  keyPoints: string[];
  summary: string;
}

interface VideoAnalysisProps {
  result: any;
}

export default function VideoAnalysis({ result }: VideoAnalysisProps) {
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
        // Return error on first render to show the error message
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Failed to extract valid JSON from response string' 
        };
      }

      // Handle different response formats
      let analysisData;
      
      if (typeof result === 'string') {
        try {
          // Try to parse as JSON string
          analysisData = JSON.parse(result);
        } catch (parseError) {
          console.error('Initial JSON parsing error:', parseError);
          // If it's not valid JSON, check if it might be a string that contains JSON
          const jsonMatch = result.match(/\{[\s\S]*\}/); // Find content between curly braces
          if (jsonMatch) {
            try {
              analysisData = JSON.parse(jsonMatch[0]);
            } catch (extractError) {
              console.error('JSON extraction error:', extractError);
              return { 
                data: null, 
                error: true, 
                errorDetails: `Failed to extract valid JSON from response string: ${extractError instanceof Error ? extractError.message : 'Invalid JSON format'}` 
              };
            }
          } else {
            return { 
              data: null, 
              error: true, 
              errorDetails: 'Response is not in JSON format' 
            };
          }
        }
      } else if (result && typeof result === 'object') {
        // Handle nested response formats (like from API responses)
        if (result.analysis) {
          // If the result has an analysis property (from API response)
          if (typeof result.analysis === 'string') {
            try {
              analysisData = JSON.parse(result.analysis);
            } catch (parseError) {
              console.error('Analysis property parsing error:', parseError);
              // If analysis is a string but not JSON, use it directly
              return { 
                data: null, 
                error: true, 
                errorDetails: `Analysis property contains non-JSON string: ${parseError instanceof Error ? parseError.message : 'Invalid JSON format'}` 
              };
            }
          } else if (typeof result.analysis === 'object') {
            // If analysis is already an object
            analysisData = result.analysis;
          }
        } else {
          // Use the result object directly
          analysisData = result;
        }
      } else {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Invalid response format' 
        };
      }
      
      // Validate the required fields exist
      if (!analysisData || typeof analysisData !== 'object') {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Analysis data is not an object' 
        };
      }
      
      if (!analysisData.topic) {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Missing required field: topic' 
        };
      }
      
      if (!analysisData.keyPoints || !Array.isArray(analysisData.keyPoints)) {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Missing or invalid field: keyPoints (should be an array)' 
        };
      }
      
      if (!analysisData.summary) {
        return { 
          data: null, 
          error: true, 
          errorDetails: 'Missing required field: summary' 
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
        {parseError ? (
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