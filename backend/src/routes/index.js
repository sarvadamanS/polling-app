/**
 * routes/index.js — mounts all API route groups
 */

import { Router } from "express";
import { login, logout, me } from "../controllers/authController.js";
import { getAllNominees } from "../controllers/nomineeController.js";
import { castVote, voteStatus } from "../controllers/voteController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Auth ──────────────────────────────────────────────────────────────────────
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", me);

// ── Nominees (public — voters need the list) ──────────────────────────────────
router.get("/nominees", getAllNominees);

// ── Votes ─────────────────────────────────────────────────────────────────────
router.post("/votes", castVote);          // cast a vote (public, session-gated)
router.get("/votes/status", voteStatus);  // check if current session voted

// ── Admin-only: full results ─────────────────────────────────────────────────
router.get("/admin/results", requireAdmin, getAllNominees);

export default router;