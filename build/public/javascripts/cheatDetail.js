"use strict";

init = function init() {
  var documentDate = document.querySelector(".js_datetime");
  var newDate = new Date(documentDate.innerText);
  var year = newDate.getFullYear();
  var month = newDate.getMonth() + 1;

  if (month < 10) {
    month = "0" + month;
  }

  var date = newDate.getDate();

  if (date < 10) {
    date = "0" + date;
  }

  var newDateFormat = "".concat(year, "-").concat(month, "-").concat(date);
  documentDate.innerText = newDateFormat;
};

$(document).ready(function () {
  $('[data-toggle="tooltip"]').tooltip({
    placement: "top"
  });
});

deleteCheat = function deleteCheat(id) {
  var message = prompt("삭제한 제보는 복구할 수 없습니다. 문제가 있는 제보만 삭제해주세요. 정말 지우려면 <제보를 삭제합니다.>라고 입력해주세요");

  if (message == "제보를 삭제합니다.") {
    location.href = "/admin/deleteCheat?id=".concat(id);
  } else {
    alert("삭제 방지 문구가 일치하지 않습니다");
  }
};

init();