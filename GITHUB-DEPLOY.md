# Quick GitHub Pages Deployment

## 🚀 Fastest Way (Automated)

1. **Initialize Git**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub Repo**:
   - Go to https://github.com/new
   - Create repository (e.g., `pdf-image-converter`)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/pdf-image-converter.git
   git branch -M main
   git push -u origin main
   ```

4. **Enable GitHub Pages**:
   - Repository → **Settings** → **Pages**
   - Source: **"GitHub Actions"**
   - Save

5. **Done!** Site will deploy automatically and be available at:
   `https://YOUR_USERNAME.github.io/pdf-image-converter/`

---

## 📋 Manual Deployment

If you prefer manual control:

```bash
npm run deploy
```

Then enable GitHub Pages:
- Settings → Pages → Source: `gh-pages` branch

---

## 📚 Full Guide

See `docs/github-pages-deployment.md` for complete instructions and troubleshooting.

---

**That's it!** Your app will be live on GitHub Pages. 🎉

