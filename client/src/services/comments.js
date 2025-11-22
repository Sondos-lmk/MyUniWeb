import API from "./api";

export const deleteComment = (eventId, commentId) =>
  API.delete(`/events/${eventId}/comments/${commentId}`);
