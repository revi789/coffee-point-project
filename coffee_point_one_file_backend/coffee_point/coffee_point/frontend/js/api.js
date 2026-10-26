/* js/api.js — маленькая обёртка над fetch для общения с нашим бэкендом.
   Сайт и API работают на одном адресе (/api/...), поэтому cookie сессии
   (в ней хранятся корзина и язык) браузер отправляет сам. */

const API_BASE = '/api';

class ApiError extends Error {
  constructor(status, data) {
    super((data && data.message) || 'Ошибка ' + status);
    this.status = status;
    this.code = data && data.error;
  }
}

async function apiRequest(method, path, body) {
  const options = {
    method: method,
    credentials: 'same-origin',
    headers: {}
  };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  const response = await fetch(API_BASE + path, options);

  let data = null;
  try {
    data = await response.json();
  } catch (error) {
    // пустой или не JSON-ответ
  }

  if (!response.ok) {
    throw new ApiError(response.status, data);
  }
  return data;
}

const api = {
  get: (path) => apiRequest('GET', path),
  post: (path, body) => apiRequest('POST', path, body),
  put: (path, body) => apiRequest('PUT', path, body),
  patch: (path, body) => apiRequest('PATCH', path, body),
  delete: (path) => apiRequest('DELETE', path)
};
