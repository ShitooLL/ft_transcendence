import { Server } from "socket.io";
export const io = new Server(8080, {
    cors: {
        origin: ["http://localhost:3000"],
    },
});
io.on('connection', client_socket => {
    console.log(client_socket.id);
});
