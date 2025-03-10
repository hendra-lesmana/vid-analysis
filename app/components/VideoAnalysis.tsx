'use client';

import { useState } from 'react';

interface VideoAnalysisProps {
  result: any;
}

export default function VideoAnalysis({ result }: VideoAnalysisProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  return (
    <div className="space-y-6 flex flex-col items-center w-full max-w-4xl mx-auto">
      <div className="flex justify-center items-center w-full mt-8 mb-6">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-6 py-2 rounded-md text-white transition-colors mx-auto ${isSaving
            ? 'bg-gray-400 cursor-not-allowed'
            : saveStatus === 'success'
            ? 'bg-green-500 hover:bg-green-600'
            : saveStatus === 'error'
            ? 'bg-red-500 hover:bg-red-600'
            : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSaving ? (
            'Saving...'
          ) : saveStatus === 'success' ? (
            'Saved!'
          ) : saveStatus === 'error' ? (
            'Error - Try Again'
          ) : (
            'Save Analysis'
          )}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-8 w-full">
        <pre className="whitespace-pre-wrap text-sm mx-4">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );  
}