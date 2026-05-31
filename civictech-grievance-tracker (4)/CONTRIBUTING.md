# 🤝 Contributing to CivicPlus

Thank you for helping improve civic infrastructure for Hyderabad!

## 🌿 Branch Naming
```bash
git checkout -b feature/water-points-map   # new feature
git checkout -b fix/live-feed-crash        # bug fix
git checkout -b docs/update-agents         # documentation
```

## 📝 Commit Convention
```
feat: add free water points to civic map
fix: resolve live feed not updating on mobile
docs: update user manual with new categories
style: improve dashboard card spacing
refactor: simplify Gemini API error handling
```

## 🔧 Setup for Development
```bash
git clone https://code.swecha.org/hijhmalajairam/civicplus.git
cd civicplus
npm install
cp .env.example .env.local
# Add GEMINI_API_KEY to .env.local
npm run dev
```

## 📂 What to Contribute

### 🟢 Good First Issues
- Add more Hyderabad zone locations to `mockData.ts`
- Add form validation to GrievanceTracker
- Improve mobile responsiveness of CivicMap

### 🟡 Intermediate
- Add real GHMC open data integration
- Implement photo upload for issue reports
- Add Telugu language support

### 🔴 Advanced
- Integrate Leaflet.js for real map tiles
- Add offline PWA support
- Build ML-based hotspot prediction

## 📐 Code Style
- TypeScript strictly typed — no `any`
- React functional components + hooks only
- TailwindCSS utility classes for styling
- Lucide React for all icons

## 🐛 Reporting Bugs
Open an issue with:
- Steps to reproduce
- Expected vs actual behavior
- Browser + OS info
- Screenshot if possible

## ✅ PR Checklist
- [ ] Tested locally
- [ ] No TypeScript errors (`npm run lint`)
- [ ] Follows commit convention
- [ ] Updated docs if needed
