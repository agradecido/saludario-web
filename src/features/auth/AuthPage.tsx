import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useRevalidator } from "react-router-dom";

import { ApiError, getProblemMessage } from "../../lib/api";
import {
  authSessionQueryOptions,
  loginUser,
  registerUser,
  type LoginInput,
  type RegisterInput
} from "./auth";
import {
  loginFormSchema,
  registerFormSchema,
  type LoginFormValues,
  type RegisterFormValues
} from "./auth.schemas";

interface AuthPageProps {
  mode: "login" | "register";
}

type FormValues = LoginFormValues | RegisterFormValues;

function isRegisterMode(mode: AuthPageProps["mode"]): mode is "register" {
  return mode === "register";
}

export function AuthPage({ mode }: AuthPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const revalidator = useRevalidator();
  const [formError, setFormError] = useState<string | null>(null);
  const registerMode = isRegisterMode(mode);
  const form = useForm<FormValues>({
    resolver: zodResolver(registerMode ? registerFormSchema : loginFormSchema),
    defaultValues: registerMode ? { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone } : {}
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      if (registerMode) {
        return registerUser(values as RegisterInput);
      }

      return loginUser(values as LoginInput);
    },
    onSuccess: async () => {
      setFormError(null);
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      await queryClient.fetchQuery(authSessionQueryOptions());
      revalidator.revalidate();
      await navigate("/");
    },
    onError: (error) => {
      if (error instanceof ApiError && error.problem.errors) {
        for (const issue of error.problem.errors) {
          if (issue.field) {
            form.setError(issue.field as keyof FormValues, {
              message: issue.message
            });
          }
        }
      }

      setFormError(
        getProblemMessage(
          error,
          registerMode ? "No se pudo crear la cuenta." : "No se pudo iniciar sesión."
        )
      );
    }
  });

  const isPending = mutation.isPending;
  const timezoneError = registerMode
    ? (form.formState.errors as { timezone?: { message?: string } }).timezone?.message
    : undefined;

  return (
    <div className="rounded-2xl bg-(--color-surface) p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        {registerMode ? "Crear cuenta" : "Iniciar sesión"}
      </h2>
      <p className="mt-1 text-sm text-(--color-text-secondary)">
        {registerMode
          ? "Empieza a registrar tu alimentación."
          : "Continúa donde lo dejaste."}
      </p>

      <form
        className="mt-5 space-y-4"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Field
          error={form.formState.errors.email?.message}
          label="Email"
        >
          <input
            autoComplete="email"
            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
            placeholder="tu@email.com"
            type="email"
            {...form.register("email")}
          />
        </Field>

        <Field
          error={form.formState.errors.password?.message}
          label="Contraseña"
        >
          <input
            autoComplete={registerMode ? "new-password" : "current-password"}
            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
            placeholder={registerMode ? "Mínimo 8 caracteres" : "Tu contraseña"}
            type="password"
            {...form.register("password")}
          />
        </Field>

        {registerMode ? (
          <Field
            error={timezoneError}
            label="Zona horaria"
          >
            <input
              className="w-full rounded-xl border border-(--color-border) bg-(--color-surface-alt) px-3.5 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-tertiary) focus:border-(--color-brand-500) focus:outline-none"
              placeholder="Europe/Madrid"
              type="text"
              {...form.register("timezone")}
            />
          </Field>
        ) : null}

        {formError ? (
          <p className="rounded-xl bg-(--color-error-bg) px-3.5 py-2.5 text-sm text-(--color-error)">
            {formError}
          </p>
        ) : null}

        <button
          className="w-full rounded-xl bg-(--color-brand-600) py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-brand-700) disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Procesando..." : registerMode ? "Crear cuenta" : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-(--color-text-secondary)">
        {registerMode ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
        <Link
          className="font-medium text-(--color-brand-600) hover:text-(--color-brand-700)"
          to={registerMode ? "/login" : "/register"}
        >
          {registerMode ? "Inicia sesión" : "Regístrate"}
        </Link>
      </p>
    </div>
  );
}

function Field({
  children,
  error,
  label
}: {
  children: React.ReactNode;
  error?: string;
  label: string;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-(--color-text-secondary)">{label}</span>
      {children}
      {error ? <span className="text-xs text-(--color-error)">{error}</span> : null}
    </label>
  );
}
