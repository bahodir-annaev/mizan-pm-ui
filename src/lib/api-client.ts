import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from './config';
import { getAccessToken, setAccessToken, clearTokens } from '@/app/auth/auth-storage';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // send httpOnly refresh cookie
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT bearer token to every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether a token refresh is already in-flight to avoid loop
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

function onRefreshed(token: string) {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
}

// Unwrap response envelope { data, meta, errors } and handle 401 → refresh
apiClient.interceptors.response.use(
  (response) => {
    // If the backend wraps data in { data: ... }, unwrap it
    if (response.data && typeof response.data === 'object' && 'data' in response.data) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error: AxiosError) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };
    console.log(error);
    if (error.config?.url !== '/auth/refresh' && error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshQueue.push((token: string) => {
            if (original.headers) {
              (original.headers as Record<string, string>).Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(original));
          });
        });
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        const newToken: string = data?.accessToken ?? data?.data?.accessToken;
        setAccessToken(newToken);
        onRefreshed(newToken);
        window.dispatchEvent(new Event('token-refreshed'));
        if (original.headers) {
          (original.headers as Record<string, string>).Authorization = `Bearer ${newToken}`;
        }
        return apiClient(original);
      } catch {
        clearTokens();
        if (window.location.pathname !== '/login') window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
