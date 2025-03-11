'use client';

export default function AnalysisSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Topic Section Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>

      {/* Key Points Section Skeleton */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <ul className="space-y-3">
          {[...Array(5)].map((_, index) => (
            <li key={index} className="flex items-start">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 dark:bg-gray-700 mr-3 mt-0.5"></span>
              <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
            </li>
          ))}
        </ul>
      </div>

      {/* Summary Section Skeleton */}
      <div>
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
        <div className="space-y-2">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  );
}