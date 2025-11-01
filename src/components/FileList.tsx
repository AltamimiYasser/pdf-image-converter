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
      <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">Uploaded Files</h2>
      <div className="space-y-2">
        {files.map((file, index) => (
          <div
            key={file.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center justify-between p-3 sm:p-4 border rounded-lg bg-white ${
              draggedIndex === index ? 'opacity-50' : ''
            } ${draggedIndex === index ? 'cursor-grabbing' : 'cursor-grab'}`}
            role="listitem"
            aria-label={`File ${file.name}, ${formatFileSize(file.size)}`}
          >
            <div className="flex items-center flex-1 min-w-0">
              <span className="mr-2 sm:mr-3 text-gray-400" aria-hidden="true">
                ⋮⋮
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm sm:text-base">{file.name}</p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {formatFileSize(file.size)} • {file.type}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(file.id)}
              onKeyDown={(e) => handleDeleteKeyDown(e, file.id)}
              className="ml-2 sm:ml-4 px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              aria-label={`Delete ${file.name}`}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

