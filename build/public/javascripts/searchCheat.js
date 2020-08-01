"use strict";

var paginator = document.querySelector(".js_paginator");
var paginator_value = document.querySelector(".js_paginator_value");
var more_char = document.querySelector(".js_more_char");
var charIdx = 0;

moreChar = function moreChar() {
  charIdx += 10;

  for (var i = 0; i < charIdx; i++) {
    try {
      document.querySelector("#char".concat(i)).style.display = null;
    } catch (error) {
      more_char.style.display = "none";
      break;
    }
  }
};

var more_phone = document.querySelector(".js_more_phone");
var phoneIdx = 0;

morePhone = function morePhone() {
  phoneIdx += 10;

  for (var i = 0; i < phoneIdx; i++) {
    try {
      document.querySelector("#phone".concat(i)).style.display = null;
    } catch (error) {
      more_phone.style.display = "none";
      break;
    }
  }
};

var more_account = document.querySelector(".js_more_account");
var accountIdx = 0;

moreAccount = function moreAccount() {
  accountIdx += 10;

  for (var i = 0; i < accountIdx; i++) {
    try {
      document.querySelector("#account".concat(i)).style.display = null;
    } catch (error) {
      more_account.style.display = "none";
      break;
    }
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