import { Court } from "../models/Events/court.js";
import { CourtBooking } from "../models/Events/courtBooking.js";


// GET /api/courts?type=basketball|tennis|football (optional filter)
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

// GET /api/courts/:id/availability?date=YYYY-MM-DD
// If date omitted -> return next 7 days [{date, slots:[{startTime,endTime}]}]
export const getCourtAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;

    const court = await Court.findById(id);
    if (!court) return res.status(404).json({ message: "Court not found" });

    if (date) {
      const d = toDateOnly(date);
      const slots = await computeAvailabilityForDate(court, d);
      return res.json({ courtId: court._id, date: isoDate(d), slots });
    }

    // default: next 7 days
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

/* ---------- helpers ---------- */
const isoDate = (d) => d.toISOString().slice(0, 10);
const toDateOnly = (inp) => {
  const d = new Date(inp);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};
const addDays = (d, n) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + n));

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const toHHMM = (mins) => {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
};

// remove busy intervals from an open interval
const subtractIntervals = (openStart, openEnd, busyIntervals) => {
  let free = [[openStart, openEnd]];
  for (const [bS, bE] of busyIntervals) {
    const next = [];
    for (const [fS, fE] of free) {
      if (bE <= fS || bS >= fE) { next.push([fS, fE]); continue; } // no overlap
      if (bS > fS) next.push([fS, Math.max(fS, bS)]);
      if (bE < fE) next.push([Math.min(bE, fE), fE]);
    }
    free = next;
  }
  return free.filter(([s, e]) => e > s);
};

async function computeAvailabilityForDate(court, dateOnly) {
  const day = dateOnly.getUTCDay(); // 0..6
  const openSlots = court.weeklySlots.filter((s) => s.dayOfWeek === day);
  if (!openSlots.length) return []; // closed that day

  const bookings = await CourtBooking.find({ court: court._id, date: dateOnly })
    .select("startTime endTime -_id");

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

  // merge adjacent segments
  available.sort((a, b) => toMin(a.startTime) - toMin(b.startTime));
  const merged = [];
  for (const seg of available) {
    if (!merged.length) { merged.push(seg); continue; }
    const last = merged[merged.length - 1];
    if (last.endTime === seg.startTime) last.endTime = seg.endTime;
    else merged.push(seg);
  }
  return merged;
}
