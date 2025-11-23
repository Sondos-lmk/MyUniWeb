// client/src/components/VendorPolls.jsx
import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "sonner";

const VendorPolls = () => {
  const [vendorPolls, setVendorPolls] = useState([]);
  const [loadingPolls, setLoadingPolls] = useState(true);
  const [votingPollId, setVotingPollId] = useState(null);

  // Fetch vendor polls
  const fetchVendorPolls = async () => {
    try {
      setLoadingPolls(true);
      const res = await api.get("/polls/active");
      setVendorPolls(res.data.polls || []);
    } catch (err) {
      console.error("Error fetching polls:", err);
    } finally {
      setLoadingPolls(false);
    }
  };

  useEffect(() => {
    fetchVendorPolls();
  }, []);

  // Handle vote
  const handleVote = async (pollId, vendorId) => {
    try {
      setVotingPollId(pollId);
      await api.post(`/polls/${pollId}/vote`, { vendorId });
      toast.success("Your vote has been submitted!");
      fetchVendorPolls(); // Refresh polls
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit vote");
    } finally {
      setVotingPollId(null);
    }
  };

  if (loadingPolls) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Vendor Polls</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-600">Loading polls...</p>
        </div>
      </div>
    );
  }

  if (vendorPolls.length === 0) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 mb-4">Vendor Polls</h3>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <p className="text-slate-600 italic">No active polls right now.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold text-slate-900 mb-4 text-center">Vendor Polls</h3>
      {vendorPolls.map((poll) => {
        const totalVotes = poll.totalVotes || 0;
        return (
          <div
            key={poll._id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6"
          >
            <h4 className="text-lg font-semibold text-slate-900 mb-4">
              {poll.question}
            </h4>
            <div className="space-y-3">
              {poll.vendors.map((vendor, index) => {
                const percentage =
                  totalVotes > 0
                    ? ((vendor.votes || 0) / totalVotes) * 100
                    : 0;
                const hasVoted = poll.userVotedFor !== null;
                const isUserVote = poll.userVotedFor === vendor.vendorId?.toString();

                return (
                  <div key={vendor.vendorId || index}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-700 font-medium">
                        {vendor.name}
                      </span>
                      <span className="text-slate-600 text-sm">
                        {vendor.votes || 0} votes
                      </span>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full flex items-center justify-end pr-3 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-white text-sm font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      {!hasVoted && (
                        <button
                          onClick={() => handleVote(poll._id, vendor.vendorId)}
                          disabled={votingPollId === poll._id}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium transition-colors disabled:opacity-50"
                        >
                          {votingPollId === poll._id ? "Voting..." : "Vote"}
                        </button>
                      )}
                      {hasVoted && isUserVote && (
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-green-600 font-bold text-sm">
                          ✓ Voted
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-slate-500 text-sm mt-4">
              {totalVotes} total votes
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default VendorPolls;

