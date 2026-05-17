import axios from 'axios';

/**
 * Single Axios instance so every screen uses the same base URL and timeouts.
 * Override with REACT_APP_API_URL when deploying to another host.
 */
const api = axios.create({
  baseURL:  'https://smart-hospital-queue-n1md.onrender.com',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Turns Axios/network errors into a short user-facing string for alert banners.
 */
export function getErrorMessage(error) {
  if (!error || typeof error !== 'object') return 'Something went wrong.';
  if (!error.response) {
    return error.message === 'Network Error'
      ? 'Cannot reach the server. Is the API running on port 3999?'
      : error.message || 'Network error.';
  }
  const { data, status } = error.response;
  if (data && typeof data.error === 'string') return data.error;
  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    const first = data.errors[0];
    if (first && typeof first.msg === 'string') return first.msg;
  }
  return `Request failed (${status}).`;
}

/** Patient / queue endpoints used by the UI */
export const patientApi = {
  register: (payload) => api.post('/register', payload),
  getQueue: (stage) => api.get(`/queue/${stage}`),
  callNext: (stage) => api.put(`/next/${stage}`),
  complete: (id) => api.put(`/complete/${id}`),
  getStatus: (id) => api.get(`/status/${id}`),
};

export default api;
