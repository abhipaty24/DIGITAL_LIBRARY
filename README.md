# Data Science Digital Library

React (Vite) + Express + PostgreSQL. Folders: `client/`, `server/`.

## Run locally
```bash
cd server && cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm install && npm run migrate && npm run seed && npm run dev
cd ../client && npm install && npm run dev   # http://localhost:5173 (proxies /api to :4000)
```

## Manage portal files
Use the **Edit** button on Modules, Lab Experiments, Tools, or Data Science Digital Library, then sign in with `ADMIN_EMAIL` and `ADMIN_PASSWORD` from `server/.env`. Managed uploads are stored in `server/uploads` with a section manifest in `server/data/files.json`; use persistent server storage for deployed environments.

## Course modules
The Modules page shows the five imported course modules (Module 01–05) plus the file groups for each course. Open any module at `/modules/:id` to read its overview, learning objectives, topics, practical applications, notes/resources and key takeaways, and to read or download its 15-page study guide PDF (`client/public/assets/modules/module-{1..5}.pdf`).

The PDF reader has two views: **Vertical view** (embedded browser reader) and **Flip-book view** — a 3D page-turning animation rendered with PDF.js. Module content lives in `client/src/data/modules.js`; the animation is in `client/src/components/PdfFlipbook.jsx` and styled in `client/src/styles/index.css`.

On the Modules page, use **Manage courses** to add or delete course cards. Course names and file-to-course assignments are saved in the current browser. Deleting a course permanently deletes its assigned uploaded files.

## Resources
The Resources page lists the seven reference resources imported from the Data Science portal (Programming, Data Science and Video links) from `client/src/data/resources.js`. Each card shows its `category · type`, title, description and an **Open resource** link. The reference portal's search, category, Add Resource and Remove controls are intentionally not included; the page shows the reference intro text and the resource cards only.

## What you must provide
- Logo: `client/public/assets/mbu-logo.png` (a "MBU LOGO" placeholder shows until then)
- Resume PDF: `client/public/assets/resume.pdf`; optional photo path in `client/src/config/siteConfig.js`
- Social links and email are in `siteConfig.js`, already filled from your message.

## Deploy
- **Database**: create a managed Postgres (Neon, Supabase or Render) and copy its URL.
- **Backend (Render/Railway)**: root `server`, build `npm install`, start `npm start`. Env: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN=<vercel url>`, `NODE_ENV=production`. Run `npm run migrate && npm run seed` once.
- **Frontend (Vercel)**: root `client`, build `npm run build`, output `dist`, env `VITE_API_URL=<backend url>`. `vercel.json` handles refresh on nested routes.
- Check `<backend>/health`, then open every page.

## Status
Written but **not yet installed, run or tested**: frontend pages, API read endpoints, admin login (HTTP-only cookie JWT, rate-limited), resource CRUD.
Not built yet: S3 uploads and signed downloads, admin UI, admin CRUD for modules/labs/tools/profile, automated tests.
