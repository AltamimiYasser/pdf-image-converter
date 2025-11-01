# pdf-image-convertor - Technical Specification

**Author:** Yasser
**Date:** 2025-11-01
**Project Level:** 1
**Project Type:** software
**Development Context:** greenfield

---

## Source Tree Structure

```
pdf-image-convertor/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout with metadata
│   │   ├── page.tsx                # Main conversion interface
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── FileUploader.tsx        # Drag & drop + file input component
│   │   ├── FileList.tsx            # Display uploaded files with reorder/delete
│   │   ├── ConversionControls.tsx  # Convert button and conversion type selector
│   │   └── ProcessingStatus.tsx     # Progress indicator during conversion
│   ├── lib/
│   │   ├── pdf-converter.ts        # PDF to images conversion logic
│   │   ├── image-converter.ts      # Images to PDF conversion logic
│   │   ├── zip-utils.ts            # ZIP file creation utilities
│   │   └── file-utils.ts           # File validation and type checking
│   ├── types/
│   │   └── index.ts                # TypeScript type definitions
│   └── hooks/
│       └── useFileConversion.ts    # Custom React hook for conversion logic
├── public/
│   └── (static assets)
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── README.md
```

---

## Technical Approach

**Architecture Pattern:** Client-side Single Page Application (SPA)

**Processing Strategy:** All conversion happens in the browser using Web APIs - no server required. This aligns with the "keep it simple" philosophy and eliminates infrastructure complexity.

**File Handling Flow:**
1. **Upload Phase:** Files accepted via drag-and-drop or file input, stored in browser memory as File objects
2. **Management Phase:** Files displayed in UI with ability to reorder (via drag-and-drop) and delete
3. **Conversion Phase:** Based on selected conversion type:
   - **PDF → Images:** Extract each PDF page as PNG image using pdf.js, create ZIP archive with JSZip
   - **Images → PDF:** Combine all images into single PDF using pdf-lib, maintain image order
4. **Output Phase:** Trigger browser download of resulting file (ZIP or PDF)

**State Management:** React useState hooks for file list and conversion state. No global state management library needed for this scope.

**Error Handling:** Client-side validation for file types and sizes. User-friendly error messages displayed inline.

---

## Implementation Stack

**Frontend Framework:**
- Next.js 14.2.0 (App Router) - React framework with built-in optimizations
- React 18.3.0 - UI library

**PDF Processing:**
- pdfjs-dist 4.0.379 - PDF.js library for PDF parsing and rendering
- pdf-lib 1.17.1 - PDF creation and manipulation library

**Image Processing:**
- Native browser Image API - No additional library needed for image handling

**File Compression:**
- jszip 3.10.1 - ZIP file creation in browser

**UI Framework:**
- Tailwind CSS 3.4.0 - Utility-first CSS framework
- Headless UI 1.7.17 - Accessible UI components (for drag-and-drop)

**Language & Build:**
- TypeScript 5.3.3 - Type safety
- Node.js 20.x - Runtime and build toolchain

**Development Tools:**
- ESLint 8.57.0 - Code linting
- Prettier 3.2.5 - Code formatting

**Deployment:**
- Vercel - Static site hosting (zero-config deployment)

---

## Technical Details

**File Type Validation:**
- PDF files: Accept `.pdf` MIME type `application/pdf`
- Image files: Accept `.png`, `.jpg`, `.jpeg`, `.webp` MIME types
- Maximum file size: 50MB per file (browser memory constraint)
- Maximum total files: 20 files per conversion session

**PDF → Images Conversion:**
- Render each PDF page as canvas element at 300 DPI resolution
- Convert canvas to PNG blob using `canvas.toBlob()` API
- Image naming: `{original-pdf-name}-page-{page-number}.png`
- Multiple PDFs: Create directory structure in ZIP:
  ```
  {pdf1-name}/
    ├── {pdf1-name}-page-1.png
    ├── {pdf1-name}-page-2.png
  {pdf2-name}/
    ├── {pdf2-name}-page-1.png
  ```

**Images → PDF Conversion:**
- Load each image into memory, calculate dimensions
- Create PDF document using pdf-lib with page size matching first image or standard A4
- Insert images as pages maintaining upload order
- Single PDF output regardless of number of input images

**File Reordering:**
- Implement drag-and-drop using HTML5 Drag and Drop API
- Update file array order on drop event
- Visual feedback during drag operation

**File Deletion:**
- Remove file from state array on delete action
- Clear file object from memory (allow garbage collection)

**Memory Management:**
- Process files sequentially to avoid memory overflow
- Use blob URLs for large file handling
- Clean up blob URLs after conversion completes

---

## Development Setup

**Prerequisites:**
- Node.js 20.x installed
- npm or yarn package manager

**Initial Setup:**
```bash
# Create Next.js app with TypeScript and Tailwind
npx create-next-app@14.2.0 pdf-image-convertor --typescript --tailwind --app

# Install dependencies
npm install pdfjs-dist@4.0.379 pdf-lib@1.17.1 jszip@3.10.1

# Install dev dependencies
npm install --save-dev @types/node @types/react @types/react-dom

# Run development server
npm run dev
```

**Environment Configuration:**
- No environment variables required (client-side only)
- No API keys or secrets needed

**PDF.js Worker Configuration:**
- Place worker file: `public/pdf.worker.min.js`
- Configure in code: `pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'`

**Browser Compatibility:**
- Chrome/Edge 90+ (Chromium-based)
- Firefox 88+
- Safari 14+ (with potential limitations on large file handling)

---

## Implementation Guide

**Phase 1: Project Setup (Day 1)**
1. Initialize Next.js project with TypeScript and Tailwind
2. Install core dependencies (pdfjs-dist, pdf-lib, jszip)
3. Configure PDF.js worker
4. Set up basic file structure

**Phase 2: File Upload Component (Day 1-2)**
1. Create `FileUploader.tsx` with drag-and-drop zone
2. Implement file input with multiple file support
3. Add file type validation (PDF and image MIME types)
4. Display selected files in list

**Phase 3: File Management (Day 2)**
1. Create `FileList.tsx` component
2. Implement drag-and-drop reordering using HTML5 API
3. Add delete functionality with confirmation
4. Display file metadata (name, size, type)

**Phase 4: PDF → Images Conversion (Day 2-3)**
1. Create `pdf-converter.ts` utility
2. Implement PDF.js integration for page extraction
3. Convert canvas to PNG blobs
4. Create ZIP structure with JSZip
5. Trigger browser download

**Phase 5: Images → PDF Conversion (Day 3)**
1. Create `image-converter.ts` utility
2. Load images and calculate dimensions
3. Use pdf-lib to create PDF with image pages
4. Maintain image order from file list
5. Trigger browser download

**Phase 6: UI Integration (Day 3-4)**
1. Create `ConversionControls.tsx` with type selector
2. Integrate conversion functions with React state
3. Add `ProcessingStatus.tsx` progress indicator
4. Handle conversion errors with user-friendly messages

**Phase 7: Polish & Testing (Day 4)**
1. Add loading states and animations
2. Test with various file sizes and types
3. Verify memory cleanup
4. Test cross-browser compatibility
5. Add error boundaries

**Key Implementation Notes:**
- Use React hooks for state management (useState, useEffect)
- Implement proper TypeScript types for file objects
- Handle async operations with proper error handling
- Use Tailwind utility classes for styling
- Ensure accessibility (ARIA labels, keyboard navigation)

---

## Testing Approach

**Unit Testing:**
- Framework: Jest 29.7.0 + React Testing Library 14.1.2
- Test file utilities (validation, type checking)
- Test conversion logic with mock files
- Test ZIP creation structure

**Integration Testing:**
- Test file upload flow end-to-end
- Test conversion workflows with sample PDFs/images
- Test file reordering and deletion
- Test error handling for invalid files

**Manual Testing Checklist:**
- [ ] Drag and drop single PDF file
- [ ] Drag and drop multiple PDF files
- [ ] Drag and drop single image file
- [ ] Drag and drop multiple image files
- [ ] Reorder files via drag-and-drop
- [ ] Delete files from list
- [ ] PDF → Images conversion (single PDF)
- [ ] PDF → Images conversion (multiple PDFs with ZIP structure)
- [ ] Images → PDF conversion (single image)
- [ ] Images → PDF conversion (multiple images)
- [ ] File size validation (reject >50MB)
- [ ] File type validation (reject non-PDF/image files)
- [ ] Memory cleanup after conversion
- [ ] Browser compatibility (Chrome, Firefox, Safari)

**Performance Testing:**
- Test with large PDF files (20-50MB)
- Test with many images (10-20 files)
- Monitor memory usage during conversion
- Verify conversion completes within reasonable time (<30 seconds for typical files)

---

## Deployment Strategy

**Platform:** Vercel (static site hosting)

**Deployment Steps:**
1. Build Next.js application: `npm run build`
2. Deploy to Vercel: `vercel deploy` or connect GitHub repository
3. Configure custom domain (optional)
4. Set up automatic deployments from main branch

**Build Configuration:**
- Output: Static export (`next.config.js`: `output: 'export'`)
- No server-side rendering needed (client-side only)
- No API routes required

**CDN & Performance:**
- Vercel Edge Network provides global CDN
- Automatic compression and optimization
- No additional caching configuration needed

**Monitoring:**
- Vercel Analytics for basic usage metrics
- Browser console error tracking
- No server-side logging required

**Rollback Strategy:**
- Vercel provides automatic rollback on failed deployments
- Manual rollback via Vercel dashboard to previous deployment

**Cost Considerations:**
- Free tier sufficient for MVP (100GB bandwidth/month)
- No server costs (static hosting)
- No database costs (client-side only)

