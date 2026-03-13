import { createBrowserRouter, Outlet } from "react-router-dom";

function Shell() {
  return (
    <div className="app-shell">
      <header className="hero-panel">
        <p className="eyebrow">Food diary for symptom-aware routines</p>
        <h1>Saludario</h1>
        <p className="hero-copy">
          Track meals, keep your timeline clean, and stay aligned with the existing API contract.
        </p>
      </header>

      <main className="content-panel">
        <Outlet />
      </main>
    </div>
  );
}

function EntriesPlaceholder() {
  return (
    <section className="surface">
      <p className="section-label">Entries</p>
      <h2>Workspace scaffolded</h2>
      <p>
        Routing, React Query, and the development proxy are in place. Auth and entries flows are the
        next implementation steps.
      </p>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Shell />,
    children: [{ index: true, element: <EntriesPlaceholder /> }]
  }
]);

