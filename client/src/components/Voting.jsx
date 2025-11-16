// components/Voting.jsx
import { useEffect, useState } from "react";
import API from "../services/api";

export default function Voting() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(null);
  const [error, setError] = useState("");

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const res = await API.get("/polls/active");
      setPolls(res.data.polls || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load polls.");
    } finally {
      setLoading(false);
    }
  };
  console.log("ACTIVE POLLS RESPONSE:", polls);

  useEffect(() => {
    fetchPolls();
  }, []);

  const vote = async (pollId, vendorId) => {
    try {
      setVoting(pollId);
      setError("");
      await API.post(`/polls/${pollId}/vote`, { vendorId });
      fetchPolls();
      alert("Your vote has been submitted!");
    } catch (err) {
      console.log("VOTE ERROR:", err.response?.data);
      setError(err.response?.data?.message || "Failed to submit vote");
    } finally {
      setVoting(null);
    }
  };

  if (loading) return <p>Loading polls…</p>;

  if (polls.length === 0)
    return (
      <div className="mt-6 p-4 bg-white rounded-xl shadow">
        <h3 className="text-xl font-semibold">Active Booth Polls</h3>
        <p className="text-gray-600 italic mt-1">No active polls right now.</p>
      </div>
    );

  return (
    <div className="mt-6 p-4 bg-white rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-4">Active Booth Polls</h3>

      {error && <p className="text-red-600 mb-3">{error}</p>}

      {polls.map((poll) => (
        <div
          key={poll._id}
          className="mb-5 p-4 border rounded-xl bg-gray-50 shadow-sm"
        >
          <h4 className="text-lg font-bold">{poll.title}</h4>
          <p className="text-gray-700">{poll.question}</p>

          <p className="text-sm text-gray-500 mt-1">
            Booth: <strong>{poll.booth?.title}</strong>
          </p>

          <p className="text-sm text-gray-500 mb-3">
            Ends:{" "}
            {poll.endAt
              ? new Date(poll.endAt).toLocaleString()
              : "No end date"}
          </p>

          {/* Vendors */}
          <div className="space-y-2">
            {poll.vendors.map((vendor) => (
            console.log("VENDOR OBJ:", vendor),
            console.log("USER VOTED FOR:", poll.userVotedFor),
            <button
            key={vendor.vendorId}
            disabled={poll.userVotedFor !== null}
            onClick={() => vote(poll._id, vendor.vendorId)}
            className={`w-full p-2 border rounded text-left transition
                ${poll.userVotedFor === vendor.vendorId
                ? "bg-green-200 border-green-500 font-semibold"
                : "bg-white hover:bg-blue-50"
                }
                ${poll.userVotedFor && poll.userVotedFor !== vendor.vendorId
                ? "opacity-50 cursor-not-allowed"
                : ""
                }
            `}
            >
            <div className="flex justify-between items-center">
                <span>{vendor.name}</span>

                {poll.userVotedFor === vendor.vendorId && (
                <span className="text-green-700 font-bold">✓</span>
                )}
            </div>
            </button>

            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
