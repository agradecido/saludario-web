# Saludario Web

Frontend web app for the Saludario API.

## Stack

- React 19
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod

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

## Implemented flows

- Register, login, logout, and session bootstrap
- Categories fetch for entry forms and filters
- Entry listing with cursor pagination
- Entry creation
- Entry editing
- Entry deletion
- Entry filtering by category and date range

## API behavior mirrored in the client

- All requests use `credentials: "include"`
- `POST`, `PATCH`, and `DELETE` requests send `X-Requested-With: XMLHttpRequest`
- Protected routes bootstrap from `GET /api/v1/auth/session`

