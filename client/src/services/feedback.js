import API from "./api";

export const fetchEventFeedback = async (eventId) => {
  try {
    const res = await API.get(`/events/${eventId}/feedback`);
    return res.data;
  } catch (err) {
    console.error("Error fetching feedback:", err);
    throw err;
  }
};
