const CHUNK_SIZE = 16 * 1024; // 16KB
const MAX_BUFFERED = 8 * 1024 * 1024; // 8MB

export function setupReceiverDatachannel(dc: RTCDataChannel) {
  dc.binaryType = "arraybuffer";
  let fileInfo: { name: string; size: number; mime: string } | null = null;
  let receivedBytes = 0;
  const chunks: ArrayBuffer[] = [];
  dc.onmessage = (event) => {
    if (typeof event.data === "string") {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case "meta":
          fileInfo = msg;
          receivedBytes = 0;
          chunks.length = 0;
          console.log("Receiving file:", msg.name);
          break;

        case "done":
          if (!fileInfo) return;

          const blob = new Blob(chunks, { type: fileInfo.mime });
          downloadBlob(blob, fileInfo.name);
          console.log("File received:", fileInfo.name);
          break;
      }
      return;
    }
    const chunk = event.data as ArrayBuffer;
    chunks.push(chunk);
    receivedBytes += chunk.byteLength;

    if (fileInfo) {
      const progress = (receivedBytes / fileInfo.size) * 100;
      console.log(`Progress: ${progress.toFixed(1)}%`);
    }
  }

  dc.onerror = (e) => {
    console.log("Receiver channel error", e);
  }

  dc.onclose = () => {
    console.log("Receiver channel closed");
  }
}

export function setupSenderChannel(
  dc: RTCDataChannel,
  file: File
) {
  dc.binaryType = "arraybuffer";

  dc.addEventListener("open", async () => {
    dc.send(JSON.stringify({
      type: "meta",
      name: file.name,
      size: file.size,
      mime: file.type,
    }));

    let offset = 0;

    try {
      while (offset < file.size) {
        if (dc.readyState !== "open") {
          throw new Error("DC closed during transfer");
        }

        if (dc.bufferedAmount > MAX_BUFFERED) {
          await waitForLowBuffer(dc);
        }

        const chunk = await file
          .slice(offset, offset + CHUNK_SIZE)
          .arrayBuffer();

        dc.send(chunk);
        offset += chunk.byteLength;
      }

      dc.send(JSON.stringify({ type: "done" }));
      dc.close();
    } catch (err) {
      console.error("File transfer failed:", err);
      if (dc.readyState === "open") dc.close();
    }
  });

  dc.onerror = (e) => {
    console.error("Sender DC error", e);
  };

  dc.onclose = () => {
    console.log("Sender DC closed");
  };
}

function waitForLowBuffer(dc: RTCDataChannel) {
  return new Promise<void>((resolve) => {
    const check = () => {
      if (dc.bufferedAmount < MAX_BUFFERED / 2) {
        dc.removeEventListener("bufferedamountlow", check);
        resolve();
      }
    };
    dc.addEventListener("bufferedamountlow", check);
  });
}


function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
