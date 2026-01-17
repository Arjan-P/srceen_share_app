import { WebSocket } from "ws";
import type { ClientId, RoomId } from "./msgTypes.js"

type Peer = {
  id: ClientId;
  ws: WebSocket;
};

const rooms = new Map<RoomId, Map<ClientId, Peer>>();

export function createRoom(roomId: RoomId) {
  const room = new Map<ClientId, Peer>();
  rooms.set(roomId, room);
}

export function hasRoom(roomId: RoomId) {
  return rooms.has(roomId);
}

export function joinRoom(
  roomId: RoomId,
  clientId: ClientId,
  ws: WebSocket
) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const peer of room.values()) {
    peer.ws.send(JSON.stringify({
      type: "peer-join",
      clientId
    }));
  }
  ws.send(JSON.stringify({
    type: "room-peers",
    peers: [...room.keys()]
  }));
  room.set(clientId, { id: clientId, ws });
}

export function leaveRoom(roomId: RoomId, clientId: ClientId) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (!room.has(clientId)) return;
  room.delete(clientId);
  for (const peer of room.values()) {
    if (peer.ws.readyState === WebSocket.OPEN) {

      peer.ws.send(JSON.stringify({
        type: "peer-left",
        clientId
      }));
    }
  }
  if (room.size === 0) {
    rooms.delete(roomId);
  }
}

export function leaveAllRooms(clientId: ClientId) {
  for (const roomId of [...rooms.keys()]) {
    leaveRoom(roomId, clientId);
  }
}

export function forwardToPeer(
  roomId: RoomId,
  targetId: ClientId,
  message: any
) {
  const room = rooms.get(roomId);
  if (!room) return;
  const peer = room.get(targetId);
  if (peer) {
    peer.ws.send(JSON.stringify(message));
  }
}
