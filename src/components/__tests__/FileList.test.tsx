import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FileList from '../FileList'
import { UploadedFile } from '@/types'

// Mock formatFileSize
jest.mock('@/lib/file-utils', () => ({
  formatFileSize: jest.fn((bytes) => {
    if (bytes === 0) return '0 Bytes'
    if (bytes < 1024) return `${bytes} Bytes`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${Math.round(bytes / (1024 * 1024))} MB`
  }),
}))

describe('FileList', () => {
  const mockOnDelete = jest.fn()
  const mockOnReorder = jest.fn()

  const createMockFile = (name: string, size: number, type: string): UploadedFile => ({
    file: new File(['content'], name, { type }),
    id: `test-${name}`,
    name,
    size,
    type,
    order: 0,
  })

  const mockFiles: UploadedFile[] = [
    createMockFile('file1.pdf', 1024, 'application/pdf'),
    createMockFile('file2.png', 2048, 'image/png'),
    createMockFile('file3.jpg', 3072, 'image/jpeg'),
  ]

  beforeEach(() => {
    jest.clearAllMocks()
    // Set up order values
    mockFiles.forEach((file, index) => {
      file.order = index
    })
  })

  it('renders list of files with metadata', () => {
    render(<FileList files={mockFiles} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    expect(screen.getByText('file1.pdf')).toBeInTheDocument()
    expect(screen.getByText('file2.png')).toBeInTheDocument()
    expect(screen.getByText('file3.jpg')).toBeInTheDocument()
    
    // Check metadata display
    expect(screen.getByText(/1 KB/i)).toBeInTheDocument()
    expect(screen.getByText(/application\/pdf/i)).toBeInTheDocument()
  })

  it('displays file name, size, and type for each file', () => {
    render(<FileList files={mockFiles} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    mockFiles.forEach((file) => {
      expect(screen.getByText(file.name)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(file.type))).toBeInTheDocument()
    })
  })

  it('calls onDelete when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(<FileList files={mockFiles} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
    
    await user.click(deleteButtons[0])
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockFiles[0].id)
  })

  it('supports drag and drop reordering', () => {
    render(<FileList files={mockFiles} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    const fileItems = screen.getAllByRole('listitem')
    const firstItem = fileItems[0]
    
    // Simulate drag start
    fireEvent.dragStart(firstItem)
    
    // Simulate drag over second item
    const secondItem = fileItems[1]
    const dragOverEvent = new Event('dragover', { bubbles: true })
    Object.defineProperty(dragOverEvent, 'preventDefault', { value: jest.fn() })
    Object.defineProperty(dragOverEvent, 'stopPropagation', { value: jest.fn() })
    secondItem.dispatchEvent(dragOverEvent)
    
    // Simulate drag end
    fireEvent.dragEnd(firstItem)
    
    // Check that reorder was called (it's called during dragOver)
    expect(mockOnReorder).toHaveBeenCalled()
  })

  it('provides visual feedback during drag operation', () => {
    render(<FileList files={mockFiles} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    const fileItems = screen.getAllByRole('listitem')
    const firstItem = fileItems[0]
    
    fireEvent.dragStart(firstItem)
    
    // Check that dragged item has opacity class
    expect(firstItem).toHaveClass('opacity-50')
  })

  it('has proper accessibility attributes', () => {
    render(<FileList files={mockFiles} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    const fileItems = screen.getAllByRole('listitem')
    fileItems.forEach((item, index) => {
      expect(item).toHaveAttribute('aria-label')
      expect(item.getAttribute('aria-label')).toContain(mockFiles[index].name)
    })
    
    const deleteButtons = screen.getAllByRole('button', { name: /Delete/i })
    deleteButtons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-label')
      expect(button.getAttribute('aria-label')).toContain(mockFiles[index].name)
    })
  })

  it('handles empty file list', () => {
    render(<FileList files={[]} onDelete={mockOnDelete} onReorder={mockOnReorder} />)
    
    expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
  })
})

