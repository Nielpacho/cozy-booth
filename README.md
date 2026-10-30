# Cozy Booth

A cozy, responsive browser photobooth built with React, TypeScript, and Vite.

## Run locally

1. Install Node.js LTS.
2. Open this folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Production build

```bash
npm run build
npm run preview
```

## Features

- Browser camera access with front/rear camera preference where supported
- 2, 3, 4, or 6-photo strip
- 3, 5, or 10-second countdown
- Retake and undo last photo
- Background and frame choices
- Natural, warm, pastel, black & white, retro, and glow filters
- Caption, title, draggable emoji decorations
- PNG export with decorations and caption rendered into the image
- Responsive desktop and mobile layout

## Privacy

Photos are captured and processed locally in the browser. This starter does not upload photos to a server.

## Before publishing

Replace `https://YOUR-DOMAIN-HERE/` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your real production domain. For the Vercel default domain, use your actual `https://your-project.vercel.app/` URL.

## Deploy

Push this folder to a GitHub repository and import that repository into Vercel. Use Vite as the framework preset, `npm run build` as the build command, and `dist` as the output directory.
