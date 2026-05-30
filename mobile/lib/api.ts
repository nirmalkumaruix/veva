import { API_BASE_URL } from './config';
import type { ApiResponse, TokenResponse } from './types';

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string | null;
};

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export function apiErrorMessage(error: unknown, fallback = 'Request failed') {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return fallback;
}

export async function request<T>(path: string, options: RequestOptions = {}) {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  let json: ApiResponse<T> | undefined;
  try {
    json = await response.json();
  } catch {
    json = undefined;
  }

  if (!response.ok || json?.success === false) {
    throw new ApiError(json?.message || `Request failed with ${response.status}`, response.status);
  }

  return json?.data as T;
}

export function apiUrl(path?: string | null) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('upi://')) return path;
  return `${API_BASE_URL.replace('/api/v1', '')}${path}`;
}

export async function login(email: string, password: string) {
  return request<TokenResponse>('/auth/login', { method: 'POST', body: { email, password } });
}

export async function register(payload: {
  email: string;
  password: string;
  fullName: string;
  mobile: string;
  role: 'OWNER' | 'TENANT';
}) {
  return request<TokenResponse>('/auth/register', { method: 'POST', body: payload });
}

export async function refresh(refreshToken: string) {
  return request<TokenResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } });
}

export function formatCurrency(value: unknown) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}
