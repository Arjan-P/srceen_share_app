let socket: WebSocket | null = null;

export function createSocket() {
  if(socket) {
    socket.close();
  }

  socket = new WebSocket(import.meta.env.VITE_SIGNALING_SERVER_URL);
  return socket;
}

export function getSocket() {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
}
