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
