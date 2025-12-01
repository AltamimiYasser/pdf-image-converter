import { ValidationResult } from '@/types'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const MAX_FILES = 50

const VALID_PDF_TYPES = ['application/pdf']
const VALID_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']

export function validateFile(
  file: File,
  currentFileCount: number
): ValidationResult {
  // Check file count limit
  if (currentFileCount >= MAX_FILES) {
    return {
      valid: false,
      error: `Maximum ${MAX_FILES} files per session`,
      fileCount: currentFileCount,
    }
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of 50MB`,
    }
  }

  // Check file type
  const isValidType =
    VALID_PDF_TYPES.includes(file.type) || VALID_IMAGE_TYPES.includes(file.type)

  if (!isValidType) {
    const validTypes = [
      ...VALID_PDF_TYPES,
      ...VALID_IMAGE_TYPES.map((t) => t.replace('image/', '.')),
    ]
    return {
      valid: false,
      error: `File "${file.name}" is not a valid format. Accepted: PDF, PNG, JPG, JPEG, WEBP`,
    }
  }

  return { valid: true }
}

export function validateFiles(
  files: File[],
  currentFileCount: number = 0
): ValidationResult {
  const totalFiles = currentFileCount + files.length
  
  if (totalFiles > MAX_FILES) {
    return {
      valid: false,
      error: `Cannot add more than ${MAX_FILES} files per session. You currently have ${currentFileCount} file${currentFileCount !== 1 ? 's' : ''} and are trying to add ${files.length} more.`,
      fileCount: totalFiles,
    }
  }

  for (const file of files) {
    const result = validateFile(file, currentFileCount)
    if (!result.valid) {
      return result
    }
    // Increment currentFileCount for next file validation
    currentFileCount++
  }

  return { valid: true }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function isPDF(file: File): boolean {
  return VALID_PDF_TYPES.includes(file.type)
}

export function isImage(file: File): boolean {
  return VALID_IMAGE_TYPES.includes(file.type)
}

