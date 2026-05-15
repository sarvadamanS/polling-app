/**
 * controllers/authController.js
 * Handles admin authentication (login / logout / session check).
 */

import bcrypt from "bcryptjs";
import prisma from "../db/prisma.js";

// POST /api/auth/login
export async function login(req, res) {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // Look up admin by username
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // Compare password with stored bcrypt hash
  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials." });
  }

  // Store admin ID in session to mark as authenticated
  req.session.adminId = admin.id;
  return res.json({ message: "Logged in.", username: admin.username });
}

// POST /api/auth/logout
export function logout(req, res) {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
}

// GET /api/auth/me — lets frontend check if already logged in
export function me(req, res) {
  if (req.session?.adminId) {
    return res.json({ loggedIn: true });
  }
  return res.json({ loggedIn: false });
}