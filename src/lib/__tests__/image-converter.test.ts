// Mock pdf-lib before importing
const mockPdfDoc = {
  embedPng: jest.fn((buffer) =>
    Promise.resolve({
      scale: jest.fn(() => ({ width: 800, height: 600 })),
    })
  ),
  embedJpg: jest.fn((buffer) =>
    Promise.resolve({
      scale: jest.fn(() => ({ width: 800, height: 600 })),
    })
  ),
  addPage: jest.fn((size) => ({
    getWidth: jest.fn(() => size[0] || 595.28),
    getHeight: jest.fn(() => size[1] || 841.89),
    drawImage: jest.fn(),
  })),
  save: jest.fn(() => Promise.resolve(new Uint8Array([1, 2, 3]))),
}

jest.mock('pdf-lib', () => ({
  PDFDocument: {
    create: jest.fn(() => Promise.resolve(mockPdfDoc)),
  },
}))

// Mock createImageBitmap
global.createImageBitmap = jest.fn((file) => {
  return Promise.resolve({
    width: 800,
    height: 600,
  } as ImageBitmap)
})

// Mock canvas.getContext for WebP conversion
const mockCanvasContext = {
  drawImage: jest.fn(),
}

HTMLCanvasElement.prototype.getContext = jest.fn(() => mockCanvasContext)
HTMLCanvasElement.prototype.toBlob = jest.fn(function (callback) {
  const pngContent = 'png content'
  const contentBytes = new Uint8Array(pngContent.length)
  for (let i = 0; i < pngContent.length; i++) {
    contentBytes[i] = pngContent.charCodeAt(i)
  }
  const blob = new Blob([pngContent], { type: 'image/png' })
  // Add arrayBuffer method to blob
  Object.defineProperty(blob, 'arrayBuffer', {
    value: async () => contentBytes.buffer,
    writable: true,
    configurable: true,
  })
  callback(blob)
})

import { convertImagesToPdf } from '../image-converter'

// Helper to create File with arrayBuffer method
function createMockFile(name: string, type: string, content: string = 'mock content'): File {
  const file = new File([content], name, { type })
  // Add arrayBuffer method if not present
  if (!file.arrayBuffer) {
    const contentBytes = new Uint8Array(content.length)
    for (let i = 0; i < content.length; i++) {
      contentBytes[i] = content.charCodeAt(i)
    }
    Object.defineProperty(file, 'arrayBuffer', {
      value: async () => contentBytes.buffer,
      writable: true,
      configurable: true,
    })
  }
  return file
}

describe('image-converter', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('converts PNG images to PDF', async () => {
    const pngFile = createMockFile('test.png', 'image/png')
    
    const result = await convertImagesToPdf([pngFile])
    
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
    expect(mockPdfDoc.embedPng).toHaveBeenCalled()
  })

  it('converts JPEG images to PDF', async () => {
    const jpegFile = createMockFile('test.jpg', 'image/jpeg')
    
    const result = await convertImagesToPdf([jpegFile])
    
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
    expect(mockPdfDoc.embedJpg).toHaveBeenCalled()
  })

  it('converts multiple images to single PDF', async () => {
    const image1 = createMockFile('image1.png', 'image/png')
    const image2 = createMockFile('image2.jpg', 'image/jpeg')
    
    const result = await convertImagesToPdf([image1, image2])
    
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
    expect(mockPdfDoc.addPage).toHaveBeenCalledTimes(2)
  })

  it('maintains image order in PDF', async () => {
    const image1 = createMockFile('image1.png', 'image/png')
    const image2 = createMockFile('image2.png', 'image/png')
    
    await convertImagesToPdf([image1, image2])
    
    // Verify that addPage was called twice (once per image)
    expect(mockPdfDoc.addPage).toHaveBeenCalledTimes(2)
  })

  it('handles WebP images by converting to PNG', async () => {
    const webpFile = createMockFile('test.webp', 'image/webp')
    
    const result = await convertImagesToPdf([webpFile])
    
    expect(result).toBeInstanceOf(Blob)
    expect(result.type).toBe('application/pdf')
    expect(global.createImageBitmap).toHaveBeenCalled()
  })

  it('throws error for unsupported image types', async () => {
    const unsupportedFile = createMockFile('test.gif', 'image/gif')
    
    await expect(convertImagesToPdf([unsupportedFile])).rejects.toThrow('Unsupported image type')
  })

  it('creates PDF with page size matching first image', async () => {
    const image1 = createMockFile('image1.png', 'image/png')
    
    await convertImagesToPdf([image1])
    
    // Verify that addPage was called with dimensions
    expect(mockPdfDoc.addPage).toHaveBeenCalled()
    const callArgs = mockPdfDoc.addPage.mock.calls[0][0]
    expect(callArgs).toBeInstanceOf(Array)
    expect(callArgs.length).toBe(2) // width and height
  })
})

