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
- 22 live camera effects across animal, cute, funny, and seasonal collections, with MediaPipe face tracking for positioned accessories and eye magnification
- A local WebGL shader layer for face warping, alien tinting, and robot visor effects; it reuses the existing camera stream and landmarks, supports up to three faces, and falls back to the built-in canvas renderer when WebGL is unavailable
- Face effects composited into captured photos and retained in downloaded photo strips
- 2, 3, or 4-photo strip
- 3, 5, or 10-second countdown
- Retake and undo last photo
- 24 built-in strip templates, including six Halloween and six Christmas designs
- Separate Cozy, Halloween, and Christmas gallery collections and clickable sticker-library tabs with expanded sticker sets
- Vertical photobooth and two-column collage layouts for 2, 3, or 4 photos
- Customizable background, frame style, strip padding, photo spacing, title, caption, and individually movable/resizable/rotatable/deletable stickers
- Caption font size, text color, alignment, and removable preset captions
- Reset any template to its original design without retaking photos
- 40 photo filters, including Vintage, Pastel, Cinematic, Korean Aesthetic, Japanese Film, Y2K, Polaroid, and more; applied to strip previews and exports
- Caption, title, draggable emoji decorations
- PNG or JPEG export with decorations and caption rendered into the image
- Automatic local video recording from the first countdown until the photo strip is complete, with browser-supported MP4/WebM downloads and iOS share-sheet support for saving to Photos
- Responsive desktop and mobile layout

## Privacy

Camera permission is requested only when the camera is enabled. Photos, face landmarks, and live effects are processed locally in the browser; this app does not upload them. The face-tracking model and WebAssembly runtime are downloaded from jsDelivr and Google when an effect is first used, so an internet connection is needed for the initial load. Use HTTPS (or localhost) for camera access, and turn the camera off with the visible camera control when finished.

## Frontend code visibility

Production builds are minified and do not include source maps, which makes the shipped files less readable. Browser code must still be sent to each visitor, so it cannot be fully hidden or made impossible to copy with DevTools. Keep secrets and sensitive business logic on a server rather than in this frontend.

## Before publishing

Replace `https://YOUR-DOMAIN-HERE/` in `index.html`, `public/robots.txt`, and `public/sitemap.xml` with your real production domain. For the Vercel default domain, use your actual `https://your-project.vercel.app/` URL.

## Deploy

Push this folder to a GitHub repository and import that repository into Vercel. Use Vite as the framework preset, `npm run build` as the build command, and `dist` as the output directory.
