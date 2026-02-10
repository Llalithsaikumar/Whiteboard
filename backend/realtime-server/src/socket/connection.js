import { registerSocketEvents } from './events.js';
import { removeUserFromRoom } from './roomManager.js';
import { v4 as uuidv4 } from 'uuid';

export function onConnection(io, socket) {
    const userId = uuidv4();

    socket.data.userId = userId;
    console.log(`User connected: ${userId}`);
    registerSocketEvents(io, socket);
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId}`);
        removeUserFromRoom(userId);
    });
}