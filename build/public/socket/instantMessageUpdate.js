"use strict";

var socket = io();
var autoScroll = true;
var rotateAngle = 0;
var refreshRotation;
var refreshIcon = document.querySelector(".my_refresh_icon");
var instant_to = document.querySelector(".js_instant_to");
var instant_content = document.querySelector(".js_instant_content");
var chat_box = document.querySelector(".js_chat_box");

init = function init() {
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

setSendTo = function setSendTo(nickname) {
  instant_to.value = nickname;
};

sendInstantMessage = function sendInstantMessage() {
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
      message: instant_content.value
    });
    chat_box.innerHTML += "\n        <div class=\"flex justify-end my-2 text-right text-gray-700\">\n            <div class=\"w-2/3 break-all\">\n                ".concat(instant_to.value, " << ").concat(instant_content.value, "\n            </div>\n        </div>\n        ");

    if (autoScroll) {
      $(document).scrollTop($(document).height());
    }

    instant_content.value = "";
    instant_content.focus();
  }
};

socket.on("event", function (data) {
  var status = data.status,
      target = data.target;

  if (status == "logout" && target == socket_email) {
    window.close();
    return;
  }
});
socket.on("instantMessage", function (data) {
  var to = data.to,
      from = data.from,
      message = data.message;

  if (socket_nickname == to) {
    chat_box.innerHTML += "\n        <div class=\"flex justify-start my-2 text-left text-green-700\">\n        <div class=\"w-2/3 break-all\" onclick=\"setSendTo('".concat(from, "')\">\n            ").concat(from, " >> ").concat(message, "\n        </div>\n        </div>\n        ");

    if (autoScroll) {
      $(document).scrollTop($(document).height());
    }
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
    sendInstantMessage();
  }
});
init();