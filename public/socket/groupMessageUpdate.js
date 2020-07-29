const socket = io();
let autoScroll = true;
let rotateAngle = 0;
let refreshRotation;
const refreshIcon = document.querySelector(".my_refresh_icon");
const instant_content = document.querySelector(".js_instant_content");
const chat_box = document.querySelector(".js_chat_box");

init = () => {
    socket.emit("joinGroup", {
        room: socket_group_id,
    });
    socket.emit("groupMessage", {
        room: socket_group_id,
        from: socket_nickname,
        from_email: socket_email,
        message: `${socket_nickname}님이 체팅방에 들어왔습니다`,
    });
    setTimeout(() => {
        $(document).scrollTop($(document).height());
    }, 100);
};

setAutoScroll = () => {
    if (autoScroll) {
        autoScroll = false;
    } else {
        autoScroll = true;
    }
};

sendGroupMessage = () => {
    if (instant_content.value == "") {
        return;
    }

    if (instant_content.value.length > 50) {
        alert("최대 50자까지 보낼 수 있습니다");
        return;
    }

    socket.emit("groupMessage", {
        room: socket_group_id,
        from: socket_nickname,
        from_email: socket_email,
        message: instant_content.value,
    });

    instant_content.value = "";
    instant_content.focus();
};

socket.on("event", (data) => {
    const { status, target } = data;
    if (status == "logout" && target == socket_email) {
        window.close();
        return;
    }

    if (status == "delete" && target == socket_group_id) {
        window.close();
        return;
    }
});

socket.on("groupMessage", (data) => {
    let { from, from_email, message } = data;

    if (from_email == socket_email) {
        chat_box.innerHTML += `
        <div class="flex justify-end my-2 text-right text-gray-700">
            <div class="w-2/3 break-all">
                ${message} << 나
            </div>
        </div>
        `;
    } else {
        chat_box.innerHTML += `
            <div class="flex justify-start my-2 text-left text-gray-700">
            <div class="w-2/3 break-all">
                ${from} ${from_email == socket_group_master_email ? "<i class='fas fa-crown'></i>" : ""} >> ${message}
            </div>
            </div>
        `;
    }

    if (autoScroll) {
        $(document).scrollTop($(document).height());
    }
});

refreshIcon.addEventListener("mouseenter", () => {
    refreshRotation = setInterval(() => {
        refreshIcon.setAttribute("style", "transform: rotate(" + rotateAngle + "deg)");
        rotateAngle += 3;
    }, 20);
});

refreshIcon.addEventListener("mouseleave", () => {
    clearInterval(refreshRotation);
});

refreshIcon.addEventListener("click", () => {
    clearInterval(refreshRotation);
});

window.addEventListener("keypress", (ev) => {
    if (ev.keyCode === 13) {
        sendGroupMessage();
    }
});

init();
