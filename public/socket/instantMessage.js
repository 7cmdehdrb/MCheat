const socket = io();
const chatIcon = document.querySelector(".my_chat_icon");
const chatIconColors = ["#f1f1f1", "#fffde1"];
let getNewMessageInterval;

getNewMessage = () => {
    let index = 0;
    getNewMessageInterval = setInterval(() => {
        chatIcon.style.backgroundColor = chatIconColors[index];
        index == 0 ? index++ : index--;
    }, 1000); // 1초마다 반복
};

openInstantChat = () => {
    window.open("/messages/instantMessage", "_blank");
    clearInterval(getNewMessageInterval);
};

socket.on("instantMessage", (data) => {
    const { to } = data;
    if (socket_session == to) {
        getNewMessage();
    }
});
