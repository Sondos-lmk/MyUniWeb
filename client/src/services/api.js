// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:4000/api",
//   withCredentials: false, // only if you don't need cookies
// });

// // Automatically attach token
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });


// // ===== Favorites API =====
// export async function getMyFavorites() {
//   const res = await API.get('/events/my/favorites');
//   // backend returns { message, count, events }
//   return res.data.events || [];
// }

// export async function addFavorite(eventId) {
//   await API.post(`/api/events/${eventId}/favorite`);
//   return true;
// }

// export async function removeFavorite(eventId) {
//   await API.delete(`/api/events/${eventId}/favorite`);
//   return true;
// }


// export default API;
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: false,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function getMyFavorites() {
  const res = await API.get("/events/my/favorites");
  return res.data.events || [];
}

export async function addFavorite(eventId) {
  await API.post(`/events/${eventId}/favorite`);
  return true;
}

export async function removeFavorite(eventId) {
  await API.delete(`/events/${eventId}/favorite`);
  return true;
}

export default API;
