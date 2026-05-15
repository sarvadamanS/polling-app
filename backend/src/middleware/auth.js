/**
 * middleware/auth.js
 * Protects admin routes — rejects requests that have no active admin session.
 */

export function requireAdmin(req, res, next) {
  if (req.session?.adminId) {
    return next(); // session exists → allow through
  }
  return res.status(401).json({ error: "Unauthorized — admin login required." });
}