# Saludario Web

Frontend web app for the Saludario API.

## Product context

Saludario is a web-based food diary application focused on health.

The goal of Saludario is to let users record what they eat, organize meals by category, and eventually help identify patterns between food intake and later symptoms or health issues.

Core product scope:

- User registration
- User login
- Personal meal history
- Add food entries
- Retrieve and browse entries
- Edit and manage entries
- Meal categorization:
  - Breakfast
  - Lunch
  - Dinner
  - Snack
- Symptom tracking (events)

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

## API behavior mirrored in the client

- All requests use `credentials: "include"`
- `POST`, `PATCH`, and `DELETE` requests send `X-Requested-With: XMLHttpRequest`
- Protected routes bootstrap from `GET /api/v1/auth/session`

