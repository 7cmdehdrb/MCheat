"use strict";

var socket = io();
var chatIcon = document.querySelector(".my_chat_icon");
var chatIconColors = ["#f1f1f1", "#F3FF34"];
var getNewMessageInterval;

getNewMessage = function getNewMessage() {
  var index = 0;
  getNewMessageInterval = setInterval(function () {
    chatIcon.style.backgroundColor = chatIconColors[index];
    index == 0 ? index++ : index--;
  }, 1000); // 1초마다 반복
};

openInstantChat = function openInstantChat() {
  window.open("/messages/instantMessage", "_blank", "width=400, height=600, right=0, menubar=0, statue=0, titlebar=0, toolbar=0");
  clearInterval(getNewMessageInterval);
};

socket.on("instantMessage", function (data) {
  var to = data.to;

  if (session_nickname == to) {
    getNewMessage();
  }
});