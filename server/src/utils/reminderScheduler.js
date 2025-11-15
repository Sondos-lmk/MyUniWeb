import { Event } from "../models/Events/Event.js";
import { User } from "../models/Users/User.js";

const ALLOWED_ROLES = new Set(["student", "staff", "ta", "professor", "eventOfficer"]);

function getStartDate(ev) {
  return ev.startDate || ev.date || null;
}

function formatWhen(date) {
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? String(date) : d.toLocaleString();
  } catch {
    return String(date);
  }
}

// Main function to be called by route or cron
export const sendRemindersForUpcomingEvents = async () => {
  const now = new Date();

  // We'll consider events starting within the next ~26 hours (enough window)
  const twoDaysFromNow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Fetch upcoming events that still have a future date/startDate
  const events = await Event.find({
    $or: [
      { startDate: { $gte: now, $lte: twoDaysFromNow } },
      { date: { $gte: now, $lte: twoDaysFromNow } },
    ],
  })
    .populate("registeredUsers", "role notifications")
    .populate("registeredStudents", "role notifications")
    .populate("participants", "role notifications");

  let totalDayReminders = 0;
  let totalHourReminders = 0;

  for (const ev of events) {
    const start = getStartDate(ev);
    if (!start) continue;
    
    const diffMs = new Date(start).getTime() - now.getTime();
    if (diffMs <= 0) continue; // already started or past

    const diffHours = diffMs / (1000 * 60 * 60);

    // ✅ More practical windows:
    // - Day reminder: any event starting in the next 1–28 hours
    // - Hour reminder: any event starting in the next 0–2 hours
    const isDayWindow = diffHours >= 1 && diffHours <= 28;
    const isHourWindow = diffHours >= 0 && diffHours <= 2;

    if (!isDayWindow && !isHourWindow) continue;


    // Collect all registered users for this event (trip/workshop/general/gym):
    const userIdSet = new Set();

    if (Array.isArray(ev.registeredUsers)) {
      ev.registeredUsers.forEach((u) => {
        const id = u._id || u;
        if (id) userIdSet.add(String(id));
      });
    }

    if (Array.isArray(ev.registeredStudents)) {
      ev.registeredStudents.forEach((u) => {
        const id = u._id || u;
        if (id) userIdSet.add(String(id));
      });
    }

    if (Array.isArray(ev.participants)) {
      ev.participants.forEach((u) => {
        const id = u._id || u;
        if (id) userIdSet.add(String(id));
      });
    }

    if (userIdSet.size === 0) continue;

    const daySent = new Set(
      (ev.reminderDaySentTo || []).map((id) => String(id))
    );
    const hourSent = new Set(
      (ev.reminderHourSentTo || []).map((id) => String(id))
    );

    const title =
      ev.title ||
      ev.sessionType ||
      "Your event";
    const typeLabel = ev.type || "event";
    const whenStr = formatWhen(start);

    const dayMessage = `⏰ Reminder: Your ${typeLabel} "${title}" starts in about 1 day (on ${whenStr}).`;
    const hourMessage = `⏰ Reminder: Your ${typeLabel} "${title}" starts in about 1 hour (at ${whenStr}).`;

    let eventChanged = false;

    for (const userIdStr of userIdSet) {
      const userId = userIdStr;

      const user = await User.findById(userId).select(
        "role notifications"
      );
      if (!user) continue;

      const role = (user.role || "").toLowerCase();
      if (!ALLOWED_ROLES.has(role)) continue; // skip vendors etc.

      user.notifications = user.notifications || [];

      // 1-day reminder
      if (isDayWindow && !daySent.has(userIdStr)) {
        user.notifications.push(dayMessage);
        await user.save();
        ev.reminderDaySentTo = ev.reminderDaySentTo || [];
        ev.reminderDaySentTo.push(user._id);
        daySent.add(userIdStr);
        eventChanged = true;
        totalDayReminders++;
      }

      // 1-hour reminder
      if (isHourWindow && !hourSent.has(userIdStr)) {
        user.notifications.push(hourMessage);
        await user.save();
        ev.reminderHourSentTo = ev.reminderHourSentTo || [];
        ev.reminderHourSentTo.push(user._id);
        hourSent.add(userIdStr);
        eventChanged = true;
        totalHourReminders++;
      }
    }

    if (eventChanged) {
      await ev.save();
    }
  }

  return {
    ok: true,
    totalDayReminders,
    totalHourReminders,
  };
};
