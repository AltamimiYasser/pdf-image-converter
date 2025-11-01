// Mock pdfjs-dist before importing
jest.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: '',
  },
  getDocument: jest.fn(() => ({
    promise: Promise.resolve({
      numPages: 5,
      getPage: jest.fn((pageNum) =>
        Promise.resolve({
          getViewport: jest.fn(() => ({ width: 800, height: 600 })),
          render: jest.fn(() => ({ promise: Promise.resolve() })),
        })
      ),
    }),
  })),
}))

import { generateImageName } from '../pdf-converter'

describe('pdf-converter', () => {
  describe('generateImageName', () => {
    it('should generate correct image name for single page PDF', () => {
      const name = generateImageName('document.pdf', 1, 1)
      expect(name).toBe('document-page-1.png')
    })

    it('should pad page numbers correctly', () => {
      const name = generateImageName('document.pdf', 5, 100)
      expect(name).toBe('document-page-005.png')
    })

    it('should handle PDF name without extension', () => {
      const name = generateImageName('document', 1, 1)
      expect(name).toBe('document-page-1.png')
    })
  })

  // Note: Full PDF conversion integration tests require browser environment
  // Manual testing recommended for end-to-end conversion functionality
})
