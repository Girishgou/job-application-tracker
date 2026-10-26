// frontend/src/api.js
const BASE_URL = 'http://127.0.0.1:8000/api';

async function handleResponse(res) {
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    let message = 'An unexpected error occurred.';
    if (data?.detail) {
      if (Array.isArray(data.detail)) {
        message = data.detail.map((d) => `${d.loc?.at(-1)}: ${d.msg}`).join(', ');
      } else {
        message = data.detail;
      }
    }
    throw new Error(message);
  }
  return data;
}

export async function getStats() {
  const res = await fetch(`${BASE_URL}/stats`);
  return handleResponse(res);
}

export async function getApplications({ search = '', status = '', sort = 'desc' }) {
  const params = new URLSearchParams();
  if (search.trim()) params.append('search', search.trim());
  if (status) params.append('status', status);
  if (sort) params.append('sort', sort);

  const res = await fetch(`${BASE_URL}/applications?${params.toString()}`);
  return handleResponse(res);
}

export async function createApplication(payload) {
  const res = await fetch(`${BASE_URL}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function updateApplication(appId, payload) {
  const res = await fetch(`${BASE_URL}/applications/${appId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

export async function deleteApplication(appId) {
  const res = await fetch(`${BASE_URL}/applications/${appId}`, {
    method: 'DELETE',
  });
  return handleResponse(res);
}