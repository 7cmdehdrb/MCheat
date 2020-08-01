"use strict";

var searchForm = document.querySelector(".js_searchForm");
var searchInput = searchForm.querySelector(".js_searchInput2");
var paginator = document.querySelector(".js_paginator");
var paginator_value = document.querySelector(".js_paginator_value");

deleteUser = function deleteUser(userEmail) {
  var confirm = prompt("\uC720\uC800\uB97C \uC644\uC804\uD788 \uC0AD\uC81C\uD558\uBA70, \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC73C\uBA70, \uC608\uC0C1\uCE58 \uBABB\uD55C \uC624\uB958\uB97C \uC57C\uAE30\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4\n\uC2DC\uC2A4\uD15C\uC0C1 \uC774\uC0C1\uC774 \uBC1C\uC0DD\uD55C \uACBD\uC6B0\uAC00 \uC544\uB2C8\uB77C\uBA74 \uC808\uB300 \uC0AD\uC81C\uD558\uC9C0 \uB9C8\uC2ED\uC2DC\uC624\n\uC815\uB9D0 \uC0AD\uC81C\uD558\uB824\uBA74 \n<".concat(userEmail, ">\uC744(\uB97C) \uC644\uC804\uD788 \uC0AD\uC81C\uD569\uB2C8\uB2E4.> \uB77C\uACE0 \uC785\uB825\uD574\uC8FC\uC138\uC694"));

  if (confirm == "".concat(userEmail, "\uC744(\uB97C) \uC644\uC804\uD788 \uC0AD\uC81C\uD569\uB2C8\uB2E4.")) {
    location.href = "/admin/deleteUser?id=".concat(userEmail);
  }
};

searchSubmit = function searchSubmit() {
  if (searchInput.value == "") {
    alert("내용을 입력해주세요");
  } else {
    searchForm.submit();
  }
};

setUrl = function setUrl(index) {
  var current_url = new URL(window.location.href);
  var search_query = current_url.searchParams;
  search_query.set("page", index);
  current_url.search = search_query.toString();
  var new_url = current_url.toString();
  location.href = new_url;
};

paginator.addEventListener("submit", function (ev) {
  ev.preventDefault();
  setUrl(paginator_value.value);
});