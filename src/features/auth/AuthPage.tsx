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
      await navigate("/entries");
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
          registerMode ? "Registration failed. Please try again." : "Login failed. Please try again."
        )
      );
    }
  });

  const isPending = mutation.isPending;
  const timezoneError = registerMode
    ? (form.formState.errors as { timezone?: { message?: string } }).timezone?.message
    : undefined;

  return (
    <section className="surface surface-form">
      <p className="section-label">{registerMode ? "Register" : "Login"}</p>
      <h2>{registerMode ? "Create your meal timeline" : "Continue your tracking session"}</h2>
      <p className="surface-copy">
        {registerMode
          ? "The backend establishes the session immediately after registration."
          : "Sessions are cookie-based, so the browser stays aligned with the API after login."}
      </p>

      <form
        className="stack-form"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            placeholder="user@example.com"
            type="email"
            {...form.register("email")}
          />
          <FieldError message={form.formState.errors.email?.message} />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            autoComplete={registerMode ? "new-password" : "current-password"}
            placeholder={registerMode ? "At least 8 characters" : "Your password"}
            type="password"
            {...form.register("password")}
          />
          <FieldError message={form.formState.errors.password?.message} />
        </label>

        {registerMode ? (
          <label className="field">
            <span>Timezone</span>
            <input
              placeholder="Europe/Madrid"
              type="text"
              {...form.register("timezone")}
            />
            <FieldError message={timezoneError} />
          </label>
        ) : null}

        {formError ? <p className="callout-error">{formError}</p> : null}

        <button
          className="button-primary"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Working..." : registerMode ? "Create account" : "Log in"}
        </button>
      </form>

      <p className="inline-note">
        {registerMode ? "Already have an account?" : "Need an account?"}{" "}
        <Link to={registerMode ? "/login" : "/register"}>
          {registerMode ? "Log in instead" : "Register here"}
        </Link>
      </p>
    </section>
  );
}

function FieldError({ message }: { message?: string }) {
  return message ? <span className="field-error">{message}</span> : null;
}
