// controllers/pollController.js
import mongoose from 'mongoose';
import { Poll } from '../models/Events/Poll.js';
import { Booth } from '../models/Events/Booth.js'; // adjust path if needed

// Helper: make sure status respects endAt
async function ensurePollStatus(poll) {
  if (!poll) return null;
  const now = new Date();
  if (poll.status === 'active' && poll.endAt && poll.endAt < now) {
    poll.status = 'closed';
    await poll.save();
  }
  return poll;
}

// Helper: compute vote counts and shape response nicely
function formatPollForResponse(poll) {
  const pollObj = poll.toObject({ virtuals: true });

  const vendorStats = (pollObj.vendors || []).map((v) => {
    const votesForVendor = (pollObj.votes || []).filter(
      (vote) => vote.vendor.toString() === v.vendor.toString()
    ).length;

    return {
      vendorId: v.vendor,
      name: v.name,
      votes: votesForVendor,
    };
  });

  const totalVotes = pollObj.votes ? pollObj.votes.length : 0;

  return {
    _id: pollObj._id,
    title: pollObj.title,
    question: pollObj.question,
    reason: pollObj.reason,
    booth: pollObj.booth
      ? {
          _id: pollObj.booth._id,
          title: pollObj.booth.title,
        }
      : null,
    startAt: pollObj.startAt,
    endAt: pollObj.endAt,
    status: pollObj.status,
    vendors: vendorStats,
    totalVotes,
    createdAt: pollObj.createdAt,
    updatedAt: pollObj.updatedAt,
  };
}

// POST /api/polls  (Event Officer)
export async function createPoll(req, res) {
  try {
    const {
      boothId,
      title,
      question,
      reason,
      startAt,
      endAt,
      vendors, // [{ vendorId, name }]
    } = req.body;

            // Prevent duplicate polls for the same conflict
        const vendorIds = vendors.map(v => v.vendorId);

        const existingPoll = await Poll.findOne({
        booth: boothId,
        "vendors.vendor": { $all: vendorIds },
        endAt: { $gte: new Date() } // poll still active or not ended yet
        });

        if (existingPoll) {
        return res.status(400).json({
            message: "A poll for this conflict already exists.",
            pollId: existingPoll._id
        });
        }


    if (!boothId || !title || !question || !startAt || !endAt || !vendors) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(vendors) || vendors.length < 2) {
      return res
        .status(400)
        .json({ message: 'Poll must include at least two vendors' });
    }

    const start = new Date(startAt);
    const end = new Date(endAt);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: 'Invalid dates provided' });
    }

    if (end <= start) {
      return res
        .status(400)
        .json({ message: 'Poll end date must be after start date' });
    }

    // Optionally verify booth exists
    const booth = await Booth.findById(boothId);
    if (!booth) {
      return res.status(404).json({ message: 'Booth not found' });
    }

    const pollVendors = vendors.map((v) => ({
      vendor: new mongoose.Types.ObjectId(v.vendorId),
      name: v.name,
    }));

    const poll = await Poll.create({
      booth: boothId,
      title,
      question,
      reason,
      startAt: start,
      endAt: end,
      status: 'active', // auto-published
      vendors: pollVendors,
    });

    const populated = await poll.populate('booth');
    const updated = await ensurePollStatus(populated);

    return res.status(201).json({ poll: formatPollForResponse(updated) });
  } catch (err) {
    console.error('Error creating poll:', err);
    return res.status(500).json({ message: 'Failed to create poll' });
  }
}

// GET /api/polls  (Event Officer)
export async function getAllPolls(req, res) {
  try {
    const polls = await Poll.find({}).populate('booth').sort({ createdAt: -1 });

    const updated = [];
    for (const p of polls) {
      updated.push(await ensurePollStatus(p));
    }

    const result = updated.map(formatPollForResponse);
    return res.json({ polls: result });
  } catch (err) {
    console.error('Error fetching polls:', err);
    return res.status(500).json({ message: 'Failed to fetch polls' });
  }
}

// GET /api/polls/by-booth/:boothId  (Event Officer)
export async function getPollsByBooth(req, res) {
  try {
    const { boothId } = req.params;
    const polls = await Poll.find({ booth: boothId })
      .populate('booth')
      .sort({ createdAt: -1 });

    const updated = [];
    for (const p of polls) {
      updated.push(await ensurePollStatus(p));
    }

    const result = updated.map(formatPollForResponse);
    return res.json({ polls: result });
  } catch (err) {
    console.error('Error fetching polls by booth:', err);
    return res.status(500).json({ message: 'Failed to fetch polls by booth' });
  }
}

// GET /api/polls/active  (Academic users)
export async function getActivePolls(req, res) {
  try {
    const now = new Date();

    // 1. Fetch all polls that are "active" and within time window
    let polls = await Poll.find({
      status: "active",
      endAt: { $gte: now }
    }).populate("booth");


    // 2. Auto close polls that expired using ensurePollStatus()
    const updated = [];
    for (const p of polls) {
      updated.push(await ensurePollStatus(p));
    }

    // 3. Filter again AFTER auto-close
    const stillActive = updated.filter((p) => p.status === "active");

    const userId = req.user._id.toString();

    // 4. Build final list including userVotedFor
    const responsePolls = stillActive.map((poll) => {
      // Find the user's vote from the RAW poll (not formatted)
      const userVote = poll.votes.find(
        (v) => v.user.toString() === userId
      );

      // Format poll for frontend
      const formatted = formatPollForResponse(poll);

      // Attach userVotedFor manually
      formatted.userVotedFor = userVote
        ? userVote.vendor.toString()
        : null;

      return formatted;
    });

    // 5. Return final response
    return res.json({ polls: responsePolls });

  } catch (err) {
    console.error("Error fetching active polls:", err);
    return res.status(500).json({ message: "Failed to fetch active polls" });
  }
}



// GET /api/polls/:id  (Any authenticated user)
export async function getPollById(req, res) {
  try {
    const { id } = req.params;
    const poll = await Poll.findById(id).populate('booth');
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    const updated = await ensurePollStatus(poll);
    return res.json({ poll: formatPollForResponse(updated) });
  } catch (err) {
    console.error('Error fetching poll by id:', err);
    return res.status(500).json({ message: 'Failed to fetch poll' });
  }
}

// POST /api/polls/:id/vote  (Academic users)
export async function voteInPoll(req, res) {
  try {
    const { id } = req.params;
    const { vendorId } = req.body;
    const userId = req.user._id;

    const poll = await Poll.findById(id);
    if (!poll) {
      return res.status(404).json({ message: 'Poll not found' });
    }

    await ensurePollStatus(poll);

    if (poll.status !== 'active') {
      return res.status(400).json({ message: 'Poll is not active' });
    }

    // Check if vendor is part of the poll
    const vendorInPoll = poll.vendors.find(
      (v) => v.vendor.toString() === vendorId
    );
    if (!vendorInPoll) {
      return res.status(400).json({ message: 'Invalid vendor for this poll' });
    }

    // Check if user already voted
    const alreadyVoted = poll.votes.some(
      (vote) => vote.user.toString() === userId.toString()
    );
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    poll.votes.push({
      user: userId,
      vendor: vendorId,
    });

    await poll.save();
    const populated = await poll.populate('booth');

    const formatted = formatPollForResponse(populated);

    // Determine which vendor the user voted for
    const userVote = populated.votes.find(
    (v) => v.user.toString() === userId.toString()
    );

    formatted.userVotedFor = userVote ? userVote.vendor.toString() : null;

    return res.json({ poll: formatted });

  } catch (err) {
    console.error('Error voting in poll:', err);
    return res.status(500).json({ message: 'Failed to submit vote' });
  }
}
