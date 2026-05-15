/**
 * socket/index.js — Socket.io event wiring.
 *
 * When an admin connects, we immediately push the current vote state
 * so the dashboard doesn't start blank.
 */

import prisma from "../db/prisma.js";

export function initSocket(io) {
  io.on("connection", async (socket) => {
    console.log(`🔌  Socket connected: ${socket.id}`);

    // Send current results to the newly connected client (admin dashboard)
    const nominees = await prisma.nominee.findMany({
      include: { _count: { select: { votes: true } } },
      orderBy: { id: "asc" },
    });
    const totalVotes = nominees.reduce((sum, n) => sum + n._count.votes, 0);

    socket.emit("voteUpdate", {
      totalVotes,
      nominees: nominees.map(({ _count, ...n }) => ({ ...n, votes: _count.votes })),
    });

    socket.on("disconnect", () => {
      console.log(`🔌  Socket disconnected: ${socket.id}`);
    });
  });
}