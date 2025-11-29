// server/src/controllers/eventOfficerAnalyticsController.js
import { Event } from "../models/Events/Event.js";

export const getEventOfficerAnalytics = async (req, res) => {
  try {
    const officerId = req.user._id;

    // last 6 months from start of month
    const now = new Date();
    const startWindow = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // ---------------------------------
    // 1) Monthly events created (last 6 months)
    // ---------------------------------
    const events = await Event.find({
      createdBy: officerId,
      createdAt: { $gte: startWindow },
    }).select("type createdAt startDate");

    const monthNames = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const monthlyMap = {};

    events.forEach((ev) => {
      const d = ev.createdAt || ev.startDate || now;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          monthKey: key,
          month: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          count: 0,
        };
      }
      monthlyMap[key].count += 1;
    });

    const monthlyEvents = Object.values(monthlyMap)
      .sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1))
      .map(({ month, count }) => ({ month, count }));

    // ---------------------------------
    // 2) Event type distribution
    // ---------------------------------
    const typeAgg = await Event.aggregate([
      { $match: { createdBy: officerId } },
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    const eventTypeCounts = {};
    typeAgg.forEach((row) => {
      eventTypeCounts[row._id || "unknown"] = row.count;
    });

    // ---------------------------------
    // 3) Registrations over time (per month)
    //    - workshops / trips: registeredUsers.length
    //    - bazaars: registeredVendors.length + externalVisitors.length
    // ---------------------------------
    const regEvents = await Event.find({
      createdBy: officerId,
      type: { $in: ["workshop", "trip", "bazaar"] },
    }).select(
      "type startDate createdAt registeredUsers registeredVendors externalVisitors"
    );

    const regMap = {};

    regEvents.forEach((ev) => {
      const d = ev.startDate || ev.createdAt || now;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;

      if (!regMap[key]) {
        regMap[key] = {
          monthKey: key,
          month: label,
          registrations: 0,
        };
      }

      let regCount = 0;
      if (ev.type === "workshop" || ev.type === "trip") {
        regCount = ev.registeredUsers?.length || 0;
      } else if (ev.type === "bazaar") {
        const vendors = ev.registeredVendors?.length || 0;
        const visitors = ev.externalVisitors?.length || 0;
        regCount = vendors + visitors;
      }

      regMap[key].registrations += regCount;
    });

    const registrationsByMonth = Object.values(regMap)
      .sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1))
      .map(({ month, registrations }) => ({ month, registrations }));

    // ---------------------------------
    // Response
    // ---------------------------------
    res.json({
      monthlyEvents,         // [{ month, count }]
      eventTypeCounts,       // { bazaar: n, conference: m, ... }
      registrationsByMonth,  // [{ month, registrations }]
    });
  } catch (err) {
    console.error("Error computing Event Officer analytics:", err);
    res
      .status(500)
      .json({ message: "Failed to load dashboard analytics.", error: err.message });
  }
};
