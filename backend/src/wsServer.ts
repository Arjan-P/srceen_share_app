import type {Server as HttpServer} from "http";
import { WebSocketServer, WebSocket } from "ws";
import { joinRoom, leaveRoom, leaveAllRooms, forwardToPeer } from "./roomManager.js";
import type { SignalMsg } from "./msgTypes.js"

export function createWSServer(server: HttpServer) {
  const wss = new WebSocketServer({server});

  wss.on("connection", (ws: WebSocket) => {
    let currentRoom: string | null = null;
    let clientId: string | null;

    ws.on("message", raw => {
      const msg = JSON.parse(raw.toString()) as SignalMsg;
      console.log(msg);

      switch (msg.type) {
        case "join":
          currentRoom = msg.roomId;
          clientId = msg.clientId;
          joinRoom(msg.roomId, msg.clientId, ws);
          break;
        case "leave":
          if(clientId) leaveRoom(msg.roomId, clientId);
          break;
        case "offer":
        case "answer":
        case "ice":
          if (!currentRoom) return;
          forwardToPeer(currentRoom, msg.target, msg);
          break;
      }
    });

    ws.on("close", () => {
      if (clientId) leaveAllRooms(clientId);
    });
  });

  return wss;
}

