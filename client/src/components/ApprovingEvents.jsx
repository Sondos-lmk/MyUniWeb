import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
// ArrowLeft removed — back button removed from this view

export default function ApprovedEvents() {
  const [activeTab, setActiveTab] = useState("requests");
  const [conflictCount, setConflictCount] = useState(0);
  const [conflicts, setConflicts] = useState([]);
  const [polls, setPolls] = useState([]);

  const [events, setEvents] = useState([]);
  const [vendorsMap, setVendorsMap] = useState({});
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [bazaarsRes, boothsRes,conflictsRes,pollsRes] = await Promise.all([
          API.get("/events", { params: { type: "bazaar" } }),
          API.get("/events", { params: { type: "booth" } }),
          API.get("/events/conflicts"),
          API.get("/polls"),
        ]);

        const bazaars = Array.isArray(bazaarsRes.data?.events)
          ? bazaarsRes.data.events
          : Array.isArray(bazaarsRes.data)
          ? bazaarsRes.data
          : [];

        const booths = Array.isArray(boothsRes.data?.events)
          ? boothsRes.data.events
          : Array.isArray(boothsRes.data)
          ? boothsRes.data
          : [];

        const now = new Date();

        const approvedBazaars = bazaars.filter(
          (e) => e.status === "approved" && new Date(e.startDate) > now
        );
        const approvedBooths = booths.filter((e) => e.status === "approved");

        const approvedEvents = [...approvedBazaars, ...approvedBooths];
        setEvents(approvedEvents);

        const vendorIds = approvedEvents
          .flatMap((ev) => ev.registeredVendors.map((v) => v.vendor))
          .filter(Boolean);

        const uniqueVendorIds = [...new Set(vendorIds)];

        if (uniqueVendorIds.length > 0) {
          const vendorsData = await Promise.all(
            uniqueVendorIds.map((id) =>
              API.get(`/users/${id}`).catch(() => null)
            )
          );

          const map = {};
          vendorsData.forEach((res) => {
            if (res && res.data) {
              map[res.data._id] = res.data.companyName || res.data.name;
            }
          });

          setVendorsMap(map);
        }


        setConflicts(conflictsRes.data.conflictedBooths || []);
        setConflictCount(conflictsRes.data.count || 0);

        // Polls
        setPolls(pollsRes.data.polls || []);

      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };

    //const fetchPolls = async () => {
    //try {
      //const res = await API.get("/polls");
      //console.log("Polls response:", res.data);

      // FIX: Extract array properly
      //setPolls(res.data.polls || []);
    //} catch (err) {
      //console.error("Error fetching polls:", err);
    //}
  //};
    fetchEvents();
    //fetchPolls();
  }, []);

  const handleVendorStatus = async (eventId, registrationId, newStatus) => {
  try {
    const response = await API.patch(
      `/events/${eventId}/vendors/${registrationId}`,
      { status: newStatus }
    );

    setEvents((prev) =>
      prev.map((ev) => {
        if (ev._id !== eventId) return ev;

        return {
          ...ev,
          registeredVendors: ev.registeredVendors.map((v) => {
            // Compare registration _id (not vendor user ID)
            return v._id === registrationId 
              ? { ...v, status: newStatus } 
              : v;
          }),
        };
      })
    );

    alert(`Vendor ${newStatus} successfully!`);
  } catch (err) {
    console.error("Error updating vendor status:", err);
    alert(
      err.response?.data?.error || "Failed to update vendor status."
    );
  }
};


  const capitalize = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vendor Requests</h2>

      {/* ---------------------- TABS NAVIGATION ---------------------- */}
      <div className="flex items-center gap-10 border-b border-gray-200 pb-2 mb-6">

      {/* Approve Requests tab */}
      <button
        onClick={() => setActiveTab("requests")}
        className={`relative text-lg font-semibold pb-2 transition-all ${
          activeTab === "requests"
            ? "text-blue-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
         Requests

        {/* blue underline */}
        {activeTab === "requests" && (
          <div className="absolute left-0 bottom-0 h-[3px] w-full bg-blue-600 rounded-full"></div>
        )}
      </button>

      {/* Conflicts tab */}
      <button
        onClick={() => setActiveTab("conflicts")}
        className={`relative text-lg font-semibold pb-2 transition-all ${
          activeTab === "conflicts"
            ? "text-blue-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Conflicts

        {/* blue underline */}
        {activeTab === "conflicts" && (
          <div className="absolute left-0 bottom-0 h-[3px] w-full bg-blue-600 rounded-full"></div>
        )}
      </button>

      <button
        onClick={() => setActiveTab("polls")}
        className={`relative text-lg font-semibold pb-2 transition-all ${
          activeTab === "polls"
            ? "text-blue-600"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        Polls
        {activeTab === "polls" && (
          <div className="absolute left-0 bottom-0 h-[3px] w-full bg-blue-600 rounded-full"></div>
        )}
      </button>
    </div>
    {activeTab === "requests" && (
      <>
      {events.length === 0 ? (
        <div>
        </div>
      ) : (
        events.map((event) => {
          const pendingVendors =
            event.registeredVendors?.filter((v) => v.status === "pending") || [];

          return (
            <div
              key={event._id}
              className="mb-6 p-6 bg-white rounded-xl shadow border-2 border-blue-200"
            >
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-xl font-semibold">
                  {event.title} ({event.type})
                </h2>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {event.status}
                </span>
              </div>

              {event.type === "bazaar" && event.startDate && event.endDate && (
                <p className="text-gray-600 mb-2">
                  📅 {new Date(event.startDate).toLocaleDateString()} -{" "}
                  {new Date(event.endDate).toLocaleDateString()}
                </p>
              )}

              <p className="text-gray-600 mb-4">
                📍 {event.location || event.locationInPlatform || "No location specified"}
              </p>

              <div className="mb-2 text-sm text-gray-500">
                Total Vendors: {event.registeredVendors?.length || 0} | Pending:{" "}
                {pendingVendors.length} | Approved:{" "}
                {event.registeredVendors?.filter((v) => v.status === "approved")
                  .length || 0}
              </div>

              <h3 className="text-lg font-semibold mb-2">Pending Vendors</h3>

              {pendingVendors.length === 0 ? (
                <p className="text-gray-500 italic">
                  No pending vendors for this event.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-100 text-left">
                        <th className="border p-2">Vendor</th>
                        <th className="border p-2">Representatives</th>
                        <th className="border p-2">Booth Size</th>
                        <th className="border p-2">Start Date</th>
                        <th className="border p-2">End Date</th>
                        <th className="border p-2">Status</th>
                        <th className="border p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingVendors.map((vendor, idx) => (
                        <tr key={vendor.vendor || idx} className="hover:bg-gray-50">
                          <td className="border p-2">
                            {capitalize(vendorsMap[vendor.vendor]) ||
                              vendor.vendor ||
                              "Unknown"}
                          </td>
                          <td className="border p-2">
                            {vendor.reps?.map((r, i) => (
                              <div key={i} className="text-sm">
                                {r.name} ({r.email})
                              </div>
                            )) || "—"}
                          </td>
                          <td className="border p-2">{vendor.boothSize || "—"}</td>
                          <td className="border p-2">
                            {vendor.startDate
                              ? new Date(vendor.startDate).toLocaleDateString()
                              : event.startDate
                              ? new Date(event.startDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="border p-2">
                            {vendor.endDate
                              ? new Date(vendor.endDate).toLocaleDateString()
                              : event.endDate
                              ? new Date(event.endDate).toLocaleDateString()
                              : "—"}
                          </td>
                          <td className="border p-2">
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              {vendor.status}
                            </span>
                          </td>
                          <td className="border p-2">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleVendorStatus(
                                    event._id,
                                    vendor._id,
                                    "approved"
                                  )
                                }
                                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-900"
                              >
                                ✓ Approve
                              </button>
                              <button
                                onClick={() =>
                                  handleVendorStatus(
                                    event._id,
                                    vendor._id,
                                    "rejected"
                                  )
                                }
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-900"
                              >
                                ✗ Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })
      )}
    </>
    )}

      {/* ------------- CONFLICTS TAB ------------- */}
      {activeTab === "conflicts" && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Conflicted Booths</h2>
          {conflicts.length === 0 ? (
            <p className="text-gray-500 italic">No booth conflicts found.</p>
          ) : (
            conflicts.map((conflict, index) => (
              <div
                key={index}
                className="p-5 bg-red-50 border border-red-300 rounded-xl mb-4"
              >
                <h3 className="text-lg font-bold text-red-700 mb-2">
                  Booth: {conflict.booth?.title || "Unknown Booth"}
                </h3>

                {conflict.conflicts.map((pair, i) => {
                  const boothId =
                    conflict.booth?._id || conflict.booth?.id || conflict.boothId;

                  // Build the vendors array to send to create poll page
                  const vendorsForPoll = [
                    {
                      vendorId:
                        pair.vendor1?._id ||
                        pair.vendor1?.vendorId ||
                        pair.vendor1?.vendor,
                      name: pair.vendor1Name,
                    },
                    {
                      vendorId:
                        pair.vendor2?._id ||
                        pair.vendor2?.vendorId ||
                        pair.vendor2?.vendor,
                      name: pair.vendor2Name,
                    },
                  ];

                  const conflictStart = pair.vendor1?.startDate;
                  const conflictEnd = pair.vendor1?.endDate;

                  return (
                    <div
                      key={i}
                      className="p-3 bg-white border rounded-lg mb-3 shadow-sm"
                    >
                      <p className="font-medium text-gray-800">
                        Vendor 1:{" "}
                        <span className="font-semibold">
                          {pair.vendor1Name}
                        </span>
                      </p>
                      <p className="font-medium text-gray-800">
                        Vendor 2:{" "}
                        <span className="font-semibold">
                          {pair.vendor2Name}
                        </span>
                      </p>

                      <p className="text-sm text-gray-600 mt-2">
                        Dates Overlap:{" "}
                        {conflictStart
                          ? new Date(conflictStart).toLocaleDateString()
                          : "N/A"}{" "}
                        →{" "}
                        {conflictEnd
                          ? new Date(conflictEnd).toLocaleDateString()
                          : "N/A"}
                      </p>

                      {/* ✅ Create Poll Button */}
                      <button
                        onClick={() =>
                          navigate(`/polls/create`, {
                            state: {
                              boothId,
                              boothTitle: conflict.booth?.title,
                              vendors: vendorsForPoll,
                              reason: `Date conflict between ${pair.vendor1Name} and ${pair.vendor2Name}`,
                              conflictStart,
                              conflictEnd,
                            },
                          })
                        }
                        className="mt-3 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-700 transition-all"
                      >
                        + Create Poll
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

  {/* ------------- POLLS TAB (EVENT OFFICER VIEW) ------------- */}
      {activeTab === "polls" && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">All Polls</h2>

          {(!Array.isArray(polls) || polls.length === 0) ? (
            <p className="text-gray-500 italic">No polls created yet.</p>
          ) : (
            polls.map((poll) => (
              <div
                key={poll._id}
                className="p-5 bg-white rounded-xl border shadow mb-4"
              >
                <h3 className="text-lg font-semibold">{poll.title}</h3>
                <p className="text-sm text-gray-600">
                  Question: {poll.question}
                </p>
                <p className="text-sm text-gray-600">
                  Booth: {poll.booth?.title || "Unknown booth"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Status:{" "}
                  <span className="font-semibold capitalize">
                    {poll.status}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Ends: {poll.endAt ? new Date(poll.endAt).toLocaleString() : "—"}
                </p>

                <div className="mt-3">
                  <h4 className="text-sm font-semibold mb-1">
                    Votes per vendor:
                  </h4>
                  {poll.vendors?.map((v) => (
                    <div
                      key={v.vendorId}
                      className="flex justify-between text-sm text-gray-700"
                    >
                      <span>{v.name}</span>
                      <span>{v.votes} votes</span>
                    </div>
                  ))}
                  <p className="text-xs text-gray-500 mt-1">
                    Total votes: {poll.totalVotes}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}