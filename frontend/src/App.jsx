import { useEffect } from "react";
import { io } from "socket.io-client";

export default function App() {
  useEffect(() => {
    const socket = io("http://localhost:3001");

    socket.on("connect", () => {
      console.log("Connected:", socket.id);

      socket.emit("join-room", { roomId: "room-1" });

      socket.emit("stroke-complete", {
        roomId: "room-1",
        stroke: {
          tool: "pen",
          path: [{ x: 1, y: 1 }, { x: 2, y: 2 }]
        }
      });
    });

    socket.on("canvas-state", (data) => {
      console.log("Canvas state:", data);
    });

    // cleanup on unmount (VERY important)
    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div>
      <h1>Whiteboard Socket Test</h1>
      <p>Open the console to see socket logs</p>
    </div>
  );
}
