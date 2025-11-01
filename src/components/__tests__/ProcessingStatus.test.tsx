import { render, screen } from '@testing-library/react'
import ProcessingStatus from '../ProcessingStatus'
import { ConversionState } from '@/types'

describe('ProcessingStatus', () => {
  it('renders nothing when status is idle', () => {
    const state: ConversionState = {
      type: null,
      status: 'idle',
      progress: { current: 0, total: 0, message: '' },
      error: null,
    }

    const { container } = render(<ProcessingStatus state={state} />)
    expect(container.firstChild).toBeNull()
  })

  it('displays processing status with progress message', () => {
    const state: ConversionState = {
      type: 'pdf-to-images',
      status: 'processing',
      progress: {
        current: 2,
        total: 5,
        message: 'Converting document.pdf...',
      },
      error: null,
    }

    render(<ProcessingStatus state={state} />)

    expect(screen.getByText('Processing...')).toBeInTheDocument()
    expect(screen.getByText('Converting document.pdf...')).toBeInTheDocument()
    expect(screen.getByText(/2 of 5/)).toBeInTheDocument()
    expect(screen.getByText(/40%/)).toBeInTheDocument()
  })

  it('displays success status with completion message', () => {
    const state: ConversionState = {
      type: 'pdf-to-images',
      status: 'success',
      progress: {
        current: 5,
        total: 5,
        message: 'Conversion complete!',
      },
      error: null,
    }

    render(<ProcessingStatus state={state} />)

    expect(screen.getByText(/^Conversion Complete!$/)).toBeInTheDocument()
    expect(screen.getByText('Conversion complete!')).toBeInTheDocument()
  })

  it('displays error status with error message', () => {
    const state: ConversionState = {
      type: 'pdf-to-images',
      status: 'error',
      progress: {
        current: 0,
        total: 0,
        message: '',
      },
      error: 'Failed to convert PDF: Invalid file format',
    }

    render(<ProcessingStatus state={state} />)

    expect(screen.getByText(/^Conversion Failed$/)).toBeInTheDocument()
    expect(screen.getByText('Failed to convert PDF: Invalid file format')).toBeInTheDocument()
  })

  it('displays processing status without progress details when total is 0', () => {
    const state: ConversionState = {
      type: 'images-to-pdf',
      status: 'processing',
      progress: {
        current: 0,
        total: 0,
        message: 'Combining images into PDF...',
      },
      error: null,
    }

    render(<ProcessingStatus state={state} />)

    const processingTexts = screen.getAllByText('Processing...')
    expect(processingTexts.length).toBeGreaterThan(0)
    expect(screen.getByText('Combining images into PDF...')).toBeInTheDocument()
    expect(screen.queryByText(/of/)).not.toBeInTheDocument()
  })

  it('displays processing status with spinner animation', () => {
    const state: ConversionState = {
      type: 'pdf-to-images',
      status: 'processing',
      progress: {
        current: 1,
        total: 3,
        message: 'Processing...',
      },
      error: null,
    }

    const { container } = render(<ProcessingStatus state={state} />)

    const spinner = container.querySelector('.animate-spin')
    expect(spinner).toBeInTheDocument()
    const processingTexts = screen.getAllByText('Processing...')
    expect(processingTexts.length).toBeGreaterThan(0)
  })

  it('displays progress bar when total > 0', () => {
    const state: ConversionState = {
      type: 'pdf-to-images',
      status: 'processing',
      progress: {
        current: 2,
        total: 5,
        message: 'Converting...',
      },
      error: null,
    }

    const { container } = render(<ProcessingStatus state={state} />)

    const progressBar = container.querySelector('.bg-blue-200.rounded-full')
    expect(progressBar).toBeInTheDocument()
    const progressFill = container.querySelector('.bg-blue-600')
    expect(progressFill).toBeInTheDocument()
    expect(progressFill).toHaveStyle({ width: '40%' })
  })
})

