// // import axios from "axios";

// // const API = axios.create({
// //   baseURL: "http://localhost:4000/api",
// //   withCredentials: false, // only if you don't need cookies
// // });

// // // Automatically attach token
// // API.interceptors.request.use((config) => {
// //   const token = localStorage.getItem("token");
// //   if (token) config.headers.Authorization = `Bearer ${token}`;
// //   return config;
// // });


// // // ===== Favorites API =====
// // export async function getMyFavorites() {
// //   const res = await API.get('/events/my/favorites');
// //   // backend returns { message, count, events }
// //   return res.data.events || [];
// // }

// // export async function addFavorite(eventId) {
// //   await API.post(`/api/events/${eventId}/favorite`);
// //   return true;
// // }

// // export async function removeFavorite(eventId) {
// //   await API.delete(`/api/events/${eventId}/favorite`);
// //   return true;
// // }


// // export default API;
// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:4000/api",
//   withCredentials: false,
// });

// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export async function getMyFavorites() {
//   const res = await API.get("/events/my/favorites");
//   return res.data.events || [];
// }

// export async function addFavorite(eventId) {
//   await API.post(`/events/${eventId}/favorite`);
//   return true;
// }

// export async function removeFavorite(eventId) {
//   await API.delete(`/events/${eventId}/favorite`);
//   return true;
// }
// // ---------- Gym API helpers ----------
// export const getGymSchedule = () => api.get("/gym");

// export const registerForGymSession = (sessionId) =>
//   api.post(`/gym/${sessionId}/register`);

// export default API;

import axios from "axios";

// Base URL for the backend API
const baseURL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "http://localhost:4000/api";

// Create a single axios instance
const api = axios.create({
  baseURL,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//
// ---------- FAVORITES HELPERS ----------
// (these match typical REST routes; if your backend uses slightly different
// paths, just tweak the strings but KEEP the exports names the same)
//

// add an event to favorites
export const addFavorite = (eventId) =>
  api.post(`/events/${eventId}/favorite`);

// remove an event from favorites
export const removeFavorite = (eventId) =>
  api.delete(`/events/${eventId}/favorite`);

// (if you ever want a helper instead of doing axios directly in Favorites.jsx)
export const getMyFavorites = () => api.get("/events/my/favorites");

//
// ---------- GYM HELPERS ----------
//

export const getGymSchedule = () => api.get("/gym");

export const registerForGymSession = (sessionId) =>
  api.post(`/gym/${sessionId}/register`);

// You can still use `api` directly elsewhere (courts, etc.)
export default api;
