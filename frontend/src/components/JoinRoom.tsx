import { useState } from "react"
import type { RoomId } from "../util/signaling"
import { useNavigate } from "react-router-dom";

export function JoinRoom() {
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [error, setError] = useState<string | null>();
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!roomId) {
      setError("Room Id not entered"); 
      return;
    }
    const res = await fetch(`${import.meta.env.VITE_HTTP_SERVER_URL}/room/${roomId}`);
    if(res.ok) {
      navigate(`/room/${roomId}`);
    } else {
      setError("Room not found");
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Room ID" onChange={(e) => setRoomId(e.target.value)} />
      {error && <p className="text-red-600">{error}</p>}
      <button type="submit">Join</button>
    </form>
  )
}
