// utils/inAppNotification.js
import { Student } from "../models/Users/Student.js";
import { Staff } from "../models/Users/Staff.js";
import { TA } from "../models/Users/TA.js";
import { Professor } from "../models/Users/Professor.js";
import { EventOfficer } from "../models/Users/EventsOfficer.js";

export const notifyUsersOfNewEvent = async (eventDoc) => {
  if (!eventDoc) return;

  const typeMap = {
    workshop: "workshop",
    trip: "trip",
    bazaar: "bazaar",
    booth: "booth",
    conference: "conference",
    gym: "gym session",
  };

  const eventType = eventDoc.type || "event";
  const typeLabel = typeMap[eventType] || "event";

  const title =
    eventDoc.title ||
    eventDoc.sessionType ||
    "New event";

  const location =
    eventDoc.location ||
    eventDoc.locationInPlatform ||
    "";

  const dateRaw = eventDoc.startDate || eventDoc.date || null;
  let dateStr = "";
  if (dateRaw) {
    try {
      const d = new Date(dateRaw);
      dateStr = isNaN(d.getTime()) ? String(dateRaw) : d.toLocaleString();
    } catch {
      dateStr = String(dateRaw);
    }
  }

  const messageParts = [
    `📢 New ${typeLabel} added: "${title}".`,
    location ? ` Location: ${location}.` : "",
    dateStr ? ` When: ${dateStr}.` : "",
  ];
  const message = messageParts.join("");

  // If event has allowedRoles, respect it; otherwise default to all academic roles
  const allowedRolesFromEvent = Array.isArray(eventDoc.allowedRoles)
    ? eventDoc.allowedRoles.map((r) => String(r).toLowerCase())
    : null;

  const defaultRoles = ["student", "staff", "ta", "professor"];
  const rolesToNotify = new Set(allowedRolesFromEvent || defaultRoles);

  const roleModelMap = [
    { role: "student", Model: Student },
    { role: "staff", Model: Staff },
    { role: "ta", Model: TA },
    { role: "professor", Model: Professor },
  ];

  // Notify students / staff / TAs / professors (based on allowedRoles)
  for (const { role, Model } of roleModelMap) {
    if (!rolesToNotify.has(role)) continue;
    const users = await Model.find().select("notifications").exec();
    for (const user of users) {
      user.notifications = user.notifications || [];
      user.notifications.push(message);
      await user.save();
    }
  }

  // Event Officers always get notified about new events
  const officers = await EventOfficer.find().select("notifications").exec();
  for (const officer of officers) {
    officer.notifications = officer.notifications || [];
    officer.notifications.push(message);
    await officer.save();
  }
};
