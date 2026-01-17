import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { RoomId } from "../util/signaling";

export function RoomForm() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState<RoomId | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {

    try {

      const res = await fetch(`${import.meta.env.VITE_HTTP_SERVER_URL}/room`, { method: 'POST' });

      if (!res.ok) throw new Error("Failed to create room");

      const { roomId } = await res.json();
      navigate(`/room/${roomId}`);
    } catch (err) {
      console.log(err);
      setError("Something went wrong");
    }
  };

  const joinRoom = async () => {
    navigate(`/room/${roomId}`);
  }

  return (
    <div className="grid grid-rows-2 divide-y items-center gap-3">

      <div className="flex flex-col space-y-6 border-b border-white/10 pb-12">
        <input type="text" placeholder="Room ID" onChange={(e) => { setRoomId(e.target.value) }} className="block w-full rounded-md bg-white/5 px-3 py-1.5 text-base text-white outline-1 -outline-offset-1 outline-white/10 placeholder:text-gray-500 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-500 sm:text-sm/6"/>
        <button type="button" onClick={joinRoom} className="buttonStyle">
          Join Room
        </button>
      </div>

      <button type="button" onClick={createRoom} className="buttonStyle">
        Create Room
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
