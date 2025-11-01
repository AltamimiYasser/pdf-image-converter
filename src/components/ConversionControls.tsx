'use client'

import { useState, useEffect } from 'react'

interface ConversionControlsProps {
  canConvertPdfToImages: boolean
  canConvertImagesToPdf: boolean
  onConvert: (type: 'pdf-to-images' | 'images-to-pdf') => void
  onDownload: () => void
  isProcessing: boolean
  hasDownloadReady: boolean
}

export default function ConversionControls({
  canConvertPdfToImages,
  canConvertImagesToPdf,
  onConvert,
  onDownload,
  isProcessing,
  hasDownloadReady,
}: ConversionControlsProps) {
  const [conversionType, setConversionType] = useState<
    'pdf-to-images' | 'images-to-pdf' | null
  >(null)

  // Reset conversion type when download is ready (so user can start new conversion after download)
  useEffect(() => {
    if (hasDownloadReady) {
      setConversionType(null)
    }
  }, [hasDownloadReady])

  const handleConvert = () => {
    if (conversionType) {
      onConvert(conversionType)
    }
  }

  const handleDownload = () => {
    onDownload()
  }

  const canConvert =
    !isProcessing &&
    !hasDownloadReady &&
    conversionType !== null &&
    ((conversionType === 'pdf-to-images' && canConvertPdfToImages) ||
      (conversionType === 'images-to-pdf' && canConvertImagesToPdf))
  
  const canDownload = hasDownloadReady && !isProcessing

  return (
    <div className="mt-6 sm:mt-8 p-4 sm:p-6 border rounded-lg bg-gray-50">
      <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Conversion Options</h2>
      
      <div className="space-y-3 sm:space-y-4">
        <div>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="conversionType"
              value="pdf-to-images"
              checked={conversionType === 'pdf-to-images'}
              onChange={(e) =>
                setConversionType(e.target.value as 'pdf-to-images')
              }
              disabled={!canConvertPdfToImages || isProcessing || hasDownloadReady}
              className="mr-2"
              aria-label="Convert PDF to Images"
            />
            <span className={!canConvertPdfToImages ? 'text-gray-400' : ''}>
              PDF → Images
            </span>
          </label>
          {!canConvertPdfToImages && (
            <p className="text-xs sm:text-sm text-gray-500 ml-6">
              No PDF files uploaded
            </p>
          )}
        </div>

        <div>
          <label className="flex items-center mb-2">
            <input
              type="radio"
              name="conversionType"
              value="images-to-pdf"
              checked={conversionType === 'images-to-pdf'}
              onChange={(e) =>
                setConversionType(e.target.value as 'images-to-pdf')
              }
              disabled={!canConvertImagesToPdf || isProcessing || hasDownloadReady}
              className="mr-2"
              aria-label="Convert Images to PDF"
            />
            <span className={!canConvertImagesToPdf ? 'text-gray-400' : ''}>
              Images → PDF
            </span>
          </label>
          {!canConvertImagesToPdf && (
            <p className="text-xs sm:text-sm text-gray-500 ml-6">
              No image files uploaded
            </p>
          )}
        </div>

        {hasDownloadReady ? (
          <button
            onClick={handleDownload}
            aria-label="Download converted file"
            className="w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Download
          </button>
        ) : (
          <button
            onClick={handleConvert}
            disabled={!canConvert}
            aria-label={isProcessing ? 'Converting files' : 'Start conversion'}
            className={`w-full px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-colors text-sm sm:text-base ${
              canConvert
                ? 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isProcessing ? 'Converting...' : 'Convert'}
          </button>
        )}
      </div>
    </div>
  )
}

