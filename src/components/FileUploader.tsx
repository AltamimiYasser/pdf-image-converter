'use client'

import { useCallback, useRef, useState } from 'react'
import { UploadedFile } from '@/types'
import { validateFiles } from '@/lib/file-utils'

interface FileUploaderProps {
  onFilesAdded: (files: UploadedFile[]) => void
  currentFileCount?: number
}

export default function FileUploader({ onFilesAdded, currentFileCount = 0 }: FileUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragCounterRef = useRef(0)
  const [error, setError] = useState<string | null>(null)

  const processFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return

      const files = Array.from(fileList)
      const validation = validateFiles(files, currentFileCount)

      if (!validation.valid) {
        setError(validation.error || 'File validation failed')
        return
      }

      setError(null)

      const uploadedFiles: UploadedFile[] = files.map((file, index) => ({
        file,
        id: `${Date.now()}-${index}-${file.name}`,
        name: file.name,
        size: file.size,
        type: file.type,
        order: index,
      }))

      onFilesAdded(uploadedFiles)
    },
    [onFilesAdded, currentFileCount]
  )

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50')
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      dragCounterRef.current = 0
      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50')

      const files = e.dataTransfer.files
      processFiles(files)
    },
    [processFiles]
  )

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files)
      // Reset input to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    },
    [processFiles]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        fileInputRef.current?.click()
      }
    },
    []
  )

  return (
    <div className="mb-6 sm:mb-8">
      <label
        htmlFor="file-upload-input"
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 sm:p-12 text-center cursor-pointer transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 block"
        tabIndex={0}
        aria-label="File upload area"
      >
        <input
          id="file-upload-input"
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,application/pdf,image/png,image/jpeg,image/webp"
          onChange={handleFileInputChange}
          className="hidden"
          aria-label="File input"
        />
        <p className="text-base sm:text-lg mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs sm:text-sm text-gray-500">
          Supported formats: PDF, PNG, JPG, JPEG, WEBP (max 50MB per file, 20 files max)
        </p>
      </label>
      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs sm:text-sm text-red-800 font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs sm:text-sm text-red-600 hover:text-red-800 underline"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}

