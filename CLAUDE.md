# CLAUDE.md

## Project Purpose

Static website for the Ius Gentium research group (PPGD/UFSC). Serves academic content (publications, events, members, cooperation) with Firebase backend for authentication and Firestore database. Deployed to GitHub Pages via custom domain grupoiusgentium.com.br.

## Architecture Overview

```
grupoiusgentium.com.br/
├── *.html              # 12 static pages (index, sobre, membros, publicacoes, eventos, etc.)
├── style.css           # Main stylesheet
├── base.css            # Base/reset styles
├── app.js              # Main application logic + Gemini AI integration
├── firebase-config.js  # Firebase SDK initialization (Auth, Firestore, AI)
├── firebase.json       # Firebase hosting/Firestore config
├── firestore.rules     # Firestore security rules
├── .firebaserc         # Firebase project alias
└── .github/workflows/
    └── deploy.yml      # GitHub Pages deployment
```

No build step — static HTML/CSS/JS served directly. Firebase SDK loaded via CDN (v12.11.0).

**Authentication:** Google Sign-In + Email/Password via Firebase Auth.
**AI Integration:** Google Gemini 2.5 Flash via Firebase AI backend.

## Build & Test Commands

```bash
# Serve locally (no build tool — use any static server)
python3 -m http.server 8000

# Deploy to Firebase (hosting + Firestore rules)
firebase deploy

# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Lint JavaScript (manual — no config present yet)
npx eslint app.js firebase-config.js

# Validate HTML
npx html-validate *.html
```

## Languages & Frameworks

- **HTML5** — 12 page files, semantic markup
- **CSS3** — 2 stylesheets (style.css, base.css), responsive design
- **JavaScript** (ES modules) — Firebase SDK, Gemini AI, DOM manipulation
- **YAML** — GitHub Actions CI/CD workflow

## Coding Conventions

- No build pipeline or bundler — vanilla JS with ES module imports via CDN
- Firebase config lives in dedicated `firebase-config.js`, imported by `app.js`
- HTML pages follow consistent structure: nav → main content → footer
- No TypeScript, no linting config, no tests currently
- Git: single `main` branch, auto-deploy on push

## Key Files

| File | Role |
|------|------|
| `index.html` | Landing page |
| `app.js` | Core logic: navigation, Gemini AI chat, dynamic content |
| `firebase-config.js` | Firebase initialization (Auth, Firestore, AI) |
| `firestore.rules` | Firestore security rules (read/write permissions) |
| `.github/workflows/deploy.yml` | GitHub Pages auto-deployment |
| `login.html` | Authentication page (Google + email/password) |
