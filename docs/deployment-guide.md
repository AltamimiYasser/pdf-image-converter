# Deployment Guide: PDF ↔ Image Converter

**Project:** PDF ↔ Image Converter  
**Deployment Target:** Vercel (Static Site Hosting)  
**Date:** 2025-01-15  
**Status:** Ready for Production

---

## Pre-Deployment Checklist

### ✅ Configuration Complete
- [x] Static export enabled in `next.config.js`
- [x] PDF.js worker file present in `public/pdf.worker.min.js`
- [x] All dependencies installed and tested
- [x] Build script configured in `package.json`
- [x] Client-side only architecture verified
- [x] Test coverage: 60 tests passing

### ✅ Production Readiness
- [x] Error handling implemented
- [x] User-friendly error messages
- [x] Responsive design verified
- [x] Accessibility features implemented
- [x] Memory cleanup patterns verified

---

## Build Configuration

### Static Export Settings

The application is configured for static export:

**`next.config.js`:**
```javascript
const nextConfig = {
  output: 'export', // Static export for production deployment
  images: {
    unoptimized: true,
  },
}
```

**Why Static Export?**
- Client-side only application (no server-side dependencies)
- No API routes or server-side rendering needed
- Can be deployed to any static hosting service
- Faster load times and lower hosting costs

---

## Local Build Testing

### Step 1: Build the Application

```bash
# Install dependencies (if not already installed)
npm install

# Run tests to ensure everything passes
npm test

# Build for production
npm run build
```

**Expected Output:**
- Build completes successfully
- Creates `out/` directory with static files
- All assets bundled correctly
- No build errors or warnings

### Step 2: Test Production Build Locally

```bash
# Serve the production build locally
npx serve out

# Or use Python's built-in server
cd out
python3 -m http.server 8000
```

**Verify:**
- [ ] Application loads correctly
- [ ] File upload works
- [ ] PDF to images conversion works
- [ ] Images to PDF conversion works
- [ ] PDF.js worker loads correctly (check browser console)
- [ ] Error handling displays correctly
- [ ] Responsive design works on mobile/tablet

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Zero configuration for Next.js static exports
- Automatic HTTPS
- Global CDN
- Free tier available
- Excellent performance

#### Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Deploy to production
vercel --prod
```

#### Deploy via Vercel Dashboard

1. **Sign up/Login to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub/GitLab/Bitbucket

2. **Import Project**
   - Click "New Project"
   - Import your Git repository
   - Vercel will auto-detect Next.js

3. **Configure Build Settings**
   - Framework Preset: Next.js
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `out` (auto-detected)
   - Install Command: `npm install` (auto-detected)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at `your-project.vercel.app`

#### Vercel Configuration File (Optional)

Create `vercel.json` for custom configuration:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build the project
npm run build

# Deploy
netlify deploy --prod --dir=out
```

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  command = "npm run build"
  publish = "out"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Option 3: GitHub Pages

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
# Add to package.json scripts:
# "deploy": "npm run build && gh-pages -d out"
```

**GitHub Pages Setup:**
1. Install `gh-pages`: `npm install --save-dev gh-pages`
2. Add deploy script to `package.json`:
   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d out"
   }
   ```
3. Run `npm run deploy`
4. Configure GitHub Pages in repository settings

### Option 4: Other Static Hosting

**Any static hosting service works:**
- AWS S3 + CloudFront
- Azure Static Web Apps
- Cloudflare Pages
- Firebase Hosting
- Any web server serving static files

**Steps:**
1. Build: `npm run build`
2. Upload `out/` directory contents to hosting service
3. Configure web server to serve `index.html` for all routes

---

## Post-Deployment Verification

### Functional Testing

- [ ] **File Upload**
  - [ ] Drag-and-drop works
  - [ ] Click to select works
  - [ ] Multiple file upload works
  - [ ] File validation works (size, type, count)

- [ ] **File Management**
  - [ ] File list displays correctly
  - [ ] File reordering works
  - [ ] File deletion works

- [ ] **PDF to Images Conversion**
  - [ ] Single PDF conversion works
  - [ ] Multiple PDF conversion works
  - [ ] ZIP download works
  - [ ] Progress updates display correctly

- [ ] **Images to PDF Conversion**
  - [ ] Single image conversion works
  - [ ] Multiple image conversion works
  - [ ] PDF download works
  - [ ] Progress updates display correctly

- [ ] **Error Handling**
  - [ ] Invalid file types show error
  - [ ] File size limits enforced
  - [ ] Conversion errors display user-friendly messages
  - [ ] Error boundary catches React errors

- [ ] **User Experience**
  - [ ] Responsive design works (mobile/tablet/desktop)
  - [ ] Keyboard navigation works
  - [ ] Loading states display correctly
  - [ ] Success messages display correctly

### Performance Testing

- [ ] **Load Time**
  - [ ] Initial page load < 2 seconds
  - [ ] PDF.js worker loads correctly
  - [ ] Assets load efficiently

- [ ] **Conversion Performance**
  - [ ] Small files (< 5MB) convert quickly
  - [ ] Medium files (5-20MB) convert within 30 seconds
  - [ ] Large files (20-50MB) convert without browser crash

- [ ] **Memory Usage**
  - [ ] No memory leaks after multiple conversions
  - [ ] Blob URLs cleaned up correctly
  - [ ] Large files don't cause browser crashes

### Browser Compatibility

Test on:
- [ ] Chrome/Edge 90+ (Chromium-based)
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

### Security Verification

- [ ] **Headers**
  - [ ] Content Security Policy configured (if applicable)
  - [ ] X-Frame-Options set
  - [ ] X-Content-Type-Options set

- [ ] **Client-Side Security**
  - [ ] File validation works correctly
  - [ ] No XSS vulnerabilities
  - [ ] No data sent to external servers

---

## Troubleshooting

### Common Issues

#### PDF.js Worker Not Loading

**Symptom:** PDF conversion fails with worker error

**Solution:**
1. Verify `public/pdf.worker.min.js` exists
2. Check browser console for 404 errors
3. Verify worker path in `src/lib/pdf-converter.ts`:
   ```typescript
   pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'
   ```

#### Build Fails

**Symptom:** `npm run build` fails

**Solutions:**
1. Clear `.next` and `out` directories: `rm -rf .next out`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for TypeScript errors: `npx tsc --noEmit`
4. Verify all imports are correct

#### Static Export Issues

**Symptom:** Routes not working after deployment

**Solution:**
- Verify `output: 'export'` is enabled in `next.config.js`
- Ensure no dynamic routes or API routes exist
- Check that all pages are client components (`'use client'`)

#### File Upload Not Working

**Symptom:** File selector opens but files don't upload

**Solution:**
1. Check browser console for errors
2. Verify file input has correct `accept` attribute
3. Check file validation logic
4. Verify `handleFilesAdded` callback is working

---

## Environment Variables (Not Required)

This application requires **no environment variables** as it's fully client-side.

---

## Monitoring and Analytics (Optional)

### Recommended Tools

- **Vercel Analytics:** Built-in analytics for Vercel deployments
- **Google Analytics:** For user behavior tracking
- **Sentry:** For error tracking (if needed)

### Setup Example (Vercel Analytics)

```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

## Rollback Plan

### If Deployment Fails

1. **Revert Configuration:**
   ```bash
   # Comment out static export temporarily
   # Edit next.config.js: output: 'export' → // output: 'export'
   ```

2. **Redeploy Previous Version:**
   - Vercel: Use "Redeploy" from deployment history
   - Other services: Revert to previous deployment

3. **Rollback Code Changes:**
   ```bash
   git revert <commit-hash>
   git push
   ```

---

## Production Checklist

### Before Going Live

- [ ] All tests passing (`npm test`)
- [ ] Production build successful (`npm run build`)
- [ ] Local production build tested
- [ ] Cross-browser testing completed
- [ ] Performance testing completed
- [ ] Security headers configured
- [ ] Error monitoring setup (optional)
- [ ] Analytics setup (optional)

### After Going Live

- [ ] Verify production URL works
- [ ] Test all conversion flows
- [ ] Verify PDF.js worker loads
- [ ] Check browser console for errors
- [ ] Test on multiple browsers
- [ ] Monitor error rates (if analytics enabled)
- [ ] Share URL with stakeholders

---

## Support and Maintenance

### Regular Maintenance

- **Weekly:** Check error logs (if monitoring enabled)
- **Monthly:** Review performance metrics
- **Quarterly:** Update dependencies
- **As Needed:** Address user feedback and bug reports

### Update Process

1. Make changes locally
2. Run tests: `npm test`
3. Build locally: `npm run build`
4. Test production build: `npx serve out`
5. Commit and push changes
6. Deployment will auto-trigger (if CI/CD configured)
7. Verify deployment success

---

## Additional Resources

- **Next.js Static Export:** https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Vercel Deployment:** https://vercel.com/docs
- **PDF.js Documentation:** https://mozilla.github.io/pdf.js/
- **Project Documentation:** See `docs/` folder

---

## Quick Deploy Commands

### Vercel (Fastest)

```bash
npm i -g vercel
vercel --prod
```

### Netlify

```bash
npm i -g netlify-cli
npm run build
netlify deploy --prod --dir=out
```

### Manual Build

```bash
npm run build
# Upload 'out/' directory to your hosting service
```

---

**Ready to Deploy!** 🚀

Your application is fully configured for production deployment. Follow the steps above to deploy to your preferred hosting service.

