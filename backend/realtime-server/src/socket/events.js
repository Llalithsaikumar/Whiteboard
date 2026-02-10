import {
  joinRoom,
  leaveRoom,
  addStroke,
  getRoomUsers,
  getRoomState,
  clearRoom
} from "./roomManager.js";

import {
  saveCanvas,
  clearCanvas,
  loadCanvas
} from "../services/pythonApi.js";

export function registerSocketEvents(io, socket) {
  const userId = socket.data.userId;

  // JOIN ROOM
  socket.on("join-room", async ({ roomId }) => {
    joinRoom(roomId, userId, socket.id);
    socket.join(roomId);

    // Load persisted canvas from Python
    const strokes = await loadCanvas(roomId);

    // Sync Node memory with Python
    strokes.forEach((stroke) => {
      addStroke(roomId, stroke);
    });

    // Send existing canvas ONLY to the joining user
    socket.emit("canvas-state", {
      roomId,
      strokes,
    });

    // Notify others
    socket.to(roomId).emit("user-joined", {
      userId,
      users: getRoomUsers(roomId),
    });
  });

  // LIVE DRAWING (no persistence)
  socket.on("draw", (data) => {
    socket.to(data.roomId).emit("draw", {
      ...data,
      userId,
    });
  });

  // STROKE COMPLETE (persist)
  socket.on("stroke-complete", async ({ roomId, stroke }) => {
    addStroke(roomId, stroke);

    socket.to(roomId).emit("stroke-complete", {
      stroke,
      userId,
    });

    const { strokes } = getRoomState(roomId);

    // Persist full canvas to Python
    await saveCanvas(roomId, strokes);
  });

  // CURSOR MOVE
  socket.on("cursor-move", ({ roomId, position }) => {
    socket.to(roomId).emit("cursor-move", {
      userId,
      position,
    });
  });

  // CLEAR CANVAS
  socket.on("clear-canvas", async ({ roomId }) => {
    clearRoom(roomId);
    await clearCanvas(roomId);

    io.to(roomId).emit("canvas-cleared");
  });

  // LEAVE ROOM
  socket.on("leave-room", ({ roomId }) => {
    leaveRoom(roomId, userId);
    socket.leave(roomId);
  });
}
