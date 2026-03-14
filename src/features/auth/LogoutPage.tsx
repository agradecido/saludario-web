import { useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "./auth";

export function LogoutPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const hasStartedRef = useRef(false);
  const mutation = useMutation({
    mutationFn: logoutUser,
    onSettled: async () => {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      await navigate("/login", { replace: true });
    }
  });

  useEffect(() => {
    if (hasStartedRef.current) {
      return;
    }

    hasStartedRef.current = true;
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
