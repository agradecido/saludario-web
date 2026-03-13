import { queryOptions } from "@tanstack/react-query";
import { redirect } from "react-router-dom";

import { queryClient } from "../../app/query-client";
import { apiRequest, isApiErrorStatus } from "../../lib/api";

export interface UserSummary {
  email: string;
  id: string;
  timezone: string;
}

export interface SessionResponse {
  session: {
    expires_at: string;
  };
  user: UserSummary;
}

export interface AuthPayload {
  user: UserSummary;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  timezone?: string;
}

export function authSessionQueryOptions() {
  return queryOptions({
    queryKey: ["auth", "session"],
    queryFn: getSession,
    retry: false,
    staleTime: 60_000
  });
}

export async function getSession(): Promise<SessionResponse> {
  return apiRequest<SessionResponse>("/api/v1/auth/session");
}

export async function registerUser(input: RegisterInput): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/api/v1/auth/register", {
    method: "POST",
    body: input
  });
}

export async function loginUser(input: LoginInput): Promise<AuthPayload> {
  return apiRequest<AuthPayload>("/api/v1/auth/login", {
    method: "POST",
    body: input
  });
}

export async function logoutUser(): Promise<void> {
  return apiRequest<void>("/api/v1/auth/logout", {
    method: "POST"
  });
}

export async function protectedLoader(): Promise<SessionResponse> {
  try {
    return await queryClient.ensureQueryData(authSessionQueryOptions());
  } catch (error) {
    if (isApiErrorStatus(error, 401)) {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      throw redirect("/login");
    }

    throw error;
  }
}

export async function guestLoader(): Promise<null> {
  try {
    await queryClient.ensureQueryData(authSessionQueryOptions());
    throw redirect("/entries");
  } catch (error) {
    if (isApiErrorStatus(error, 401)) {
      queryClient.removeQueries({ queryKey: ["auth", "session"] });
      return null;
    }

    throw error;
  }
}

