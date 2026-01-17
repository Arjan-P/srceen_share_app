import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { sendMessage, onMessage, initSignaling } from "../util/signaling";
import type { ClientId } from "../util/signaling"
import { createSocket, getSocket } from "../util/socket";

interface SignalingContextType {
  id: ClientId;
  webSocketOpen: boolean;
  sendMessage: typeof sendMessage;
  onMessage: typeof onMessage;
}

const SignalingContext = createContext<SignalingContextType | null>(null);

export function SignalingProvider({ children }: { children: ReactNode }) {
  const [clientId, setClientId] = useState<ClientId>("");
  const [webSocketOpen, setWebSocketOpen] = useState<boolean>(false);

  useEffect(() => {
    
  fetch(`${import.meta.env.VITE_HTTP_SERVER_URL}/id`)
    .then(res => res.json())
    .then(data => setClientId(data));
  }, []);

  useEffect(() => {

    let disposed = false;
    let reconnectTimer: number | null = null;

    function connect() {
      if (disposed) return;

      const socket = createSocket();

      socket.addEventListener("open", () => {
        setWebSocketOpen(true);
        console.log("Connected");
      });

      socket.addEventListener("close", () => {
        setWebSocketOpen(false);
        console.log("Disconnected");

        if (!disposed && !reconnectTimer) {
          reconnectTimer = window.setTimeout(() => {
            reconnectTimer = null;
            connect();
          }, 2000);
        }
      });

      socket.addEventListener("error", () => {
        socket.close();
      });

      initSignaling();
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try {
        getSocket().close();
      } catch { }
    };
  }, []);

  return (
    <SignalingContext.Provider value={{ id: clientId, webSocketOpen, sendMessage, onMessage }}>
      {children}
    </SignalingContext.Provider>
  )
}

export function useSignaling() {
  const cntx = useContext(SignalingContext);
  if (!cntx) {
    throw new Error("useSignaling must be used within a SignalingProvider");
  }
  return cntx;
}
