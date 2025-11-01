// Lazy import pdfjs-dist to avoid SSR issues
let pdfjsLib: typeof import('pdfjs-dist') | null = null

async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist')
    // Configure PDF.js worker - use basePath for GitHub Pages
    if (typeof window !== 'undefined') {
      // Detect basePath from current location (for GitHub Pages: /repo-name)
      // Get the base path by checking if we're in a subdirectory
      const pathParts = window.location.pathname.split('/').filter(Boolean)
      // If pathname starts with something after the domain, it's likely a basePath
      // For GitHub Pages: /pdf-image-converter/...
      const basePath = pathParts.length > 0 && pathParts[0] !== '' 
        ? `/${pathParts[0]}` 
        : ''
      pdfjsLib.GlobalWorkerOptions.workerSrc = `${basePath}/pdf.worker.min.js`
    }
  }
  return pdfjsLib
}

const DPI = 300
const SCALE = DPI / 72 // 72 DPI is PDF default

export async function convertPdfToImages(
  pdfFile: File,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob[]> {
  const pdfjs = await getPdfjsLib()
  const arrayBuffer = await pdfFile.arrayBuffer()
  
  if (onProgress) {
    onProgress(0, 1, `Loading PDF: ${pdfFile.name}...`)
  }
  
  const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  
  if (onProgress) {
    onProgress(0, numPages, `Processing ${numPages} page${numPages !== 1 ? 's' : ''} from ${pdfFile.name}...`)
  }
  
  const images: Blob[] = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (onProgress) {
      onProgress(pageNum, numPages, `Converting page ${pageNum} of ${numPages} from ${pdfFile.name}...`)
    }
    
    const page = await pdf.getPage(pageNum)
    const viewport = page.getViewport({ scale: SCALE })

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    const context = canvas.getContext('2d')

    if (!context) {
      throw new Error('Failed to get canvas context')
    }

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    }

    await page.render(renderContext).promise

    // Convert canvas to PNG blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to convert canvas to blob'))
          }
        },
        'image/png'
      )
    })

    images.push(blob)
  }

  return images
}

export function generateImageName(
  pdfName: string,
  pageNumber: number,
  totalPages: number
): string {
  const baseName = pdfName.replace(/\.pdf$/i, '')
  const padding = totalPages.toString().length
  const pageStr = String(pageNumber).padStart(padding, '0')
  return `${baseName}-page-${pageStr}.png`
}

