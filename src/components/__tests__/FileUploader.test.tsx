import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileUploader from '../FileUploader'

// Mock validateFiles
jest.mock('@/lib/file-utils', () => ({
  validateFiles: jest.fn(),
  formatFileSize: jest.fn((bytes) => `${bytes} bytes`),
  isPDF: jest.fn(),
  isImage: jest.fn(),
}))

import { validateFiles } from '@/lib/file-utils'

const mockValidateFiles = validateFiles as jest.MockedFunction<typeof validateFiles>

describe('FileUploader', () => {
  const mockOnFilesAdded = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    mockValidateFiles.mockReturnValue({ valid: true })
  })

  it('renders file upload area', () => {
    render(<FileUploader onFilesAdded={mockOnFilesAdded} />)
    expect(screen.getByText(/Drag and drop files here/i)).toBeInTheDocument()
    expect(screen.getByText(/Supported formats/i)).toBeInTheDocument()
  })

  it('validates files before adding them', async () => {
    mockValidateFiles.mockReturnValue({ valid: false, error: 'Invalid file type' })
    
    render(<FileUploader onFilesAdded={mockOnFilesAdded} />)
    
    const fileInput = screen.getByLabelText(/File input/i) as HTMLInputElement
    const file = new File(['content'], 'test.txt', { type: 'text/plain' })
    
    // Create a mock DataTransfer object for the change event
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [file],
    })

    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(mockValidateFiles).toHaveBeenCalledWith([file], 0)
      expect(mockOnFilesAdded).not.toHaveBeenCalled()
    })
  })

  it('passes current file count to validation', async () => {
    render(<FileUploader onFilesAdded={mockOnFilesAdded} currentFileCount={5} />)
    
    const fileInput = screen.getByLabelText(/File input/i) as HTMLInputElement
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [file],
    })

    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(mockValidateFiles).toHaveBeenCalledWith([file], 5)
    })
  })

  it('calls onFilesAdded with uploaded files when validation passes', async () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    mockValidateFiles.mockReturnValue({ valid: true })
    
    render(<FileUploader onFilesAdded={mockOnFilesAdded} />)
    
    const fileInput = screen.getByLabelText(/File input/i) as HTMLInputElement
    
    Object.defineProperty(fileInput, 'files', {
      configurable: true,
      value: [file],
    })

    fireEvent.change(fileInput)

    await waitFor(() => {
      expect(mockOnFilesAdded).toHaveBeenCalled()
      const uploadedFiles = mockOnFilesAdded.mock.calls[0][0]
      expect(uploadedFiles).toHaveLength(1)
      expect(uploadedFiles[0].name).toBe('test.pdf')
      expect(uploadedFiles[0].type).toBe('application/pdf')
    })
  })

  it('handles drag and drop events', () => {
    render(<FileUploader onFilesAdded={mockOnFilesAdded} />)
    
    const uploadArea = screen.getByLabelText(/File upload area/i)
    
    // Simulate drag enter
    fireEvent.dragEnter(uploadArea, {
      dataTransfer: {
        items: [{ kind: 'file' }],
      },
    })

    // Simulate drag over
    fireEvent.dragOver(uploadArea)

    // Simulate drop
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const fileList = {
      0: file,
      length: 1,
      item: () => file,
      [Symbol.iterator]: function* () {
        yield file
      },
    } as FileList

    fireEvent.drop(uploadArea, {
      dataTransfer: {
        files: fileList,
      },
    })

    expect(mockValidateFiles).toHaveBeenCalled()
  })

  it('has proper accessibility attributes', () => {
    render(<FileUploader onFilesAdded={mockOnFilesAdded} />)
    
    const uploadArea = screen.getByLabelText(/File upload area/i)
    expect(uploadArea).toHaveAttribute('tabIndex', '0')
    expect(uploadArea).toHaveAttribute('aria-label', 'File upload area')
    expect(uploadArea.tagName.toLowerCase()).toBe('label')
    
    const fileInput = screen.getByLabelText(/File input/i)
    expect(fileInput).toHaveAttribute('aria-label', 'File input')
  })
})

