import { InstantMessage } from "./server/models/messages";
import sanitize from "mongo-sanitize";

module.exports = (io) => {
    io.on("connection", (socket) => {
        socket.on("instantMessage", async (data) => {
            let { to, from, message } = data;

            console.log(`Socket - ${to} >> ${from} : ${message}`);

            await InstantMessage.create({
                to: sanitize(to),
                from: sanitize(from),
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
    });
};
