'use client'

import { useState } from 'react'
import { UploadedFile } from '@/types'
import { formatFileSize } from '@/lib/file-utils'

interface FileListProps {
  files: UploadedFile[]
  onDelete: (fileId: string) => void
  onReorder: (files: UploadedFile[]) => void
}

export default function FileList({
  files,
  onDelete,
  onReorder,
}: FileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (draggedIndex === null || draggedIndex === index) return

    const newFiles = [...files]
    const draggedItem = newFiles[draggedIndex]
    newFiles.splice(draggedIndex, 1)
    newFiles.splice(index, 0, draggedItem)

    // Update order values
    newFiles.forEach((file, idx) => {
      file.order = idx
    })

    onReorder(newFiles)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleDelete = (fileId: string) => {
    onDelete(fileId)
  }

  const handleDeleteKeyDown = (e: React.KeyboardEvent, fileId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleDelete(fileId)
    }
  }

  return (
    <div className="mt-6 sm:mt-8">
      <div className="bg-white rounded-lg p-4">
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={file.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center justify-between p-4 border rounded-lg bg-white transition-opacity ${
                draggedIndex === index ? 'opacity-50' : ''
              } ${draggedIndex === index ? 'cursor-grabbing' : 'cursor-grab'} border-neutral-border hover:border-primary`}
              role="listitem"
              aria-label={`File ${file.name}, ${formatFileSize(file.size)}`}
            >
              <div className="flex items-center flex-1 min-w-0">
                <span className="mr-3 text-neutral-textSecondary" aria-hidden="true">
                  ⋮⋮
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate text-sm sm:text-base text-neutral-textPrimary">{file.name}</p>
                  <p className="text-xs sm:text-sm text-neutral-textSecondary">
                    {formatFileSize(file.size)} • {file.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(file.id)}
                onKeyDown={(e) => handleDeleteKeyDown(e, file.id)}
                className="ml-4 px-3 py-1 text-xs sm:text-sm text-error hover:bg-error-light hover:text-error rounded focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 transition-colors"
                aria-label={`Delete ${file.name}`}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}