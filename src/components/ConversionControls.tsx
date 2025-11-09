'use client'

import { useState, useEffect } from 'react'

interface ConversionControlsProps {
  canConvertPdfToImages: boolean
  canConvertImagesToPdf: boolean
  onConvert: (type: 'pdf-to-images' | 'images-to-pdf' | 'pdf-to-pdfs') => void
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
  // Reset when download is ready (so user can start new conversion after download)
  useEffect(() => {
    if (hasDownloadReady) {
      // Reset handled by parent
    }
  }, [hasDownloadReady])

  const handleConvert = (type: 'pdf-to-images' | 'images-to-pdf' | 'pdf-to-pdfs') => {
    onConvert(type)
  }

  const handleDownload = () => {
    onDownload()
  }

  const hasMixedFiles = canConvertPdfToImages && canConvertImagesToPdf
  
  const canConvertPdfOnly = canConvertPdfToImages && !canConvertImagesToPdf
  const canConvertImagesOnly = canConvertImagesToPdf && !canConvertPdfToImages
  const canConvert = !isProcessing && !hasDownloadReady && (canConvertPdfToImages || canConvertImagesToPdf)
  
  const canDownload = hasDownloadReady && !isProcessing

  return (
    <div className="mt-6 sm:mt-8 flex flex-col items-center">
      {hasDownloadReady ? (
        <button
          onClick={handleDownload}
          aria-label="Download converted file"
          className="w-full max-w-[300px] px-6 py-3 rounded-lg font-semibold transition-colors text-base bg-success hover:bg-success-hover text-white focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2"
        >
          Download
        </button>
      ) : (
        <div className="w-full max-w-[300px] flex flex-col gap-3">
          {hasMixedFiles ? (
            <>
              {/* Both PDFs and Images uploaded - show all conversion options */}
              <button
                onClick={() => handleConvert('pdf-to-images')}
                disabled={isProcessing || !canConvertPdfToImages}
                aria-label="Convert PDFs to Images"
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-base ${
                  canConvertPdfToImages && !isProcessing
                    ? 'bg-primary hover:bg-primary-hover text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Convert PDFs to Images
              </button>
              <button
                onClick={() => handleConvert('pdf-to-pdfs')}
                disabled={isProcessing || !canConvertPdfToImages}
                aria-label="Split PDFs into Pages"
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-base ${
                  canConvertPdfToImages && !isProcessing
                    ? 'bg-primary hover:bg-primary-hover text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Split Pages
              </button>
              <button
                onClick={() => handleConvert('images-to-pdf')}
                disabled={isProcessing || !canConvertImagesToPdf}
                aria-label="Convert Images to PDF"
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-base ${
                  canConvertImagesToPdf && !isProcessing
                    ? 'bg-success hover:bg-success-hover text-white focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Convert Images to PDF
              </button>
              <p className="text-xs sm:text-sm text-neutral-textSecondary text-center mt-1">
                Detected: Both PDF and image files uploaded
              </p>
            </>
          ) : canConvertPdfOnly ? (
            <>
              {/* Only PDFs uploaded - show both conversion options */}
              <button
                onClick={() => handleConvert('pdf-to-images')}
                disabled={!canConvert}
                aria-label={isProcessing ? 'Converting files' : 'Convert PDFs to Images'}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-base ${
                  canConvert
                    ? 'bg-primary hover:bg-primary-hover text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Converting...' : 'Convert to Images'}
              </button>
              <button
                onClick={() => handleConvert('pdf-to-pdfs')}
                disabled={!canConvert}
                aria-label={isProcessing ? 'Splitting files' : 'Split PDFs into Pages'}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-base ${
                  canConvert
                    ? 'bg-success hover:bg-success-hover text-white focus:outline-none focus:ring-2 focus:ring-success focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Splitting...' : 'Split Pages'}
              </button>
              <p className="text-xs sm:text-sm text-neutral-textSecondary text-center mt-1">
                Detected: PDF files uploaded
              </p>
            </>
          ) : canConvertImagesOnly ? (
            <>
              {/* Only Images uploaded */}
              <button
                onClick={() => handleConvert('images-to-pdf')}
                disabled={!canConvert}
                aria-label={isProcessing ? 'Converting files' : 'Convert Images to PDF'}
                className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors text-base ${
                  canConvert
                    ? 'bg-primary hover:bg-primary-hover text-white focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isProcessing ? 'Converting...' : 'Convert to PDF'}
              </button>
              <p className="text-xs sm:text-sm text-neutral-textSecondary text-center mt-1">
                Detected: Image files uploaded
              </p>
            </>
          ) : (
            <>
              {/* No compatible files */}
              <button
                disabled
                aria-label="No files to convert"
                className="w-full px-6 py-3 rounded-lg font-semibold text-base bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Convert Files
              </button>
              <p className="text-xs sm:text-sm text-neutral-textSecondary text-center mt-1">
                Upload PDF or image files to convert
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}