// Mock pdf-lib before importing
const mockCopyPages = jest.fn(() => Promise.resolve([{}, {}]))
const mockAddPage = jest.fn()
const mockSave = jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3, 4, 5])))

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn(() =>
      Promise.resolve({
        getPageCount: jest.fn(() => 2),
        copyPages: mockCopyPages,
      })
    ),
    create: jest.fn(() =>
      Promise.resolve({
        addPage: mockAddPage,
        copyPages: mockCopyPages,
        save: mockSave,
      })
    ),
  },
}))

import { combinePdfs } from '../pdf-combiner'

// Helper to create mock File objects with arrayBuffer method
const createMockPdfFile = (name: string): File => {
  const mockContent = new Uint8Array([1, 2, 3, 4, 5])
  const blob = new Blob([mockContent], { type: 'application/pdf' })
  const file = new File([blob], name, { type: 'application/pdf' })

  // Mock arrayBuffer method for test environment
  file.arrayBuffer = jest.fn(() => Promise.resolve(mockContent.buffer as ArrayBuffer))

  return file
}

describe('pdf-combiner', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('combinePdfs', () => {
    it('should throw error when no PDF files provided', async () => {
      await expect(combinePdfs([])).rejects.toThrow('No PDF files provided to combine')
    })

    it('should return single file as-is when only one PDF is provided', async () => {
      const singlePdf = createMockPdfFile('single.pdf')
      const result = await combinePdfs([singlePdf])

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/pdf')
    })

    it('should combine multiple PDF files', async () => {
      const pdf1 = createMockPdfFile('doc1.pdf')
      const pdf2 = createMockPdfFile('doc2.pdf')
      const pdf3 = createMockPdfFile('doc3.pdf')

      const result = await combinePdfs([pdf1, pdf2, pdf3])

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/pdf')
    })

    it('should call progress callback with correct values', async () => {
      const pdf1 = createMockPdfFile('doc1.pdf')
      const pdf2 = createMockPdfFile('doc2.pdf')
      const progressCallback = jest.fn()

      await combinePdfs([pdf1, pdf2], progressCallback)

      // Should have called progress multiple times during processing
      expect(progressCallback).toHaveBeenCalled()

      // First call should be for initialization
      const firstCall = progressCallback.mock.calls[0]
      expect(firstCall[0]).toBe(0) // current
      expect(firstCall[1]).toBe(2) // total (2 files)
    })

    it('should process files in order', async () => {
      const pdf1 = createMockPdfFile('first.pdf')
      const pdf2 = createMockPdfFile('second.pdf')
      const progressMessages: string[] = []

      const progressCallback = (current: number, total: number, message: string) => {
        progressMessages.push(message)
      }

      await combinePdfs([pdf1, pdf2], progressCallback)

      // Check that first.pdf is mentioned before second.pdf in progress messages
      const firstIndex = progressMessages.findIndex(m => m.includes('first.pdf'))
      const secondIndex = progressMessages.findIndex(m => m.includes('second.pdf'))

      expect(firstIndex).toBeLessThan(secondIndex)
    })
  })

  // Note: Full PDF combining integration tests require browser environment
  // Manual testing recommended for end-to-end combining functionality
})
