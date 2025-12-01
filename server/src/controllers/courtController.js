import { Court } from "../models/Events/court.js";
import { CourtBooking } from "../models/Events/courtBooking.js";

/* ============================================================
   GET ALL COURTS
   GET /api/courts?type=basketball|tennis|football
   ============================================================ */
export const getAllCourts = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = type ? { type } : {};
    const courts = await Court.find(filter).sort({ type: 1, name: 1 });
    res.json(courts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ============================================================
   GET COURT AVAILABILITY
   GET /api/courts/:id/availability?date=YYYY-MM-DD
   ============================================================ */
export const getCourtAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const court = await Court.findById(id);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // If a specific date is provided
    if (date) {
      const d = toDateOnly(date);
      const slots = await computeAvailabilityForDate(court, d);
      return res.json({ courtId: court._id, date: isoDate(d), slots });
    }

    // Otherwise: return next 7 days
    const days = [];
    let d = toDateOnly(new Date());

    for (let i = 0; i < 7; i++) {
      const slots = await computeAvailabilityForDate(court, d);
      days.push({ date: isoDate(d), slots });
      d = addDays(d, 1);
    }

    res.json({ courtId: court._id, days });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// POST /api/courts/:id/book
export const bookCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.body;
    const user = req.user;

    if (!date || !startTime || !endTime)
      return res.status(400).json({ message: "Missing date or time." });

    const bookingDate = new Date(date);
    const dateOnly = new Date(Date.UTC(
      bookingDate.getUTCFullYear(),
      bookingDate.getUTCMonth(),
      bookingDate.getUTCDate()
    ));

    // CHECK COURT EXISTS
    const court = await Court.findById(id);
    if (!court) return res.status(404).json({ message: "Court not found" });

    // CHECK CONFLICTS
    const conflict = await CourtBooking.findOne({
      court: id,
      date: dateOnly,
      startTime: { $lt: endTime },
      endTime: { $gt: startTime },
    });

    if (conflict)
      return res.status(400).json({ message: "Slot already booked" });

    // ⭐ AUTO-FILL STUDENT INFO
    const booking = new CourtBooking({
      court: id,
      date: dateOnly,
      startTime,
      endTime,
      bookedBy: user._id,
      studentName: user.name,
      studentGucId: user.uniID || user.gucId
    });

    await booking.save();

    res.status(201).json({
      message: "Court booked successfully",
      booking,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ============================================================
   GET MY BOOKINGS
   GET /api/courts/my-bookings
   ============================================================ */
export const getMyCourtBookings = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const bookings = await CourtBooking.find({ bookedBy: userId })
      .populate("court", "name type")
      .sort({ date: 1, startTime: 1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* ============================================================
   HELPER FUNCTIONS
   ============================================================ */
const isoDate = (d) => d.toISOString().slice(0, 10);

const toDateOnly = (inp) => {
  const d = new Date(inp);
  return new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate()
  ));
};

const addDays = (d, n) =>
  new Date(Date.UTC(
    d.getUTCFullYear(),
    d.getUTCMonth(),
    d.getUTCDate() + n
  ));

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const toHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

const subtractIntervals = (openStart, openEnd, busyIntervals) => {
  let free = [[openStart, openEnd]];

  for (const [bS, bE] of busyIntervals) {
    const next = [];
    for (const [fS, fE] of free) {
      if (bE <= fS || bS >= fE) {
        next.push([fS, fE]); 
        continue;
      }
      if (bS > fS) next.push([fS, Math.max(fS, bS)]);
      if (bE < fE) next.push([Math.min(bE, fE), fE]);
    }
    free = next;
  }

  return free.filter(([s, e]) => e > s);
};

async function computeAvailabilityForDate(court, dateOnly) {
  const day = dateOnly.getUTCDay();
  const openSlots = court.weeklySlots.filter((s) => s.dayOfWeek === day);
  if (!openSlots.length) return [];

  const bookings = await CourtBooking.find({ court: court._id, date: dateOnly })
    .select("startTime endTime studentName studentGucId");

  // Build busy intervals for subtracting
  const busy = bookings
    .map((b) => [toMin(b.startTime), toMin(b.endTime)])
    .sort((a, b) => a[0] - b[0]);

  const available = [];

  for (const s of openSlots) {
    const opens = toMin(s.startTime);
    const closes = toMin(s.endTime);
    const freeSegments = subtractIntervals(opens, closes, busy);

    for (const [fs, fe] of freeSegments) {
      available.push({ startTime: toHHMM(fs), endTime: toHHMM(fe) });
    }
  }

  // Merge adjacent free segments
  available.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const merged = [];
  for (const seg of available) {
    if (!merged.length) {
      merged.push(seg);
      continue;
    }
    const last = merged[merged.length - 1];
    if (last.endTime === seg.startTime) {
      last.endTime = seg.endTime;
    } else {
      merged.push(seg);
    }
  }

  // ⭐ Add booked slots + free slots
  const finalSlots = [];

  // Add booked slots with student info
  for (const b of bookings) {
    finalSlots.push({
      startTime: b.startTime,
      endTime: b.endTime,
      booked: true,
      studentName: b.studentName,
      studentGucId: b.studentGucId
    });
  }

  // Add free slots
  for (const seg of merged) {
    finalSlots.push({
      startTime: seg.startTime,
      endTime: seg.endTime,
      booked: false
    });
  }

  // Sort everything correctly
  finalSlots.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));

  return finalSlots;
}
