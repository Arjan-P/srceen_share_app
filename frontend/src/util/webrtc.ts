import { setupSenderChannel } from "./datachannels";
import { sendMessage } from "./signaling";
import type { ClientId, SignalMsg } from "./signaling";

interface PeerEntry {
  pc: RTCPeerConnection;
  dc?: RTCDataChannel;
  iceCandidateBuffer: RTCIceCandidateInit[];
}

const peers = new Map<ClientId, PeerEntry>();

function createPeerConnection(from: ClientId, target: ClientId): PeerEntry {
  let peer = peers.get(target);
  if (peer) return peer;
  const pc = new RTCPeerConnection({ 'iceServers': [{ 'urls': 'stun:stun.l.google.com:19302' }] });

  peer = {
    pc,
    iceCandidateBuffer: []
  }

  pc.addEventListener("icecandidate", (event) => {
    if (event.candidate) {
      const msg: SignalMsg = {
        type: "ice",
        from,
        target,
        candidate: event.candidate,
      };
      sendMessage(msg);
    }
  });

  pc.addEventListener("connectionstatechange", () => {
    if (pc.connectionState === "connected") {
      console.log(`Connection from ${from} to ${target} established`);
    }
    if (pc.connectionState === "closed" || pc.connectionState === "failed" || pc.connectionState === "disconnected") {
      removePeer(target);
    }
  });

  pc.addEventListener("track", (event) => {
    const [remoteStream] = event.streams;
    const video = document.getElementById("remoteStream") as HTMLVideoElement | null;

    if(!video) {
      console.error(`Video element #remoteStrean not found`);
      return;
    }
    video.srcObject = remoteStream;
  })

  peers.set(target, peer);
  return peer;
}

export async function makeOffer(from: ClientId, target: ClientId) {
  const peer = createPeerConnection(from, target);
  if (peer.pc.connectionState === "connected") return;
  const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  for (const track of screenStream.getTracks()) {
    peer.pc.addTrack(track, screenStream);
  }
  const offer = await peer.pc.createOffer();
  await peer.pc.setLocalDescription(offer);
  return offer;
}

export async function handleOffer(from: ClientId, target: ClientId, offer: RTCSessionDescriptionInit) {
  const peer = createPeerConnection(from, target);
  await peer.pc.setRemoteDescription(new RTCSessionDescription(offer));

  flushIce(peer.pc, peer.iceCandidateBuffer);

  const answer = await peer.pc.createAnswer();
  await peer.pc.setLocalDescription(answer);
  return answer;
}

export async function handleAnswer(from: ClientId, target: ClientId, answer: RTCSessionDescriptionInit) {
  const peer = createPeerConnection(from, target);
  await peer.pc.setRemoteDescription(answer);

  flushIce(peer.pc, peer.iceCandidateBuffer);
}

export async function handleIce(from: ClientId, target: ClientId, candidate: RTCIceCandidateInit) {
  const peer = createPeerConnection(from, target);
  if (!peer.pc.remoteDescription) {
    peer.iceCandidateBuffer.push(candidate);
    return;
  }
  await peer.pc.addIceCandidate(candidate);
}

async function flushIce(pc: RTCPeerConnection, iceBuffer: RTCIceCandidateInit[]) {

  console.log("flushing ice");
  for (const c of iceBuffer) {
    await pc.addIceCandidate(c);
  }
  iceBuffer.length = 0;
}

export async function sendStream(from: ClientId, target: ClientId) {
  const peer = createPeerConnection(from, target);
  const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
  for (const track of screenStream.getTracks()) {
    peer.pc.addTrack(track, screenStream);
  }
}

function removePeer(target: ClientId) {
  const peer = peers.get(target);
  if (!peer) return;
  peer.pc.close();
  peers.delete(target);
}
