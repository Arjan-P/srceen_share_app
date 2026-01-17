import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { useSignaling } from "../context/SignalingContext";
import { Navigate, useLocation } from "react-router-dom";

export function RoomGuard({ children }: { children: ReactNode }) {
  const { webSocketOpen } = useSignaling();
  const [checking, setChecking] = useState(true);
  const [valid, setValid] = useState(false);
  const location = useLocation();

  if (!webSocketOpen) {
    return (
      <Navigate
        to="/offline"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  useEffect(() => {
    let cancelled = false;

    async function validateRoom() {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_HTTP_SERVER_URL}${location.pathname}`
        );

        if (!cancelled && res.ok) {
          setValid(true);
        }
      } catch {
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    validateRoom();

    return () => {
      cancelled = true;
    };
  }, []); 

  if(checking) {
    return <div>Checking Room...</div>
  }

  if(!valid) {
    return (
      <Navigate to={"/"} />
    )
  }
  
  return children;
}

