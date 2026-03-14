import { useQuery } from "@tanstack/react-query";
import {
  Link,
  NavLink,
  Outlet,
  createBrowserRouter,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError
} from "react-router-dom";

import { AuthPage } from "../features/auth/AuthPage";
import { LogoutPage } from "../features/auth/LogoutPage";
import { DashboardPage } from "../features/dashboard/DashboardPage";
import {
  authSessionQueryOptions,
  guestLoader,
  protectedLoader,
  type SessionResponse
} from "../features/auth/auth";
import { EntriesPage } from "../features/entries/EntriesPage";

function AuthenticatedLayout() {
  const sessionData = useLoaderData() as SessionResponse;

  useQuery({
    ...authSessionQueryOptions(),
    initialData: sessionData
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-4 py-3 sm:px-6">
        <NavLink
          className="text-lg font-bold tracking-tight text-(--color-text)"
          to="/"
        >
          Saludario
        </NavLink>

        <nav className="flex items-center gap-1">
          <NavLink
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-(--color-brand-600) text-white"
                  : "text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface-hover)"
              }`
            }
            to="/"
            end
          >
            Inicio
          </NavLink>
          <NavLink
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-(--color-brand-600) text-white"
                  : "text-(--color-text-secondary) hover:text-(--color-text) hover:bg-(--color-surface-hover)"
              }`
            }
            to="/entries"
          >
            Historial
          </NavLink>
          <Link
            className="ml-2 rounded-lg px-3 py-1.5 text-sm text-(--color-text-tertiary) transition-colors hover:text-(--color-text) hover:bg-(--color-surface-hover)"
            to="/logout"
          >
            Salir
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function PublicLayout() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-(--color-surface-alt) px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Saludario</h1>
          <p className="mt-1 text-sm text-(--color-text-secondary)">
            Tu diario de alimentación y bienestar
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}

function RouteErrorBoundary() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : "Error de aplicación";
  const detail =
    isRouteErrorResponse(error) && typeof error.data === "string"
      ? error.data
      : "No se ha podido cargar esta página.";

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-(--color-surface) p-8 text-center shadow-lg">
        <p className="mb-2 text-xs font-semibold tracking-widest text-(--color-error) uppercase">
          Error
        </p>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="mt-2 text-sm text-(--color-text-secondary)">{detail}</p>
        <Link
          className="mt-6 inline-block rounded-xl bg-(--color-brand-600) px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-700)"
          to="/"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        loader: protectedLoader,
        element: <AuthenticatedLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />
          },
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
        element: <AuthenticatedLayout />,
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
