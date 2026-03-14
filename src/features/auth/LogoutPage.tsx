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
    <div className="flex min-h-[60dvh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Cerrando sesión...</h2>
        <p className="mt-1 text-sm text-(--color-text-secondary)">Un momento.</p>
      </div>
    </div>
  );
}
