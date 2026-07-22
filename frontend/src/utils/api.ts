// src/utils/api.ts

const API_BASE_URL = 'http://localhost:8000/api';

interface FetchOptions extends RequestInit {
  token?: string | null;
}

export const fetchApi = async (endpoint: string, options: FetchOptions = {}) => {
  const { token, headers, ...restOptions } = options;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    ...restOptions,
  });

  if (response.status === 401) {
    // Optionally trigger a global logout event here if needed, 
    // but usually the components handle 401 by redirecting or context handles it.
    throw new Error('Unauthorized');
  }

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};
