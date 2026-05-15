/**
 * hooks/useSocket.js
 * Connects to the backend Socket.io server and streams live vote updates.
 * Returns { nominees, totalVotes } — updates reactively on every "voteUpdate" event.
 */

import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || window.location.origin;

export function useSocket() {
  const [nominees, setNominees] = useState([]);
  const [totalVotes, setTotalVotes] = useState(0);

  useEffect(() => {
    const socket = io(SOCKET_URL, { withCredentials: true });

    socket.on("voteUpdate", (data) => {
      setNominees(data.nominees);
      setTotalVotes(data.totalVotes);
    });

    // Clean up on unmount
    return () => socket.disconnect();
  }, []);

  return { nominees, totalVotes };
}