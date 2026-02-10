const rooms = new Map();
const userToRoom = new Map();

export function joinRoom(roomId, userId, socketId) {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, { users: new Map(), strokes: [] });
    }

    const room = rooms.get(roomId);
    room.users.set(userId, socketId);
    userToRoom.set(userId, roomId);
}

export function leaveRoom(roomId, userId) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.users.delete(userId);
    userToRoom.delete(userId);

    if (room.users.size === 0) {
        rooms.delete(roomId);
    }
}
export function removeUserFromRoom(userId) {
    const roomId = userToRoom.get(userId);
    if (!roomId) return;
    leaveRoom(roomId, userId);
}

export function addStroke(roomId, stroke) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.strokes.push(stroke);
}

export function getRoomUsers(roomId) {
    const room = rooms.get(roomId);
    if (!room) return [];
    return Array.from(room.users.keys());
}

export function getRoomState(roomId) {
    const room = rooms.get(roomId);
    if (!room) return { strokes: [] };
    return {
        strokes: room.strokes
    };
}

export function clearRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    room.strokes = [];
}   

