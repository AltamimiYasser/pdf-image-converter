'use client'

import { useState } from 'react'
import FileUploader from '@/components/FileUploader'
import FileList from '@/components/FileList'
import ConversionControls from '@/components/ConversionControls'
import ProcessingStatus from '@/components/ProcessingStatus'
import ErrorBoundary from '@/components/ErrorBoundary'
import { UploadedFile, ConversionState } from '@/types'
import { isPDF, isImage } from '@/lib/file-utils'
import { convertPdfToImages } from '@/lib/pdf-converter'
import { createZipFromPdfImages } from '@/lib/zip-utils'
import { convertImagesToPdf } from '@/lib/image-converter'

export default function Home() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [conversionState, setConversionState] = useState<ConversionState>({
    type: null,
    status: 'idle',
    progress: { current: 0, total: 0, message: '' },
    error: null,
  })

  const handleFilesAdded = (newFiles: UploadedFile[]) => {
    setFiles((prev) => [...prev, ...newFiles])
  }

  const handleFileDelete = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId))
  }

  const handleFileReorder = (reorderedFiles: UploadedFile[]) => {
    setFiles(reorderedFiles)
  }

  const handleConvert = async (type: 'pdf-to-images' | 'images-to-pdf') => {
    try {
      setConversionState({
        type,
        status: 'processing',
        progress: { current: 0, total: 0, message: 'Starting conversion...' },
        error: null,
        downloadBlob: undefined,
        downloadFileName: undefined,
      })

      if (type === 'pdf-to-images') {
        const pdfFiles = files.filter((f) => isPDF(f.file))
        const imagesPerPdf = new Map<string, Blob[]>()

        for (let i = 0; i < pdfFiles.length; i++) {
          const pdfFile = pdfFiles[i]
          const fileIndex = i + 1
          const totalFiles = pdfFiles.length

          setConversionState((prev) => ({
            ...prev,
            progress: {
              current: i,
              total: totalFiles,
              message: `Processing file ${fileIndex} of ${totalFiles}: ${pdfFile.name}...`,
            },
          }))

          const images = await convertPdfToImages(
            pdfFile.file,
            (current, total, message) => {
              // Calculate overall progress: completed files + current file progress
              const completedFiles = i
              const overallTotal = totalFiles
              const overallCurrent = completedFiles + (current / total)
              
              setConversionState((prev) => ({
                ...prev,
                progress: {
                  current: Math.floor(overallCurrent * overallTotal),
                  total: overallTotal,
                  message,
                },
              }))
            }
          )
          imagesPerPdf.set(pdfFile.name, images)
        }

        setConversionState((prev) => ({
          ...prev,
          progress: {
            current: pdfFiles.length,
            total: pdfFiles.length,
            message: 'Creating ZIP archive...',
          },
        }))

        const zipBlob = await createZipFromPdfImages(
          pdfFiles.map((f) => f.file),
          imagesPerPdf
        )

        setConversionState({
          type: 'pdf-to-images',
          status: 'success',
          progress: {
            current: pdfFiles.length,
            total: pdfFiles.length,
            message: `Successfully converted ${pdfFiles.length} PDF${pdfFiles.length !== 1 ? 's' : ''} to images!`,
          },
          error: null,
          downloadBlob: zipBlob,
          downloadFileName: 'converted-images.zip',
        })
      } else {
        const imageFiles = files.filter((f) => isImage(f.file))

        setConversionState((prev) => ({
          ...prev,
          progress: {
            current: 0,
            total: imageFiles.length,
            message: `Converting ${imageFiles.length} image${imageFiles.length !== 1 ? 's' : ''} to PDF...`,
          },
        }))

        const pdfBlob = await convertImagesToPdf(
          imageFiles.map((f) => f.file),
          (current, total, message) => {
            setConversionState((prev) => ({
              ...prev,
              progress: {
                current,
                total,
                message,
              },
            }))
          }
        )

        setConversionState({
          type: 'images-to-pdf',
          status: 'success',
          progress: {
            current: imageFiles.length,
            total: imageFiles.length,
            message: `Successfully converted ${imageFiles.length} image${imageFiles.length !== 1 ? 's' : ''} to PDF!`,
          },
          error: null,
          downloadBlob: pdfBlob,
          downloadFileName: 'converted.pdf',
        })
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred during conversion'
      
      // Make error messages more user-friendly
      let userFriendlyMessage = errorMessage
      if (errorMessage.includes('Failed to get canvas context')) {
        userFriendlyMessage = 'Unable to process the file. Please try a different file or refresh the page.'
      } else if (errorMessage.includes('Failed to convert')) {
        userFriendlyMessage = 'Failed to convert the file. The file may be corrupted or in an unsupported format.'
      } else if (errorMessage.includes('Unsupported image type')) {
        userFriendlyMessage = 'This image format is not supported. Please use PNG, JPG, JPEG, or WEBP.'
      } else if (errorMessage.includes('Failed to load')) {
        userFriendlyMessage = 'Unable to load the file. Please check that the file is not corrupted.'
      } else if (errorMessage.includes('Invalid PDF') || errorMessage.includes('PDF structure')) {
        userFriendlyMessage = 'This PDF file appears to be corrupted or invalid. Please try a different PDF file.'
      } else if (errorMessage.includes('password') || errorMessage.includes('encrypted')) {
        userFriendlyMessage = 'This PDF file is password-protected or encrypted. Please remove the password and try again.'
      }

      setConversionState({
        type: null,
        status: 'error',
        progress: { current: 0, total: 0, message: '' },
        error: userFriendlyMessage,
        downloadBlob: undefined,
        downloadFileName: undefined,
      })
    }
  }

  const handleDownload = () => {
    if (conversionState.downloadBlob && conversionState.downloadFileName) {
      const url = URL.createObjectURL(conversionState.downloadBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = conversionState.downloadFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      // Reset conversion state after download to allow new conversion
      setConversionState({
        type: null,
        status: 'idle',
        progress: { current: 0, total: 0, message: '' },
        error: null,
        downloadBlob: undefined,
        downloadFileName: undefined,
      })
    }
  }

  const pdfFiles = files.filter((f) => isPDF(f.file))
  const imageFiles = files.filter((f) => isImage(f.file))
  const canConvertPdfToImages = pdfFiles.length > 0
  const canConvertImagesToPdf = imageFiles.length > 0
  const hasDownloadReady = conversionState.status === 'success' && conversionState.downloadBlob !== undefined

  return (
    <ErrorBoundary>
      <main className="min-h-screen p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 text-neutral-textPrimary">
              PDF ↔ Image Converter
            </h1>
            <p className="text-neutral-textSecondary text-sm sm:text-base">
              Convert between PDF and image formats in your browser
            </p>
          </div>
          
          <FileUploader onFilesAdded={handleFilesAdded} currentFileCount={files.length} />
          
          {files.length > 0 && (
            <>
              <FileList
                files={files}
                onDelete={handleFileDelete}
                onReorder={handleFileReorder}
              />
              
              <ConversionControls
                canConvertPdfToImages={canConvertPdfToImages}
                canConvertImagesToPdf={canConvertImagesToPdf}
                onConvert={handleConvert}
                onDownload={handleDownload}
                isProcessing={conversionState.status === 'processing'}
                hasDownloadReady={hasDownloadReady}
              />
              
              <ProcessingStatus state={conversionState} />
            </>
          )}
        </div>
      </main>
    </ErrorBoundary>
  )
}
