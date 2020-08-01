"use strict";

var titleInput = document.querySelector(".js_titleInput");
var fileInput = document.querySelector(".js_inputFile");

function getExtension(filename) {
  var parts = filename.split(".");
  return parts[parts.length - 1];
}

function isImage(filename) {
  var ext = getExtension(filename);

  switch (ext.toLowerCase()) {
    case "jpg":
    case "gif":
    case "bmp":
    case "png":
      //etc
      return true;
  }

  return false;
}

window.addEventListener("submit", function (ev) {
  try {
    if (fileInput.value != "") {
      if (!isImage(fileInput.value)) {
        ev.preventDefault();
        alert("사진첨부는 .jpg, .png, .gif 파일만 가능합니다");
        return;
      }
    }
  } catch (error) {
    console.log(error);
  }

  if (titleInput.value > 20) {
    ev.preventDefault();
    alert("제목은 최대 20자까지 작성 가능합니다");
    return;
  }
});