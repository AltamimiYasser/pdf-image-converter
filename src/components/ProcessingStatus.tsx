'use client'

import { ConversionState } from '@/types'

interface ProcessingStatusProps {
  state: ConversionState
}

export default function ProcessingStatus({ state }: ProcessingStatusProps) {
  if (state.status === 'idle') {
    return null
  }

  const progressPercentage =
    state.progress.total > 0
      ? Math.round((state.progress.current / state.progress.total) * 100)
      : 0

  return (
    <div className="mt-6 p-4 rounded-lg">
      {state.status === 'processing' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
            <div className="flex-1">
              <p className="font-semibold text-blue-900">Processing...</p>
              {state.progress.message && (
                <p className="text-sm text-blue-700 mt-1">
                  {state.progress.message}
                </p>
              )}
            </div>
          </div>
          {state.progress.total > 0 && (
            <>
              <div className="flex items-center justify-between text-sm text-blue-600 mb-2">
                <span>{state.progress.current} of {state.progress.total}</span>
                <span>{progressPercentage}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </>
          )}
        </div>
      )}

      {state.status === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-green-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <p className="font-semibold text-green-900">Conversion Complete!</p>
          </div>
          {state.progress.message && (
            <p className="text-sm text-green-700 mt-1">
              {state.progress.message}
            </p>
          )}
        </div>
      )}

      {state.status === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-600 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <p className="font-semibold text-red-900">Conversion Failed</p>
          </div>
          {state.error && (
            <p className="text-sm text-red-700 mt-1">{state.error}</p>
          )}
        </div>
      )}
    </div>
  )
}

