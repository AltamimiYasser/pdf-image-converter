import JSZip from 'jszip'
import { generateImageName } from './pdf-converter'
import { generatePdfPageName } from './pdf-splitter'

export interface ZipFile {
  name: string
  blob: Blob
}

export async function createZip(
  files: ZipFile[],
  structure: 'flat' | 'directory' = 'flat'
): Promise<Blob> {
  const zip = new JSZip()

  if (structure === 'flat') {
    // Single PDF: flat structure
    files.forEach((file) => {
      zip.file(file.name, file.blob)
    })
  } else {
    // Multiple PDFs: directory structure
    // Assume files are organized by PDF name prefix
    const pdfGroups = new Map<string, ZipFile[]>()

    files.forEach((file) => {
      // Extract PDF name from filename (before "-page-")
      const match = file.name.match(/^(.+?)-page-\d+\.png$/)
      if (match) {
        const pdfName = match[1]
        if (!pdfGroups.has(pdfName)) {
          pdfGroups.set(pdfName, [])
        }
        pdfGroups.get(pdfName)!.push(file)
      } else {
        // Fallback: put in root
        zip.file(file.name, file.blob)
      }
    })

    // Create directory structure
    pdfGroups.forEach((groupFiles, pdfName) => {
      groupFiles.forEach((file) => {
        zip.file(`${pdfName}/${file.name}`, file.blob)
      })
    })
  }

  return zip.generateAsync({ type: 'blob' })
}

export async function createZipFromPdfImages(
  pdfFiles: File[],
  imagesPerPdf: Map<string, Blob[]>
): Promise<Blob> {
  const zip = new JSZip()

  if (pdfFiles.length === 1) {
    // Single PDF: flat structure
    const pdfName = pdfFiles[0].name
    const images = imagesPerPdf.get(pdfName) || []
    images.forEach((image, index) => {
      const imageName = generateImageName(pdfName, index + 1, images.length)
      zip.file(imageName, image)
    })
  } else {
    // Multiple PDFs: directory structure
    pdfFiles.forEach((pdfFile) => {
      const images = imagesPerPdf.get(pdfFile.name) || []
      const pdfName = pdfFile.name.replace(/\.pdf$/i, '')
      images.forEach((image, index) => {
        const imageName = generateImageName(pdfFile.name, index + 1, images.length)
        zip.file(`${pdfName}/${imageName}`, image)
      })
    })
  }

  return zip.generateAsync({ type: 'blob' })
}

export async function createZipFromSplitPdfs(
  pdfFiles: File[],
  pdfsPerFile: Map<string, Blob[]>
): Promise<Blob> {
  const zip = new JSZip()

  // Always use flat structure (no subdirectories)
  pdfFiles.forEach((pdfFile) => {
    const pdfPages = pdfsPerFile.get(pdfFile.name) || []
    pdfPages.forEach((pdfBlob, index) => {
      const pdfPageName = generatePdfPageName(pdfFile.name, index + 1, pdfPages.length)
      zip.file(pdfPageName, pdfBlob)
    })
  })

  return zip.generateAsync({ type: 'blob' })
}

