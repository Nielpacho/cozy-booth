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
- 2, 3, or 4-photo strip
- 3, 5, or 10-second countdown
- Retake and undo last photo
- 24 built-in strip templates, including six Halloween and six Christmas designs
- Separate Cozy, Halloween, and Christmas gallery collections and clickable sticker-library tabs with expanded sticker sets
- Vertical photobooth and two-column collage layouts for 2, 3, or 4 photos
- Customizable background, frame style, strip padding, photo spacing, title, caption, and individually movable/resizable/rotatable/deletable stickers
- Caption font size, text color, alignment, and removable preset captions
- Reset any template to its original design without retaking photos
- Natural, warm, pastel, black & white, retro, and glow filters
- Caption, title, draggable emoji decorations
- PNG or JPEG export with decorations and caption rendered into the image
- Automatic local video recording from the first countdown until the photo strip is complete, with video download and iOS share-sheet support for saving to Photos
- Responsive desktop and mobile layout

## Privacy

Photos are captured and processed locally in the browser. This starter does not upload photos to a server.

## Before publishing

Replace `https://YOUR-DOMAIN-HERE/` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your real production domain. For the Vercel default domain, use your actual `https://your-project.vercel.app/` URL.

## Deploy

Push this folder to a GitHub repository and import that repository into Vercel. Use Vite as the framework preset, `npm run build` as the build command, and `dist` as the output directory.
