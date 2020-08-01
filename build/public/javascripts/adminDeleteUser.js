"use strict";

deleteUser = function deleteUser(userEmail) {
  var confirm = prompt("\uC720\uC800\uB97C \uC644\uC804\uD788 \uC0AD\uC81C\uD558\uBA70, \uBCF5\uAD6C\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4\n\uC815\uB9D0 \uC0AD\uC81C\uD558\uB824\uBA74 \n<".concat(userEmail, "\uC744(\uB97C) \uC644\uC804\uD788 \uC0AD\uC81C\uD569\uB2C8\uB2E4.> \uB77C\uACE0 \uC785\uB825\uD574\uC8FC\uC138\uC694"));

  if (confirm == "".concat(userEmail, "\uC744(\uB97C) \uC644\uC804\uD788 \uC0AD\uC81C\uD569\uB2C8\uB2E4.")) {
    location.href = "/admin/deleteUser?id=".concat(userEmail);
  } else {
    alert("잘못 입력하셨습니다. 다시 시도해주세요");
  }
};