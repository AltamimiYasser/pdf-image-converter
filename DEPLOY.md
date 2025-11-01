# Quick Deployment Reference

## ✅ Pre-Deployment Status

- **Static Export:** ✅ Enabled (`output: 'export'` in `next.config.js`)
- **Build Status:** ✅ Successful (`npm run build` completed)
- **Output Directory:** ✅ `out/` created with all files
- **PDF Worker:** ✅ `pdf.worker.min.js` included in output
- **Tests:** ✅ 60 tests passing

## 🚀 Quick Deploy Commands

### Vercel (Recommended)
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

### Manual Upload
```bash
npm run build
# Upload contents of 'out/' directory to your hosting service
```

## 📋 Post-Deployment Checklist

- [ ] Visit production URL
- [ ] Test file upload (drag-and-drop and click)
- [ ] Test PDF → Images conversion
- [ ] Test Images → PDF conversion
- [ ] Check browser console for errors
- [ ] Test on multiple browsers
- [ ] Verify responsive design on mobile

## 📚 Full Documentation

See `docs/deployment-guide.md` for complete deployment instructions, troubleshooting, and verification steps.

## ⚠️ Build Warning

The build shows a warning about `async/await` in pdfjs-dist. This is **safe to ignore** - it's a known Next.js static export warning. The code works correctly in browsers which fully support async/await.

## 🎯 Next Steps

1. **Deploy:** Choose your hosting service and deploy
2. **Verify:** Complete post-deployment checklist
3. **Share:** Share the production URL with users

---

**Ready to deploy!** 🚀

