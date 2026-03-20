# Saludario Web

Minimal web app for tracking food intake and symptoms. Built with React, TypeScript, Tailwind CSS v4, and Vite.

## Product context

Saludario is a health-focused food diary that lets users record what they eat, organize meals by category, and log symptoms to help identify patterns between food intake and how they feel.

Core features:

- **Dashboard** — Clean landing screen after login with a bottom-anchored floating action button (FAB) that expands upward into a multilevel menu:
  - Level 1: **Add food or drink** / **Log a symptom**
  - Level 2: Food categories (fetched from API: Desayuno, Comida, Cena, Snack) or body regions for symptoms
  - Each selection opens the corresponding modal with context pre-filled
- **Food entries** — Full CRUD with cursor-paginated history, category filters, and date range queries
- **Symptom tracking** — Record symptoms with a severity scale (1–5), timestamp, and optional notes
- **Authentication** — Cookie-based sessions with login, registration, and logout
- **Meal categories** — Dynamically loaded from `/api/v1/categories` with fallback defaults
- **Light/dark mode** — Automatic via `prefers-color-scheme`

## Stack

- React 19
- TypeScript
- Vite 7
- Tailwind CSS 4
- React Router 7
- TanStack Query 5
- React Hook Form 7
- Zod 4

## Project structure

```
src/
├── app/
│   ├── query-client.ts          # TanStack Query client config
│   └── router.tsx               # Routes, layouts, error boundary
├── components/
│   └── Modal.tsx                # Reusable modal (bottom sheet on mobile)
├── features/
│   ├── auth/                    # Login, register, logout, session
│   ├── categories/              # Meal category lookup
│   ├── dashboard/               # Dashboard page + add-entry/add-symptom modals
│   ├── entries/                 # Food entry CRUD + paginated history
│   └── symptoms/                # Symptom event API layer + schema
├── lib/
│   ├── api.ts                   # Fetch wrapper, ApiError, RFC 7807 handling
│   └── datetime.ts              # Timezone and date formatting helpers
├── styles/
│   └── index.css                # Tailwind import + theme tokens
└── main.tsx                     # App entry point
```

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the backend API from repo docroot.
   The frontend expects the API at `http://localhost:3000`.

3. Start the frontend:

   ```bash
   npm run dev
   ```

Vite proxies `/api/*` requests to `http://localhost:3000`, so the browser keeps the same origin in local development.

## Validation

Run the local check before committing:

```bash
npm run check
```

## API endpoints used

| Feature    | Method | Path                                      |
| ---------- | ------ | ----------------------------------------- |
| Session    | GET    | `/api/v1/auth/session`                    |
| Login      | POST   | `/api/v1/auth/login`                      |
| Register   | POST   | `/api/v1/auth/register`                   |
| Logout     | POST   | `/api/v1/auth/logout`                     |
| Categories | GET    | `/api/v1/categories`                      |
| Entries    | GET    | `/api/v1/entries`                          |
| Entry      | GET    | `/api/v1/entries/:id`                      |
| Create     | POST   | `/api/v1/entries`                          |
| Update     | PATCH  | `/api/v1/entries/:id`                      |
| Delete     | DELETE | `/api/v1/entries/:id`                      |
| Symptoms   | GET    | `/api/v1/internal/symptoms/events`         |
| Symptom    | GET    | `/api/v1/internal/symptoms/events/:id`     |
| Create     | POST   | `/api/v1/internal/symptoms/events`         |

All requests use `credentials: "include"`. State-changing requests send `X-Requested-With: XMLHttpRequest`. Protected routes bootstrap from `GET /api/v1/auth/session`.

