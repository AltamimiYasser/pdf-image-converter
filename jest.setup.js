import '@testing-library/jest-dom'

// Mock window methods
global.URL.createObjectURL = jest.fn(() => 'mock-url')
global.URL.revokeObjectURL = jest.fn()

// Mock canvas.toBlob
HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
  const blob = new Blob(['mock'], { type: type || 'image/png' })
  callback(blob)
}

// Mock createImageBitmap
global.createImageBitmap = jest.fn((file) => {
  return Promise.resolve({
    width: 100,
    height: 100,
  })
})

