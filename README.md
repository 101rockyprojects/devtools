# DevTools Directory

A lightweight directory of developer tools (including AI tools), built with SvelteKit. The catalog is stored in Supabase (Postgres) with Row Level Security (RLS), and the UI supports searching and sending public suggestions for new tools.

## Why this project exists

- Useful: a simple directory you can actually browse and maintain
- Educational: a practical “API security” showcase (RLS, validation, rate limiting, safe URL handling)

## Tech Stack

- SvelteKit (Svelte 5) + TypeScript
- Vite
- `@sveltejs/adapter-node`
- Supabase (Postgres + RLS)
- Web3Forms (email delivery for public suggestions)

## Data & Security Model (high level)

### Source of truth: Supabase

- Table: `api.devtools`
- Public reads: allowed via RLS policy
- Writes: blocked for the public (only `service_role` can manage data)

This prevents the classic OWASP “Broken Access Control” issue where public users can overwrite your catalog.

### Public suggestions (separate from the catalog)

Public users can submit suggestions via `POST /api/suggestions`. Suggestions:

- Are validated + normalized server-side
- Are rate-limited (basic per-IP bucket)
- Are sent to your email via Web3Forms
- Do **not** write to the `api.devtools` table automatically

This keeps the public endpoint safe while still allowing community input.

## API Endpoints

### `GET /api/devtools`

Returns the list of tools from Supabase (`api.devtools`).

### `POST /api/suggestions`

Public endpoint to suggest a new tool. Payload example:

```json
{
  "name": "Postman",
  "description": "API platform for building and testing APIs",
  "details": "Useful for REST testing, collections, and collaboration.",
  "category": "DevTool",
  "url": "https://www.postman.com/",
  "tags": ["api", "testing"]
}
```

Notes:

- `url` is optional
- `category` must be one of: `IA`, `DevTool`, `Docs`, `Library`, `Tool`
- Only `http/https` URLs are accepted

### `GET /api/tools` (legacy)

Backwards-compatible alias for fetching tools. It is now **read-only**.

## Supabase Setup

### 1) Create the table + policies

This repo includes a migration:

- `supabase/migrations/20260317100000_init_api_devtools.sql`

It creates:

- schema `api`
- table `api.devtools` (UUID primary key, category constraint, basic URL constraint)
- RLS policies (public read, service-role manage)
- seed data (migrated from `static/tools.json`)

### 2) Expose the `api` schema in Supabase

Because the table is in a non-default schema, you must ensure the schema is exposed by Supabase:

- Supabase Dashboard → Project Settings → API → **Exposed schemas**
- Add: `api`

If you don’t expose it, queries to `schema('api').from('devtools')` will fail.

## Environment Variables

Create `.env.local` (do not commit secrets):

```bash
# Supabase
SUPABASE_API_URL="https://<project>.supabase.co"
SUPABASE_ANON_KEY="<anon-key>"

# Required for server-side inserts (used by /api/admin/devtools and /newia)
SUPABASE_SERVICE_ROLE_KEY="<service-role-key>"
ADMIN_PASSWORD="<your-admin-password>"

# Web3Forms (suggestion emails; used server-side)
WEB3FORMS_API_KEY="<web3forms-api-key>"

# Optional (defaults to rockystevendeveloper@gmail.com)
SUGGESTIONS_TO_EMAIL="rockystevendeveloper@gmail.com"

# Optional (JWT note)
# SUPABASE_JWT_SECRET="<project jwt secret>"
```

JWT note: Supabase access tokens are JWTs. If you later add admin-only endpoints, you can verify Supabase JWTs server-side (e.g., to restrict catalog writes to your admin user). This project currently relies on RLS to prevent public writes.


## GitHub Pages (gh-pages) Deployment

GitHub Pages is static hosting, so this project is configured as a SPA:

- SSR disabled: `src/routes/+layout.ts`
- Static adapter with `404.html` fallback: `svelte.config.js`

### Steps

1) Push the repo to GitHub with a `main` branch
2) In GitHub → Settings → Pages:
   - Source: **GitHub Actions**
3) In GitHub → Settings → Secrets and variables → Actions → Secrets, add:
   - `PUBLIC_SUPABASE_API_URL`
   - `PUBLIC_SUPABASE_ANON_KEY`
   - `PUBLIC_WEB3FORMS_API_KEY`
   - `PUBLIC_ADMIN_EMAIL` (optional)
4) Push to `main` → the workflow deploys automatically:
   - `.github/workflows/deploy.yml`

### Notes

- `/newia` inserts directly into Supabase and relies on Supabase Auth + RLS. You must create a Supabase Auth user with the admin email and sign in there.
- Server endpoints under `src/routes/api/*` won’t run on GitHub Pages. For suggestions, the UI uses `PUBLIC_WEB3FORMS_API_KEY` to submit directly to Web3Forms.

## Local Development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build
npm run preview
npm run check
```

## OWASP-ish checklist (what’s implemented)

- Access control: Supabase RLS prevents public writes to the catalog
- Input validation: `POST /api/suggestions` validates and normalizes input
- Rate limiting: basic per-IP bucket for suggestions
- Safe URLs: the UI only renders external links/images when they are valid `http/https` URLs
