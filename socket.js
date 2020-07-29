import { InstantMessage, GroupMessage } from "./server/models/messages";
import sanitize from "mongo-sanitize";

module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on("event", (data) => {
            console.log(data);
            io.emit("event", data);
        });

        socket.on("instantMessage", async (data) => {
            // 귓속말
            const { to, from, from_email, message } = data;

            console.log(`Socket - ${from} >> ${to} : ${message}`);

            await InstantMessage.create({
                to: sanitize(to),
                from: sanitize(from),
                from_email: sanitize(from_email),
                message: sanitize(message),
            })
                .then((instant) => {
                    if (instant == null) {
                        throw Error();
                    } else {
                        io.emit("instantMessage", {
                            to: sanitize(to),
                            from: sanitize(from),
                            message: sanitize(message),
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });

        socket.on("joinGroup", async (data) => {
            // 그룹 참여
            const { room } = data;
            console.log(`Join Room : ${room}`);
            socket.join(room);
        });

        socket.on("groupMessage", async (data) => {
            // 그룹 체팅
            const { room, from, from_email, message } = data;
            console.log(`Socket - ${from} >> ${room} : ${message}`);

            await GroupMessage.create({
                room: sanitize(room),
                from: sanitize(from),
                from_email: sanitize(from_email),
                message: sanitize(message),
            })
                .then((newMessage) => {
                    if (newMessage == null) {
                        throw Error();
                    } else {
                        io.to(room).emit("groupMessage", {
                            room: sanitize(room),
                            from: sanitize(from),
                            from_email: sanitize(from_email),
                            message: sanitize(message),
                        });
                    }
                })
                .catch((err) => {
                    console.log(err);
                });
        });
    });
};
