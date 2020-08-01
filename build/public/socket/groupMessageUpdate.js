"use strict";

var socket = io();
var autoScroll = true;
var rotateAngle = 0;
var refreshRotation;
var refreshIcon = document.querySelector(".my_refresh_icon");
var instant_content = document.querySelector(".js_instant_content");
var chat_box = document.querySelector(".js_chat_box");

init = function init() {
  socket.emit("joinGroup", {
    room: socket_group_id
  });
  socket.emit("groupMessage", {
    room: socket_group_id,
    from: socket_nickname,
    from_email: socket_email,
    message: "".concat(socket_nickname, "\uB2D8\uC774 \uCC44\uD305\uBC29\uC5D0 \uB4E4\uC5B4\uC654\uC2B5\uB2C8\uB2E4")
  });
  setTimeout(function () {
    $(document).scrollTop($(document).height());
  }, 100);
};

setAutoScroll = function setAutoScroll() {
  if (autoScroll) {
    autoScroll = false;
  } else {
    autoScroll = true;
  }
};

sendGroupMessage = function sendGroupMessage() {
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
    message: instant_content.value
  });
  instant_content.value = "";
  instant_content.focus();
};

socket.on("event", function (data) {
  var status = data.status,
      target = data.target;

  if (status == "logout" && target == socket_email) {
    window.close();
    return;
  }

  if (status == "delete" && target == socket_group_id) {
    window.close();
    return;
  }
});
socket.on("groupMessage", function (data) {
  var from = data.from,
      from_email = data.from_email,
      message = data.message;

  if (from_email == socket_email) {
    chat_box.innerHTML += "\n        <div class=\"flex justify-end my-2 text-right text-gray-700\">\n            <div class=\"w-2/3 break-all\">\n                ".concat(message, " << \uB098\n            </div>\n        </div>\n        ");
  } else {
    chat_box.innerHTML += "\n            <div class=\"flex justify-start my-2 text-left text-gray-700\">\n            <div class=\"w-2/3 break-all\">\n                ".concat(from, " ").concat(from_email == socket_group_master_email ? "<i class='fas fa-crown'></i>" : "", " >> ").concat(message, "\n            </div>\n            </div>\n        ");
  }

  if (autoScroll) {
    $(document).scrollTop($(document).height());
  }
});
refreshIcon.addEventListener("mouseenter", function () {
  refreshRotation = setInterval(function () {
    refreshIcon.setAttribute("style", "transform: rotate(" + rotateAngle + "deg)");
    rotateAngle += 3;
  }, 20);
});
refreshIcon.addEventListener("mouseleave", function () {
  clearInterval(refreshRotation);
});
refreshIcon.addEventListener("click", function () {
  clearInterval(refreshRotation);
});
window.addEventListener("keypress", function (ev) {
  if (ev.keyCode === 13) {
    sendGroupMessage();
  }
});
init();