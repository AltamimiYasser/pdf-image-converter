// Mock JSZip before importing
jest.mock('jszip', () => {
  const mockZip = {
    file: jest.fn(),
    generateAsync: jest.fn(() => Promise.resolve(new Blob(['zip content'], { type: 'application/zip' }))),
  }

  return jest.fn(() => mockZip)
})

import JSZip from 'jszip'
import { createZipFromPdfImages, createZip } from '../zip-utils'
import { generateImageName } from '../pdf-converter'

jest.mock('../pdf-converter', () => ({
  generateImageName: jest.fn((pdfName, pageNum, totalPages) => {
    // Match actual implementation: removes .pdf extension
    const baseName = pdfName.replace(/\.pdf$/i, '')
    const padding = totalPages.toString().length
    const pageStr = String(pageNum).padStart(padding, '0')
    return `${baseName}-page-${pageStr}.png`
  }),
}))

describe('zip-utils', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('createZipFromPdfImages', () => {
    it('creates flat ZIP structure for single PDF', async () => {
      const pdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' })
      const images = [
        new Blob(['image1'], { type: 'image/png' }),
        new Blob(['image2'], { type: 'image/png' }),
      ]
      const imagesPerPdf = new Map([[pdfFile.name, images]])

      const result = await createZipFromPdfImages([pdfFile], imagesPerPdf)

      expect(result).toBeInstanceOf(Blob)
      expect(result.type).toBe('application/zip')
      
      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      // generateImageName receives 'document.pdf', removes .pdf, creates 'document-page-1.png'
      expect(mockZip.file).toHaveBeenCalledWith('document-page-1.png', images[0])
      expect(mockZip.file).toHaveBeenCalledWith('document-page-2.png', images[1])
      expect(mockZip.file).not.toHaveBeenCalledWith(expect.stringContaining('/'), expect.anything())
    })

    it('creates directory structure for multiple PDFs', async () => {
      const pdf1 = new File(['pdf1'], 'document1.pdf', { type: 'application/pdf' })
      const pdf2 = new File(['pdf2'], 'document2.pdf', { type: 'application/pdf' })
      const images1 = [new Blob(['img1'], { type: 'image/png' })]
      const images2 = [new Blob(['img2'], { type: 'image/png' })]
      const imagesPerPdf = new Map([
        [pdf1.name, images1],
        [pdf2.name, images2],
      ])

      const result = await createZipFromPdfImages([pdf1, pdf2], imagesPerPdf)

      expect(result).toBeInstanceOf(Blob)
      
      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      // generateImageName receives 'document1.pdf', removes .pdf, creates 'document1-page-1.png'
      // Directory name is 'document1' (pdfFile.name.replace(/\.pdf$/i, ''))
      // So full path is 'document1/document1-page-1.png'
      expect(mockZip.file).toHaveBeenCalledWith('document1/document1-page-1.png', images1[0])
      expect(mockZip.file).toHaveBeenCalledWith('document2/document2-page-1.png', images2[0])
    })

    it('handles empty images array', async () => {
      const pdfFile = new File(['pdf content'], 'document.pdf', { type: 'application/pdf' })
      const imagesPerPdf = new Map([[pdfFile.name, []]])

      const result = await createZipFromPdfImages([pdfFile], imagesPerPdf)

      expect(result).toBeInstanceOf(Blob)
      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      expect(mockZip.file).not.toHaveBeenCalled()
    })
  })

  describe('createZip', () => {
    it('creates flat ZIP structure', async () => {
      const files = [
        { name: 'file1.png', blob: new Blob(['content1']) },
        { name: 'file2.png', blob: new Blob(['content2']) },
      ]

      const result = await createZip(files, 'flat')

      expect(result).toBeInstanceOf(Blob)
      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      expect(mockZip.file).toHaveBeenCalledWith('file1.png', files[0].blob)
      expect(mockZip.file).toHaveBeenCalledWith('file2.png', files[1].blob)
    })

    it('creates directory structure for multiple PDFs', async () => {
      const files = [
        { name: 'document1-page-1.png', blob: new Blob(['content1']) },
        { name: 'document1-page-2.png', blob: new Blob(['content2']) },
        { name: 'document2-page-1.png', blob: new Blob(['content3']) },
      ]

      const result = await createZip(files, 'directory')

      expect(result).toBeInstanceOf(Blob)
      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      expect(mockZip.file).toHaveBeenCalledWith('document1/document1-page-1.png', files[0].blob)
      expect(mockZip.file).toHaveBeenCalledWith('document1/document1-page-2.png', files[1].blob)
      expect(mockZip.file).toHaveBeenCalledWith('document2/document2-page-1.png', files[2].blob)
    })

    it('defaults to flat structure', async () => {
      const files = [
        { name: 'file1.png', blob: new Blob(['content1']) },
      ]

      await createZip(files)

      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      expect(mockZip.file).toHaveBeenCalledWith('file1.png', files[0].blob)
    })

    it('handles files that do not match PDF page naming pattern', async () => {
      const files = [
        { name: 'random-file.png', blob: new Blob(['content1']) },
      ]

      const result = await createZip(files, 'directory')

      expect(result).toBeInstanceOf(Blob)
      const mockZip = (JSZip as jest.MockedFunction<typeof JSZip>)()
      expect(mockZip.file).toHaveBeenCalledWith('random-file.png', files[0].blob)
    })
  })
})

