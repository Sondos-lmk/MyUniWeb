// import axios from 'axios';

// const API = axios.create({
//   baseURL: 'http://localhost:4000/api',
//   withCredentials: false
// });

// // Attach token
// API.interceptors.request.use(config => {
//   const token = localStorage.getItem('token');
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default API;
//marwan
// client/src/services/api.js
// client/src/services/api.js
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

function authHeaders() {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Helper to read server errors safely (JSON or text)
async function readError(res) {
  try {
    const data = await res.json();
    return typeof data === "string" ? data : data?.error || JSON.stringify(data);
  } catch {
    return await res.text();
  }
}

export async function apiGet(path, params = {}) {
  const url = new URL(`${API_BASE}${path}`);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function apiPost(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function apiPatch(path, body = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function apiDelete(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

/** EVENTS */
export const fetchEvents = (type) => apiGet("/events", type ? { type } : {});
export const fetchEventById = (id) => apiGet(`/events/${id}`);
export const registerForEvent = (eventId) =>
  apiPost("/events/register", { eventId }); // student/trip

/** VENDOR FLOWS */
export const applyForBazaar = (bazaarId, payload) =>
  apiPost(`/events/bazaar/${bazaarId}/register`, payload);

export const applyForBooth = (boothId, payload) =>
  apiPost(`/events/booth/${boothId}/register`, payload);

export const fetchMyApplications = () => apiGet("/events/my-applications");

/** ME */
export const fetchMyRegisteredEvents = () => apiGet("/events/my-events");

/* -----------------------------
   Back-compat default export
   For files that still do:
   import API from "../services/api"
-------------------------------- */
const API = {
  get: (path, params) => apiGet(path, params),
  post: (path, body) => apiPost(path, body),
  patch: (path, body) => apiPatch(path, body),
  delete: (path) => apiDelete(path),
};

export default API;
export { API_BASE };

