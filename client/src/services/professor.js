// client/src/services/professor.js
import API from "./api";

// Fetch notifications for the logged-in professor
export async function getProfessorNotifications() {
  const { data } = await API.get("events/professor/notifications");
  // data = { message, professorName, notifications: [...] }
  return data;
}
