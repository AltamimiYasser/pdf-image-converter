import { PDFDocument } from 'pdf-lib'

/**
 * Splits a multi-page PDF into individual single-page PDFs
 * @param pdfFile - The PDF file to split
 * @param onProgress - Optional callback for progress updates
 * @returns Array of PDF blobs, one for each page
 */
export async function splitPdfIntoPages(
  pdfFile: File,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob[]> {
  const arrayBuffer = await pdfFile.arrayBuffer()

  if (onProgress) {
    onProgress(0, 1, `Loading PDF: ${pdfFile.name}...`)
  }

  const pdfDoc = await PDFDocument.load(arrayBuffer)
  const numPages = pdfDoc.getPageCount()

  if (onProgress) {
    onProgress(0, numPages, `Processing ${numPages} page${numPages !== 1 ? 's' : ''} from ${pdfFile.name}...`)
  }

  const pdfBlobs: Blob[] = []

  for (let pageIndex = 0; pageIndex < numPages; pageIndex++) {
    const pageNumber = pageIndex + 1

    if (onProgress) {
      onProgress(pageNumber, numPages, `Extracting page ${pageNumber} of ${numPages} from ${pdfFile.name}...`)
    }

    // Create a new PDF document for this single page
    const newPdfDoc = await PDFDocument.create()

    // Copy the page from the source document
    const [copiedPage] = await newPdfDoc.copyPages(pdfDoc, [pageIndex])
    newPdfDoc.addPage(copiedPage)

    // Save the new PDF as bytes
    const pdfBytes = await newPdfDoc.save()

    // Convert to Blob
    const blob = new Blob([pdfBytes], { type: 'application/pdf' })
    pdfBlobs.push(blob)
  }

  return pdfBlobs
}

/**
 * Generates a filename for a split PDF page
 * @param pdfName - Original PDF filename
 * @param pageNumber - Page number (1-indexed)
 * @param totalPages - Total number of pages
 * @returns Formatted filename
 */
export function generatePdfPageName(
  pdfName: string,
  pageNumber: number,
  totalPages: number
): string {
  const baseName = pdfName.replace(/\.pdf$/i, '')
  const padding = totalPages.toString().length
  const pageStr = String(pageNumber).padStart(padding, '0')
  return `${baseName}-page-${pageStr}.pdf`
}
