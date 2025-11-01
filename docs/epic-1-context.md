# Epic Technical Specification: PDF ↔ Image Conversion Tool

Date: 2025-01-15
Author: Yasser
Epic ID: 1
Status: Draft

---

## Overview

This epic delivers a client-side web application that enables bidirectional conversion between PDF documents and image files (PNG, JPG, JPEG, WEBP) without requiring server infrastructure or authentication. The application provides drag-and-drop file management, supports both single and multiple file conversions, and processes all conversions entirely in the browser using Web APIs. This aligns with the project goal of creating a simple, zero-infrastructure solution for document-image conversion workflows.

The epic encompasses two stories that build upon each other: first establishing core conversion functionality (project setup, file upload, management, and both conversion directions), then completing UI integration with polish, error handling, and comprehensive testing.

## Objectives and Scope

**In-Scope:**
- Client-side PDF to images conversion (PNG format at 300 DPI)
- Client-side images to PDF conversion (single combined PDF)
- Drag-and-drop file upload for PDFs and images
- File list management with reorder and delete capabilities
- ZIP file creation for PDF→Images outputs (with directory structure for multiple PDFs)
- Browser-based file downloads (ZIP or PDF)
- File type validation (PDF and image formats: PNG, JPG, JPEG, WEBP)
- File size limits (50MB per file, max 20 files per session)
- Cross-browser compatibility (Chrome/Edge 90+, Firefox 88+, Safari 14+)
- Responsive UI with accessibility features

**Out-of-Scope:**
- Server-side processing or API endpoints
- User authentication or accounts
- File storage or persistence beyond browser session
- Cloud storage integration
- Advanced PDF features (annotations, forms, encryption)
- Image editing or manipulation beyond conversion
- Batch processing beyond 20 files per session
- Mobile app (web-only, responsive design)

## System Architecture Alignment

This epic aligns with the client-side SPA architecture defined in the tech spec. All processing occurs in the browser using Web APIs, eliminating server infrastructure requirements. The application leverages Next.js 14.2.0 App Router for modern React development, with TypeScript for type safety.

**Key Components Referenced:**
- `src/components/FileUploader.tsx` - Drag-and-drop upload component
- `src/components/FileList.tsx` - File display with reorder/delete
- `src/components/ConversionControls.tsx` - Conversion type selector and controls
- `src/components/ProcessingStatus.tsx` - Progress indicator
- `src/lib/pdf-converter.ts` - PDF to images conversion logic
- `src/lib/image-converter.ts` - Images to PDF conversion logic
- `src/lib/zip-utils.ts` - ZIP file creation utilities
- `src/lib/file-utils.ts` - File validation and type checking

**Architecture Constraints:**
- Client-side only processing (no API routes)
- Browser memory limitations (50MB per file, max 20 files)
- Static export configuration for Next.js (no SSR)
- Zero external dependencies for conversion processing (all libraries are client-side)

## Detailed Design

### Services and Modules

| Module | Responsibility | Inputs | Outputs | Owner |
|--------|---------------|--------|---------|-------|
| FileUploader | File upload via drag-and-drop or file input | User file selection | File objects array | Frontend |
| FileList | Display and manage uploaded files | File objects array | Reordered/deleted file array | Frontend |
| file-utils | File validation and type checking | File objects | Validation results (pass/fail + error messages) | Frontend |
| pdf-converter | PDF to images conversion | PDF File objects | ZIP file with PNG images | Frontend |
| image-converter | Images to PDF conversion | Image File objects | Single PDF file | Frontend |
| zip-utils | ZIP file creation and structure | File blobs with names | ZIP blob | Frontend |
| ConversionControls | Conversion type selection and trigger | File list, conversion type | Conversion trigger signal | Frontend |
| ProcessingStatus | Progress indication during conversion | Conversion state | Visual progress updates | Frontend |

### Data Models and Contracts

**File Object (Browser File API):**
```typescript
interface UploadedFile {
  file: File;                    // Native browser File object
  id: string;                    // Unique identifier for list management
  name: string;                  // File name
  size: number;                 // File size in bytes
  type: string;                 // MIME type (application/pdf, image/png, etc.)
  order: number;                // Display order (for reordering)
}
```

**Conversion State:**
```typescript
interface ConversionState {
  type: 'pdf-to-images' | 'images-to-pdf' | null;
  status: 'idle' | 'processing' | 'success' | 'error';
  progress: {
    current: number;
    total: number;
    message: string;
  };
  error: string | null;
}
```

**File Validation Result:**
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  fileCount?: number;
}
```

### APIs and Interfaces

**File Upload Interface:**
- Input: HTML5 Drag and Drop events or `<input type="file">` change events
- Processing: `file-utils.validateFile()` - validates type, size, count
- Output: Array of `UploadedFile` objects added to state

**PDF to Images Conversion:**
- Input: Array of PDF File objects
- Processing: `pdf-converter.convertPdfToImages()` - uses pdf.js to render pages to canvas, converts to PNG blobs
- Output: ZIP file blob via `zip-utils.createZip()`
- Error Handling: Returns error message if PDF parsing fails

**Images to PDF Conversion:**
- Input: Array of Image File objects
- Processing: `image-converter.convertImagesToPdf()` - loads images, creates PDF with pdf-lib, inserts pages maintaining order
- Output: PDF file blob
- Error Handling: Returns error message if image loading fails

**ZIP Creation Interface:**
- Input: Array of file blobs with names, directory structure preference
- Processing: `zip-utils.createZip()` - creates ZIP archive using JSZip
- Output: ZIP blob for download
- Structure: Single PDF → flat images; Multiple PDFs → `{pdf-name}/` directories

### Workflows and Sequencing

**File Upload Workflow:**
1. User drags files onto drop zone OR selects files via file input
2. `FileUploader` captures file list
3. `file-utils.validateFile()` validates each file (type, size, total count)
4. Valid files added to `UploadedFile[]` state
5. `FileList` displays files with metadata
6. User can reorder via drag-and-drop (updates order field)
7. User can delete files (removes from state array)

**PDF → Images Conversion Workflow:**
1. User selects "PDF → Images" conversion type
2. User clicks "Convert" button
3. `ConversionControls` triggers conversion with PDF files
4. `ProcessingStatus` shows "Converting..." with progress
5. For each PDF file:
   - `pdf-converter` loads PDF using pdf.js
   - Renders each page to canvas at 300 DPI
   - Converts canvas to PNG blob
   - Names image: `{pdf-name}-page-{n}.png`
6. `zip-utils` creates ZIP structure:
   - Single PDF: Flat images in ZIP root
   - Multiple PDFs: Directory structure `{pdf-name}/` containing images
7. ZIP blob created and download triggered
8. `ProcessingStatus` shows success message
9. Blob URLs cleaned up from memory

**Images → PDF Conversion Workflow:**
1. User selects "Images → PDF" conversion type
2. User clicks "Convert" button
3. `ConversionControls` triggers conversion with image files
4. `ProcessingStatus` shows "Converting..." with progress
5. For each image file:
   - Image loaded into memory
   - Dimensions calculated
6. `image-converter` creates PDF document using pdf-lib:
   - Page size matches first image or standard A4
   - Images inserted as pages in file list order
7. Single PDF blob created and download triggered
8. `ProcessingStatus` shows success message
9. Blob URLs cleaned up from memory

## Non-Functional Requirements

### Performance

- **Conversion Speed:** PDF to images conversion should complete within 30 seconds for typical files (<10MB, <10 pages)
- **Memory Usage:** Application must handle files up to 50MB each without browser crashes
- **File Processing:** Sequential processing to avoid memory overflow with large files
- **UI Responsiveness:** UI remains responsive during conversion (progress updates without blocking)
- **Browser Compatibility:** Works on Chrome/Edge 90+, Firefox 88+, Safari 14+ with graceful degradation

### Security

- **Client-Side Only:** No server communication, no data transmission to external services
- **File Access:** Files only accessible within browser session (no persistence)
- **Input Validation:** Strict file type validation prevents malicious file uploads
- **Memory Safety:** Proper cleanup of blob URLs prevents memory leaks
- **No Authentication Required:** Zero authentication reduces attack surface

### Reliability/Availability

- **Error Handling:** Graceful error handling for corrupted PDFs, invalid images, or conversion failures
- **Memory Management:** Blob URLs cleaned up after downloads to prevent memory leaks
- **Recovery:** User can retry conversion after errors without page reload
- **Degradation:** Application degrades gracefully on unsupported browsers (shows error message)

### Observability

- **Error Logging:** Console error logging for debugging conversion failures
- **Progress Feedback:** Real-time progress updates during conversion ("Converting page 2 of 5...")
- **User Feedback:** Clear success/error messages displayed inline in UI
- **Browser Console:** Development errors logged to browser console for debugging

## Dependencies and Integrations

**Core Dependencies:**
- `next@14.2.0` - React framework with App Router
- `react@18.3.0` - UI library
- `react-dom@18.3.0` - React DOM rendering
- `pdfjs-dist@4.0.379` - PDF parsing and rendering (client-side)
- `pdf-lib@1.17.1` - PDF creation and manipulation (client-side)
- `jszip@3.10.1` - ZIP file creation (client-side)

**Development Dependencies:**
- `typescript@5.3.3` - Type safety
- `@types/node@20.x` - Node.js type definitions
- `@types/react@18.x` - React type definitions
- `@types/react-dom@18.x` - React DOM type definitions
- `tailwindcss@3.4.0` - Utility-first CSS framework
- `eslint@8.57.0` - Code linting
- `prettier@3.2.5` - Code formatting

**Build Tool:**
- `node@20.x` - Runtime and build toolchain

**Deployment:**
- `vercel` - Static site hosting (no server-side dependencies)

**Browser APIs Used:**
- HTML5 File API - File upload and reading
- HTML5 Drag and Drop API - File reordering
- Canvas API - PDF page rendering
- Blob API - File blob creation
- URL.createObjectURL() - Download triggering
- FileReader API - Image loading

## Acceptance Criteria (Authoritative)

1. **AC1:** User can upload PDF files via drag-and-drop or file selection
   - Accepts `.pdf` files (MIME: `application/pdf`)
   - Maximum file size: 50MB per file
   - Maximum files: 20 files per session

2. **AC2:** User can upload image files via drag-and-drop or file selection
   - Accepts `.png`, `.jpg`, `.jpeg`, `.webp` files
   - Maximum file size: 50MB per file
   - Maximum files: 20 files per session

3. **AC3:** User can view uploaded files in a list with metadata
   - Displays file name, size, and type
   - Files are displayed in upload order

4. **AC4:** User can reorder files via drag-and-drop
   - Drag-and-drop reordering updates file list order
   - Visual feedback during drag operation
   - Order affects conversion output sequence

5. **AC5:** User can delete files from the upload list
   - Delete button removes file from list
   - File object cleared from memory

6. **AC6:** User can convert PDF files to images
   - Extracts each PDF page as PNG image at 300 DPI
   - Single PDF: Creates ZIP with images named `{pdf-name}-page-{n}.png`
   - Multiple PDFs: Creates ZIP with directory structure `{pdf-name}/` containing images
   - Triggers browser download of ZIP file

7. **AC7:** User can convert image files to PDF
   - Combines all images into single PDF document
   - Maintains image order from file list
   - Page size matches first image or standard A4
   - Triggers browser download of PDF file

8. **AC8:** File type validation rejects invalid files
   - Shows error message for non-PDF/image files
   - Shows error message for files exceeding 50MB
   - Shows error message if total files exceed 20

9. **AC9:** User can select conversion type (PDF → Images or Images → PDF)
   - Conversion type selector clearly visible
   - Selection disabled when no compatible files uploaded
   - Visual indication of selected conversion type

10. **AC10:** User sees processing status during conversion
    - Progress indicator shows conversion in progress
    - Processing status updates (e.g., "Converting page 2 of 5...")
    - Convert button disabled during processing

11. **AC11:** User receives clear error messages for conversion failures
    - Error messages displayed inline in UI
    - Specific error details (file name, error type)
    - User-friendly language (not technical jargon)

12. **AC12:** User sees success feedback after conversion
    - Success message displayed after completion
    - Download triggered automatically
    - File list remains available for additional conversions

13. **AC13:** Application handles edge cases gracefully
    - Empty file list: Convert button disabled
    - Mixed file types: Error message explaining incompatibility
    - Invalid file types: Clear rejection message
    - Large files: Progress indication and memory management

14. **AC14:** Application works across major browsers
    - Chrome/Edge 90+ (Chromium-based)
    - Firefox 88+
    - Safari 14+ (with graceful degradation if needed)

15. **AC15:** Application handles memory cleanup properly
    - Blob URLs cleaned up after download
    - Large files don't cause memory leaks
    - Multiple conversions don't accumulate memory

16. **AC16:** UI is accessible and responsive
    - ARIA labels on interactive elements
    - Keyboard navigation supported
    - Responsive design works on mobile/tablet/desktop

## Traceability Mapping

| AC | Spec Section | Component(s)/API(s) | Test Idea |
|----|--------------|---------------------|-----------|
| AC1 | File Upload Component | FileUploader.tsx, file-utils.ts | Upload PDF files via drag-and-drop, verify file list updates |
| AC2 | File Upload Component | FileUploader.tsx, file-utils.ts | Upload image files via file input, verify accepted formats |
| AC3 | File List Component | FileList.tsx | Display uploaded files with name, size, type metadata |
| AC4 | File Management | FileList.tsx, HTML5 Drag API | Drag file to reorder, verify order updates in state |
| AC5 | File Management | FileList.tsx | Click delete button, verify file removed from state |
| AC6 | PDF Conversion | pdf-converter.ts, zip-utils.ts | Convert PDF to images, verify ZIP structure and PNG quality |
| AC7 | Image Conversion | image-converter.ts | Convert images to PDF, verify page order and dimensions |
| AC8 | File Validation | file-utils.ts | Upload invalid file types, verify error message displayed |
| AC9 | Conversion Controls | ConversionControls.tsx | Select conversion type, verify UI updates and button state |
| AC10 | Processing Status | ProcessingStatus.tsx | Trigger conversion, verify progress updates during processing |
| AC11 | Error Handling | Error boundary, ConversionControls | Trigger conversion error, verify user-friendly error message |
| AC12 | Success Feedback | ProcessingStatus.tsx | Complete conversion, verify success message and download trigger |
| AC13 | Edge Cases | All components | Test empty list, mixed types, invalid files, large files |
| AC14 | Browser Compatibility | All components | Test on Chrome, Firefox, Safari, verify functionality |
| AC15 | Memory Management | pdf-converter.ts, image-converter.ts | Multiple conversions, verify blob URL cleanup |
| AC16 | Accessibility | All components | Test keyboard navigation, ARIA labels, responsive design |

## Risks, Assumptions, Open Questions

**Risks:**
1. **Risk:** Browser memory limitations with large PDF files (50MB+)
   - **Mitigation:** Sequential processing, blob URL cleanup, file size limits enforced
   - **Impact:** Medium - May cause browser crashes with very large files

2. **Risk:** PDF.js worker configuration complexity across browsers
   - **Mitigation:** Standard worker setup, test on all target browsers
   - **Impact:** Low - Well-documented library with browser support

3. **Risk:** Safari limitations with large file handling
   - **Mitigation:** Graceful degradation, error messages, test on Safari 14+
   - **Impact:** Low - Known Safari limitations, graceful handling

**Assumptions:**
1. Users have modern browsers (Chrome 90+, Firefox 88+, Safari 14+)
2. Users understand drag-and-drop file operations
3. File sizes stay within 50MB limit per file
4. No need for server-side processing or authentication
5. Browser memory sufficient for 20 files × 50MB = 1GB max

**Open Questions:**
1. Should we support additional image formats beyond PNG, JPG, JPEG, WEBP?
   - **Decision:** No for MVP, can add later if requested
2. Should we support PDF password-protected files?
   - **Decision:** No for MVP, client-side decryption not feasible
3. Should we add batch processing for >20 files?
   - **Decision:** No for MVP, memory constraints prevent this

## Test Strategy Summary

**Test Levels:**
1. **Unit Tests:** File utilities, conversion logic, ZIP creation (mocked dependencies)
2. **Integration Tests:** File upload flow, conversion workflows, error handling
3. **Manual Tests:** Cross-browser compatibility, edge cases, accessibility

**Test Frameworks:**
- Jest 29.7.0 + React Testing Library 14.1.2 for unit/integration tests
- Manual testing checklist for browser compatibility and edge cases

**Coverage Targets:**
- File utilities: 100% (critical validation logic)
- Conversion logic: 80% (core paths and error cases)
- Components: 70% (user interactions and state management)

**Critical Test Scenarios:**
- PDF to images conversion (single and multiple PDFs)
- Images to PDF conversion (single and multiple images)
- File validation (type, size, count limits)
- File reordering and deletion
- Error handling for corrupted files
- Memory cleanup after conversions
- Cross-browser compatibility
- Accessibility (keyboard navigation, screen readers)

**Edge Cases:**
- Empty file list
- Mixed file types
- Files exceeding size limits
- Maximum file count (20 files)
- Large file conversions (50MB)
- Corrupted PDF files
- Invalid image formats
- Browser memory limits

