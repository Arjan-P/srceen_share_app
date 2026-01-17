import { getSocket } from "./socket";

export type ClientId = string;
export type RoomId = string;
export type SignalMsg =
  {
      type: "join";
      roomId: RoomId;
      clientId: ClientId;
  }
  |
  {
    type: "leave";
    roomId: RoomId;
    clientId: ClientId;
  }
  |
  {
      type: "offer";
      from: ClientId;
      target: ClientId;
      sdp: RTCSessionDescriptionInit;
  }
  |
  {
      type: "answer";
      from: ClientId;
      target: ClientId;
      sdp: RTCSessionDescriptionInit;
  }
  |
  {
      type: "ice";
      from: ClientId;
      target: ClientId;
      candidate: RTCIceCandidateInit;
  }
  |
  {
    type: "peer-join";
    clientId: ClientId;
  }
  |
  {
    type: "room-peers";
    peers: ClientId[];
  }
  |
  {
    type: "peer-left";
    clientId: ClientId;
  };

type Handler = (msg: SignalMsg) => void;
const handlers = new Set<Handler>();
let wiredSocket: WebSocket | null = null;

export function createSocket() {
  const socket = getSocket();
  return socket;
}

export function sendMessage(msg: SignalMsg) {
  const socket = getSocket();
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(msg));
  } else {
    console.error("Connection not open yet");
  }
}

export function initSignaling() {
  const socket = getSocket();
  if(wiredSocket === socket) return;
  wiredSocket = socket;
  socket.addEventListener("message", (event) => {
    try {
      const msg = JSON.parse(event.data);

      if (!msg || typeof msg.type !== "string") {
        console.error("Invalid msg: ", msg);
        return;
      }

      handlers.forEach((handler) => {
        try {
          handler(msg)
        } catch (err) {
          console.error("single handler error: ", err);
        }
      });
    } catch (err) {
      console.error("Invlaid msg: ", event.data);
      return;
    }
  })
}

export function onMessage(handler: Handler) {
  handlers.add(handler);
  return () => {
    handlers.delete(handler)
  };
}
