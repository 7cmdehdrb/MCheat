"use strict";

var searchForm = document.querySelector(".js_searchForm2");
var searchInput = document.querySelector(".js_searchInput3");
var js_timeset = document.querySelectorAll(".js_timeset");
var paginator = document.querySelector(".js_paginator");
var paginator_value = document.querySelector(".js_paginator_value");

change_dateformat = function change_dateformat(new_date) {
  var newDate = new Date(new_date);
  var month = newDate.getMonth() + 1;

  if (month < 10) {
    month = "0" + month;
  }

  var date = newDate.getDate();

  if (date < 10) {
    date = "0" + date;
  }

  var newDateFormat = "".concat(month).concat(date);
  return newDateFormat;
};

init = function init() {
  js_timeset.forEach(function (element) {
    element.innerText = change_dateformat(element.innerText);
  });
};

searchCommunities = function searchCommunities() {
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
init();