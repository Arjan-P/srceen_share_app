import { useNavigate } from "react-router-dom";

export function CreateRoom() {
  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_HTTP_SERVER_URL}/room`, {method: 'POST'});
      const { roomId } = await res.json();

      navigate(`/room/${roomId}`);
    } catch(err) {
      console.error(err);
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Create</button>
    </form>
  )
}
