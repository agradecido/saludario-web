export interface ProblemFieldError {
  code?: string;
  field?: string;
  message: string;
}

export interface ProblemDetails {
  code?: string;
  detail?: string;
  errors?: ProblemFieldError[];
  instance?: string;
  request_id?: string;
  status: number;
  title: string;
  type?: string;
}

export class ApiError extends Error {
  problem: ProblemDetails;
  status: number;

  constructor(problem: ProblemDetails) {
    super(problem.detail ?? problem.title);
    this.name = "ApiError";
    this.problem = problem;
    this.status = problem.status;
  }
}

function isProblemDetails(value: unknown): value is ProblemDetails {
  return typeof value === "object" && value !== null && "status" in value && "title" in value;
}

function toProblemDetails(response: Response, payload: unknown): ProblemDetails {
  if (isProblemDetails(payload)) {
    return payload;
  }

  return {
    status: response.status,
    title: response.statusText || "Request failed",
    detail: typeof payload === "string" ? payload : undefined
  };
}

function isStateChangingMethod(method: string): boolean {
  return method === "POST" || method === "PATCH" || method === "DELETE";
}

export function isApiErrorStatus(error: unknown, status: number): error is ApiError {
  return error instanceof ApiError && error.status === status;
}

export function getProblemMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    return error.problem.detail ?? error.problem.title ?? fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export async function apiRequest<TResponse>(
  path: string,
  init: Omit<RequestInit, "body"> & { body?: BodyInit | object } = {}
): Promise<TResponse> {
  const method = (init.method ?? "GET").toUpperCase();
  const headers = new Headers(init.headers);
  const rawBody = init.body;
  const isFormData = rawBody instanceof FormData;

  if (rawBody !== undefined && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (isStateChangingMethod(method) && !headers.has("X-Requested-With")) {
    headers.set("X-Requested-With", "XMLHttpRequest");
  }

  const response = await fetch(path, {
    ...init,
    method,
    headers,
    credentials: "include",
    body:
      rawBody === undefined
        ? undefined
        : rawBody instanceof FormData || typeof rawBody === "string" || rawBody instanceof Blob
          ? rawBody
          : JSON.stringify(rawBody)
  });

  if (response.status === 204) {
    return undefined as TResponse;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? ((await response.json()) as unknown)
    : await response.text();

  if (!response.ok) {
    throw new ApiError(toProblemDetails(response, payload));
  }

  return payload as TResponse;
}
