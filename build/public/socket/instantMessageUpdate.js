const socket = io();
let autoScroll = true;
let rotateAngle = 0;
let refreshRotation;
const refreshIcon = document.querySelector(".my_refresh_icon");
const instant_to = document.querySelector(".js_instant_to");
const instant_content = document.querySelector(".js_instant_content");
const chat_box = document.querySelector(".js_chat_box");

init = () => {
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

setSendTo = (nickname) => {
    instant_to.value = nickname;
};

sendInstantMessage = () => {
    if (socket_nickname == instant_to.value) {
        alert("자기 자신에게 보낼 수 없습니다");
        return;
    }

    if (instant_content.value.length > 50) {
        alert("최대 50자까지 보낼 수 있습니다");
        return;
    }

    if (instant_to.value != "" && instant_content.value != "") {
        socket.emit("instantMessage", {
            to: instant_to.value,
            from: socket_nickname,
            from_email: socket_email,
            message: instant_content.value,
        });

        chat_box.innerHTML += `
        <div class="flex justify-end my-2 text-right text-gray-700">
            <div class="w-2/3 break-all">
                ${instant_to.value} << ${instant_content.value}
            </div>
        </div>
        `;

        if (autoScroll) {
            $(document).scrollTop($(document).height());
        }

        instant_content.value = "";
        instant_content.focus();
    }
};

socket.on("event", (data) => {
    const { status, target } = data;
    if (status == "logout" && target == socket_email) {
        window.close();
        return;
    }
});

socket.on("instantMessage", (data) => {
    const { to, from, message } = data;
    if (socket_nickname == to) {
        chat_box.innerHTML += `
        <div class="flex justify-start my-2 text-left text-green-700">
        <div class="w-2/3 break-all" onclick="setSendTo('${from}')">
            ${from} >> ${message}
        </div>
        </div>
        `;

        if (autoScroll) {
            $(document).scrollTop($(document).height());
        }
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
        sendInstantMessage();
    }
});

init();
