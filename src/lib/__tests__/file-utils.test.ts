import { validateFile, validateFiles, formatFileSize, isPDF, isImage } from '../file-utils'

describe('file-utils', () => {
  describe('validateFile', () => {
    it('should validate PDF file', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(file, 0)
      expect(result.valid).toBe(true)
    })

    it('should validate PNG image file', () => {
      const file = new File(['content'], 'test.png', { type: 'image/png' })
      const result = validateFile(file, 0)
      expect(result.valid).toBe(true)
    })

    it('should reject file exceeding size limit', () => {
      const largeFile = new File(['x'.repeat(51 * 1024 * 1024)], 'large.pdf', {
        type: 'application/pdf',
      })
      const result = validateFile(largeFile, 0)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('exceeds maximum size')
    })

    it('should reject invalid file type', () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' })
      const result = validateFile(file, 0)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('not a valid format')
    })

    it('should reject when file count exceeds limit', () => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      const result = validateFile(file, 50)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Maximum 50 files')
    })
  })

  describe('validateFiles', () => {
    it('should validate multiple files', () => {
      const files = [
        new File(['content'], 'test1.pdf', { type: 'application/pdf' }),
        new File(['content'], 'test2.png', { type: 'image/png' }),
      ]
      const result = validateFiles(files)
      expect(result.valid).toBe(true)
    })

    it('should reject when total files exceed limit', () => {
      const files = Array(51)
        .fill(0)
        .map((_, i) => new File(['content'], `test${i}.pdf`, { type: 'application/pdf' }))
      const result = validateFiles(files)
      expect(result.valid).toBe(false)
    })

    it('should reject when adding files would exceed limit with existing files', () => {
      const existingFileCount = 45
      const files = Array(10)
        .fill(0)
        .map((_, i) => new File(['content'], `test${i}.pdf`, { type: 'application/pdf' }))
      const result = validateFiles(files, existingFileCount)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Cannot add more than 50 files')
      expect(result.error).toContain('You currently have 45')
      expect(result.error).toContain('trying to add 10 more')
    })

    it('should allow adding files when total stays within limit', () => {
      const existingFileCount = 15
      const files = Array(5)
        .fill(0)
        .map((_, i) => new File(['content'], `test${i}.pdf`, { type: 'application/pdf' }))
      const result = validateFiles(files, existingFileCount)
      expect(result.valid).toBe(true)
    })

    it('should handle edge case: exactly 50 files total', () => {
      const existingFileCount = 48
      const files = Array(2)
        .fill(0)
        .map((_, i) => new File(['content'], `test${i}.pdf`, { type: 'application/pdf' }))
      const result = validateFiles(files, existingFileCount)
      expect(result.valid).toBe(true)
    })
  })

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(0)).toBe('0 Bytes')
    })
  })

  describe('isPDF', () => {
    it('should identify PDF files', () => {
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      expect(isPDF(pdfFile)).toBe(true)
      
      const imageFile = new File(['content'], 'test.png', { type: 'image/png' })
      expect(isPDF(imageFile)).toBe(false)
    })
  })

  describe('isImage', () => {
    it('should identify image files', () => {
      const pngFile = new File(['content'], 'test.png', { type: 'image/png' })
      expect(isImage(pngFile)).toBe(true)
      
      const pdfFile = new File(['content'], 'test.pdf', { type: 'application/pdf' })
      expect(isImage(pdfFile)).toBe(false)
    })
  })
})

