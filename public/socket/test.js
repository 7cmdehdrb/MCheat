const socket = io();

socket.on("connect", () => {
    console.log("connect");
});

socket.on("test", () => {
    console.log("HELLO WORLD");
});

console.log(socket);
