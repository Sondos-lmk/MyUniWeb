// client/src/services/favorites.js
import API from "./api";

// GET my favorites
export const fetchMyFavorites = async () => {
  const { data } = await API.get("/events/my/favorites");
  return data.events || [];
};

// POST add favorite
export const addFavorite = async (eventId) => {
  const { data } = await API.post(`/events/${eventId}/favorite`);
  return data;
};

// DELETE remove favorite
export const removeFavorite = async (eventId) => {
  const { data } = await API.delete(`/events/${eventId}/favorite`);
  return data;
};