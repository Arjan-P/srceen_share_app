export type ClientId = string;
export type RoomId = string;
export type SignalMsg =
  {
    type: "new-connection";
    clientId: ClientId;
  }
  |
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
      from: ClientId
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
