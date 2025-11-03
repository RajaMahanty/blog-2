# Blog App 2 — React + Express + MongoDB (with AI content and ImageKit)

A full‑stack blog platform with a modern React (Vite + Tailwind CSS) client and an Express + MongoDB API. Admins can write posts with a rich text editor, toggle publish/draft, delete posts, and moderate comments. Images are uploaded to ImageKit with URL-based optimization. An AI helper (Google Gemini) can generate draft content for a given title.

## Tech stack

- Client: React 19, Vite 7, Tailwind CSS v4, React Router, Quill editor, Axios, react-hot-toast
- Server: Node.js, Express 5, Mongoose (MongoDB), JSON Web Tokens (JWT), Multer, ImageKit SDK, Google Generative AI SDK

## Monorepo layout

```
.
├── client/                  # React + Vite frontend
│   ├── src/
│   │   ├── pages/           # Public pages + Admin area
│   │   ├── components/      # UI components
│   │   └── context/         # App context (Axios base URL, auth token)
│   └── vite.config.js
└── server/                  # Express API
		├── configs/             # DB, ImageKit, Gemini
		├── controllers/         # Admin + Blog controllers
		├── middlewares/         # auth (JWT), multer (uploads)
		├── models/              # Blog, Comment schemas
		├── routes/              # /api/admin, /api/blog routers
		└── server.js            # App entrypoint
```

## Features

- Public
  - Browse blogs by category, search by title/category, responsive design
  - View a blog with hero image, rich content, and approved comments
  - Add a comment (goes to moderation until approved)
- Admin
  - Login with email/password (from server env)
  - Dashboard with counts (blogs, comments, drafts) and latest blogs
  - Add blog with thumbnail upload, rich text (Quill), optional “Publish now”
  - Generate content via AI (Gemini) from the title prompt
  - Toggle publish/unpublish, delete blogs
  - Review, approve, and delete comments
- Media & AI
  - Image uploads to ImageKit and URL transformation for optimization (auto quality, WebP, resize)
  - Content generation using Google Gemini

## Prerequisites

- Node.js 18+ and pnpm installed
- A MongoDB deployment (Atlas or local)
- ImageKit account and keys
- Google AI Studio API key (Gemini)

## Environment variables

Create a `.env` file in `server/`:

```bash
# server/.env
PORT=3000

# Mongo
# IMPORTANT: MONGODB_URI should be the base connection string WITHOUT the database name.
# The code appends "/quickblog" automatically.
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster-host>

# Admin auth (static credentials for admin login)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecret

# JWT
JWT_SECRET=replace-with-a-long-random-string

# ImageKit
IMAGEKIT_PUBLIC_KEY=pk_xxxxxxxxx
IMAGEKIT_PRIVATE_KEY=sk_xxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/<your_id>

# Google Gemini
GEMINI_API_KEY=your-google-genai-api-key
```

Create a `.env.local` in `client/` to point the client to the API base URL:

```bash
# client/.env.local
VITE_BASE_URL=http://localhost:3000
```

Notes

- The server reads `process.env.MONGODB_URI` and connects to `${MONGODB_URI}/quickblog`.
- The auth middleware expects the raw JWT in the `Authorization` header (no “Bearer ” prefix).

## Install and run (Windows PowerShell)

```powershell
# 1) API server
cd server
pnpm install
# Add server/.env with the values listed above
pnpm run server   # starts nodemon on http://localhost:3000

# 2) Client app
cd ../client
pnpm install
# Add client/.env.local with VITE_BASE_URL=http://localhost:3000
pnpm run dev      # starts Vite on http://localhost:5173
```

Open the client at http://localhost:5173. The client talks to the API at `VITE_BASE_URL`.

## Scripts

- server
  - `pnpm run server` — dev with nodemon
  - `pnpm start` — production start
- client
  - `pnpm dev` — Vite dev server
  - `pnpm build` — production build to `dist/`
  - `pnpm preview` — preview built app
  - `pnpm lint` — run ESLint

## API quick reference

Base URL: `http://localhost:3000`

- Health

  - GET `/` → "API is working"

- Admin (Authorization: <token> header required after login)

  - POST `/api/admin/login` — body: `{ email, password }` → `{ success, token }`
  - GET `/api/admin/dashboard` → counts and recent blogs
  - GET `/api/admin/blogs` — list all blogs (published + drafts)
  - GET `/api/admin/comments` — list all comments (populated with blog)
  - POST `/api/admin/approve-comment` — body: `{ id }`
  - POST `/api/admin/delete-comment` — body: `{ id }`

- Blogs
  - GET `/api/blog/all` — list published blogs only
  - GET `/api/blog/:blogId` — get single blog
  - POST `/api/blog/add` — multipart/form-data
    - fields:
      - `image`: file
      - `blog`: JSON string: `{ title, subTitle, description, category, isPublished }`
    - auth required (Authorization: <token>)
  - POST `/api/blog/delete` — body: `{ id }` (auth required)
  - POST `/api/blog/toggle-publish` — body: `{ id }` (auth required)
  - POST `/api/blog/add-comment` — body: `{ blog, name, content }`
  - POST `/api/blog/comments` — body: `{ blogId }` → returns approved comments only
  - POST `/api/blog/generate` — body: `{ prompt }` (auth required) → `{ content }`

### Data models

Blog

```ts
{
	title: string,
	subTitle?: string,
	description: string,       // HTML produced by Quill
	category: string,
	image: string,             // ImageKit URL (optimized via URL params)
	isPublished: boolean,
	createdAt: Date,
	updatedAt: Date,
}
```

Comment

```ts
{
	blog: ObjectId<blog>,
	name: string,
	content: string,
	isApproved: boolean,       // default false; shown publicly only when true
	createdAt: Date,
	updatedAt: Date,
}
```

## Admin usage

1. Visit `/admin` in the client and log in with the credentials from `server/.env`.
2. After login, the token is saved to `localStorage` and attached to `Authorization` for subsequent requests.
3. Add a blog: upload an image and compose content in the editor; optionally “Generate with AI” to prefill content from the title.
4. Use the list to toggle publish/unpublish or delete.
5. Moderate comments under Admin → Comments (approve or delete).

## Gotchas and tips

- Mongo URI: Don’t include a database name in `MONGODB_URI`; the code appends `/quickblog`.
- Authorization header: Provide the raw JWT in `Authorization`; do not prefix with `Bearer`.
- Case sensitivity (cross‑platform): On case‑sensitive filesystems, ensure imports’ casing matches filenames (e.g., `context/AppContext
- ImageKit: The code uploads to the folder `/blog-2/blogImages`. Ensure your account has permissions; ImageKit will create folders on-demand.
- Security (production hardening):
  - Consider adding JWT expiry and refresh strategy.
  - Rate‑limit login and AI generation endpoints.
  - Validate/sanitize rich text if user‑generated inputs are introduced.

## Build and deploy

Client

```powershell
cd client
pnpm build
pnpm preview
```

Server

```powershell
cd server
pnpm install --prod
pnpm start
```

Deploy the server behind HTTPS and set `VITE_BASE_URL` accordingly in the client’s environment.

## License

ISC (as per server/package.json). Update if you plan to use a different license.

---

Made with ❤️ for learning and rapid prototyping. PRs welcome.
