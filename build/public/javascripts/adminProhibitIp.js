"use strict";

setUrl = function setUrl(index) {
  var current_url = new URL(window.location.href);
  var search_query = current_url.searchParams;
  search_query.set("page", index);
  current_url.search = search_query.toString();
  var new_url = current_url.toString();
  location.href = new_url;
};