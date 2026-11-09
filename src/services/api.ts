import axios from 'axios';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
export type AuthPayload = {
  sub: string;
  userId?: string;
  email: string;
  name?: string;
  organizationId: string;
  roles: string[];
  permissions?: string[];
};

export function getAuthPayload(): AuthPayload | null {
  const token = localStorage.getItem('ohdah_access_token');
  if (!token) return null;
  try {
    const encoded = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(encoded.padEnd(encoded.length + ((4 - (encoded.length % 4)) % 4), '='));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decoded = new TextDecoder('utf-8').decode(bytes);
    return JSON.parse(decoded) as AuthPayload;
  } catch {
    return null;
  }
}

export const getOrganizationId = () => getAuthPayload()?.organizationId || '';
export const getCurrentUserId = () => getAuthPayload()?.sub || '';

export const api = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ohdah_access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

async function coordinateTokenRefresh(failedRefreshToken: string): Promise<string> {
  const performActualRefresh = async (tokenToUse: string): Promise<string> => {
    try {
      const res = await axios.post<{ accessToken: string; refreshToken?: string }>(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken: tokenToUse },
      );
      const newAccessToken = res.data?.accessToken;
      if (!newAccessToken) {
        throw new Error('لم يتم استلام رمز دخول صالح.');
      }
      localStorage.setItem('ohdah_access_token', newAccessToken);
      if (res.data.refreshToken) {
        localStorage.setItem('ohdah_refresh_token', res.data.refreshToken);
      }
      api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
      return newAccessToken;
    } catch (err: unknown) {
      // Re-read storage: another tab might have refreshed concurrently
      const currentStored = localStorage.getItem('ohdah_refresh_token');
      const currentAccess = localStorage.getItem('ohdah_access_token');
      if (currentStored && currentStored !== tokenToUse && currentAccess) {
        api.defaults.headers.common.Authorization = `Bearer ${currentAccess}`;
        return currentAccess;
      }

      // ONLY remove tokens if the token currently in localStorage is still the failed one!
      if (currentStored === tokenToUse) {
        localStorage.removeItem('ohdah_access_token');
        localStorage.removeItem('ohdah_refresh_token');
      }
      throw err;
    }
  };

  // Cross-tab coordination via Web Locks API where supported
  if (typeof navigator !== 'undefined' && navigator.locks && navigator.locks.request) {
    return navigator.locks.request('ohdah_auth_refresh_lock', async () => {
      const latestAccess = localStorage.getItem('ohdah_access_token');
      const latestRefresh = localStorage.getItem('ohdah_refresh_token');

      // If another tab already rotated the token while this tab was waiting for the lock
      if (latestRefresh && latestRefresh !== failedRefreshToken && latestAccess) {
        api.defaults.headers.common.Authorization = `Bearer ${latestAccess}`;
        return latestAccess;
      }

      if (!latestRefresh) {
        throw new Error('لا يوجد رمز تحديث متوفر.');
      }

      return performActualRefresh(latestRefresh);
    });
  } else {
    // Safe fallback for browsers/environments without Web Locks API
    const latestAccess = localStorage.getItem('ohdah_access_token');
    const latestRefresh = localStorage.getItem('ohdah_refresh_token');
    if (latestRefresh && latestRefresh !== failedRefreshToken && latestAccess) {
      api.defaults.headers.common.Authorization = `Bearer ${latestAccess}`;
      return latestAccess;
    }
    if (!latestRefresh) {
      throw new Error('لا يوجد رمز تحديث متوفر.');
    }
    return performActualRefresh(latestRefresh);
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest?._retry) {
      // Do not attempt refresh if the 401 came from the refresh endpoint itself
      if (originalRequest?.url?.includes('/auth/refresh')) {
        const storedRefresh = localStorage.getItem('ohdah_refresh_token');
        let requestToken: string | undefined;
        try {
          const reqData = typeof originalRequest.data === 'string'
            ? JSON.parse(originalRequest.data)
            : originalRequest.data;
          requestToken = reqData?.refreshToken;
        } catch {
          requestToken = undefined;
        }
        if (!requestToken || requestToken === storedRefresh) {
          localStorage.removeItem('ohdah_access_token');
          localStorage.removeItem('ohdah_refresh_token');
        }
        return Promise.reject(error);
      }

      // Single-tab queue: if this tab is already refreshing, wait for it
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const currentRefreshToken = localStorage.getItem('ohdah_refresh_token') || '';

      try {
        const newAccessToken = await coordinateTokenRefresh(currentRefreshToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown, fallback = 'تعذر تنفيذ الطلب. حاول مرة أخرى.') {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message;
    return Array.isArray(message) ? message.join('، ') : message || fallback;
  }
  return fallback;
}
