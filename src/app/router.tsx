import { useQuery } from "@tanstack/react-query";
import {
  NavLink,
  Outlet,
  createBrowserRouter,
  isRouteErrorResponse,
  redirect,
  useLoaderData,
  useRouteError
} from "react-router-dom";

import { AuthPage } from "../features/auth/AuthPage";
import { LogoutPage } from "../features/auth/LogoutPage";
import {
  authSessionQueryOptions,
  guestLoader,
  protectedLoader,
  type SessionResponse
} from "../features/auth/auth";
import { EntriesPage } from "../features/entries/EntriesPage";

function BrandBlock() {
  return (
    <header className="hero-panel">
      <p className="eyebrow">Food diary for symptom-aware routines</p>
      <h1>Saludario</h1>
      <p className="hero-copy">
        The frontend now mirrors the backend contract directly: cookie sessions, protected history,
        category lookups, and entry CRUD from one workspace.
      </p>
    </header>
  );
}

function AuthenticatedLayout() {
  const sessionData = useLoaderData() as SessionResponse;

  useQuery({
    ...authSessionQueryOptions(),
    initialData: sessionData
  });

  return (
    <div className="app-shell">
      <BrandBlock />

      <div className="content-stack">
        <section className="surface surface-nav">
          <div>
            <p className="section-label">Active session</p>
            <h2>{sessionData.user.email}</h2>
            <p className="surface-copy">Timezone: {sessionData.user.timezone}</p>
          </div>

          <nav className="nav-row">
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
              to="/entries"
            >
              Entries
            </NavLink>
            <NavLink
              className={({ isActive }) => (isActive ? "nav-link nav-link-active" : "nav-link")}
              to="/logout"
            >
              Logout
            </NavLink>
          </nav>
        </section>

        <main className="content-panel">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="app-shell">
      <BrandBlock />
      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  );
}

function RouteErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Application error";
  const detail =
    isRouteErrorResponse(error) && typeof error.data === "string"
      ? error.data
      : "The current route could not be rendered.";

  return (
    <div className="app-shell">
      <BrandBlock />
      <main className="content-panel">
        <section className="surface surface-form">
          <p className="section-label">Error</p>
          <h2>{title}</h2>
          <p className="surface-copy">{detail}</p>
        </section>
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        loader: async () => redirect("/entries")
      },
      {
        loader: protectedLoader,
        element: <AuthenticatedLayout />,
        children: [
          {
            path: "entries",
            element: <EntriesPage />
          },
          {
            path: "entries/:entryId/edit",
            element: <EntriesPage />
          }
        ]
      },
      {
        loader: guestLoader,
        element: <PublicLayout />,
        children: [
          {
            path: "login",
            element: <AuthPage mode="login" />
          },
          {
            path: "register",
            element: <AuthPage mode="register" />
          }
        ]
      },
      {
        path: "logout",
        loader: protectedLoader,
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <LogoutPage />
          }
        ]
      }
    ]
  }
]);
