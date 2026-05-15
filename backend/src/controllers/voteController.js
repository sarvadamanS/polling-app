/**
 * controllers/voteController.js
 * Handles vote casting.
 *
 * One-vote-per-session rule: the express-session ID is used as a unique key.
 * If a Vote row already exists for this sessionId, the request is rejected.
 */

import prisma from "../db/prisma.js";

// POST /api/votes
export async function castVote(req, res) {
  const { nomineeId } = req.body;
  const sessionId = req.session.id; // express-session auto-creates this

  if (!nomineeId) {
    return res.status(400).json({ error: "nomineeId is required." });
  }

  // Check if this session already voted
  const existing = await prisma.vote.findUnique({ where: { sessionId } });
  if (existing) {
    return res.status(409).json({ error: "You have already voted in this session." });
  }

  // Verify nominee exists
  const nominee = await prisma.nominee.findUnique({ where: { id: Number(nomineeId) } });
  if (!nominee) {
    return res.status(404).json({ error: "Nominee not found." });
  }

  // Record the vote
  await prisma.vote.create({ data: { sessionId, nomineeId: Number(nomineeId) } });

  // Mark session so the frontend knows this session has voted
  req.session.hasVoted = true;
  req.session.votedFor = Number(nomineeId);

  // Build fresh vote counts and emit to all admin sockets
  const nominees = await prisma.nominee.findMany({
    include: { _count: { select: { votes: true } } },
    orderBy: { id: "asc" },
  });
  const totalVotes = nominees.reduce((sum, n) => sum + n._count.votes, 0);
  const payload = {
    totalVotes,
    nominees: nominees.map(({ _count, ...n }) => ({ ...n, votes: _count.votes })),
  };

  // getIO() is attached to req by the server so controllers stay decoupled from socket.io
  req.getIO().emit("voteUpdate", payload);

  return res.status(201).json({
    message: "Vote cast successfully.",
    votedFor: nominee.name,
  });
}

// GET /api/votes/status — tells the frontend if this session has already voted
export function voteStatus(req, res) {
  return res.json({
    hasVoted: req.session.hasVoted ?? false,
    votedFor: req.session.votedFor ?? null,
  });
}