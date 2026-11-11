// src/services/api.ts

const BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:8080'
).replace(/\/$/, '');

type RequestData = unknown;

async function handleResponse<T>(
  response: Response
): Promise<T> {
  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      responseText || 'Erro ao processar a requisição.'
    );
  }

  // Algumas respostas podem não possuir corpo.
  if (!responseText) {
    return undefined as T;
  }

  const contentType = response.headers.get('content-type');

  if (
    contentType &&
    contentType.includes('application/json')
  ) {
    return JSON.parse(responseText) as T;
  }

  return responseText as T;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });

  return handleResponse<T>(response);
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'GET',
    });
  },

  async post<T>(
    endpoint: string,
    data?: RequestData
  ): Promise<T> {
    return request<T>(endpoint, {
      method: 'POST',
      body:
        data !== undefined
          ? JSON.stringify(data)
          : undefined,
    });
  },

  async put<T>(
    endpoint: string,
    data?: RequestData
  ): Promise<T> {
    return request<T>(endpoint, {
      method: 'PUT',
      body:
        data !== undefined
          ? JSON.stringify(data)
          : undefined,
    });
  },

  async delete<T>(endpoint: string): Promise<T> {
    return request<T>(endpoint, {
      method: 'DELETE',
    });
  },
};
