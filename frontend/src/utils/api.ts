// src/utils/api.ts

const API_BASE_URL = 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
  bypassCache?: boolean;
}

// In-memory cache & deduplication for GET requests
const apiCache = new Map<string, { data: any; timestamp: number }>();
const pendingRequests = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 3000; // 3 seconds cache for instant tab/page switching

export const clearApiCache = () => {
  apiCache.clear();
};

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { token, headers, bypassCache = false, method = 'GET', ...restOptions } = options;

  const isGetMethod = !method || method.toUpperCase() === 'GET';
  const cacheKey = `${token || 'public'}:${endpoint}`;

  // Invalidate cache on write operations (POST, PUT, DELETE)
  if (!isGetMethod) {
    clearApiCache();
  }

  // Check cache for GET requests
  if (isGetMethod && !bypassCache) {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    // Deduplicate in-flight requests
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const fetchPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          ...defaultHeaders,
          ...headers,
        },
        ...restOptions,
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      if (isGetMethod && !bypassCache) {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
      }

      return data;
    } finally {
      if (isGetMethod) {
        pendingRequests.delete(cacheKey);
      }
    }
  })();

  if (isGetMethod && !bypassCache) {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
};

export const downloadFileApi = async (endpoint: string, token?: string | null, defaultFilename = 'download.xlsx') => {
  const headers: HeadersInit = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

  if (!response.ok) {
    throw new Error('Gagal mengunduh file');
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', defaultFilename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};
