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
      e.currentTarget.classList.add('border-primary', 'bg-neutral-bg')
    }
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current--
    if (dragCounterRef.current === 0) {
      e.currentTarget.classList.remove('border-primary', 'bg-neutral-bg')
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
      e.currentTarget.classList.remove('border-primary', 'bg-neutral-bg')

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
        className="border-2 border-dashed border-neutral-border rounded-xl p-6 sm:p-12 text-center cursor-pointer transition-all hover:border-primary hover:bg-neutral-bg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 block"
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
        <div className="text-5xl mb-4">📁</div>
        <p className="text-base sm:text-lg mb-2 font-semibold text-neutral-textPrimary">
          Drag and drop files here
        </p>
        <p className="text-xs sm:text-sm text-neutral-textSecondary">
          or click to select • PDF, PNG, JPG, JPEG, WEBP
        </p>
      </label>
      {error && (
        <div className="mt-4 p-3 sm:p-4 bg-error-light border border-error rounded-lg">
          <p className="text-xs sm:text-sm text-error font-medium">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-2 text-xs sm:text-sm text-error hover:opacity-80 underline"
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}