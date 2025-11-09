import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversionControls from '../ConversionControls'

describe('ConversionControls', () => {
  const mockOnConvert = jest.fn()
  const mockOnDownload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders all conversion buttons when mixed files uploaded', () => {
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    expect(screen.getByText('Convert PDFs to Images')).toBeInTheDocument()
    expect(screen.getByText('Split Pages')).toBeInTheDocument()
    expect(screen.getByText('Convert Images to PDF')).toBeInTheDocument()
    expect(screen.getByText(/Detected: Both PDF and image files uploaded/i)).toBeInTheDocument()
  })

  it('renders both PDF conversion buttons for PDF files only', () => {
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={false}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    expect(screen.getByText('Convert to Images')).toBeInTheDocument()
    expect(screen.getByText('Split Pages')).toBeInTheDocument()
    expect(screen.getByText(/Detected: PDF files uploaded/i)).toBeInTheDocument()
    expect(screen.queryByText('Convert Images to PDF')).not.toBeInTheDocument()
  })

  it('renders single button for image files only', () => {
    render(
      <ConversionControls
        canConvertPdfToImages={false}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    expect(screen.getByText('Convert to PDF')).toBeInTheDocument()
    expect(screen.getByText(/Detected: Image files uploaded/i)).toBeInTheDocument()
    expect(screen.queryByText('Convert PDFs to Images')).not.toBeInTheDocument()
  })

  it('calls onConvert with pdf-to-images when PDF button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: 'Convert PDFs to Images' })
    await user.click(pdfButton)

    expect(mockOnConvert).toHaveBeenCalledWith('pdf-to-images')
  })

  it('calls onConvert with images-to-pdf when Images button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    const imagesButton = screen.getByRole('button', { name: 'Convert Images to PDF' })
    await user.click(imagesButton)

    expect(mockOnConvert).toHaveBeenCalledWith('images-to-pdf')
  })

  it('calls onConvert with pdf-to-pdfs when Split Pages button clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={false}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    const splitButton = screen.getByRole('button', { name: 'Split PDFs into Pages' })
    await user.click(splitButton)

    expect(mockOnConvert).toHaveBeenCalledWith('pdf-to-pdfs')
  })

  it('disables buttons when no files uploaded', () => {
    render(
      <ConversionControls
        canConvertPdfToImages={false}
        canConvertImagesToPdf={false}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={false}
      />
    )

    const convertButton = screen.getByRole('button', { name: /No files to convert/i })
    expect(convertButton).toBeDisabled()
    expect(screen.getByText(/Upload PDF or image files to convert/i)).toBeInTheDocument()
  })

  it('disables buttons during processing', () => {
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={true}
        hasDownloadReady={false}
      />
    )

    const pdfButton = screen.getByRole('button', { name: 'Convert PDFs to Images' })
    const splitButton = screen.getByRole('button', { name: 'Split PDFs into Pages' })
    const imagesButton = screen.getByRole('button', { name: 'Convert Images to PDF' })

    expect(pdfButton).toBeDisabled()
    expect(splitButton).toBeDisabled()
    expect(imagesButton).toBeDisabled()
  })

  it('shows download button when download is ready', () => {
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={true}
      />
    )

    const downloadButton = screen.getByRole('button', { name: 'Download converted file' })
    expect(downloadButton).toBeInTheDocument()
    expect(downloadButton).toHaveTextContent('Download')
    expect(screen.queryByText('Convert PDFs to Images')).not.toBeInTheDocument()
  })

  it('calls onDownload when download button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <ConversionControls
        canConvertPdfToImages={true}
        canConvertImagesToPdf={true}
        onConvert={mockOnConvert}
        onDownload={mockOnDownload}
        isProcessing={false}
        hasDownloadReady={true}
      />
    )

    const downloadButton = screen.getByRole('button', { name: 'Download converted file' })
    await user.click(downloadButton)

    expect(mockOnDownload).toHaveBeenCalledTimes(1)
  })
})