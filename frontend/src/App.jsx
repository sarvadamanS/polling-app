/**
 * App.jsx — top-level router.
 *
 * Routes:
 *   /          → VotePage   (audience)
 *   /admin     → AdminLogin
 *   /admin/dashboard → AdminDashboard (protected)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import VotePage from "./pages/VotePage.jsx";
import AdminLogin from "./pages/AdminLogin.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<VotePage />} />
      <Route path="/admin" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}