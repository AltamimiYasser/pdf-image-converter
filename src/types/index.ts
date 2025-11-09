export interface UploadedFile {
  file: File
  id: string
  name: string
  size: number
  type: string
  order: number
}

export interface ValidationResult {
  valid: boolean
  error?: string
  fileCount?: number
}

export interface ConversionState {
  type: 'pdf-to-images' | 'images-to-pdf' | 'pdf-to-pdfs' | null
  status: 'idle' | 'processing' | 'success' | 'error'
  progress: {
    current: number
    total: number
    message: string
  }
  error: string | null
  downloadBlob?: Blob
  downloadFileName?: string
}

export type ProgressCallback = (current: number, total: number, message: string) => void

