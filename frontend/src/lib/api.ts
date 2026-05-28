import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

export type ApiResponse<T> = { success: boolean; message: string; data: T; timestamp: string };

type TokenResponse = { accessToken: string; refreshToken: string; fullName: string; roles: string[] };
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? '/api/v1' });

const authKeys = ['accessToken', 'refreshToken', 'fullName', 'roles'];
const authExpiredEvent = 'veetu-auth-expired';
const authUpdatedEvent = 'veetu-auth-updated';

function dispatchAuthEvent(name: string, detail?: TokenResponse) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

function storeAuth(data: TokenResponse) {
  localStorage.setItem('accessToken', data.accessToken);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('fullName', data.fullName);
  localStorage.setItem('roles', JSON.stringify(data.roles));
  dispatchAuthEvent(authUpdatedEvent, data);
}

function clearAuth() {
  authKeys.forEach((key) => localStorage.removeItem(key));
  dispatchAuthEvent(authExpiredEvent);
}

function isAuthEndpoint(config?: RetryConfig) {
  return config?.url?.startsWith('/auth/') || config?.url?.includes('/auth/');
}

export function isAuthError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function apiErrorMessage(error: unknown, fallback = 'Request failed') {
  if (axios.isAxiosError<ApiResponse<unknown>>(error)) {
    return error.response?.data?.message || error.message || fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown>>) => {
    const original = error.config as RetryConfig | undefined;
    const refreshToken = localStorage.getItem('refreshToken');
    if (isAuthError(error) && refreshToken && original && !original._retry && !isAuthEndpoint(original)) {
      original._retry = true;
      try {
        const response = await axios.post<ApiResponse<TokenResponse>>(`${api.defaults.baseURL}/auth/refresh`, { refreshToken });
        const data = response.data.data;
        storeAuth(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        clearAuth();
      }
    }
    if (isAuthError(error)) clearAuth();
    return Promise.reject(error);
  },
);
