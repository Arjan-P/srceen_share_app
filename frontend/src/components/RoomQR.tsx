import { QRCodeCanvas } from "qrcode.react";
import type { RoomId } from "../util/signaling";

export function RoomQR({ roomId }: { roomId: RoomId }) {
  const roomUrl = `${window.location.origin}/room/${roomId}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <QRCodeCanvas
        value={roomUrl}
        size={180}
        bgColor="transparent"
        fgColor="#ffffff"
      />
    </div>
  )
}
