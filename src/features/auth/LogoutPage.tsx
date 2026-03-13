import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useRevalidator } from "react-router-dom";

import { logoutUser } from "./auth";

export function LogoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  const mutation = useMutation({
    mutationFn: logoutUser,
    onSettled: async () => {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      revalidator.revalidate();
      await navigate("/login", { replace: true });
    }
  });

  useEffect(() => {
    mutation.mutate();
  }, [mutation]);

  return (
    <section className="surface surface-form">
      <p className="section-label">Logout</p>
      <h2>Clearing the active session</h2>
      <p className="surface-copy">The app is revoking the current cookie-based session.</p>
    </section>
  );
}

