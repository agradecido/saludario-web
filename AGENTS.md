# Project Guidelines

## Language Policy

- **Code, comments, commit messages, branch names:** Always in English.
- **UI copy (labels, errors, placeholders):** Spanish — the app targets Spanish-speaking users.

## Code Style

- TypeScript strict mode — no `any`, no type assertions unless unavoidable.
- Named exports only; no default exports.
- Interfaces over type aliases for object shapes.
- Alphabetical property order in interfaces by convention (see `Entry`, `ProblemDetails`).
- Use `function` declarations for top-level functions; arrow functions for callbacks and inline handlers.
- Prefer early returns over nested conditionals.
- No barrel files (`index.ts`); import directly from the source module.

## Architecture

### Feature-based structure

```
src/features/<feature>/
  <feature>.ts            # API layer: interfaces, fetch functions, query options
  <feature>.schemas.ts    # Zod schemas for form validation
  <Feature>Page.tsx       # Page-level React component
  <Feature>Modal.tsx      # Modal components (if applicable)
```

Each feature owns its API layer, validation schemas, and UI. Shared utilities live in `src/lib/`, reusable components in `src/components/`.

The `src/features/events/` directory holds the shared event domain:
- `events.ts` — `BaseEvent`, `FoodEvent`, `SymptomEvent`, `AppEvent` discriminated union, `AppEventsPage`
- `events.schemas.ts` — `appEventFormSchema` combining sub-schemas via `z.discriminatedUnion('type', [...])`

### Layers and responsibilities

| Layer | Location | Responsibility |
|-------|----------|----------------|
| API client | `src/lib/api.ts` | Fetch wrapper, `ApiError`, RFC 7807 parsing |
| Date utilities | `src/lib/datetime.ts` | Timezone-aware formatting and conversion |
| Event domain | `src/features/events/` | `AppEvent` union, `AppEventsPage`, `appEventFormSchema` |
| Feature API | `src/features/*/*.ts` | Domain interfaces, API functions, query options |
| Validation | `src/features/*/*.schemas.ts` | Zod schemas for form data |
| UI | `src/features/*/*.tsx` | React components (pages, modals, forms) |
| Routing | `src/app/router.tsx` | Route tree, layouts, loaders, error boundary |
| Query config | `src/app/query-client.ts` | TanStack Query client defaults |

### Key patterns

- **Server state:** TanStack Query — use `queryOptions()` factories in feature API files.
- **Form state:** React Hook Form + `@hookform/resolvers` + Zod schema.
- **API calls:** All go through `apiRequest<T>()`. Never call `fetch()` directly.
- **Error handling:** API errors are `ApiError` instances wrapping RFC 7807 `ProblemDetails`. Use `isApiErrorStatus()` for status checks, `getProblemMessage()` for display text.
- **Auth:** Cookie-based sessions. Protected routes use `protectedLoader`; guest routes use `guestLoader`. Session is cached via TanStack Query.
- **Routing:** React Router with `createBrowserRouter`, loader-based auth guards, and `<Outlet />` layouts.
- **Styling:** Tailwind CSS 4 utility classes with CSS custom property theme tokens defined in `src/styles/index.css`. Light/dark mode via `prefers-color-scheme`. Use semantic token names (`--color-surface`, `--color-text-secondary`, `--color-brand-600`) instead of raw Tailwind colors.
- **Event model:** All user-recorded data is typed as `AppEvent = FoodEvent | SymptomEvent`. API functions in `entries.ts` and `symptoms.ts` attach the `type` discriminator at the response boundary. Use `getEventTimestamp(event)` to resolve the canonical timestamp across event types.

## Build and Test

```bash
npm install          # Install dependencies
npm run dev          # Vite dev server with HMR (proxies /api/* → localhost:3000)
npm run check        # TypeScript type-check + Vite production build
```

Run `npm run check` before committing. The build must pass with zero errors.

## Conventions

### Commits

- One commit per logical change — each commit must be self-contained and buildable.
- Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `refactor:`, `chore:`, `docs:`, `style:`, `test:`.
- Commit message body in English; concise imperative mood (`Add entry form validation`, not `Added...`).

### Branches

- `feat/<short-description>` for features, `fix/<short-description>` for bug fixes.

### API integration

- All endpoints are listed in `README.md § API endpoints used`.
- State-changing requests (`POST`, `PATCH`, `DELETE`) must include `X-Requested-With: XMLHttpRequest` — handled automatically by `apiRequest()`.
- All requests use `credentials: "include"` — handled automatically by `apiRequest()`.

### Component patterns

- Pages are suffixed `Page` (e.g., `EntriesPage`), modals suffixed `Modal` (e.g., `AddEntryModal`).
- Form mutations invalidate relevant queries on success, then close/reset the form.
- Field-level API errors (`ProblemDetails.errors[]`) are mapped to form fields via `setError()`.

### Dependencies

- Do not add new dependencies without explicit approval.
- Current stack: React 19, React Router 7, TanStack Query 5, React Hook Form 7, Zod 4, Tailwind CSS 4, Vite 7.
