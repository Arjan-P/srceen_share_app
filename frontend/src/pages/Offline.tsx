import { useEffect } from "react"
import { useSignaling } from "../context/SignalingContext"
import { useNavigate, useLocation } from "react-router-dom";

export function Offline() {
  const { webSocketOpen } = useSignaling();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from;

  useEffect(() => {
    if (webSocketOpen && from) {
      navigate(from, { replace: true });
    }
  }, [webSocketOpen, from, navigate]);

  return (
    <div>
      <h1>Offline</h1>
      <p>Reconnecting to signaling server…</p>
    </div>
  );
}
