"use strict";

var paginator = document.querySelector(".js_paginator");
var paginator_value = document.querySelector(".js_paginator_value");

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