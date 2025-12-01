import { PDFDocument } from 'pdf-lib'

/**
 * Combines multiple PDF files into a single PDF
 * @param pdfFiles - Array of PDF files to combine (in order)
 * @param onProgress - Optional callback for progress updates
 * @returns Single PDF blob containing all pages from all input PDFs
 */
export async function combinePdfs(
  pdfFiles: File[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  if (pdfFiles.length === 0) {
    throw new Error('No PDF files provided to combine')
  }

  if (pdfFiles.length === 1) {
    // If only one file, just return it as-is
    const arrayBuffer = await pdfFiles[0].arrayBuffer()
    return new Blob([arrayBuffer], { type: 'application/pdf' })
  }

  if (onProgress) {
    onProgress(0, pdfFiles.length, 'Creating combined PDF document...')
  }

  // Create a new PDF document to hold all pages
  const combinedPdf = await PDFDocument.create()

  let totalPagesAdded = 0

  for (let i = 0; i < pdfFiles.length; i++) {
    const pdfFile = pdfFiles[i]
    const fileNumber = i + 1

    if (onProgress) {
      onProgress(i, pdfFiles.length, `Loading PDF ${fileNumber} of ${pdfFiles.length}: ${pdfFile.name}...`)
    }

    const arrayBuffer = await pdfFile.arrayBuffer()
    const sourcePdf = await PDFDocument.load(arrayBuffer)
    const pageCount = sourcePdf.getPageCount()

    if (onProgress) {
      onProgress(i, pdfFiles.length, `Copying ${pageCount} page${pageCount !== 1 ? 's' : ''} from ${pdfFile.name}...`)
    }

    // Copy all pages from the source PDF
    const pageIndices = Array.from({ length: pageCount }, (_, idx) => idx)
    const copiedPages = await combinedPdf.copyPages(sourcePdf, pageIndices)

    // Add all copied pages to the combined document
    for (const page of copiedPages) {
      combinedPdf.addPage(page)
      totalPagesAdded++
    }

    if (onProgress) {
      onProgress(i + 1, pdfFiles.length, `Added ${pageCount} page${pageCount !== 1 ? 's' : ''} from ${pdfFile.name}`)
    }
  }

  if (onProgress) {
    onProgress(pdfFiles.length, pdfFiles.length, `Finalizing combined PDF with ${totalPagesAdded} pages...`)
  }

  // Save the combined PDF
  const pdfBytes = await combinedPdf.save()

  return new Blob([pdfBytes], { type: 'application/pdf' })
}
