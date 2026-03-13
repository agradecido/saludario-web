# Frontend Handoff

Project: `Saludario Web`

Goal: build the frontend web app for the existing Saludario API.

## Backend repo

- `/home/javi/sites/saludario-api`

## Backend status

- Backend MVP is implemented through phases 1-5
- Security review fixes have also been applied
- Working tree was clean at handoff time

## Main backend docs

- [README.md](./README.md)
- [docs/API_CONTRACT.md](./docs/API_CONTRACT.md)
- [docs/openapi.json](./docs/openapi.json)
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [docs/SECURITY_CHECKLIST.md](./docs/SECURITY_CHECKLIST.md)

## Implemented backend behavior

### Auth

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/session`

Notes:
- Auth uses cookie-based server sessions
- Requests must use `credentials: "include"`
- State-changing requests must include `X-Requested-With: XMLHttpRequest`
- Logout is protected and returns `401` without a valid session

### Categories

- `GET /api/v1/categories`

### Food entries

- `GET /api/v1/entries`
- `POST /api/v1/entries`
- `GET /api/v1/entries/:entry_id`
- `PATCH /api/v1/entries/:entry_id`
- `DELETE /api/v1/entries/:entry_id`

### Internal symptoms API

- `POST /api/v1/internal/symptoms/events`
- `GET /api/v1/internal/symptoms/events`
- `GET /api/v1/internal/symptoms/events/:symptom_event_id`

## Frontend constraints

- All code and commit messages must be in English
- Work step by step
- Show what was done at each step
- One commit per step
- Run checks before each commit

## Recommended frontend stack

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- React Hook Form
- Zod

## Recommended frontend architecture

- Separate repo: `saludario-web`
- Shared API client layer
- Route-level auth bootstrap using `GET /api/v1/auth/session`
- Dev proxy to backend API in local development

## Required frontend request behavior

- Always send cookies:

```ts
credentials: "include"
```

- For `POST`, `PATCH`, and `DELETE`, also send:

```ts
headers: {
  "X-Requested-With": "XMLHttpRequest"
}
```

## Suggested first milestone

1. Scaffold `saludario-web` with Vite + React + TypeScript
2. Add routing, query client, and shared API client
3. Configure local dev proxy to the backend
4. Build auth pages:
   - register
   - login
   - logout
   - session bootstrap
5. Build entries UI:
   - list
   - create
   - edit
   - delete
6. Build categories integration
7. Optionally expose symptoms UI later

## Ready-to-paste prompt for the new Codex session

```text
Project: Saludario Web
Goal: build the frontend web app for the existing Saludario API

Backend repo:
- /home/javi/sites/saludario-api

Backend status:
- Backend MVP is already implemented through phases 1-5
- Security review fixes have been applied
- Auth is cookie-based server sessions
- Frontend must use credentials: "include"
- State-changing requests must send X-Requested-With: XMLHttpRequest

Main backend docs:
- /home/javi/sites/saludario-api/docs/API_CONTRACT.md
- /home/javi/sites/saludario-api/docs/openapi.json
- /home/javi/sites/saludario-api/README.md

Important backend behavior:
- Auth endpoints:
  - POST /api/v1/auth/register
  - POST /api/v1/auth/login
  - POST /api/v1/auth/logout
  - GET /api/v1/auth/session
- Food entries:
  - GET/POST /api/v1/entries
  - GET/PATCH/DELETE /api/v1/entries/:entry_id
- Categories:
  - GET /api/v1/categories
- Internal symptoms:
  - POST /api/v1/internal/symptoms/events
  - GET /api/v1/internal/symptoms/events
  - GET /api/v1/internal/symptoms/events/:symptom_event_id

Frontend constraints:
- Code and commit messages in English
- Work step by step
- Show what was done at each step
- One commit per step
- Run checks before each commit

Recommended frontend direction:
- New repo: saludario-web
- React + TypeScript + Vite
- React Router
- TanStack Query
- React Hook Form + Zod
- Use a shared API client wrapper
- Use a dev proxy to the API in local development

First thing to do:
- scaffold the frontend repo
- set up API client with credentials include and CSRF header for POST/PATCH/DELETE
- create the initial app shell and auth flow
```
