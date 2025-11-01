import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ConversionControls from '../ConversionControls'

describe('ConversionControls', () => {
  const mockOnConvert = jest.fn()
  const mockOnDownload = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders conversion type selector', () => {
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

    expect(screen.getByText('PDF → Images')).toBeInTheDocument()
    expect(screen.getByText('Images → PDF')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Start conversion' })).toBeInTheDocument()
  })

  it('allows selecting PDF to Images conversion type', async () => {
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

    const pdfToImagesRadio = screen.getByRole('radio', { name: 'Convert PDF to Images' })
    await user.click(pdfToImagesRadio)

    expect(pdfToImagesRadio).toBeChecked()

    const convertButton = screen.getByRole('button', { name: 'Start conversion' })
    await user.click(convertButton)

    expect(mockOnConvert).toHaveBeenCalledWith('pdf-to-images')
  })

  it('allows selecting Images to PDF conversion type', async () => {
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

    const imagesToPdfRadio = screen.getByRole('radio', { name: 'Convert Images to PDF' })
    await user.click(imagesToPdfRadio)

    expect(imagesToPdfRadio).toBeChecked()

    const convertButton = screen.getByRole('button', { name: 'Start conversion' })
    await user.click(convertButton)

    expect(mockOnConvert).toHaveBeenCalledWith('images-to-pdf')
  })

  it('disables PDF to Images option when no PDF files uploaded', () => {
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

    const pdfToImagesRadio = screen.getByRole('radio', { name: 'Convert PDF to Images' })
    expect(pdfToImagesRadio).toBeDisabled()
    expect(screen.getByText(/No PDF files uploaded/i)).toBeInTheDocument()
  })

  it('disables Images to PDF option when no image files uploaded', () => {
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

    const imagesToPdfRadio = screen.getByRole('radio', { name: 'Convert Images to PDF' })
    expect(imagesToPdfRadio).toBeDisabled()
    expect(screen.getByText(/No image files uploaded/i)).toBeInTheDocument()
  })

  it('disables convert button when no conversion type selected', () => {
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

    const convertButton = screen.getByRole('button', { name: 'Start conversion' })
    expect(convertButton).toBeDisabled()
  })

  it('disables convert button during processing', () => {
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

    const convertButton = screen.getByRole('button', { name: 'Converting files' })
    expect(convertButton).toBeDisabled()
    expect(screen.getByText('Converting...')).toBeInTheDocument()
  })

  it('disables all options during processing', () => {
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

    const pdfToImagesRadio = screen.getByRole('radio', { name: 'Convert PDF to Images' })
    const imagesToPdfRadio = screen.getByRole('radio', { name: 'Convert Images to PDF' })

    expect(pdfToImagesRadio).toBeDisabled()
    expect(imagesToPdfRadio).toBeDisabled()
  })

  it('enables convert button when conversion type is selected and files are available', async () => {
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

    const pdfToImagesRadio = screen.getByRole('radio', { name: 'Convert PDF to Images' })
    await user.click(pdfToImagesRadio)

    const convertButton = screen.getByRole('button', { name: 'Start conversion' })
    expect(convertButton).not.toBeDisabled()
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
    expect(screen.queryByRole('button', { name: 'Start conversion' })).not.toBeInTheDocument()
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

  it('disables convert button when download is ready', () => {
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

    const pdfToImagesRadio = screen.getByRole('radio', { name: 'Convert PDF to Images' })
    expect(pdfToImagesRadio).toBeDisabled()
    
    const imagesToPdfRadio = screen.getByRole('radio', { name: 'Convert Images to PDF' })
    expect(imagesToPdfRadio).toBeDisabled()
  })
})
