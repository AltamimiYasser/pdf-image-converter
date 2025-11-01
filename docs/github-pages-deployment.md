# GitHub Pages Deployment Guide

**Project:** PDF ↔ Image Converter  
**Platform:** GitHub Pages  
**Date:** 2025-01-15

---

## 🚀 Quick Start

### Option 1: Automated Deployment (Recommended)

This uses GitHub Actions to automatically deploy when you push to main branch.

**Steps:**

1. **Initialize Git Repository** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `pdf-image-converter`)
   - **Don't** initialize with README, .gitignore, or license (we already have these)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pdf-image-converter.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under **Source**, select **"GitHub Actions"**
   - Save the settings

5. **First Deployment**:
   - GitHub Actions will automatically run when you push
   - Go to **Actions** tab to see the deployment progress
   - Once complete, your site will be live at:
     `https://YOUR_USERNAME.github.io/pdf-image-converter/`

**That's it!** Every time you push to `main`, your site will automatically deploy.

---

### Option 2: Manual Deployment (Using gh-pages)

If you prefer manual control:

1. **Install gh-pages** (already installed):
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Create GitHub Repository** (same as above)

3. **Push your code**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/pdf-image-converter.git
   git branch -M main
   git push -u origin main
   ```

4. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

5. **Enable GitHub Pages**:
   - Go to repository **Settings** → **Pages**
   - Under **Source**, select **"Deploy from a branch"**
   - Select branch: **`gh-pages`**
   - Select folder: **`/ (root)`**
   - Click **Save**

6. **Access your site**:
   - Your site will be available at:
     `https://YOUR_USERNAME.github.io/pdf-image-converter/`
   - It may take a few minutes to become available

---

## 📋 Pre-Deployment Checklist

- [x] ✅ Static export enabled (`output: 'export'` in `next.config.js`)
- [x] ✅ Build tested (`npm run build` works)
- [x] ✅ `.gitignore` created
- [x] ✅ `gh-pages` installed
- [x] ✅ GitHub Actions workflow created (`.github/workflows/deploy.yml`)
- [x] ✅ Deployment script added to `package.json`

---

## 🔧 Configuration Details

### GitHub Actions Workflow

The workflow (`.github/workflows/deploy.yml`) does the following:

1. **Triggers on**: Push to `main` branch or manual trigger
2. **Builds**: Installs dependencies, runs tests, builds the app
3. **Deploys**: Uploads `out/` directory to GitHub Pages

### Deployment Script

The `npm run deploy` script:
- Builds the application (`npm run build`)
- Deploys `out/` directory to `gh-pages` branch using `gh-pages`

---

## 🎯 Repository Setup Steps

### 1. Initialize Git Repository

```bash
# Initialize git (if not already done)
git init

# Create .gitignore (already created)
# Add all files
git add .

# Initial commit
git commit -m "Initial commit: PDF ↔ Image Converter"
```

### 2. Create GitHub Repository

**Via GitHub Website:**
1. Go to https://github.com/new
2. Repository name: `pdf-image-converter` (or your preferred name)
3. Description: "Client-side PDF ↔ Image conversion tool"
4. Choose Public or Private
5. **Don't** check "Initialize with README" (we already have files)
6. Click "Create repository"

**Via GitHub CLI** (if installed):
```bash
gh repo create pdf-image-converter --public --source=. --remote=origin --push
```

### 3. Connect Local Repository to GitHub

```bash
# Add remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/pdf-image-converter.git

# If your default branch is 'master' instead of 'main':
git branch -M main  # or 'master' if that's your default

# Push to GitHub
git push -u origin main
```

### 4. Enable GitHub Pages

**For GitHub Actions (Recommended):**
1. Go to repository → **Settings** → **Pages**
2. Under **Source**, select **"GitHub Actions"**
3. Click **Save**

**For Manual Deployment (gh-pages):**
1. Run `npm run deploy` first
2. Go to repository → **Settings** → **Pages**
3. Under **Source**, select **"Deploy from a branch"**
4. Branch: `gh-pages`
5. Folder: `/ (root)`
6. Click **Save**

---

## 🔄 Updating Your Site

### Automated Deployment (GitHub Actions)

Just push to `main`:
```bash
git add .
git commit -m "Update: describe your changes"
git push origin main
```

GitHub Actions will automatically:
- Run tests
- Build the application
- Deploy to GitHub Pages

### Manual Deployment (gh-pages)

```bash
# Make your changes
git add .
git commit -m "Update: describe your changes"
git push origin main

# Deploy
npm run deploy
```

---

## 🐛 Troubleshooting

### Build Fails in GitHub Actions

**Check:**
1. All tests pass locally: `npm test`
2. Build works locally: `npm run build`
3. Check Actions tab for detailed error messages

**Common Issues:**
- Missing dependencies in `package.json`
- TypeScript errors
- Test failures

### Site Not Updating

**For GitHub Actions:**
- Check Actions tab for deployment status
- Wait a few minutes (deployment can take 2-5 minutes)
- Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)

**For Manual Deployment:**
- Verify `gh-pages` branch exists: `git branch -a`
- Check GitHub Pages settings (branch and folder)
- Ensure `npm run deploy` completed successfully

### 404 Errors

**Possible Causes:**
- Base path issue (if repository name doesn't match URL)
- Check Next.js routing configuration
- Verify `out/` directory structure

**Solution:**
If your repository name is not `pdf-image-converter`, you may need to set `basePath` in `next.config.js`:
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/your-repo-name',  // Add this if needed
  images: {
    unoptimized: true,
  },
}
```

### PDF Worker Not Loading

**Symptom:** PDF conversion fails with worker error

**Solution:**
1. Verify `public/pdf.worker.min.js` exists
2. Check browser console for 404 errors
3. Ensure worker path is correct: `/pdf.worker.min.js`

---

## 📍 Your Site URL

Once deployed, your site will be available at:

**If repository name is `pdf-image-converter`:**
```
https://YOUR_USERNAME.github.io/pdf-image-converter/
```

**If repository name is different:**
```
https://YOUR_USERNAME.github.io/your-repo-name/
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## ✅ Post-Deployment Verification

After deployment, verify:

- [ ] Site loads at GitHub Pages URL
- [ ] File upload works (drag-and-drop and click)
- [ ] PDF → Images conversion works
- [ ] Images → PDF conversion works
- [ ] PDF.js worker loads (check browser console)
- [ ] No 404 errors in browser console
- [ ] Responsive design works on mobile
- [ ] Error handling displays correctly

---

## 🔐 Security Considerations

GitHub Pages automatically provides:
- ✅ HTTPS (automatic)
- ✅ Custom domain support (optional)
- ✅ No server-side code execution

**Note:** Since this is a client-side only application, there are no environment variables or secrets needed.

---

## 📊 Monitoring

**GitHub Actions:**
- Check **Actions** tab for deployment history
- View build logs for troubleshooting
- See deployment status and timing

**GitHub Pages:**
- Check **Settings** → **Pages** for deployment status
- View recent deployments

---

## 🎉 Next Steps

1. **Deploy:** Follow the steps above to deploy to GitHub Pages
2. **Verify:** Complete the post-deployment verification checklist
3. **Share:** Share your GitHub Pages URL with users
4. **Update:** Push changes to automatically redeploy (with GitHub Actions)

---

## 📚 Additional Resources

- **GitHub Pages Docs:** https://docs.github.com/en/pages
- **GitHub Actions Docs:** https://docs.github.com/en/actions
- **Next.js Static Export:** https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **gh-pages Package:** https://github.com/tschaub/gh-pages

---

**Ready to deploy to GitHub Pages!** 🚀

Your application is fully configured for GitHub Pages deployment. Choose your preferred method (automated or manual) and follow the steps above.

