import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ClientId } from "../util/signaling";
import { useSignaling } from "../context/SignalingContext";
import { handleAnswer, handleIce, handleOffer, makeOffer } from "../util/webrtc";
import { RoomQR } from "../components/RoomQR";

export function Room() {
  const { roomId } = useParams();
  const { id, webSocketOpen, sendMessage, onMessage } = useSignaling();
  const [peers, setPeers] = useState<ClientId[]>([]);
  const navigate = useNavigate();

  const makeOffers = async () => {

    for (const peer of peers) {
      const offer = await makeOffer(id, peer);
      if (offer) {

        sendMessage({
          type: "offer",
          from: id,
          target: peer,
          sdp: offer
        });
      }
    }
  }

  useEffect(() => {
    if (!roomId || !webSocketOpen) return;
    const leaveRoom = () => {
      sendMessage({
        type: "leave",
        roomId,
        clientId: id
      })
    }
    const unsubscribe = onMessage(async msg => {
      switch (msg.type) {
        case "offer":
          const answer = await handleOffer(id, msg.from, msg.sdp);
          sendMessage({
            type: "answer",
            from: id,
            target: msg.from,
            sdp: answer
          });
          break;
        case "answer":
          await handleAnswer(id, msg.from, msg.sdp);
          break;
        case "ice":
          await handleIce(id, msg.from, msg.candidate);
          break;
        case "room-peers":
          setPeers(msg.peers);
          break;
        case "peer-join":
          setPeers(prev =>
            prev.includes(msg.clientId) ? prev : [...prev, msg.clientId]
          );
          break;
        case "peer-left":
          setPeers(prev => prev.filter(peer => peer !== msg.clientId));
          break;
      }
    });

    sendMessage({
      type: "join",
      roomId,
      clientId: id
    });

    return () => {
      leaveRoom();
      unsubscribe();
    }
  }, [roomId, webSocketOpen]);

  return (
    <section className="p-8">
      <h1>Client ID: {id}</h1>
      <h2> Room: {roomId}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2
                divide-y divide-white/10
                md:divide-y-0 md:divide-x">
        <div className="py-4 md:pr-4">
          <h3>Peers:</h3>
          <ul>
            {peers.map(peer => (
              <li key={peer}>{peer}</li>
            ))}
          </ul>
        </div>

        <div className="py-4 md:pl-4 flex justify-center">
          <RoomQR roomId={roomId!} />
        </div>
      </div>

      <div className="flex flex-col items-center">
        <video autoPlay playsInline controls id="remoteStream" />
        <button onClick={makeOffers} className="buttonStyle">Share</button>
        <button onClick={() => navigate("/")} className="buttonStyle">Leave Room</button>
      </div>
    </section>
  )
}
