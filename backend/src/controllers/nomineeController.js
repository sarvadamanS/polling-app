/**
 * controllers/nomineeController.js
 * Returns all nominees with their current vote counts.
 */

import prisma from "../db/prisma.js";

// GET /api/nominees
export async function getAllNominees(req, res) {
  const nominees = await prisma.nominee.findMany({
    include: { _count: { select: { votes: true } } },
    orderBy: { id: "asc" },
  });

  // Shape data: replace prisma _count with a clean `votes` number
  const data = nominees.map(({ _count, ...n }) => ({
    ...n,
    votes: _count.votes,
  }));

  return res.json(data);
}