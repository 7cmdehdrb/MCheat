"use strict";

var check = false;
var nicknameInput = document.querySelector(".js_nickname");
var serverInput = document.querySelector(".js_server");
var guildInput = document.querySelector(".js_guild");
var profileInput = document.querySelector(".js_profile");
var bioInput = document.querySelector(".js_bioInput");
document.addEventListener("submit", function (ev) {
  if (check == false) {
    ev.preventDefault();
    alert("캐릭터 찾기를 해주세요");
    return;
  }

  if (bioInput.value.length > 50) {
    ev.preventDefault();
    alert("한줄소개는 최대 50자까지 작성 가능합니다");
    return;
  }

  alert("개인정보가 변경되어 로그아웃 합니다");
});
nicknameInput.addEventListener("click", function () {
  check = false;
  nicknameInput.removeAttribute("readonly");
});

checkNickname = function checkNickname() {
  nicknameInput.setAttribute("readonly", "readonly");
  check = false;
  var nickname = nicknameInput.value;
  serverInput.value = "로딩중...";
  guildInput.value = "로딩중...";
  fetch("/users/searchNickname?id=".concat(nickname)).then(function (Response) {
    return Response.json();
  }).then(function (json) {
    serverInput.value = json.server;
    guildInput.value = json.guild;
    profileInput.value = json.profile;

    if (json.server != "캐릭터를 찾을 수 없습니다") {
      check = true;
    }
  })["catch"](function (err) {
    return console.log(err);
  });
};

agree = function agree() {
  agreeInput.checked = true;
};