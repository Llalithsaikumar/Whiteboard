import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import { PORT, CLIENT_ORIGIN } from './config/env.js';
import { onConnection } from './socket/connection.js';

const app = express();
app.use(cors({ origin: CLIENT_ORIGIN,
    credentials: true 
    })
);

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: CLIENT_ORIGIN,
        methods: ["GET", "POST"],
        credentials: true
    }
});
io.on('connection', (socket) => onConnection(io, socket));

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});