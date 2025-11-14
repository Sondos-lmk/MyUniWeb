import API from "./api"; // this uses your axios instance

export async function createWorkshop(payload) {
  const { data } = await API.post("/professor/workshop", payload);
  return data;
}

// list the logged-in professor's workshops
export async function getMyWorkshops() {
  const { data } = await API.get("events/professor/my-workshops");
  return data; // { message, workshops: [...] }
}

// update a workshop by id (PUT)
export async function updateWorkshop(id, payload) {
  const { data } = await API.put(`events/professor/workshop/${id}`, payload);
  return data; // { message, workshop }
}

// 🔹 NEW: get participants + remaining spots for one workshop
export async function getWorkshopParticipants(id) {
  const { data } = await API.get(`/events/professor/workshop/${id}/participants`);
  return data; // { workshopId, title, capacity, registeredCount, remainingSpots, participants: [...] }
}