// Mock pdf-lib before importing
jest.mock('pdf-lib', () => ({
  PDFDocument: {
    load: jest.fn(() =>
      Promise.resolve({
        getPageCount: jest.fn(() => 10),
        copyPages: jest.fn(() => Promise.resolve([{}])),
      })
    ),
    create: jest.fn(() =>
      Promise.resolve({
        addPage: jest.fn(),
        save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
      })
    ),
  },
}))

import { generatePdfPageName } from '../pdf-splitter'

describe('pdf-splitter', () => {
  describe('generatePdfPageName', () => {
    it('should generate correct PDF page name for single page PDF', () => {
      const name = generatePdfPageName('document.pdf', 1, 1)
      expect(name).toBe('document-page-1.pdf')
    })

    it('should pad page numbers correctly for PDFs with 10-99 pages', () => {
      const name = generatePdfPageName('document.pdf', 5, 50)
      expect(name).toBe('document-page-05.pdf')
    })

    it('should pad page numbers correctly for PDFs with 100+ pages', () => {
      const name = generatePdfPageName('document.pdf', 5, 150)
      expect(name).toBe('document-page-005.pdf')
    })

    it('should handle PDF name without extension', () => {
      const name = generatePdfPageName('document', 1, 1)
      expect(name).toBe('document-page-1.pdf')
    })

    it('should handle different cases of .pdf extension', () => {
      const name1 = generatePdfPageName('document.PDF', 1, 1)
      expect(name1).toBe('document-page-1.pdf')

      const name2 = generatePdfPageName('document.Pdf', 1, 1)
      expect(name2).toBe('document-page-1.pdf')
    })

    it('should generate correct names for multiple pages', () => {
      const totalPages = 100
      const name1 = generatePdfPageName('report.pdf', 1, totalPages)
      const name50 = generatePdfPageName('report.pdf', 50, totalPages)
      const name100 = generatePdfPageName('report.pdf', 100, totalPages)

      expect(name1).toBe('report-page-001.pdf')
      expect(name50).toBe('report-page-050.pdf')
      expect(name100).toBe('report-page-100.pdf')
    })
  })

  // Note: Full PDF splitting integration tests require browser environment
  // Manual testing recommended for end-to-end splitting functionality
})
