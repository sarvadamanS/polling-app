/**
 * lib/api.js — pre-configured Axios instance.
 * withCredentials: true ensures session cookies are sent on every request.
 */

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export default api;