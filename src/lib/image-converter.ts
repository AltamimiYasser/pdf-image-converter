import { PDFDocument } from 'pdf-lib'

const A4_WIDTH = 595.28 // A4 width in points
const A4_HEIGHT = 841.89 // A4 height in points

export async function convertImagesToPdf(
  imageFiles: File[],
  onProgress?: (current: number, total: number, message: string) => void
): Promise<Blob> {
  const pdfDoc = await PDFDocument.create()
  const totalImages = imageFiles.length

  let pageSize: { width: number; height: number } | null = null

  for (let i = 0; i < imageFiles.length; i++) {
    const imageFile = imageFiles[i]
    
    if (onProgress) {
      onProgress(i + 1, totalImages, `Processing image ${i + 1} of ${totalImages}: ${imageFile.name}...`)
    }
    
    // Load image
    const arrayBuffer = await imageFile.arrayBuffer()
    let image

    // Determine image type and load accordingly
    if (imageFile.type === 'image/png') {
      image = await pdfDoc.embedPng(arrayBuffer)
    } else if (
      imageFile.type === 'image/jpeg' ||
      imageFile.type === 'image/jpg'
    ) {
      image = await pdfDoc.embedJpg(arrayBuffer)
    } else if (imageFile.type === 'image/webp') {
      // pdf-lib doesn't support WebP directly, convert via canvas
      const bitmap = await createImageBitmap(imageFile)
      const canvas = document.createElement('canvas')
      canvas.width = bitmap.width
      canvas.height = bitmap.height
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(bitmap, 0, 0)
        const pngBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (blob) resolve(blob)
              else reject(new Error('Failed to convert WebP'))
            },
            'image/png'
          )
        })
        const pngBuffer = await pngBlob.arrayBuffer()
        image = await pdfDoc.embedPng(pngBuffer)
      } else {
        throw new Error('Failed to get canvas context for WebP conversion')
      }
    } else {
      throw new Error(`Unsupported image type: ${imageFile.type}`)
    }

    // Determine page size (use first image dimensions or A4)
    if (!pageSize) {
      const imageDims = image.scale(1)
      pageSize = {
        width: imageDims.width || A4_WIDTH,
        height: imageDims.height || A4_HEIGHT,
      }
    }

    // Create page and add image
    const page = pdfDoc.addPage([pageSize.width, pageSize.height])
    const imageDims = image.scale(1)

    // Fit image to page while maintaining aspect ratio
    const pageWidth = page.getWidth()
    const pageHeight = page.getHeight()
    const imageWidth = imageDims.width
    const imageHeight = imageDims.height

    const scaleX = pageWidth / imageWidth
    const scaleY = pageHeight / imageHeight
    const scale = Math.min(scaleX, scaleY)

    const scaledWidth = imageWidth * scale
    const scaledHeight = imageHeight * scale

    // Center image on page
    const x = (pageWidth - scaledWidth) / 2
    const y = (pageHeight - scaledHeight) / 2

    page.drawImage(image, {
      x,
      y,
      width: scaledWidth,
      height: scaledHeight,
    })
  }

  if (onProgress) {
    onProgress(totalImages, totalImages, 'Generating PDF...')
  }
  
  const pdfBytes = await pdfDoc.save()
  return new Blob([pdfBytes], { type: 'application/pdf' })
}

